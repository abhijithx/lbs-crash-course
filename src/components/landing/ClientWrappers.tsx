"use client";

import { useAuth } from "@/contexts/auth-context";
import Navbar from "./Navbar";
import CTASection from "./CTASection";

export function NavbarWrapper() {
    const { user, userData } = useAuth();
    const isAdmin = userData?.role === "admin";
    const dashboardLink = isAdmin ? "/admin" : "/dashboard";

    return (
        <Navbar 
            user={user} 
            userData={userData} 
            isAdmin={isAdmin} 
            dashboardLink={dashboardLink} 
        />
    );
}

export function CTAWrapper() {
    const { user, userData } = useAuth();
    const isAdmin = userData?.role === "admin";
    const dashboardLink = isAdmin ? "/admin" : "/dashboard";

    return (
        <CTASection 
            user={user} 
            userData={userData} 
            isAdmin={isAdmin} 
            dashboardLink={dashboardLink} 
        />
    );
}
