"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccordionContextValue {
    value: string | string[];
    onValueChange: (value: string) => void;
    type: "single" | "multiple";
}

const AccordionContext = React.createContext<AccordionContextValue | undefined>(undefined);

export function Accordion({
    type = "single",
    defaultValue,
    value: controlledValue,
    onValueChange: controlledOnValueChange,
    children,
    className
}: {
    type?: "single" | "multiple";
    defaultValue?: string | string[];
    value?: string | string[];
    onValueChange?: (value: any) => void;
    children: React.ReactNode;
    className?: string;
}) {
    const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue || (type === "multiple" ? [] : ""));

    const isControlled = controlledValue !== undefined;
    const value = isControlled ? controlledValue : uncontrolledValue;

    const onValueChange = React.useCallback((itemValue: string) => {
        if (type === "single") {
            const newValue = value === itemValue ? "" : itemValue;
            if (!isControlled) setUncontrolledValue(newValue);
            controlledOnValueChange?.(newValue);
        } else {
            const currentValues = Array.isArray(value) ? value : [];
            const newValue = currentValues.includes(itemValue)
                ? currentValues.filter(v => v !== itemValue)
                : [...currentValues, itemValue];
            if (!isControlled) setUncontrolledValue(newValue);
            controlledOnValueChange?.(newValue);
        }
    }, [type, value, isControlled, controlledOnValueChange]);

    return (
        <AccordionContext.Provider value={{ value, onValueChange, type }}>
            <div className={cn("space-y-2", className)}>
                {children}
            </div>
        </AccordionContext.Provider>
    );
}

export function AccordionItem({
    value,
    children,
    className
}: {
    value: string;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={cn("border border-border/50 rounded-2xl overflow-hidden bg-card/30 backdrop-blur-sm transition-all hover:border-primary/20", className)}>
            {React.Children.map(children, child => {
                if (React.isValidElement(child)) {
                    return React.cloneElement(child as React.ReactElement<any>, { value });
                }
                return child;
            })}
        </div>
    );
}

export function AccordionTrigger({
    value,
    children,
    className
}: {
    value?: string;
    children: React.ReactNode;
    className?: string;
}) {
    const context = React.useContext(AccordionContext);
    if (!context) throw new Error("AccordionTrigger must be used within Accordion");

    const isOpen = Array.isArray(context.value)
        ? context.value.includes(value!)
        : context.value === value;

    return (
        <button
            type="button"
            onClick={() => context.onValueChange(value!)}
            className={cn(
                "flex w-full items-center justify-between p-4 text-left font-medium transition-all",
                isOpen ? "bg-muted/30" : "hover:bg-muted/20",
                className
            )}
        >
            {children}
            <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
            >
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
            </motion.div>
        </button>
    );
}

export function AccordionContent({
    value,
    children,
    className
}: {
    value?: string;
    children: React.ReactNode;
    className?: string;
}) {
    const context = React.useContext(AccordionContext);
    if (!context) throw new Error("AccordionContent must be used within Accordion");

    const isOpen = Array.isArray(context.value)
        ? context.value.includes(value!)
        : context.value === value;

    return (
        <AnimatePresence initial={false}>
            {isOpen && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                >
                    <div className={cn("p-4 pt-0", className)}>
                        {children}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
