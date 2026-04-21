"use client";

import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { HelpCircle, Check, X, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TransactionIdHelperProps {
    trigger?: React.ReactNode;
}

export function TransactionIdHelper({ trigger }: TransactionIdHelperProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <div onClick={() => setIsOpen(true)} className="cursor-pointer">
                {trigger || (
                    <button 
                        type="button"
                        className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-primary/70 hover:text-primary transition-all hover:scale-105 active:scale-95"
                    >
                        <HelpCircle className="h-3.5 w-3.5" />
                        Locate ID
                    </button>
                )}
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen} className="sm:max-w-112.5">
                <DialogContent className="p-0 overflow-hidden border-0 shadow-[0_20px_50px_rgba(0,0,0,0.2)] rounded-4xl sm:rounded-[40px]">
                    <div className="bg-white dark:bg-[#0a0a0b] p-6 sm:p-10">
                        <div className="text-center space-y-2 mb-8">
                            <DialogHeader>
                                <DialogTitle className="text-2xl sm:text-3xl font-black text-[#1a1c20] dark:text-white tracking-tight">
                                    Locate Transaction ID
                                </DialogTitle>
                            </DialogHeader>
                            <p className="text-slate-500 dark:text-slate-400 font-semibold text-sm">
                                Look for the <span className="text-primary font-extrabold uppercase tracking-tight">12 digit UPI Ref ID</span>
                            </p>
                        </div>

                        <div className="space-y-4 mb-8">
                            {/* Correct Example */}
                            <div className="relative group transition-all duration-300 hover:-translate-y-1">
                                <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-[#111114] border border-slate-100 dark:border-white/5 shadow-[0_4px_12px_rgba(0,0,0,0.03)] dark:shadow-none transition-all group-hover:shadow-[0_8px_24px_rgba(16,185,129,0.12)] group-hover:border-emerald-200 dark:group-hover:border-emerald-500/30">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100/50 dark:border-emerald-500/20">
                                            <div className="w-6 h-6 bg-emerald-500 rounded-lg flex items-center justify-center shadow-[0_4px_12px_rgba(16,185,129,0.3)]">
                                                <div className="w-1.5 h-3 border-r-[2.5px] border-b-[2.5px] border-white rotate-45 -translate-y-0.5" />
                                            </div>
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">UPI transaction ID</p>
                                            <p className="font-mono text-lg font-black text-slate-800 dark:text-slate-100 tracking-tight">602609720300</p>
                                        </div>
                                    </div>
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-500/10 transition-transform group-hover:scale-110">
                                        <Check className="h-5 w-5 text-emerald-500 stroke-[3px]" />
                                    </div>
                                </div>
                            </div>

                            {/* Incorrect Example */}
                            <div className="relative group transition-all duration-300 hover:-translate-y-1">
                                <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-[#111114] border border-slate-100 dark:border-white/5 shadow-[0_4px_12px_rgba(0,0,0,0.03)] dark:shadow-none transition-all group-hover:shadow-[0_8px_24px_rgba(244,63,94,0.12)] group-hover:border-rose-200 dark:group-hover:border-rose-500/30">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-100/50 dark:border-rose-500/20 text-rose-500">
                                            <div className="w-6 h-6 bg-rose-100 dark:bg-rose-500/20 rounded-full flex items-center justify-center border border-rose-200 dark:border-rose-500/30">
                                                <span className="text-xs font-black text-rose-500">G</span>
                                            </div>
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Google transaction ID</p>
                                            <p className="font-mono text-lg font-black text-slate-400 dark:text-slate-500 tracking-tight">CICAgJjcnMiiSw</p>
                                        </div>
                                    </div>
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-500/10 transition-transform group-hover:scale-110">
                                        <X className="h-5 w-5 text-rose-500 stroke-[3px]" />
                                    </div>
                                </div>
                            </div>

                            <div className="px-5 py-4 rounded-2xl bg-primary/5 dark:bg-primary/10 border border-primary/10 flex gap-3 mt-6">
                                <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                                    <Info className="h-3.5 w-3.5 text-primary" />
                                </div>
                                <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-300 leading-snug">
                                    Please upload the correct <span className="text-primary font-black underline underline-offset-4 decoration-primary/30">UPI transaction ID</span> as shown above.
                                </p>
                            </div>
                        </div>

                        <div className="pt-2">
                            <Button 
                                onClick={() => setIsOpen(false)}
                                className="w-full h-14 rounded-2xl bg-[#13151a] hover:bg-[#1a1e26] text-white font-black text-lg shadow-[0_8px_30px_rgba(0,0,0,0.2)] transition-all active:scale-[0.97] hover:shadow-[0_12px_40px_rgba(0,0,0,0.3)]"
                            >
                                Got It
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
