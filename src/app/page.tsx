"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  Video,
  BookOpen,
  Trophy,
  Users,
  Bell,
  Monitor,
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
} from "lucide-react";

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

const stats = [
  { value: "100+", label: "Video Lectures" },
  { value: "500+", label: "Practice MCQs" },
  { value: "50+", label: "Mock Tests" },
  { value: "24/7", label: "Access" },
];

const packages = [
  {
    name: "Recorded Only",
    price: "Affordable",
    description: "Access all recorded video lectures and study materials",
    features: ["Full recorded class library", "Weekly quizzes", "Mock tests", "Rank tracking", "Push notifications"],
    highlighted: false,
  },
  {
    name: "Live + Recorded",
    price: "Best Value",
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
    price: "Interactive",
    description: "Join live classes with real-time interaction",
    features: ["Live interactive classes", "Live class recordings", "Weekly quizzes", "Mock tests", "Push notifications"],
    highlighted: false,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold">LBS MCA</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="gradient-primary border-0">
                <Sparkles className="h-4 w-4 mr-1" />
                Register
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        {/* Background gradients */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 h-72 w-72 rounded-full bg-[var(--primary)]/20 blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-[var(--accent)]/15 blur-[120px]" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--muted)] px-4 py-1.5 text-sm text-[var(--muted-foreground)]">
              <Zap className="h-4 w-4 text-[var(--warning)]" />
              Admissions Open — Limited Seats
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
              Crack Your{" "}
              <span className="gradient-text">LBS MCA</span>
              <br />
              Entrance Exam
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg sm:text-xl text-[var(--muted-foreground)]">
              The most comprehensive learning platform for MCA entrance preparation.
              Live classes, recorded courses, quizzes, mock tests, and rank tracking — all in one place.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="gradient-primary border-0 text-base px-8">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="#features">
                <Button variant="outline" size="lg" className="text-base px-8">
                  Explore Features
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 mx-auto max-w-3xl"
          >
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 text-center"
              >
                <div className="text-2xl sm:text-3xl font-bold gradient-text">{stat.value}</div>
                <div className="mt-1 text-sm text-[var(--muted-foreground)]">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold">
              Everything You Need to <span className="gradient-text">Succeed</span>
            </h2>
            <p className="mt-4 text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">
              Our platform provides a complete learning experience with tools designed to maximize your preparation.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <div className="group rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 transition-all duration-300 hover:border-[var(--primary)]/40 hover:shadow-lg hover:shadow-[var(--primary)]/5 h-full">
                  <div
                    className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} mb-4`}
                  >
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Packages */}
      <section className="py-20 sm:py-28 border-t border-[var(--border)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold">
              Choose Your <span className="gradient-text">Package</span>
            </h2>
            <p className="mt-4 text-lg text-[var(--muted-foreground)]">
              Select the plan that fits your learning style
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {packages.map((pkg, index) => (
              <motion.div
                key={pkg.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <div
                  className={`relative rounded-2xl border p-6 h-full flex flex-col ${pkg.highlighted
                    ? "border-[var(--primary)] bg-[var(--primary)]/5 shadow-lg shadow-[var(--primary)]/10"
                    : "border-[var(--border)] bg-[var(--card)]"
                    }`}
                >
                  {pkg.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 gradient-primary rounded-full px-4 py-1 text-xs font-semibold text-white">
                      Most Popular
                    </div>
                  )}
                  <h3 className="text-xl font-bold">{pkg.name}</h3>
                  <div className="text-sm text-[var(--muted-foreground)] mt-1">{pkg.price}</div>
                  <p className="text-sm text-[var(--muted-foreground)] mt-3">{pkg.description}</p>
                  <ul className="mt-6 space-y-3 flex-1">
                    {pkg.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <Sparkles className="h-4 w-4 text-[var(--primary)] shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/register" className="mt-6 block">
                    <Button
                      className={`w-full ${pkg.highlighted ? "gradient-primary border-0" : ""}`}
                      variant={pkg.highlighted ? "default" : "outline"}
                    >
                      Register Now
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-[var(--border)]">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Start Your <span className="gradient-text">Journey?</span>
          </h2>
          <p className="text-lg text-[var(--muted-foreground)] mb-8">
            Join hundreds of aspirants who are already preparing with our platform.
          </p>
          <Link href="/register">
            <Button size="lg" className="gradient-primary border-0 text-base px-10">
              Register Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-[var(--primary)]" />
            <span className="text-sm font-semibold">LBS MCA Entrance Learning Platform</span>
          </div>
          <p className="text-sm text-[var(--muted-foreground)]">
            © 2024 LBS MCA. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
