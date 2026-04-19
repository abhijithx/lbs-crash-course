import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

const getApiKeys = (envVar: string): string[] => {
    const keys = process.env[envVar] || "";
    return keys.split(",").map(k => k.trim()).filter(k => k.length > 0);
};

const GEMINI_API_KEYS = getApiKeys("GEMINI_API_KEYS");
const GROQ_API_KEYS = getApiKeys("GROQ_API_KEYS");
const NVIDIA_API_KEYS = getApiKeys("NVIDIA_API_KEYS");
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";
const PICO_API_URL = process.env.AI_API_URL || "";

// Add helpful logs for Vercel debugging
if (GEMINI_API_KEYS.length === 0) console.warn("[AI System] Notice: GEMINI_API_KEYS is not set.");
if (GROQ_API_KEYS.length === 0) console.warn("[AI System] Notice: GROQ_API_KEYS is not set.");
if (NVIDIA_API_KEYS.length === 0) console.warn("[AI System] Notice: NVIDIA_API_KEYS is not set.");
if (!GITHUB_TOKEN) console.warn("[AI System] Notice: GITHUB_TOKEN is not set.");
if (!PICO_API_URL) console.warn("[AI System] Notice: AI_API_URL is not set.");

// Standard system prompt fallback if one isn't provided in the request
const DEFAULT_SYSTEM_PROMPT = "You are an expert tutor for the LBS MCA Entrance Exam in Kerala. Answer student queries accurately and concisely. Only answer topics related to Mathematics, Computer Science, Logical Reasoning, and General Awareness for the MCA entrance. If a user asks something unrelated, politely steer them back to their studies. Keep your responses brief and focused.";

async function callGeminiAPI(prompt: string, apiKeys: string[]): Promise<string | null> {
    if (apiKeys.length === 0) return null;

    for (let i = 0; i < apiKeys.length; i++) {
        const apiKey = apiKeys[i];
        console.log(`[Gemini] Trying key ${i + 1}`);
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
                    signal: controller.signal
                }
            );
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.warn(`[Gemini] API key ${i + 1} failed with status ${response.status}:`, JSON.stringify(errorData));
                continue;
            }
            
            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
            if (text) {
                console.log(`[Gemini] Success with key ${i + 1}`);
                return text;
            }
        } catch (e) {
            console.warn(`[Gemini] API key ${i + 1} error:`, e);
        }
    }
    return null;
}

async function callGroqAPI(prompt: string, apiKeys: string[]): Promise<string | null> {
    if (apiKeys.length === 0) return null;

    for (let i = 0; i < apiKeys.length; i++) {
        const apiKey = apiKeys[i];
        console.log(`[Groq] Trying key ${i + 1}`);
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    messages: [{ role: "user", content: prompt }],
                    model: "llama-3.1-8b-instant",
                    temperature: 0.7,
                    max_tokens: 1024,
                }),
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                const err = await response.text();
                console.warn(`[Groq] API key ${i + 1} failed with status ${response.status}:`, err.slice(0, 100));
                continue;
            }
            
            const data = await response.json();
            const text = data.choices?.[0]?.message?.content || "";
            if (text) {
                console.log(`[Groq] Success with key ${i + 1}`);
                return text;
            }
        } catch (e) {
            console.warn(`[Groq] API key ${i + 1} error:`, e);
        }
    }
    return null;
}

async function callNvidiaAPI(prompt: string, apiKeys: string[]): Promise<string | null> {
    if (apiKeys.length === 0) return null;

    for (let i = 0; i < apiKeys.length; i++) {
        const apiKey = apiKeys[i];
        console.log(`[NVIDIA] Trying key ${i + 1}`);
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "meta/llama-3.1-70b-instruct",
                    messages: [{ role: "user", content: prompt }],
                    max_tokens: 1024,
                    temperature: 0.6,
                }),
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                const err = await response.text();
                console.warn(`[NVIDIA] API key ${i + 1} failed with status ${response.status}:`, err.slice(0, 100));
                continue;
            }
            
            const data = await response.json();
            const text = data.choices?.[0]?.message?.content || "";
            if (text) {
                console.log(`[NVIDIA] Success with key ${i + 1}`);
                return text;
            }
        } catch (e) {
            console.warn(`[NVIDIA] API key ${i + 1} error:`, e);
        }
    }
    return null;
}

async function callGithubAPI(prompt: string, token: string): Promise<string | null> {
    if (!token) return null;

    console.log(`[GitHub] Attempting API call...`);
    try {
        // GitHub Models moved to a standard Azure Inference endpoint in 2026.
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const response = await fetch("https://models.inference.ai.azure.com/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "meta-llama-3.1-70b-instruct",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.8,
                max_tokens: 1024,
            }),
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            const err = await response.text();
            console.warn(`[GitHub] API failed with status ${response.status}:`, err.slice(0, 100));
            return null;
        }
        
        const data = await response.json();
        const text = data.choices?.[0]?.message?.content || "";
        if (text) {
            console.log("[GitHub] Success");
            return text;
        }
    } catch (e) {
        console.warn("[GitHub] API error:", e);
    }
    return null;
}

async function callPicoAPI(prompt: string, apiUrl: string): Promise<string | null> {
    if (!apiUrl) return null;

    console.log(`[PicoApps] Attempting API call...`);
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: prompt }),
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            console.warn(`[PicoApps] API failed with status ${response.status}`);
            return null;
        }
        
        const data = await response.json();
        // PicoApps often returns simple text or { text: "..." }
        const text = typeof data === 'string' ? data : (data.text || data.response || "");
        if (text) {
            console.log("[PicoApps] Success");
            return text;
        }
    } catch (e) {
        console.warn("[PicoApps] API error:", e);
    }
    return null;
}

export async function POST(req: NextRequest) {
    try {
        const { prompt: rawPrompt } = await req.json();

        // Security: Verify ID Token (if provided)
        const authHeader = req.headers.get("Authorization");
        const idToken = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;
        
        let isAuthenticated = false;
        if (idToken && adminAuth) {
            try {
                await adminAuth.verifyIdToken(idToken);
                isAuthenticated = true;
            } catch (e) {
                console.warn("[AI Proxy] Invalid token provided:", e);
            }
        }

        // Allow guest access if prompt is simple (no context mapping) 
        // but enforce login for data-heavy queries
        const isContextSensitive = typeof rawPrompt === 'string' && rawPrompt.includes("CONTEXT:");
        if (isContextSensitive && !isAuthenticated) {
            return NextResponse.json({ 
                error: "Please login to access personalized AI analytics." 
            }, { status: 401 });
        }
        
        const prompt = typeof rawPrompt === 'string' 
            ? rawPrompt.replace(/[\x00-\x1F\x7F-\x9F]/g, "").trim() 
            : "";

        const finalPrompt = prompt.includes("CONTEXT:") ? prompt : `${DEFAULT_SYSTEM_PROMPT}\n\n${prompt}`;
        
        let text: string | null = null;

        // Try providers in priority order
        
        // 1. Groq (Fastest)
        if (!text && GROQ_API_KEYS.length > 0) {
            text = await callGroqAPI(finalPrompt, GROQ_API_KEYS);
        }

        // 2. NVIDIA
        if (!text && NVIDIA_API_KEYS.length > 0) {
            text = await callNvidiaAPI(finalPrompt, NVIDIA_API_KEYS);
        }

        // 3. GitHub
        if (!text && GITHUB_TOKEN) {
            text = await callGithubAPI(finalPrompt, GITHUB_TOKEN);
        }

        // 4. Gemini (Robust Fallback)
        if (!text && GEMINI_API_KEYS.length > 0) {
            text = await callGeminiAPI(finalPrompt, GEMINI_API_KEYS);
        }

        // 5. PicoApps (Ultimate Static Fallback)
        if (!text && PICO_API_URL) {
            text = await callPicoAPI(finalPrompt, PICO_API_URL);
        }

        if (!text) {
            console.error("[AI System] CRITICAL: All AI providers failed. Returning fallback message.");
            const providers = {
                groq: GROQ_API_KEYS.length,
                nvidia: NVIDIA_API_KEYS.length,
                github: !!GITHUB_TOKEN,
                gemini: GEMINI_API_KEYS.length,
                pico: !!PICO_API_URL
            };
            console.error("[AI System] Provider Status:", JSON.stringify(providers));
            
            const fallbackResponse = "I apologize, but AI services are currently unavailable. For immediate assistance with your LBS MCA preparation, please:\n\n1. Review your recorded classes in the dashboard\n2. Attempt practice quizzes to identify weak areas\n3. Check announcements for class schedules\n\nI will be back shortly to assist you!";
            return NextResponse.json({ text: fallbackResponse });
        }

        return NextResponse.json({ text });
    } catch (error) {
        console.error("AI Proxy Error:", error);
        return NextResponse.json({ error: "Internal server error during AI processing" }, { status: 500 });
    }
}