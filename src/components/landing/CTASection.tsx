import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { User } from "firebase/auth";
import { UserData } from "@/lib/types";

interface CTASectionProps {
    user: User | null;
    userData: UserData | null;
    isAdmin: boolean;
    dashboardLink: string;
}

export default function CTASection({ user, userData, isAdmin, dashboardLink }: CTASectionProps) {
    const isReady = user && userData;
    
    return (
        <section className="py-20 lg:py-32 border-t border-border bg-secondary/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent pointer-events-none" />
            <div className="mx-auto max-w-4xl px-6 sm:px-8 text-center relative z-10">
                <h2 className="text-4xl sm:text-5xl font-black mb-8 tracking-tight leading-[1.2]">
                    {isReady ? (
                        <>Welcome Back to <span className="text-transparent bg-clip-text bg-linear-to-br from-primary to-accent">LBS MCA</span></>
                    ) : (
                        <>Ready to Start Your <span className="text-transparent bg-clip-text bg-linear-to-br from-primary to-accent">Journey?</span></>
                    )}
                </h2>
                <p className="text-xl text-muted-foreground mb-12 font-medium max-w-2xl mx-auto leading-relaxed">
                    {isReady
                        ? "Pick up where you left off and continue your preparation with our advanced learning modules."
                        : "Join hundreds of aspirants who are already preparing with our platform. Unlock your potential today."}
                </p>
                <Link href={isReady ? dashboardLink : "/login"}>
                    <Button size="lg" className="bg-linear-to-br from-primary to-accent border-0 text-lg px-12 rounded-full h-14 shadow-2xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300 font-bold">
                        {isReady ? (isAdmin ? "Admin Panel" : "Go to Dashboard") : "Login Now"}
                        <ArrowRight className="ml-2 h-6 w-6" />
                    </Button>
                </Link>
            </div>
        </section>
    );
}
