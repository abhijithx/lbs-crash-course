"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
    {
        variants: {
            variant: {
                default:
                    "bg-primary text-primary-foreground shadow-md hover:opacity-90 active:scale-[0.98]",
                destructive:
                    "bg-destructive text-white shadow-md hover:opacity-90 active:scale-[0.98]",
                outline:
                    "border border-border bg-transparent hover:bg-accent/10 hover:text-accent",
                secondary:
                    "bg-secondary text-secondary-foreground hover:opacity-80",
                ghost:
                    "hover:bg-accent/10 hover:text-accent",
                link:
                    "text-primary underline-offset-4 hover:underline",
                success:
                    "bg-success text-white shadow-md hover:opacity-90 active:scale-[0.98]",
            },
            size: {
                default: "h-10 px-5 py-2",
                sm: "h-8 px-3 text-xs",
                lg: "h-12 px-8 text-base",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> { }

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, ...props }, ref) => {
        return (
            <button
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";

export { Button, buttonVariants };
