import React from "react";

export default function RootLoading() {
    return (
        <div className="fixed inset-0 z-100 flex flex-col items-center justify-center bg-background/80 backdrop-blur-md">
            <div className="relative flex items-center justify-center">
                {/* Outermost rotating ring */}
                <div className="h-24 w-24 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                
                {/* Inner counter-rotating pulse */}
                <div className="absolute h-16 w-16 rounded-full border-4 border-teal-500/10 border-b-teal-500/40 animate-[spin_1.5s_linear_infinite_reverse]" />
                
                {/* Center logo/dot */}
                <div className="absolute h-4 w-4 bg-primary rounded-full animate-pulse shadow-[0_0_15px_rgba(94,158,162,0.5)]" />
            </div>
            
            <div className="mt-8 flex flex-col items-center space-y-2">
                <h2 className="text-xl font-bold tracking-tight text-foreground animate-pulse">
                    LBS MCA Prep
                </h2>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-[0.2em] opacity-70">
                    Preparing your workspace
                </p>
            </div>
        </div>
    );
}
