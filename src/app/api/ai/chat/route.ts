import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_AI_API_URL;

export async function POST(req: NextRequest) {
    if (!API_URL) {
        return NextResponse.json({ error: "AI API configuration missing" }, { status: 500 });
    }

    try {
        const { prompt } = await req.json();

        if (!prompt) {
            return NextResponse.json({ error: "No prompt provided" }, { status: 400 });
        }

        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ prompt }),
        });

        if (!response.ok) {
            const status = response.status;
            return NextResponse.json({ error: `AI request failed with status ${status}` }, { status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("AI Proxy Error:", error);
        return NextResponse.json({ error: "Internal server error during AI processing" }, { status: 500 });
    }
}
