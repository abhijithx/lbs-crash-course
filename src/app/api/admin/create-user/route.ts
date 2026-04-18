import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        // Authorization check
        const secret = process.env.ADMIN_API_SECRET;
        const requestSecret = request.headers.get("x-admin-secret");

        if (!secret || requestSecret !== secret) {
            return NextResponse.json(
                { message: "Unauthorized: Invalid or missing admin secret" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json(
                { message: "Email and password are required" },
                { status: 400 }
            );
        }

        const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
        if (!API_KEY) {
            console.error("FIREBASE_API_KEY is not configured in environment variables");
            return NextResponse.json(
                { message: "Server configuration error: Firebase API Key missing" },
                { status: 500 }
            );
        }

        // 1. Create User via Firebase REST API
        const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email,
                password,
                returnSecureToken: true
            })
        });

        const data = await response.json();

        if (!response.ok) {
            if (data.error?.message === 'EMAIL_EXISTS') {
                // If the user happens to exist already, we need to return a failure since we cannot easily query their UID 
                // without the Admin SDK. Or we can just login? 
                // Since this runs on the server, we can login to get their UID.
                const loginRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email,
                        password,
                        returnSecureToken: true
                    })
                });
                const loginData = await loginRes.json();
                if (loginRes.ok) {
                    return NextResponse.json({ uid: loginData.localId });
                }
            }
            const errorMessage = data.error?.message || "Unknown Firebase error";
            throw new Error(errorMessage);
        }

        return NextResponse.json({ uid: data.localId });

    } catch (error: unknown) {
        console.error("Create User API Error:", error);
        const err = error as Error;
        return NextResponse.json(
            { message: `Failed to create user: ${err.message}` },
            { status: 500 }
        );
    }
}
