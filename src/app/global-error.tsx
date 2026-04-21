"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ShieldAlert, RefreshCw } from "lucide-react";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html lang="en">
            <body className="antialiased selection:bg-primary/20">
                <div className="min-h-screen bg-background flex items-center justify-center p-6 text-center">
                    <div className="max-w-md w-full">
                        <div className="h-24 w-24 bg-card border border-border shadow-2xl rounded-4xl flex items-center justify-center mx-auto mb-10 rotate-3">
                            <ShieldAlert className="h-12 w-12 text-destructive" />
                        </div>
                        
                        <h1 className="text-4xl font-black text-foreground mb-4 tracking-tighter">
                            CORE_CRITICAL_FAILURE
                        </h1>
                        
                        <p className="text-muted-foreground font-medium mb-12 opacity-80 leading-relaxed">
                            The application root has encountered a fatal exception. Please attempt a hard reinitialization of the session state.
                        </p>
                        
                        <Button 
                            onClick={reset}
                            className="w-full rounded-2xl h-14 font-bold text-lg gap-3 shadow-2xl shadow-primary/30 transition-transform active:scale-95"
                        >
                            <RefreshCw className="h-5 w-5" />
                            Hard Reset Application
                        </Button>
                        
                        {process.env.NODE_ENV === "development" && (
                            <pre className="mt-12 p-6 bg-secondary/30 rounded-3xl text-[10px] text-destructive font-mono text-left overflow-auto max-h-60 border border-border/50">
                                {error.stack || error.message}
                            </pre>
                        )}
                    </div>
                </div>
            </body>
        </html>
    );
}
