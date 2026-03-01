"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ref, onValue } from "firebase/database";
import { db } from "@/lib/firebase";
import { UserPlus, Users, Video, BookOpen, ArrowUpCircle, Megaphone, FileText, Activity } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import type { PendingRegistration, Announcement } from "@/lib/types";

export default function AdminOverview() {
    const [stats, setStats] = useState({
        pending: 0,
        verified: 0,
        rejected: 0,
        upgrades: 0,
        liveClasses: 0,
        quizzes: 0,
        mockTests: 0,
        announcements: 0,
    });
    const [recentRegistrations, setRecentRegistrations] = useState<PendingRegistration[]>([]);
    const [recentAnnouncements, setRecentAnnouncements] = useState<Announcement[]>([]);

    useEffect(() => {
        const listeners: (() => void)[] = [];

        const countNode = (path: string, key: string, filter?: (val: Record<string, unknown>) => boolean) => {
            const unsub = onValue(ref(db, path), (snapshot) => {
                let count = 0;
                if (filter) {
                    snapshot.forEach((child) => { if (filter(child.val())) count++; });
                } else {
                    count = snapshot.size;
                }
                setStats((prev) => ({ ...prev, [key]: count }));
            });
            listeners.push(unsub);
        };

        countNode("pendingRegistrations", "pending", (v) => v.status === "pending");
        countNode("users", "verified", (v) => v.status === "verified" && v.role !== "admin");
        countNode("users", "rejected", (v) => v.status === "rejected");
        countNode("upgradeRequests", "upgrades", (v) => v.status === "pending");
        countNode("liveClasses", "liveClasses");
        countNode("quizzes", "quizzes");
        countNode("mockTests", "mockTests");
        countNode("announcements", "announcements");

        // Recent registrations
        const regUnsub = onValue(ref(db, "pendingRegistrations"), (snapshot) => {
            const list: PendingRegistration[] = [];
            snapshot.forEach((child) => {
                const data = child.val();
                if (data.status === "pending") {
                    list.push({ ...data, id: child.key! });
                }
            });
            list.sort((a, b) => b.submittedAt - a.submittedAt);
            setRecentRegistrations(list.slice(0, 5));
        });
        listeners.push(regUnsub);

        // Recent announcements
        const annUnsub = onValue(ref(db, "announcements"), (snapshot) => {
            const list: Announcement[] = [];
            snapshot.forEach((child) => {
                list.push({ ...child.val(), id: child.key! });
            });
            list.sort((a, b) => b.createdAt - a.createdAt);
            setRecentAnnouncements(list.slice(0, 3));
        });
        listeners.push(annUnsub);

        return () => listeners.forEach((u) => u());
    }, []);

    const cards = [
        { label: "Pending Registrations", value: stats.pending, icon: UserPlus, color: "from-amber-500 to-orange-500", href: "/admin/registrations" },
        { label: "Verified Users", value: stats.verified, icon: Users, color: "from-green-500 to-emerald-500", href: "/admin/users" },
        { label: "Upgrade Requests", value: stats.upgrades, icon: ArrowUpCircle, color: "from-violet-500 to-purple-500", href: "/admin/upgrades" },
        { label: "Live Classes", value: stats.liveClasses, icon: Video, color: "from-blue-500 to-cyan-500", href: "/admin/live-classes" },
        { label: "Quizzes", value: stats.quizzes, icon: BookOpen, color: "from-pink-500 to-rose-500", href: "/admin/quizzes" },
        { label: "Mock Tests", value: stats.mockTests, icon: FileText, color: "from-teal-500 to-sky-500", href: "/admin/mock-tests" },
        { label: "Announcements", value: stats.announcements, icon: Megaphone, color: "from-lime-500 to-green-500", href: "/admin/announcements" },
    ];

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Admin <span className="gradient-text">Dashboard</span></h1>
                <p className="mt-1 text-[var(--muted-foreground)]">Platform management overview</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {cards.map((card) => (
                    <Link key={card.label} href={card.href}>
                        <Card className="hover:border-[var(--primary)]/40 hover:shadow-lg hover:shadow-[var(--primary)]/5 transition-all duration-300 cursor-pointer group h-full">
                            <CardContent className="p-5">
                                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${card.color} mb-3 transition-transform duration-300 group-hover:scale-110`}>
                                    <card.icon className="h-5 w-5 text-white" />
                                </div>
                                <p className="text-2xl font-bold">{card.value}</p>
                                <p className="text-xs text-[var(--muted-foreground)] mt-1">{card.label}</p>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            {/* Recent Activity Section */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Recent Registrations */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Activity className="h-4 w-4 text-amber-500" />
                            Recent Registrations
                        </CardTitle>
                        <Link href="/admin/registrations" className="text-xs text-[var(--primary)] hover:underline">
                            View all →
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {recentRegistrations.length === 0 ? (
                            <p className="text-sm text-[var(--muted-foreground)] text-center py-6">No pending registrations</p>
                        ) : (
                            <div className="space-y-3">
                                {recentRegistrations.map((reg) => (
                                    <div key={reg.id} className="flex items-center gap-3 rounded-lg p-2.5 hover:bg-[var(--muted)]/50 transition-colors">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-500 text-xs font-bold text-white shrink-0">
                                            {reg.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{reg.name}</p>
                                            <p className="text-xs text-[var(--muted-foreground)] truncate">{reg.email}</p>
                                        </div>
                                        <span className="text-[10px] text-[var(--muted-foreground)] shrink-0">
                                            {format(new Date(reg.submittedAt), "MMM d")}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Announcements */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Megaphone className="h-4 w-4 text-green-500" />
                            Recent Announcements
                        </CardTitle>
                        <Link href="/admin/announcements" className="text-xs text-[var(--primary)] hover:underline">
                            View all →
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {recentAnnouncements.length === 0 ? (
                            <p className="text-sm text-[var(--muted-foreground)] text-center py-6">No announcements yet</p>
                        ) : (
                            <div className="space-y-3">
                                {recentAnnouncements.map((ann) => (
                                    <div key={ann.id} className="rounded-lg border border-[var(--border)] p-3 hover:bg-[var(--muted)]/30 transition-colors">
                                        <p className="text-sm font-medium">{ann.title}</p>
                                        <p className="text-xs text-[var(--muted-foreground)] mt-1 line-clamp-1">{ann.content}</p>
                                        <p className="text-[10px] text-[var(--muted-foreground)] mt-1.5">
                                            {format(new Date(ann.createdAt), "MMM d, yyyy · h:mm a")}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
