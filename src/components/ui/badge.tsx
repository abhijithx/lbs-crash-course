"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
    {
        variants: {
            variant: {
                default: "border-transparent bg-[var(--primary)] text-[var(--primary-foreground)]",
                secondary: "border-transparent bg-[var(--secondary)] text-[var(--secondary-foreground)]",
                destructive: "border-transparent bg-[var(--destructive)] text-white",
                outline: "border-[var(--border)] text-[var(--foreground)]",
                success: "border-transparent bg-[var(--success)] text-white",
                warning: "border-transparent bg-[var(--warning)] text-black",
                live: "border-transparent bg-red-500 text-white animate-pulse",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    );
}

export { Badge, badgeVariants };
