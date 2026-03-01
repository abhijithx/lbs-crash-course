"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { GraduationCap } from "lucide-react";

function LoadingSpinner({ className }: { className?: string }) {
    return (
        <div className={cn("flex items-center justify-center", className)}>
            <div className="relative h-8 w-8">
                <div className="absolute inset-0 rounded-full border-2 border-[var(--muted)]" />
                <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[var(--primary)] animate-spin" />
            </div>
        </div>
    );
}

function PageLoader() {
    return (
        <div className="flex h-screen items-center justify-center bg-[var(--background)]">
            <div className="flex flex-col items-center gap-4 animate-fade-in">
                <div className="relative">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary animate-float">
                        <GraduationCap className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute inset-0 rounded-2xl gradient-primary opacity-30 blur-xl" />
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-[var(--primary)] animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="h-2 w-2 rounded-full bg-[var(--primary)] animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="h-2 w-2 rounded-full bg-[var(--primary)] animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
            </div>
        </div>
    );
}

function CardSkeleton({ className }: { className?: string }) {
    return (
        <div className={cn("rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6", className)}>
            <div className="space-y-4">
                <div className="h-4 w-3/4 rounded-lg shimmer" />
                <div className="h-3 w-1/2 rounded-lg shimmer" />
                <div className="h-10 w-full rounded-lg shimmer" />
            </div>
        </div>
    );
}

function TableSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="rounded-xl border border-[var(--border)] overflow-hidden">
            <div className="p-4 space-y-3">
                {Array.from({ length: rows }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full shimmer shrink-0" />
                        <div className="flex-1 space-y-2">
                            <div className="h-3 w-2/3 rounded shimmer" />
                            <div className="h-2.5 w-1/3 rounded shimmer" />
                        </div>
                        <div className="h-8 w-20 rounded-lg shimmer" />
                    </div>
                ))}
            </div>
        </div>
    );
}

function StatCardSkeleton() {
    return (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
            <div className="h-10 w-10 rounded-xl shimmer mb-3" />
            <div className="h-7 w-12 rounded shimmer mb-1" />
            <div className="h-3 w-24 rounded shimmer" />
        </div>
    );
}

export { LoadingSpinner, PageLoader, CardSkeleton, TableSkeleton, StatCardSkeleton };
