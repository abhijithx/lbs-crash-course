"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, MessageCircle, Clock, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ContactSection() {
    return (
        <section id="contact" className="relative py-24 sm:py-32 bg-background overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/5 blur-[120px] rounded-full" />
            </div>

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 z-10">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-6">
                                Have Questions? <br />
                                <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-teal-500">Reach Out to Us</span>
                            </h2>
                            <p className="text-lg text-muted-foreground mb-10 font-light leading-relaxed">
                                Whether you have a query about the LBS MCA Entrance pattern, our coaching fee, or platform access, we are here to assist you 24/7.
                            </p>

                            <div className="space-y-6">
                                <div className="flex items-center gap-4 group cursor-default">
                                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                        <Mail className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Email Us</div>
                                        <div className="text-lg font-semibold text-foreground">cetmca2025@gmail.com</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 group cursor-default">
                                    <div className="h-12 w-12 rounded-2xl bg-teal-500/10 flex items-center justify-center text-teal-600 group-hover:bg-teal-500 group-hover:text-white transition-all duration-300">
                                        <MessageCircle className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">WhatsApp Support</div>
                                        <div className="text-lg font-semibold text-foreground">+91 70128 23414</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 group cursor-default">
                                    <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
                                        <Clock className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Response Time</div>
                                        <div className="text-lg font-semibold text-foreground">Usually within 12 hour</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute -inset-4 bg-linear-to-tr from-primary/10 to-teal-500/10 blur-xl rounded-[2.5rem] pointer-events-none opacity-50" />
                            <div className="relative rounded-4xl border border-border bg-card p-8 sm:p-10 shadow-2xl overflow-hidden">
                                <div className="absolute top-0 right-0 h-32 w-32 bg-linear-to-br from-primary/10 to-transparent rounded-bl-[100px] pointer-events-none" />

                                <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                    <Zap className="h-5 w-5 text-primary" />
                                    Quick Connect
                                </h3>

                                <div className="space-y-5">
                                    <Link href="https://wa.me/917012823414" target="_blank" className="block transform transition-transform hover:-translate-y-1">
                                        <Button className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white border-0 h-14 rounded-2xl text-lg font-bold shadow-lg shadow-green-500/20">
                                            Chat on WhatsApp
                                            <MessageCircle className="ml-2 h-6 w-6" />
                                        </Button>
                                    </Link>

                                    <Link href="/contact" className="block transform transition-transform hover:-translate-y-1">
                                        <Button variant="outline" className="w-full border-border group hover:border-primary h-14 rounded-2xl text-lg font-semibold text-foreground bg-white/50">
                                            Detailed Inquiry Form
                                            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </Link>
                                </div>

                                <div className="mt-8 p-4 rounded-xl bg-secondary/30 border border-border">
                                    <p className="text-xs text-muted-foreground text-center leading-relaxed">
                                        By contacting us, you agree to our Terms of Service and Privacy Policy. We respect your data and never share it with third parties.
                                    </p>
                                </div>
                            </div>
                        </div>
                </div>
            </div>
        </section>
    );
}
