"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TabsProps {
    value: string;
    onValueChange: (value: string) => void;
    children: React.ReactNode;
    className?: string;
}

function Tabs({ value, onValueChange, children, className }: TabsProps) {
    return (
        <div className={cn("w-full", className)} data-value={value}>
            {React.Children.map(children, (child) => {
                if (React.isValidElement(child)) {
                    return React.cloneElement(child as React.ReactElement<{ value?: string; activeValue?: string; onValueChange?: (v: string) => void }>, {
                        activeValue: value,
                        onValueChange,
                    });
                }
                return child;
            })}
        </div>
    );
}

interface TabsListProps {
    children: React.ReactNode;
    className?: string;
    activeValue?: string;
    onValueChange?: (value: string) => void;
}

function TabsList({ children, className, activeValue, onValueChange }: TabsListProps) {
    return (
        <div className={cn("inline-flex items-center gap-1 rounded-xl bg-[var(--muted)] p-1", className)}>
            {React.Children.map(children, (child) => {
                if (React.isValidElement(child)) {
                    return React.cloneElement(child as React.ReactElement<{ activeValue?: string; onValueChange?: (v: string) => void }>, {
                        activeValue,
                        onValueChange,
                    });
                }
                return child;
            })}
        </div>
    );
}

interface TabsTriggerProps {
    value: string;
    children: React.ReactNode;
    className?: string;
    activeValue?: string;
    onValueChange?: (value: string) => void;
}

function TabsTrigger({ value, children, className, activeValue, onValueChange }: TabsTriggerProps) {
    const isActive = activeValue === value;
    return (
        <button
            type="button"
            className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all cursor-pointer",
                isActive
                    ? "bg-[var(--card)] text-[var(--foreground)] shadow-sm"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
                className
            )}
            onClick={() => onValueChange?.(value)}
        >
            {children}
        </button>
    );
}

interface TabsContentProps {
    value: string;
    children: React.ReactNode;
    className?: string;
    activeValue?: string;
}

function TabsContent({ value, children, className, activeValue }: TabsContentProps) {
    if (activeValue !== value) return null;
    return (
        <div className={cn("mt-4 animate-fade-in", className)}>
            {children}
        </div>
    );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
