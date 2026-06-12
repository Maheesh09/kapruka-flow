import { GoogleGenerativeAI } from '@google/generative-ai'
export const maxDuration = 60
export const runtime = 'nodejs'  // prevents Vercel edge from buffering the NDJSON stream

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

// ── Own-API rate limit (protects your Gemini quota) ───────────────────────────
const RL = new Map() // ip -> { count, windowStart }
const RL_WINDOW = 5 * 60 * 1000
const RL_MAX = 25
function rateLimited(ip) {
    const now = Date.now()
    const e = RL.get(ip)
    if (!e || now - e.windowStart > RL_WINDOW) { RL.set(ip, { count: 1, windowStart: now }); return false }
    e.count++
    return e.count > RL_MAX
}

// ── MCP read-tool cache (protects the shared 60 req/min per-IP MCP limit) ─────
const MCP_CACHE = new Map() // key -> { text, ts }
const CACHE_TTL = 10 * 60 * 1000
const CACHEABLE = new Set(['kapruka_search_products', 'kapruka_get_product', 'kapruka_list_categories', 'kapruka_list_delivery_cities'])

// ── System prompt ──────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = (lang) => `You are the Kapruka Flow navigator — a calm, confident AI guide for Kapruka.com, Sri Lanka's largest e-commerce platform. Today's date is ${new Date().toISOString().slice(0, 10)}.

${lang === 'SI' ? 'LANGUAGE: The user has selected Sinhala. Respond entirely in Sinhala (සිංහල) throughout the conversation. All messages, labels, chips, and the gift_message field must be in Sinhala.' : ''}
${lang === 'TG' ? 'LANGUAGE: The user has selected Tanglish. Respond in a natural mix of Sinhala and English as spoken by Sri Lankans (e.g. "Machan, meka really nice gift ekak" or "Amma ta deliver karanna puluwan Saturday"). Warm and casual.' : ''}

═══ PERSONALITY ═══
- Warm, brief, never salesy. You are a guide, not a salesperson.
- Act before asking — when you have enough info, search and check delivery immediately.
- Never dump product lists as text. Always use PRODUCT_TRIO format for presenting options.

═══ CONVERSATION FLOW ═══
1. Understand the goal (occasion, city, date, budget)
2. Search products proactively
3. Check delivery BEFORE presenting options
4. Present exactly 3 options using PRODUCT_TRIO format
5. When user selects one → generate PLAN_BOARD
6. Collect recipient details if missing
7. Create order when all details are ready

═══ QUICK-REPLY CHIPS ═══
Whenever you ask the user a question with predictable answers, append ONE chips block at the very end of your message so the user can tap instead of type:

<CHIPS>["Birthday","Anniversary","Just because"]</CHIPS>

Rules: 2–5 chips, each under 5 words, in the user's language. Use for occasions, dates ("Tomorrow","This Saturday"), budgets ("Under 5,000","5,000–10,000"), yes/no confirmations, cities. Never use chips when asking for free-form details like names, phone numbers, or addresses.

═══ PRODUCT_TRIO FORMAT ═══
ALWAYS use this format when presenting product options — never list products as plain text:

<PRODUCT_TRIO>
{
  "context": "A one-sentence warm intro for the three options",
  "products": [
    {
      "product_id": "exact ID from search results",
      "name": "exact product name",
      "price": 5020,
      "image_url": "exact URL from search results or null",
      "url": "exact product URL or null",
      "reason": "One-line reason — why this fits the person",
      "pick": false
    }
  ]
}
</PRODUCT_TRIO>

Rules for PRODUCT_TRIO:
- Exactly 3 products
- Set "pick": true on the middle product (your recommendation)
- Use exact product IDs and image URLs from tool results — never invent
- reason should be a short, human, opinionated line (not marketing copy)
- The JSON must be strictly valid: double quotes, no trailing commas, no comments.
- image_url MUST be copied character-for-character from the "image_url" field in the search results JSON. If the field is null or missing, use null — never construct or guess an image URL.

═══ PLAN_BOARD FORMAT ═══
Generate when: product selected + city known + date known.

<PLAN_BOARD>
{
  "occasion": "e.g. Amma's Birthday",
  "message": "A short warm sentence",
  "delivery": {
    "city": "e.g. Kandy",
    "date": "YYYY-MM-DD",
    "fee": 450,
    "confirmed": true
  },
  "recipient": {
    "name": null,
    "phone": null,
    "address": null
  },
  "items": [
    {
      "product_id": "exact ID",
      "name": "exact product name",
      "price": 5020,
      "image_url": "exact URL from search or null",
      "url": "exact URL or null",
      "quantity": 1,
      "icing_text": null
    }
  ],
  "gift_message": "A warm message in the user's language",
  "subtotal": 5020,
  "delivery_fee": 450,
  "total": 5470,
  "currency": "LKR",
  "needs_recipient": true
}
</PLAN_BOARD>

When user provides recipient details, emit a fresh PLAN_BOARD with them filled in and needs_recipient: false.
When the user adds another item, emit a fresh PLAN_BOARD with ALL items (old + new) and recalculated totals — multi-item carts are fully supported.
When the user edits the gift message, emit a fresh PLAN_BOARD with the new gift_message and everything else unchanged.

═══ AFTER ORDER CREATION ═══
Respond with the checkout URL, order ref, and expiry. Example:
"Your order is locked — ORD-20260613-XXXX. Pay here: https://www.kapruka.com/tools/continue_order.jsp?id=XXXX — prices held until 2026-06-13T14:22:00+05:30."

═══ RULES ═══
- Always verify delivery with kapruka_check_delivery before confirming dates
- For cakes and flowers, warn about perishable delivery constraints
- Never invent product IDs, prices, or image URLs
- If a tool reports a rate limit, tell the user warmly that Kapruka is asking you to slow down for a moment and to try again in ~30 seconds. Never show raw errors.
- Output ONLY ONE structured block per response (either PRODUCT_TRIO or PLAN_BOARD, never both)
- When asking for multiple details (name, phone, address), put each item on its OWN line starting with "* ", with a short intro sentence above. Use **bold** only for the detail names. No other markdown (no headings, no numbered lists).`

// ── Tool definitions (unchanged) ───────────────────────────────────────────────
const KAPRUKA_TOOLS = [{
    functionDeclarations: [
        {
            name: 'kapruka_search_products',
            description: 'Search the Kapruka catalog by keyword. Returns product names, IDs, prices, image URLs. Use this to find products.',
            parameters: {
                type: 'object',
                properties: {
                    q: { type: 'string', description: 'Search keyword' },
                    category: { type: 'string', description: 'Category: Birthday, cakes, flowers, Chocolates, Grocery, Clothing, Cosmetics, Books, Fruits, KidsToys, Giftset' },
                    min_price: { type: 'number' },
                    max_price: { type: 'number' },
                    in_stock_only: { type: 'boolean' },
                    limit: { type: 'number', description: 'Default 5, max 10' },
                    currency: { type: 'string', description: 'Default LKR' }
                },
                required: ['q']
            }
        },
        {
            name: 'kapruka_get_product',
            description: 'Get full product details by ID.',
            parameters: {
                type: 'object',
                properties: {
                    product_id: { type: 'string' },
                    currency: { type: 'string' }
                },
                required: ['product_id']
            }
        },
        {
            name: 'kapruka_list_categories',
            description: 'List all product categories on Kapruka.',
            parameters: { type: 'object', properties: {} }
        },
        {
            name: 'kapruka_list_delivery_cities',
            description: 'Search delivery network cities.',
            parameters: {
                type: 'object',
                properties: {
                    query: { type: 'string' },
                    limit: { type: 'number' }
                },
                required: ['query']
            }
        },
        {
            name: 'kapruka_check_delivery',
            description: 'Check delivery availability to a city on a date. Always run before confirming.',
            parameters: {
                type: 'object',
                properties: {
                    city: { type: 'string' },
                    delivery_date: { type: 'string', description: 'YYYY-MM-DD' },
                    product_id: { type: 'string', description: 'Needed for perishable warnings' }
                },
                required: ['city', 'delivery_date']
            }
        },
        {
            name: 'kapruka_create_order',
            description: 'Create guest checkout order. Returns click-to-pay URL locked for 60 mins.',
            parameters: {
                type: 'object',
                properties: {
                    cart: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                product_id: { type: 'string' },
                                quantity: { type: 'number' },
                                icing_text: { type: 'string' }
                            },
                            required: ['product_id', 'quantity']
                        }
                    },
                    recipient: {
                        type: 'object',
                        properties: { name: { type: 'string' }, phone: { type: 'string' } },
                        required: ['name', 'phone']
                    },
                    delivery: {
                        type: 'object',
                        properties: {
                            address: { type: 'string' },
                            city: { type: 'string' },
                            location_type: { type: 'string' },
                            date: { type: 'string' },
                            instructions: { type: 'string' }
                        },
                        required: ['address', 'city', 'date']
                    },
                    sender: {
                        type: 'object',
                        properties: { name: { type: 'string' }, anonymous: { type: 'boolean' } },
                        required: ['name']
                    },
                    gift_message: { type: 'string' },
                    currency: { type: 'string' }
                },
                required: ['cart', 'recipient', 'delivery', 'sender']
            }
        },
        {
            name: 'kapruka_track_order',
            description: 'Track an existing order by order number.',
            parameters: {
                type: 'object',
                properties: { order_number: { type: 'string' } },
                required: ['order_number']
            }
        }
    ]
}]

// ── Human-readable status labels for the live thinking feed ───────────────────
function statusLabel(name, args = {}) {
    switch (name) {
        case 'kapruka_search_products': {
            let s = `Searching “${args.q || '…'}”`
            if (args.category) s += ` in ${args.category}`
            if (args.max_price) s += ` under LKR ${Number(args.max_price).toLocaleString()}`
            return { icon: 'search', label: s }
        }
        case 'kapruka_get_product':
            return { icon: 'package', label: 'Pulling product details' }
        case 'kapruka_list_categories':
            return { icon: 'layout-grid', label: 'Browsing categories' }
        case 'kapruka_list_delivery_cities':
            return { icon: 'map-pin', label: `Finding “${args.query || ''}” in the delivery network` }
        case 'kapruka_check_delivery':
            return { icon: 'truck', label: `Checking delivery to ${args.city || '…'}${args.delivery_date ? ` on ${args.delivery_date}` : ''}` }
        case 'kapruka_create_order':
            return { icon: 'lock', label: 'Locking in your order' }
        case 'kapruka_track_order':
            return { icon: 'compass', label: `Tracking ${args.order_number || 'your order'}` }
        default:
            return { icon: 'sparkles', label: 'Working on it' }
    }
}

// ── MCP Client ─────────────────────────────────────────────────────────────────
class KaprukaMCPClient {
    constructor() { this.sessionId = null; this.msgId = 1; this.ready = false }

    async _rpc(method, params = {}, isNotif = false) {
        const body = { jsonrpc: '2.0', method, params }
        if (!isNotif) body.id = this.msgId++
        const headers = { 'Content-Type': 'application/json', 'Accept': 'application/json, text/event-stream' }
        if (this.sessionId) headers['mcp-session-id'] = this.sessionId

        const ctrl = new AbortController()
        const timeout = setTimeout(() => ctrl.abort(), 20000)
        let res
        try {
            res = await fetch('https://mcp.kapruka.com/mcp', {
                method: 'POST', headers, body: JSON.stringify(body), signal: ctrl.signal
            })
        } finally { clearTimeout(timeout) }

        const sid = res.headers.get('mcp-session-id')
        if (sid) this.sessionId = sid
        if (isNotif) return null
        if (res.status === 429) return { error: { message: 'rate_limited' } }

        const ct = res.headers.get('content-type') || ''
        if (ct.includes('text/event-stream')) {
            const text = await res.text()
            for (const line of text.split('\n').filter(l => l.startsWith('data:')).reverse())
                try { return JSON.parse(line.slice(5).trim()) } catch { }
            return null
        }
        return res.json()
    }

    async init() {
        if (this.ready) return
        await this._rpc('initialize', { protocolVersion: '2025-03-26', capabilities: {}, clientInfo: { name: 'kapruka-flow', version: '1' } })
        await this._rpc('notifications/initialized', {}, true)
        this.ready = true
    }

    async callTool(name, args) {
        // Read tools must return JSON — the default markdown format omits image_url entirely
        const callArgs = CACHEABLE.has(name)
            ? { ...args, response_format: 'json' }
            : args

        // Cache read-only tools — shields the shared per-IP MCP rate limit
        const key = CACHEABLE.has(name) ? `${name}:${JSON.stringify(callArgs)}` : null
        if (key) {
            const hit = MCP_CACHE.get(key)
            if (hit && Date.now() - hit.ts < CACHE_TTL) return hit.text
        }

        await this.init()
        const result = await this._rpc('tools/call', { name, arguments: { params: callArgs } })
        if (result?.error?.message === 'rate_limited') {
            return 'RATE_LIMIT: Kapruka is asking us to slow down. Tell the user warmly to try again in about 30 seconds.'
        }
        const content = result?.result?.content
        const text = Array.isArray(content)
            ? content.filter(b => b.type === 'text').map(b => b.text).join('\n')
            : JSON.stringify(result)

        if (key && !text.startsWith('Error')) MCP_CACHE.set(key, { text, ts: Date.now() })
        return text
    }
}

// ── Parsers ────────────────────────────────────────────────────────────────────
function cleanJSON(raw) {
    return raw.trim().replace(/^```json\s*/i, '').replace(/\s*```$/i, '').replace(/^```\s*/, '').replace(/\s*```$/, '')
}
function parseBlock(text, tag) {
    const m = text.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, 'i'))
    if (!m) return { found: false, data: null }
    try { return { found: true, data: JSON.parse(cleanJSON(m[1])) } }
    catch (e) { console.error(`${tag} parse:`, e.message); return { found: true, data: null } }
}
function stripBlocks(text) {
    return text
        .replace(/<PRODUCT_TRIO>[\s\S]*?<\/PRODUCT_TRIO>/gi, '')
        .replace(/<PLAN_BOARD>[\s\S]*?<\/PLAN_BOARD>/gi, '')
        .replace(/<CHIPS>[\s\S]*?<\/CHIPS>/gi, '')
        .trim()
}
function parseChips(text) {
    const m = text.match(/<CHIPS>([\s\S]*?)<\/CHIPS>/i)
    if (!m) return null
    try {
        const arr = JSON.parse(cleanJSON(m[1]))
        return Array.isArray(arr) ? arr.slice(0, 5).map(String) : null
    } catch { return null }
}

// ── History builder (capped — keeps tokens and latency under control) ─────────
const HISTORY_CAP = 16
function toGeminiHistory(messages) {
    return messages.slice(0, -1).slice(-HISTORY_CAP).map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: typeof m.content === 'string' ? m.content : JSON.stringify(m.content) }]
    }))
}

// ── Build the final JSON payload from model text ───────────────────────────────
async function buildPayload(fullText, chat) {
    let text = fullText

    // Trio: found + valid → done. Found + invalid → one corrective retry.
    let trio = parseBlock(text, 'PRODUCT_TRIO')
    if (trio.found && !trio.data) {
        const retry = await chat.sendMessage(
            'Your <PRODUCT_TRIO> JSON was invalid. Re-send ONLY the corrected <PRODUCT_TRIO> block with strictly valid JSON — double quotes, no trailing commas, nothing else.'
        )
        text = retry.response.text()
        trio = parseBlock(text, 'PRODUCT_TRIO')
    }
    if (trio.data) return { type: 'product_trio', trio: trio.data, rawText: fullText }

    let plan = parseBlock(text, 'PLAN_BOARD')
    if (plan.found && !plan.data) {
        const retry = await chat.sendMessage(
            'Your <PLAN_BOARD> JSON was invalid. Re-send ONLY the corrected <PLAN_BOARD> block with strictly valid JSON — double quotes, no trailing commas, nothing else.'
        )
        text = retry.response.text()
        plan = parseBlock(text, 'PLAN_BOARD')
    }
    if (plan.data) return { type: 'plan_board', plan: plan.data, rawText: fullText }

    // Plain chat — never leak raw tags to the user
    const chips = parseChips(text)
    const clean = stripBlocks(text)
    return {
        type: 'chat',
        text: clean || 'Let me take another look at that — could you rephrase?',
        chips,
        rawText: fullText
    }
}

// ── Route handler — streams NDJSON: status lines, then one final line ──────────
export async function POST(req) {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    if (rateLimited(ip)) {
        return new Response(JSON.stringify({ type: 'final', payload: { type: 'chat', text: 'You\u2019re moving fast! Give me a minute to catch up, then try again.' } }) + '\n',
            { status: 429, headers: { 'Content-Type': 'application/x-ndjson' } })
    }

    let body
    try { body = await req.json() } catch { return new Response('Bad request', { status: 400 }) }
    const { messages, lang = 'EN' } = body
    if (!messages?.length) return new Response('No messages', { status: 400 })

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
        async start(controller) {
            const emit = (obj) => controller.enqueue(encoder.encode(JSON.stringify(obj) + '\n'))
            try {
                const mcp = new KaprukaMCPClient()
                const model = genAI.getGenerativeModel({
                    model: 'gemini-3.1-flash-lite',   // flash, not flash-lite: reliable tool orchestration matters more than ~1s latency
                    tools: KAPRUKA_TOOLS,
                    systemInstruction: SYSTEM_PROMPT(lang)
                })

                const chat = model.startChat({ history: toGeminiHistory(messages) })
                const lastMessage = messages[messages.length - 1].content
                let result = await chat.sendMessage(lastMessage)

                let iterations = 0
                while (iterations < 8) {
                    iterations++
                    const functionCalls = result.response.functionCalls()
                    if (!functionCalls?.length) break

                    // Emit a real status line for each tool call BEFORE running it
                    for (const call of functionCalls) emit({ type: 'status', ...statusLabel(call.name, call.args) })

                    const toolResults = await Promise.all(
                        functionCalls.map(async call => {
                            let output
                            try { output = await mcp.callTool(call.name, call.args) }
                            catch (e) { output = `Error: ${e.message}` }
                            return { functionResponse: { name: call.name, response: { result: output } } }
                        })
                    )
                    result = await chat.sendMessage(toolResults)
                }

                emit({ type: 'status', icon: 'sparkles', label: 'Putting it together for you' })
                const payload = await buildPayload(result.response.text(), chat)
                emit({ type: 'final', payload })
            } catch (e) {
                console.error('Route error:', e)
                emit({ type: 'final', payload: { type: 'chat', text: 'Something went wrong on my side — try that once more?' } })
            } finally {
                controller.close()
            }
        }
    })

    return new Response(stream, {
        headers: {
            'Content-Type': 'application/x-ndjson',
            'Cache-Control': 'no-cache',
            'X-Accel-Buffering': 'no',   // disables nginx/Vercel proxy buffering
        }
    })
}
