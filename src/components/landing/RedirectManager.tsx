"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

export default function RedirectManager() {
    const { user, userData, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (loading) return;
        if (user && userData) {
            if (userData.firstLogin) {
                router.replace("/change-password");
            } else if (userData.role === "admin") {
                router.replace("/admin");
            } else {
                router.replace("/dashboard");
            }
        }
    }, [user, userData, loading, router]);

    return null;
}
