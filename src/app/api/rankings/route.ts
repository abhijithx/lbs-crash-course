import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET() {
    if (!adminDb) {
        return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
    }

    try {
        // Fetch all data in parallel using Admin SDK (bypasses security rules)
        const [quizAttsSnap, mockAttsSnap, usersSnap, quizzesSnap, mocksSnap] = await Promise.all([
            adminDb.ref("quizAttempts").once("value"),
            adminDb.ref("mockAttempts").once("value"),
            adminDb.ref("users").once("value"),
            adminDb.ref("quizzes").once("value"),
            adminDb.ref("mockTests").once("value")
        ]);

        const quizAttempts = quizAttsSnap.val() || {};
        const mockAttempts = mockAttsSnap.val() || {};
        const users = usersSnap.val() || {};
        
        // Inject IDs into quizzes and mockTests objects to match frontend expectations
        const quizzesRaw = quizzesSnap.val() || {};
        const quizzes: Record<string, any> = {};
        Object.entries(quizzesRaw).forEach(([id, val]: [string, any]) => {
            quizzes[id] = { ...val, id };
        });

        const mocksRaw = mocksSnap.val() || {};
        const mockTests: Record<string, any> = {};
        Object.entries(mocksRaw).forEach(([id, val]: [string, any]) => {
            mockTests[id] = { ...val, id };
        });

        // Convert attempts objects to arrays for easier frontend consumption
        const quizAttList = Object.entries(quizAttempts).map(([id, val]: [string, any]) => ({ ...val, id }));
        const mockAttList = Object.entries(mockAttempts).map(([id, val]: [string, any]) => ({ ...val, id }));

        return NextResponse.json({
            quizAttempts: quizAttList,
            mockAttempts: mockAttList,
            users,
            quizzes,
            mockTests
        });
    } catch (error: any) {
        console.error("Rankings API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
