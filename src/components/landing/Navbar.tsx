"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, ArrowRight, Sparkles, Home, Info, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavbarProps {
    user: any;
    userData: any;
    isAdmin: boolean;
    dashboardLink: string;
}

export default function Navbar({ user, userData, isAdmin, dashboardLink }: NavbarProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    
    // Lock body scroll when mobile menu is open
    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [mobileMenuOpen]);

    return (
        <nav className="sticky top-0 z-50 bg-primary/95 backdrop-blur-xl border-b border-border text-white transition-all duration-300">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-lg group-hover:scale-105 transition-transform duration-300 overflow-hidden">
                        <Image src="/icon.png" alt="LBS MCA Logo" width={36} height={36} className="h-full w-full object-contain" />
                    </div>
                    <span className="text-lg font-bold tracking-tight text-white">LBS MCA</span>
                </Link>
                <div className="flex items-center gap-8">
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium">
                        <Link href="/" className="hover:text-white/80 transition-colors">Home</Link>
                        <Link href="#features" className="text-white/80 hover:text-white transition-colors">About</Link>
                        <Link href="#contact" className="text-white/80 hover:text-white transition-colors">Contact</Link>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:block">
                            {user && userData ? (
                                <Link href={dashboardLink}>
                                    <Button className="bg-white hover:bg-white/90 text-primary rounded-full px-6 py-2 h-9 text-sm font-semibold shadow-md hover:-translate-y-0.5 transition-all duration-300">
                                        {isAdmin ? "Admin Panel" : "Dashboard"}
                                        <ArrowRight className="w-3.5 h-3.5 ml-2" />
                                    </Button>
                                </Link>
                            ) : (
                                <Link href="/login">
                                    <Button className="bg-white hover:bg-white/90 text-primary rounded-full px-6 py-2 h-9 text-sm font-semibold shadow-md hover:-translate-y-0.5 transition-all duration-300">
                                        <Sparkles className="w-3.5 h-3.5 mr-2" />
                                        Login
                                    </Button>
                                </Link>
                            )}
                        </div>

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setMobileMenuOpen(true)}
                            className="md:hidden p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                            aria-label="Toggle menu"
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Sidebar Navigation — rendered as full-screen overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <>
                        {/* Backdrop Overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileMenuOpen(false)}
                            className="fixed inset-0 z-100 bg-black/60 backdrop-blur-sm md:hidden cursor-pointer"
                        />

                        {/* Sidebar Drawer */}
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 z-110 w-full max-w-75 h-dvh bg-[#0b1417] border-l border-[#26464f] shadow-2xl md:hidden flex flex-col"
                        >
                            {/* Sidebar Header */}
                            <div className="flex h-16 items-center justify-between px-5 border-b border-[#26464f]">
                                <div className="flex items-center gap-2.5">
                                    <Image src="/icon.png" alt="Logo" width={28} height={28} />
                                    <span className="text-base font-bold text-white">LBS MCA</span>
                                </div>
                                <button
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                                    aria-label="Close menu"
                                >
                                    <X className="h-5 w-5 text-white" />
                                </button>
                            </div>

                            {/* Sidebar Body */}
                            <div className="flex-1 overflow-y-auto px-5 py-8 flex flex-col gap-5">
                                <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-4 text-base font-medium group text-white/90 hover:text-white transition-colors">
                                    <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
                                        <Home className="h-5 w-5" />
                                    </div>
                                    Home
                                </Link>
                                <Link href="#features" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-4 text-base font-medium group text-white/70 hover:text-white transition-colors">
                                    <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
                                        <Info className="h-5 w-5" />
                                    </div>
                                    About
                                </Link>
                                <Link href="#contact" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-4 text-base font-medium group text-white/70 hover:text-white transition-colors">
                                    <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
                                        <PhoneCall className="h-5 w-5" />
                                    </div>
                                    Contact
                                </Link>

                                <div className="mt-auto pt-8 border-t border-[#26464f]">
                                    {user && userData ? (
                                        <Link href={dashboardLink} onClick={() => setMobileMenuOpen(false)}>
                                            <Button className="w-full bg-white text-primary rounded-xl h-12 font-bold shadow-lg hover:bg-white/90 transition-all">
                                                Go to Dashboard
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Button>
                                        </Link>
                                    ) : (
                                        <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                                            <Button className="w-full bg-white text-primary rounded-xl h-12 font-bold shadow-lg hover:bg-white/90 transition-all">
                                                <Sparkles className="mr-2 h-4 w-4" />
                                                Login Now
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            </div>

                            {/* Sidebar Footer */}
                            <div className="px-5 py-4 text-center border-t border-[#26464f]">
                                <p className="text-[10px] text-white/40 font-medium uppercase tracking-[0.2em]">
                                    Premium Learning Experience 2026
                                </p>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </nav>
    );
}
