import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CTASectionProps {
    user: any;
    userData: any;
    isAdmin: boolean;
    dashboardLink: string;
}

export default function CTASection({ user, userData, isAdmin, dashboardLink }: CTASectionProps) {
    return (
        <section className="py-20 border-t border-border">
            <div className="mx-auto max-w-3xl px-4 text-center">
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                    {user && userData ? (
                        <>Welcome Back to <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-accent">LBS MCA</span></>
                    ) : (
                        <>Ready to Start Your <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-accent">Journey?</span></>
                    )}
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                    {user && userData
                        ? "Pick up where you left off and continue your preparation."
                        : "Join hundreds of aspirants who are already preparing with our platform."}
                </p>
                <Link href={user && userData ? dashboardLink : "/login"}>
                    <Button size="lg" className="bg-linear-to-r from-primary to-accent border-0 text-base px-10 rounded-full h-12 shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all">
                        {user && userData ? (isAdmin ? "Admin Panel" : "Go to Dashboard") : "Login Now"}
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                </Link>
            </div>
        </section>
    );
}
