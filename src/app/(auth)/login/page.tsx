import React, { Suspense } from "react";
import { Metadata } from "next";
import { PageLoader } from "@/components/ui/loading";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
    title: "Student Login | LBS MCA Entrance Learning Platform",
    description: "Login to your LBS MCA account to access live classes, recorded lectures, and mock tests. The official preparation platform for Kerala MCA Entrance aspirants.",
};

export default function LoginPage() {
    return (
        <Suspense fallback={<PageLoader />}>
            <LoginForm />
        </Suspense>
    );
}
