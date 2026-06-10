import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are the Kapruka Navigator — a calm, confident AI shopping guide for Kapruka.com, Sri Lanka's largest e-commerce platform.

Your job is to help people accomplish life goals, not browse products. Translate goals into the right products and guide them through to checkout.

Rules:
- Always narrow to 3 strong options maximum — never dump a wall of results
- Ask about goals and outcomes, not product specs
- When you have enough info, act before asking permission
- Be warm and brief — never salesy
- Support English, Sinhala, and Tanglish — detect which language the user writes in and respond in kind
- Today's date is ${new Date().toISOString().slice(0, 10)}`;

// ─── Kapruka MCP Client ───────────────────────────────────────────────────────
// One instance per request. Initializes once, reused for all tool calls.

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

// ─── Kapruka Tool Definitions for Gemini ─────────────────────────────────────

const KAPRUKA_TOOLS = [{
    functionDeclarations: [
        {
            name: 'kapruka_search_products',
            description: 'Search the Kapruka product catalog by keyword. Returns product names, IDs, prices, images, and stock status. Use this to find products for the user.',
            parameters: {
                type: 'object',
                properties: {
                    q: { type: 'string', description: 'Search keyword e.g. birthday cake, roses, chocolate' },
                    category: { type: 'string', description: 'Category filter. Valid values: Birthday, cakes, flowers, Chocolates, Grocery, Clothing, Cosmetics, Books, Fruits, KidsToys, Giftset' },
                    min_price: { type: 'number', description: 'Minimum price in LKR' },
                    max_price: { type: 'number', description: 'Maximum price in LKR' },
                    in_stock_only: { type: 'boolean', description: 'Only return in-stock products' },
                    limit: { type: 'number', description: 'Max results, default 5, max 10' },
                    currency: { type: 'string', description: 'Currency code, default LKR' }
                },
                required: ['q']
            }
        },
        {
            name: 'kapruka_get_product',
            description: 'Get full details for a specific product by its ID including images, variants, and shipping info.',
            parameters: {
                type: 'object',
                properties: {
                    product_id: { type: 'string', description: 'The product ID from search results' },
                    currency: { type: 'string', description: 'Currency code, default LKR' }
                },
                required: ['product_id']
            }
        },
        {
            name: 'kapruka_list_categories',
            description: 'List all product categories available on Kapruka.',
            parameters: {
                type: 'object',
                properties: {}
            }
        },
        {
            name: 'kapruka_list_delivery_cities',
            description: 'Search for cities in the Kapruka delivery network.',
            parameters: {
                type: 'object',
                properties: {
                    query: { type: 'string', description: 'City name to search for e.g. Kandy, Colombo, Galle' },
                    limit: { type: 'number', description: 'Max results, default 10' }
                },
                required: ['query']
            }
        },
        {
            name: 'kapruka_check_delivery',
            description: 'Check if delivery is available to a city on a given date, and get the delivery fee. Always run this before confirming a delivery.',
            parameters: {
                type: 'object',
                properties: {
                    city: { type: 'string', description: 'Delivery city name e.g. Kandy' },
                    delivery_date: { type: 'string', description: 'Date in YYYY-MM-DD format' },
                    product_id: { type: 'string', description: 'Product ID — required for cakes and flowers to get perishable warnings' }
                },
                required: ['city', 'delivery_date']
            }
        },
        {
            name: 'kapruka_create_order',
            description: 'Create a guest checkout order and return a click-to-pay URL. Prices are locked for 60 minutes.',
            parameters: {
                type: 'object',
                properties: {
                    cart: {
                        type: 'array',
                        description: 'List of items to order',
                        items: {
                            type: 'object',
                            properties: {
                                product_id: { type: 'string' },
                                quantity: { type: 'number' },
                                icing_text: { type: 'string', description: 'Text to write on cake if applicable' }
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
                    gift_message: { type: 'string', description: 'Optional gift message to include' },
                    currency: { type: 'string', description: 'Currency code, default LKR' }
                },
                required: ['cart', 'recipient', 'delivery', 'sender']
            }
        },
        {
            name: 'kapruka_track_order',
            description: 'Track an existing order by order number. Returns status and delivery progress.',
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

// ─── Message format helpers ───────────────────────────────────────────────────

function toGeminiHistory(messages) {
    // Convert our {role, content} format to Gemini's {role, parts} format
    // Skip the last message — that gets sent via chat.sendMessage()
    return messages.slice(0, -1).map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: typeof m.content === 'string' ? m.content : JSON.stringify(m.content) }]
    }));
}

// ─── Main handler ─────────────────────────────────────────────────────────────

export async function POST(req) {
    try {
        const { messages } = await req.json();
        if (!messages || messages.length === 0) {
            return NextResponse.json({ error: 'No messages provided' }, { status: 400 });
        }

        const mcp = new KaprukaMCPClient();

        const model = genAI.getGenerativeModel({
            model: 'gemini-3.1-flash-lite',
            tools: KAPRUKA_TOOLS,
            systemInstruction: SYSTEM_PROMPT
        });

        const chat = model.startChat({
            history: toGeminiHistory(messages)
        });

        const lastMessage = messages[messages.length - 1].content;
        let result = await chat.sendMessage(lastMessage);

        // Agentic loop — keep going until Gemini stops calling tools
        let iterations = 0;
        while (iterations < 10) {
            iterations++;
            const functionCalls = result.response.functionCalls();

            if (!functionCalls || functionCalls.length === 0) {
                // No more tool calls — return final answer
                const text = result.response.text();
                return NextResponse.json({ text });
            }

            console.log('Tool calls:', functionCalls.map(c => c.name));

            // Execute all tool calls in parallel
            const toolResults = await Promise.all(
                functionCalls.map(async (call) => {
                    let output;
                    try {
                        output = await mcp.callTool(call.name, call.args);
                    } catch (e) {
                        output = `Error calling ${call.name}: ${e.message}`;
                    }
                    return {
                        functionResponse: {
                            name: call.name,
                            response: { result: output }
                        }
                    };
                })
            );

            // Send tool results back to Gemini and continue
            result = await chat.sendMessage(toolResults);
        }

        // Fallback if loop limit hit
        return NextResponse.json({ text: result.response.text() });

    } catch (e) {
        console.error('Route error:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}