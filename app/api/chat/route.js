import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
export const maxDuration = 60

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

//System prompt

const SYSTEM_PROMPT = (lang) => `You are the Kapruka Flow navigator — a calm, confident AI guide for Kapruka.com, Sri Lanka's largest e-commerce platform. Today's date is ${new Date().toISOString().slice(0, 10)}.

${lang === 'SI' ? 'LANGUAGE: The user has selected Sinhala. Respond entirely in Sinhala (සිංහල) throughout the conversation. All messages, labels, and the gift_message field must be in Sinhala.' : ''}
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

═══ AFTER ORDER CREATION ═══
Respond with the checkout URL, order ref, and expiry. Example:
"Your order is locked — ORD-20260613-XXXX. Pay here: https://www.kapruka.com/tools/continue_order.jsp?id=XXXX — prices held until 2026-06-13T14:22:00+05:30."

═══ RULES ═══
- Always verify delivery with kapruka_check_delivery before confirming dates
- For cakes and flowers, warn about perishable delivery constraints
- Never invent product IDs, prices, or image URLs
- Output ONLY ONE structured block per response (either PRODUCT_TRIO or PLAN_BOARD, never both)`

//Tool definitions

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

//MCP Client

class KaprukaMCPClient {
    constructor() { this.sessionId = null; this.msgId = 1; this.ready = false }

    async _rpc(method, params = {}, isNotif = false) {
        const body = { jsonrpc: '2.0', method, params }
        if (!isNotif) body.id = this.msgId++
        const headers = { 'Content-Type': 'application/json', 'Accept': 'application/json, text/event-stream' }
        if (this.sessionId) headers['mcp-session-id'] = this.sessionId

        const res = await fetch('https://mcp.kapruka.com/mcp', { method: 'POST', headers, body: JSON.stringify(body) })
        const sid = res.headers.get('mcp-session-id')
        if (sid) this.sessionId = sid
        if (isNotif) return null

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
        await this.init()
        const result = await this._rpc('tools/call', { name, arguments: { params: args } })
        const content = result?.result?.content
        if (Array.isArray(content)) return content.filter(b => b.type === 'text').map(b => b.text).join('\n')
        return JSON.stringify(result)
    }
}

//Parsers

function cleanJSON(raw) {
    return raw.trim().replace(/^```json\s*/i, '').replace(/\s*```$/i, '').replace(/^```\s*/, '').replace(/\s*```$/, '')
}

function parsePlanBoard(text) {
    const m = text.match(/<PLAN_BOARD>([\s\S]*?)<\/PLAN_BOARD>/i)
    if (!m) return null
    try { return JSON.parse(cleanJSON(m[1])) } catch (e) { console.error('PLAN_BOARD parse:', e.message); return null }
}

function parseProductTrio(text) {
    const m = text.match(/<PRODUCT_TRIO>([\s\S]*?)<\/PRODUCT_TRIO>/i)
    if (!m) return null
    try { return JSON.parse(cleanJSON(m[1])) } catch (e) { console.error('PRODUCT_TRIO parse:', e.message); return null }
}

//History builder

function toGeminiHistory(messages) {
    return messages.slice(0, -1).map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: typeof m.content === 'string' ? m.content : JSON.stringify(m.content) }]
    }))
}

//Route handler

export async function POST(req) {
    try {
        const { messages, lang = 'EN' } = await req.json()
        if (!messages?.length) return NextResponse.json({ error: 'No messages' }, { status: 400 })

        const mcp = new KaprukaMCPClient()
        const model = genAI.getGenerativeModel({
            model: 'gemini-3.1-flash-lite',
            tools: KAPRUKA_TOOLS,
            systemInstruction: SYSTEM_PROMPT(lang)
        })

        const chat = model.startChat({ history: toGeminiHistory(messages) })
        const lastMessage = messages[messages.length - 1].content
        let result = await chat.sendMessage(lastMessage)

        let iterations = 0
        while (iterations < 10) {
            iterations++
            const functionCalls = result.response.functionCalls()
            if (!functionCalls?.length) break

            console.log('🔧', functionCalls.map(c => c.name).join(', '))
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

        const fullText = result.response.text()

        // Check for structured outputs
        const trio = parseProductTrio(fullText)
        if (trio) return NextResponse.json({ type: 'product_trio', trio, rawText: fullText })

        const plan = parsePlanBoard(fullText)
        if (plan) return NextResponse.json({ type: 'plan_board', plan, rawText: fullText })

        return NextResponse.json({ type: 'chat', text: fullText, rawText: fullText })

    } catch (e) {
        console.error('Route error:', e)
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}