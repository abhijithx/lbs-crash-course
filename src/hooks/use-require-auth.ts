"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

// Hook to protect routes that require authentication
export function useRequireAuth(requiredRole?: "admin" | "student") {
    const { user, userData, loading, isAdmin } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (loading) return;

        if (!user) {
            router.replace("/login");
            return;
        }

        // Check if first login — force password change
        if (userData?.firstLogin) {
            router.replace("/change-password");
            return;
        }

        // Check role
        if (requiredRole === "admin" && !isAdmin) {
            router.replace("/dashboard");
            return;
        }

        if (requiredRole === "student" && isAdmin) {
            router.replace("/admin");
            return;
        }
    }, [user, userData, loading, isAdmin, requiredRole, router]);

    return { user, userData, loading, isAdmin };
}
