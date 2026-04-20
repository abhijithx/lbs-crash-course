"use client";

import { motion } from "framer-motion";
import { Video, Monitor, BookOpen, Trophy, Bell, Shield } from "lucide-react";

const features = [
    {
        icon: Video,
        title: "Live Classes",
        description: "Join real-time interactive sessions via Google Meet with expert instructors.",
        gradient: "from-blue-500 to-cyan-500",
    },
    {
        icon: Monitor,
        title: "Recorded Courses",
        description: "Access a library of recorded video lectures on YouTube, learn at your pace.",
        gradient: "from-violet-500 to-purple-500",
    },
    {
        icon: BookOpen,
        title: "Weekly Quizzes",
        description: "Test your knowledge every week with curated MCQ quizzes on all subjects.",
        gradient: "from-pink-500 to-rose-500",
    },
    {
        icon: Trophy,
        title: "Mock Tests & Ranks",
        description: "Take full-length mock tests, get instant scores, and track your national rank.",
        gradient: "from-amber-500 to-orange-500",
    },
    {
        icon: Bell,
        title: "Push Notifications",
        description: "Never miss a class or quiz — get real-time alerts for all important events.",
        gradient: "from-green-500 to-emerald-500",
    },
    {
        icon: Shield,
        title: "Secure Platform",
        description: "Single-device login enforcement and admin-verified accounts for security.",
        gradient: "from-red-500 to-pink-500",
    },
];

export default function FeaturesGrid() {
    return (
        <section id="features" className="relative py-24 sm:py-32 bg-secondary/20">
            {/* Decorative Grid */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center mask-[linear-gradient(180deg,rgba(255,255,255,0),white,rgba(255,255,255,0))] opacity-[0.02] pointer-events-none"></div>

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 z-10">
                <div className="text-center mb-20 animate-fade-in-up">
                    <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-foreground">
                        Complete <span className="text-transparent bg-clip-text bg-linear-to-br from-primary to-accent">LBS MCA Preparation</span>
                    </h2>
                    <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">
                        Everything you need to crack LBS MCA Entrance: live classes, recorded lectures, mock tests, previous papers, and rank tracking.
                    </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, index) => (
                        <div
                            key={feature.title}
                            className={`group relative rounded-3xl border border-border bg-card p-8 h-full shadow-lg hover:shadow-2xl hover:shadow-primary/5 overflow-hidden transition-all duration-300 hover:border-primary/50 hover:-translate-y-1 stagger-${index + 1}`}
                        >
                            {/* Subtle top glow on hover */}
                            <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                            <div
                                className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br ${feature.gradient} mb-7 shadow-lg ring-1 ring-white/20`}
                            >
                                <feature.icon className="h-7 w-7 text-white" />
                            </div>
                            <h3 className="text-2xl font-black text-foreground mb-4 tracking-tight">{feature.title}</h3>
                            <p className="text-base text-muted-foreground leading-relaxed font-medium">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
