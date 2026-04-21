import { adminAuth, adminDb } from "./firebase-admin";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * For API Routes - verifies Bearer token in header
 */
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

/**
 * For Server Actions - verifies __session cookie
 */
export async function verifyActionSession() {
    const session = (await cookies()).get("__session")?.value;
    if (!session || !adminAuth) return null;

    try {
        return await adminAuth.verifyIdToken(session);
    } catch (error) {
        console.error("[AUTH_UTILS] Action session verification failed:", error);
        return null;
    }
}

/**
 * High-level helper to verify admin role
 * Works for both API routes (pass req) and Server Actions (no req)
 */
export async function verifyAdmin(req?: NextRequest) {
    let decodedToken;
    
    if (req) {
        const { user } = await verifySession(req);
        decodedToken = user;
    } else {
        decodedToken = await verifyActionSession();
    }

    if (!decodedToken || !adminDb) return null;

    try {
        const userRef = adminDb.ref(`users/${decodedToken.uid}`);
        const snapshot = await userRef.get();
        const userData = snapshot.val();

        if (userData?.role === "admin") {
            return { ...decodedToken, role: "admin" as const };
        }
        
        console.warn(`[SECURITY_ALERT] Non-admin access attempt by UID: ${decodedToken.uid}`);
        return null;
    } catch (error) {
        console.error("[AUTH_UTILS] Admin verification failed:", error);
        return null;
    }
}
