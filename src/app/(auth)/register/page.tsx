import React, { Suspense } from "react";
import { Metadata } from "next";
import { Loader2 } from "lucide-react";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
    title: "Student Registration | LBS MCA Entrance Crash Course 2025",
    description: "Register for the LBS MCA Entrance Crash Course 2025. Secure your spot for live classes, interactive quizzes, and comprehensive mock tests for Kerala MCA preparation.",
};

export default function RegisterPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        }>
            <RegisterForm />
        </Suspense>
    );
}
