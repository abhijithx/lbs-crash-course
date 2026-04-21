import { adminAuth } from "./firebase-admin";
import { NextRequest, NextResponse } from "next/server";

export async function verifySession(req: NextRequest) {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ") || !adminAuth) {
        return { user: null, error: NextResponse.json({ message: "Authentication Required" }, { status: 401 }) };
    }

    try {
        const idToken = authHeader.substring(7);
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        return { user: decodedToken, error: null };
    } catch (error) {
        console.error("[AUTH_UTILS] Token verification failed:", error);
        return { user: null, error: NextResponse.json({ message: "Invalid Session" }, { status: 401 }) };
    }
}
