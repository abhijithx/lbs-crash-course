import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
            <div className="absolute -bottom-[10%] -left-[10%] w-[40%] h-[40%] bg-teal-500/5 blur-[120px] rounded-full" />
            
            <div className="max-w-2xl w-full text-center relative z-10">
                <div className="relative inline-block mb-8">
                    <span className="text-[12rem] font-black text-primary/10 select-none leading-none">
                        404
                    </span>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-24 w-24 bg-card border border-border shadow-2xl rounded-3xl flex items-center justify-center animate-bounce">
                            <Search className="h-10 w-10 text-primary" />
                        </div>
                    </div>
                </div>
                
                <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground mb-4 tracking-tight">
                    Lost in the Syllabus?
                </h1>
                
                <p className="text-lg text-muted-foreground mb-12 max-w-lg mx-auto font-light leading-relaxed">
                    The topic you're looking for isn't here. It might have been moved to a different module or never existed in the exam pattern.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link href="/">
                        <Button className="rounded-full px-8 h-12 gap-2 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                            <Home className="h-4 w-4" />
                            Back to Home
                        </Button>
                    </Link>
                    <Link href="/dashboard">
                        <Button variant="outline" className="rounded-full px-8 h-12 gap-2 border-border/60 hover:bg-secondary hover:scale-105 active:scale-95 transition-all">
                            <ArrowLeft className="h-4 w-4" />
                            Go to Dashboard
                        </Button>
                    </Link>
                </div>
                
                <div className="mt-20 pt-8 border-t border-border/40 grid grid-cols-1 sm:grid-cols-3 gap-8">
                    <div className="text-center">
                        <div className="text-xl font-bold text-foreground">120</div>
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Exam Questions</div>
                    </div>
                    <div className="text-center">
                        <div className="text-xl font-bold text-foreground">150</div>
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Total Minutes</div>
                    </div>
                    <div className="text-center">
                        <div className="text-xl font-bold text-foreground">LBS</div>
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Rank Focused</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
