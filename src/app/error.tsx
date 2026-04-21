"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RotateCcw, ShieldAlert, BookOpen } from "lucide-react";

export default function RootError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an analytics or logging service
        console.error("[CRITICAL_CLIENT_ERROR]", error);
    }, [error]);

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
            <div className="absolute inset-0 bg-linear-to-br from-destructive/5 to-transparent pointer-events-none" />
            
            <div className="max-w-md w-full bg-card border border-border shadow-2xl rounded-4xl p-8 text-center relative z-10 backdrop-blur-sm">
                <div className="h-20 w-20 bg-destructive/10 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-pulse">
                    <ShieldAlert className="h-10 w-10 text-destructive" />
                </div>
                
                <h1 className="text-3xl font-extrabold text-foreground mb-3 tracking-tight">
                    System Turbulence
                </h1>
                
                <p className="text-muted-foreground font-light mb-8 leading-relaxed">
                    Something went wrong while processing the intelligence data. This is usually transient and can be fixed with a quick reset.
                </p>
                
                {process.env.NODE_ENV === "development" && (
                    <div className="bg-secondary/50 rounded-2xl p-4 mb-8 text-left overflow-auto max-h-40">
                        <code className="text-[10px] text-destructive font-mono whitespace-pre italic">
                            {error.message || "Unknown error occurred"}
                            {error.digest && ` (Digest: ${error.digest})`}
                        </code>
                    </div>
                )}
                
                <div className="flex flex-col gap-3">
                    <Button 
                        onClick={reset}
                        className="rounded-full h-12 gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-white bg-primary hover:bg-primary/90"
                    >
                        <RotateCcw className="h-4 w-4" />
                        Reinitialize Workspace
                    </Button>
                    
                    <Button 
                        variant="ghost" 
                        className="rounded-full h-12 gap-2 text-muted-foreground hover:text-foreground"
                        onClick={() => window.location.assign("/")}
                    >
                        <BookOpen className="h-4 w-4" />
                        Return to Syllabus
                    </Button>
                </div>
                
                <p className="mt-8 text-[11px] text-muted-foreground/60 flex items-center justify-center gap-2">
                    <AlertCircle className="h-3 w-3" />
                    Our AI is monitoring this incident for optimization.
                </p>
            </div>
        </div>
    );
}
