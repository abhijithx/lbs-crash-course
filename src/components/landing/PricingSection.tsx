"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const packages = [
    {
        name: "Recorded Only",
        price: "₹350",
        description: "Access all recorded video lectures and study materials",
        features: ["Full recorded class library", "Weekly quizzes", "Mock tests", "Rank tracking", "Push notifications"],
        highlighted: false,
    },
    {
        name: "Live + Recorded",
        price: "₹499",
        description: "Complete access to both live and recorded classes",
        features: [
            "Everything in Recorded",
            "Live interactive classes",
            "Live class recordings",
            "Priority support",
            "All features included",
        ],
        highlighted: true,
    },
    {
        name: "Live Only",
        price: "₹350",
        description: "Join live classes with real-time interaction",
        features: ["Live interactive classes", "Live class recordings", "Weekly quizzes", "Mock tests", "Push notifications"],
        highlighted: false,
    },
];

interface PricingSectionProps {
    liveOnlyEnabled: boolean;
    recordOnlyEnabled: boolean;
    bothEnabled: boolean;
}

export default function PricingSection({ liveOnlyEnabled, recordOnlyEnabled, bothEnabled }: PricingSectionProps) {
    const activePackages = packages.filter((pkg) => {
        if (pkg.name === "Live Only") return liveOnlyEnabled;
        if (pkg.name === "Recorded Only") return recordOnlyEnabled;
        if (pkg.name === "Live + Recorded") return bothEnabled;
        return true;
    });

    return (
        <section className="relative py-24 sm:py-32  border-t border-border">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 z-10">
                <div className="text-center mb-20">
                    <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
                        Choose Your <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-accent">Package</span>
                    </h2>
                    <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
                        Select the plan that fits your learning style
                    </p>
                </div>

                <div className="flex flex-wrap justify-center gap-6 max-w-5xl mx-auto">
                    {activePackages.map((pkg, index) => (
                        <div
                            key={pkg.name}
                            className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] max-w-sm"
                        >
                            <div
                                className={`relative rounded-3xl border p-8 h-full flex flex-col transition-all duration-300 overflow-hidden ${pkg.highlighted
                                    ? "border-primary/30 bg-card shadow-xl shadow-primary/10"
                                    : "border-border bg-card shadow-md"
                                    }`}
                            >
                                {pkg.highlighted && (
                                    <>
                                        <div className="absolute inset-0 bg-linear-to-b from-primary/5 to-transparent pointer-events-none" />
                                        <div className="absolute top-0 right-8 bg-linear-to-b from-primary to-teal-800 rounded-b-xl px-3 py-1.5 text-xs font-bold text-primary-foreground tracking-widest uppercase shadow-lg">
                                            Most Popular
                                        </div>
                                    </>
                                )}
                                <h3 className={`text-2xl font-bold ${pkg.highlighted ? "text-foreground" : "text-foreground/90"}`}>{pkg.name}</h3>
                                <div className="text-xl font-medium text-primary mt-2 mb-4">{pkg.price}</div>
                                <p className="text-base text-muted-foreground font-light leading-relaxed flex-1">{pkg.description}</p>

                                <div className="h-px w-full bg-linear-to-r from-transparent via-white/10 to-transparent my-6"></div>

                                <ul className="space-y-4 mb-8">
                                    {pkg.features.map((f) => (
                                        <li key={f} className="flex items-center gap-3 text-sm text-muted-foreground">
                                            <Sparkles className={`h-4 w-4 shrink-0 ${pkg.highlighted ? "text-primary" : "text-primary/60"}`} />
                                            <span>{f}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Link
                                    href={`/register?package=${pkg.name === "Live + Recorded" ? "both" : pkg.name === "Live Only" ? "live_only" : "recorded_only"}`}
                                    className="mt-auto block"
                                >
                                    <Button
                                        className={`w-full rounded-xl h-12 text-base font-bold shadow-none transition-all duration-300 ${pkg.highlighted ? "bg-linear-to-r from-primary to-accent hover:from-accent hover:to-primary text-white border-0 shadow-lg shadow-primary/30" : "bg-transparent border border-border text-foreground hover:bg-secondary"}`}
                                        variant={pkg.highlighted ? "default" : "outline"}
                                    >
                                        Register Now
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
