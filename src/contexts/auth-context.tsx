"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    updatePassword,
    User,
    EmailAuthProvider,
    reauthenticateWithCredential,
} from "firebase/auth";
import {
    ref,
    get,
    set,
    onValue,
    update,
} from "firebase/database";
import { auth, db } from "@/lib/firebase";
import { useOneSignal } from "@/lib/onesignal";
import type { UserData } from "@/lib/types";

interface AuthContextType {
    user: User | null;
    userData: UserData | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
    isAdmin: boolean;
    isVerified: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    useOneSignal();

    // Generate unique session ID
    const generateSessionId = () => {
        return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    };

    // Listen to auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);
            if (firebaseUser) {
                // Fetch user data from Realtime DB
                const userRef = ref(db, `users/${firebaseUser.uid}`);
                const snapshot = await get(userRef);
                if (snapshot.exists()) {
                    const data = snapshot.val() as UserData;
                    setUserData({ ...data, uid: firebaseUser.uid });
                }
            } else {
                setUserData(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Listen for session invalidation (single-device enforcement)
    useEffect(() => {
        if (!user || !userData) return;

        const currentSessionId = sessionStorage.getItem("sessionId");
        if (!currentSessionId) return;

        const sessionRef = ref(db, `users/${user.uid}/activeSessionId`);
        const unsubscribe = onValue(sessionRef, (snapshot) => {
            const activeSessionId = snapshot.val();
            if (activeSessionId && activeSessionId !== currentSessionId) {
                // Session was overwritten by another login — force logout
                signOut(auth);
                sessionStorage.removeItem("sessionId");
                if (typeof window !== "undefined") {
                    window.location.href = "/login?reason=session_expired";
                }
            }
        });

        return () => unsubscribe();
    }, [user, userData]);

    const login = useCallback(async (email: string, password: string) => {
        const result = await signInWithEmailAndPassword(auth, email, password);

        // Generate and save session ID for single-device enforcement
        const sessionId = generateSessionId();
        sessionStorage.setItem("sessionId", sessionId);

        // Update session in DB
        await update(ref(db, `users/${result.user.uid}`), {
            activeSessionId: sessionId,
        });

        // Fetch user data
        const userRef = ref(db, `users/${result.user.uid}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
            const data = snapshot.val() as UserData;
            setUserData({ ...data, uid: result.user.uid });
        }
    }, []);

    const logout = useCallback(async () => {
        if (user) {
            // Clear session ID in DB
            await set(ref(db, `users/${user.uid}/activeSessionId`), null);
        }
        sessionStorage.removeItem("sessionId");
        await signOut(auth);
        setUserData(null);
    }, [user]);

    const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
        if (!user || !user.email) throw new Error("No user logged in");

        // Re-authenticate first
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);

        // Update password
        await updatePassword(user, newPassword);

        // Mark first login complete
        if (userData?.firstLogin) {
            await update(ref(db, `users/${user.uid}`), { firstLogin: false });
            setUserData((prev) => prev ? { ...prev, firstLogin: false } : null);
        }
    }, [user, userData]);

    const isAdmin = userData?.role === "admin";
    const isVerified = userData?.status === "verified";

    return (
        <AuthContext.Provider
            value={{
                user,
                userData,
                loading,
                login,
                logout,
                changePassword,
                isAdmin,
                isVerified,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
