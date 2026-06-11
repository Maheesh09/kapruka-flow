import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ─── System Prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = () => `You are the Kapruka Navigator — a calm, confident AI shopping guide for Kapruka.com, Sri Lanka's largest e-commerce platform. Today's date is ${new Date().toISOString().slice(0, 10)}.

═══ PERSONALITY ═══
- Warm, brief, never salesy. You are a guide, not a salesperson.
- Always narrow results to exactly 3 options. Never dump a wall of products.
- Act before asking — when you have enough info, search and check delivery immediately.
- Detect the user's language and respond in the same language: English, Sinhala, or Tanglish.
- For Sinhala input, respond in Sinhala. For Tanglish (mixed Sinhala-English), respond in Tanglish.

═══ YOUR JOB ═══
People don't want to "buy products" — they want to celebrate someone, send love, fix a problem.
Start from their goal. Ask about the occasion and person, not the product specs.
Translate: Goal → Right Products → Delivery Check → Plan → Checkout.

═══ CONVERSATION FLOW ═══
1. Understand the goal (occasion, recipient, city, date, budget if mentioned)
2. Search products proactively — don't ask permission to search
3. Check delivery to the city on the date BEFORE presenting options
4. Present exactly 3 options with name and price
5. When user selects one → generate a PLAN_BOARD (see format below)
6. If recipient details are missing, set needs_recipient: true
7. When all details are complete → create the order when asked

═══ PLAN BOARD FORMAT ═══
Generate a PLAN_BOARD when ALL of these are true:
✓ User has selected or confirmed a specific product
✓ Delivery city is known
✓ Delivery date is known

Wrap it EXACTLY like this — no text before the opening tag:

<PLAN_BOARD>
{
  "occasion": "e.g. Amma's Birthday",
  "message": "A short warm sentence to show above the board",
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
      "product_id": "exact ID from search results",
      "name": "exact product name",
      "price": 5020,
      "image_url": "exact URL from search results or null",
      "url": "exact product URL from search results or null",
      "quantity": 1,
      "icing_text": null
    }
  ],
  "gift_message": null,
  "subtotal": 5020,
  "delivery_fee": 450,
  "total": 5470,
  "currency": "LKR",
  "needs_recipient": true
}
</PLAN_BOARD>

IMPORTANT PLAN_BOARD rules:
- Use exact product IDs and image URLs from tool results — never invent them
- Set needs_recipient: false only when you have name, phone, AND address
- If user provides recipient details, include them in the recipient object
- When updating a plan (e.g. user changes product or adds recipient), emit a fresh PLAN_BOARD
- Do NOT add any text after </PLAN_BOARD> — the board message field handles the text

═══ AFTER ORDER CREATION ═══
When kapruka_create_order succeeds, respond with:
- The checkout URL as a clickable link
- The order reference number
- A note that prices are locked for 60 minutes
- Ask if they want to track the order later

═══ RULES ═══
- Always verify delivery availability with kapruka_check_delivery before confirming dates
- For cakes and flowers, always warn about perishable delivery constraints
- Never invent product IDs, prices, or image URLs — only use values from tool results
- If a search returns no results, say so honestly and suggest alternatives`;

// ─── Kapruka Tool Definitions ─────────────────────────────────────────────────

const KAPRUKA_TOOLS = [{
    functionDeclarations: [
        {
            name: 'kapruka_search_products',
            description: 'Search the Kapruka product catalog by keyword. Returns product names, IDs, prices, image URLs, and stock status. Always use this to find products.',
            parameters: {
                type: 'object',
                properties: {
                    q: { type: 'string', description: 'Search keyword e.g. birthday cake, roses, chocolate gift' },
                    category: { type: 'string', description: 'Category filter. Valid: Birthday, cakes, flowers, Chocolates, Grocery, Clothing, Cosmetics, Books, Fruits, KidsToys, Giftset' },
                    min_price: { type: 'number', description: 'Minimum price in LKR' },
                    max_price: { type: 'number', description: 'Maximum price in LKR' },
                    in_stock_only: { type: 'boolean', description: 'Only return in-stock products' },
                    limit: { type: 'number', description: 'Max results, default 5' },
                    currency: { type: 'string', description: 'Currency code, default LKR' }
                },
                required: ['q']
            }
        },
        {
            name: 'kapruka_get_product',
            description: 'Get full details for a specific product by ID including images, variants, and shipping info.',
            parameters: {
                type: 'object',
                properties: {
                    product_id: { type: 'string', description: 'Product ID from search results' },
                    currency: { type: 'string', description: 'Currency code, default LKR' }
                },
                required: ['product_id']
            }
        },
        {
            name: 'kapruka_list_categories',
            description: 'List all product categories available on Kapruka.',
            parameters: { type: 'object', properties: {} }
        },
        {
            name: 'kapruka_list_delivery_cities',
            description: 'Search for cities in the Kapruka delivery network.',
            parameters: {
                type: 'object',
                properties: {
                    query: { type: 'string', description: 'City name to search e.g. Kandy, Colombo, Galle' },
                    limit: { type: 'number', description: 'Max results, default 10' }
                },
                required: ['query']
            }
        },
        {
            name: 'kapruka_check_delivery',
            description: 'Check if delivery is available to a city on a given date. Always run this before confirming a delivery date.',
            parameters: {
                type: 'object',
                properties: {
                    city: { type: 'string', description: 'Delivery city name' },
                    delivery_date: { type: 'string', description: 'Date in YYYY-MM-DD format' },
                    product_id: { type: 'string', description: 'Product ID — needed for perishable warnings on cakes and flowers' }
                },
                required: ['city', 'delivery_date']
            }
        },
        {
            name: 'kapruka_create_order',
            description: 'Create a guest checkout order and return a click-to-pay URL. Prices locked for 60 minutes. Only call this when you have ALL required fields.',
            parameters: {
                type: 'object',
                properties: {
                    cart: {
                        type: 'array',
                        description: 'Items to order',
                        items: {
                            type: 'object',
                            properties: {
                                product_id: { type: 'string' },
                                quantity: { type: 'number' },
                                icing_text: { type: 'string', description: 'Text to write on cake' }
                            },
                            required: ['product_id', 'quantity']
                        }
                    },
                    recipient: {
                        type: 'object',
                        properties: {
                            name: { type: 'string' },
                            phone: { type: 'string' }
                        },
                        required: ['name', 'phone']
                    },
                    delivery: {
                        type: 'object',
                        properties: {
                            address: { type: 'string' },
                            city: { type: 'string' },
                            location_type: { type: 'string', description: 'house, apartment, or office' },
                            date: { type: 'string', description: 'YYYY-MM-DD' },
                            instructions: { type: 'string' }
                        },
                        required: ['address', 'city', 'date']
                    },
                    sender: {
                        type: 'object',
                        properties: {
                            name: { type: 'string' },
                            anonymous: { type: 'boolean' }
                        },
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
                properties: {
                    order_number: { type: 'string', description: 'Order number e.g. ORD-20260610-XXXX' }
                },
                required: ['order_number']
            }
        }
    ]
}];

// ─── Kapruka MCP Client ───────────────────────────────────────────────────────

class KaprukaMCPClient {
    constructor() {
        this.sessionId = null;
        this.msgId = 1;
        this.ready = false;
    }

    async _rpc(method, params = {}, isNotif = false) {
        const body = { jsonrpc: '2.0', method, params };
        if (!isNotif) body.id = this.msgId++;

        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json, text/event-stream'
        };
        if (this.sessionId) headers['mcp-session-id'] = this.sessionId;

        const res = await fetch('https://mcp.kapruka.com/mcp', {
            method: 'POST',
            headers,
            body: JSON.stringify(body)
        });

        const sid = res.headers.get('mcp-session-id');
        if (sid) this.sessionId = sid;
        if (isNotif) return null;

        const ct = res.headers.get('content-type') || '';
        if (ct.includes('text/event-stream')) {
            const text = await res.text();
            for (const line of text.split('\n').filter(l => l.startsWith('data:')).reverse()) {
                try { return JSON.parse(line.slice(5).trim()); } catch { }
            }
            return null;
        }
        return res.json();
    }

    async init() {
        if (this.ready) return;
        await this._rpc('initialize', {
            protocolVersion: '2025-03-26',
            capabilities: {},
            clientInfo: { name: 'kapruka-navigator', version: '1' }
        });
        await this._rpc('notifications/initialized', {}, true);
        this.ready = true;
    }

    async callTool(name, args) {
        await this.init();
        const result = await this._rpc('tools/call', { name, arguments: { params: args } });
        const content = result?.result?.content;
        if (Array.isArray(content)) {
            return content.filter(b => b.type === 'text').map(b => b.text).join('\n');
        }
        return JSON.stringify(result);
    }
}

// ─── Plan Board Parser ────────────────────────────────────────────────────────

function parsePlanBoard(text) {
    let match = text.match(/<PLAN_BOARD>([\s\S]*?)<\/PLAN_BOARD>/i);
    if (!match) return null;

    // Strip markdown code fences Gemini sometimes adds
    let json = match[1].trim();
    json = json.replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
    json = json.replace(/^```\s*/, '').replace(/\s*```$/, '');

    try {
        return JSON.parse(json);
    } catch (e) {
        console.error('Plan board parse failed:', e.message);
        console.error('Raw content:', json.slice(0, 300));
        return null;
    }
}

function stripPlanBoard(text) {
    return text.replace(/<PLAN_BOARD>[\s\S]*?<\/PLAN_BOARD>/g, '').trim();
}

// ─── History Builder ──────────────────────────────────────────────────────────

function toGeminiHistory(messages) {
    return messages.slice(0, -1).map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: typeof m.content === 'string' ? m.content : JSON.stringify(m.content) }]
    }));
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(req) {
    try {
        const { messages } = await req.json();
        if (!messages || messages.length === 0) {
            return NextResponse.json({ error: 'No messages' }, { status: 400 });
        }

        const mcp = new KaprukaMCPClient();

        const model = genAI.getGenerativeModel({
            model: 'gemini-3.1-flash-lite',
            tools: KAPRUKA_TOOLS,
            systemInstruction: SYSTEM_PROMPT()
        });

        const chat = model.startChat({ history: toGeminiHistory(messages) });
        const lastMessage = messages[messages.length - 1].content;

        let result = await chat.sendMessage(lastMessage);

        // Agentic loop — keep going until Gemini stops calling tools
        let iterations = 0;
        while (iterations < 10) {
            iterations++;
            const functionCalls = result.response.functionCalls();

            if (!functionCalls || functionCalls.length === 0) {
                // No more tool calls — process the final response
                const fullText = result.response.text();
                const plan = parsePlanBoard(fullText);

                if (plan) {
                    // Return structured plan board
                    return NextResponse.json({
                        type: 'plan_board',
                        plan,
                        // Keep full text in rawText so it goes into history correctly
                        rawText: fullText
                    });
                }

                // Plain chat response
                return NextResponse.json({
                    type: 'chat',
                    text: fullText,
                    rawText: fullText
                });
            }

            console.log('🔧 Tool calls:', functionCalls.map(c => c.name).join(', '));

            // Execute all tool calls (in parallel when possible)
            const toolResults = await Promise.all(
                functionCalls.map(async (call) => {
                    let output;
                    try {
                        output = await mcp.callTool(call.name, call.args);
                    } catch (e) {
                        console.error(`Tool error (${call.name}):`, e.message);
                        output = `Error: ${e.message}`;
                    }
                    return {
                        functionResponse: {
                            name: call.name,
                            response: { result: output }
                        }
                    };
                })
            );

            result = await chat.sendMessage(toolResults);
        }

        // Loop limit hit — return whatever we have
        const fallback = result.response.text();
        return NextResponse.json({ type: 'chat', text: fallback, rawText: fallback });

    } catch (e) {
        console.error('Route error:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}