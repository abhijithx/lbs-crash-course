import { Metadata } from "next";
import Script from "next/script";
import Link from "next/link";
import { GraduationCap } from "lucide-react";

// Landing components
import HeroSection from "../components/landing/HeroSection";
import FeaturesGrid from "../components/landing/FeaturesGrid";
import PricingSection from "../components/landing/PricingSection";
import ExamInfo from "../components/landing/ExamInfo";
import ContactSection from "../components/landing/ContactSection";
import RedirectManager from "../components/landing/RedirectManager";
import { NavbarWrapper, CTAWrapper } from "../components/landing/ClientWrappers";

export const metadata: Metadata = {
    title: "LBS MCA Entrance 2026 - Best Online Coaching for Kerala & South India",
    description: "Join the official LBS MCA Entrance 2026 Crash Course. Expert training for Kerala MCA aspirants with live classes, mock tests, and rank-boosting study materials. Serving students across Kerala and Tamil Nadu.",
};

const courseSchema = {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": "LBS MCA Entrance 2026 Official Crash Course",
    "description": "Premium online preparation course for Kerala LBS MCA Entrance 2026. Expert mentorship for students from Kerala, Tamil Nadu, and beyond. Includes live sessions, recorded library, and national ranking mock tests.",
    "provider": {
        "@type": "Organization",
        "name": "Infronixis Technologies",
        "sameAs": "https://lbscourse.cetmca.in"
    },
    "courseCode": "LBS-MCA-2026",
    "hasCourseInstance": {
        "@type": "CourseInstance",
        "courseMode": "online",
        "courseWorkload": "PT10H",
        "instructor": {
            "@type": "Person",
            "name": "Expert MCA Mentors"
        }
    }
};

const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
        {
            "@type": "Question",
            "name": "What is included in the LBS MCA Entrance Crash Course?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "The course includes live interactive classes, recorded and sorted video lectures, weekly subject-wise quizzes, full-length mock tests with national ranking, and push notifications for class alerts."
            }
        },
        {
            "@type": "Question",
            "name": "Can I access recorded classes if I miss the live session?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, all live sessions are recorded and made available in our library for students to re-watch at any time."
            }
        },
        {
            "@type": "Question",
            "name": "Does the platform provide mock tests for LBS MCA?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Absolutely. We provide comprehensive mock tests that simulate the actual LBS MCA Exam pattern, including rank tracking to help you gauge your performance."
            }
        }
    ]
};

export default function LandingPage() {
    // Accessibility: Note that these env vars are accessed on the server here
    const liveOnlyEnabled = process.env.NEXT_PUBLIC_LIVE_ONLY === "true";
    const recordOnlyEnabled = process.env.NEXT_PUBLIC_RECORD_ONLY === "true";
    const bothEnabled = process.env.NEXT_PUBLIC_BOTH_PACKAGE === "true";

    return (
        <div className="min-h-screen bg-background">
            <RedirectManager />
            <Script id="course-schema" type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(courseSchema)
                }}
            />
            <Script id="faq-schema" type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(faqSchema)
                }}
            />
            
            {/* Navbar is a client component that handles auth-dependent UI */}
            <NavbarWrapper />

            <main>
                <HeroSection />
                <FeaturesGrid />
                <PricingSection 
                    liveOnlyEnabled={liveOnlyEnabled}
                    recordOnlyEnabled={recordOnlyEnabled}
                    bothEnabled={bothEnabled}
                />
                <ExamInfo />
                <ContactSection />
                <CTAWrapper />
            </main>

            {/* Footer */}
            <footer className="border-t border-border py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-primary" />
                        <span className="text-sm font-semibold">LBS MCA Entrance Learning Platform</span>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                        <Link href="/blog" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
                            Blog
                        </Link>
                        <Link href="/privacy-policy" className="text-muted-foreground hover:text-foreground transition-colors">
                            Privacy Policy
                        </Link>
                        <Link href="/terms-of-service" className="text-muted-foreground hover:text-foreground transition-colors">
                            Terms of Service
                        </Link>
                        <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                            Contact Us
                        </Link>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        © 2026 LBS MCA. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
