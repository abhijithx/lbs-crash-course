import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

const PICO_API_URL = process.env.AI_API_URL || "";

// Standard system prompt fallback
const DEFAULT_SYSTEM_PROMPT = "You are an expert academic tutor for the LBS MCA Entrance Exam (Kerala), developed by Ajmal U K, Founder of ToolPix. Answer queries based on the 120-question exam pattern: CS (50 Qs), Math (25 Qs), Aptitude (25 Qs), English (15 Qs), and GK (5 Qs). Provide technically deep explanations for topics like 2's Complement, Floating Point, Boolean Algebra, Coordinate Geometry, and Trigonometry. If asked unrelated questions, politely guide them back to their LBS MCA preparation.";

async function callPicoAPI(prompt: string, apiUrl: string): Promise<string | null> {
    if (!apiUrl) return null;

    console.log(`[PicoApps] Attempting AI call...`);
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout for stability

        const response = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: prompt }),
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            console.error(`[PicoApps] API failed with status ${response.status}`);
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
        console.error("[PicoApps] API error:", e);
    }
    return null;
}

export async function POST(req: NextRequest) {
    try {
        const { prompt: rawPrompt } = await req.json();

        // 1. Authentication Check
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

        // 2. Guest Check
        const isContextSensitive = typeof rawPrompt === 'string' && rawPrompt.includes("CONTEXT:");
        if (isContextSensitive && !isAuthenticated) {
            return NextResponse.json({ 
                error: "Please login to access personalized AI analytics." 
            }, { status: 401 });
        }
        
        // 3. Sanitization
        const prompt = typeof rawPrompt === 'string' 
            ? rawPrompt.replace(/[\x00-\x1F\x7F-\x9F]/g, "").trim() 
            : "";

        const finalPrompt = prompt.includes("CONTEXT:") ? prompt : `${DEFAULT_SYSTEM_PROMPT}\n\n${prompt}`;
        
        // 4. Simplified Response (Removed complex sequential proxies as requested)
        if (!PICO_API_URL) {
            console.error("[AI System] Missing AI_API_URL configuration.");
            return NextResponse.json({ text: "AI service configuration missing." }, { status: 500 });
        }

        const text = await callPicoAPI(finalPrompt, PICO_API_URL);
        
        if (!text) {
            console.error("[AI System] PicoApps failed to provide a response.");
            const fallbackResponse = "I apologize, but I'm currently unable to generate a response. Please try visiting your dashboard for study materials.";
            return NextResponse.json({ text: fallbackResponse });
        }

        // Return direct JSON since PicoApps is non-streaming for now
        return NextResponse.json({ text: text });

    } catch (error) {
        console.error("AI Proxy Error:", error);
        return NextResponse.json({ error: "Internal server error during AI processing" }, { status: 500 });
    }
}