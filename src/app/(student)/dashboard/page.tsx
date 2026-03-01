"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/auth-context";
import { ref, onValue, query, orderByChild, limitToLast } from "firebase/database";
import { db } from "@/lib/firebase";
import type { LiveClass, Announcement } from "@/lib/types";
import { Video, BookOpen, Trophy, Megaphone, Calendar, Clock, FileText, ArrowRight, Sparkles } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function StudentDashboard() {
    const { userData } = useAuth();
    const [upcomingClasses, setUpcomingClasses] = useState<LiveClass[]>([]);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);

    useEffect(() => {
        const liveRef = query(ref(db, "liveClasses"), orderByChild("scheduledAt"), limitToLast(3));
        const unsubLive = onValue(liveRef, (snapshot) => {
            const classes: LiveClass[] = [];
            snapshot.forEach((child) => {
                const data = child.val();
                if (data.status !== "completed") {
                    classes.push({ ...data, id: child.key! });
                }
            });
            setUpcomingClasses(classes.reverse());
        });

        const annRef = query(ref(db, "announcements"), orderByChild("createdAt"), limitToLast(3));
        const unsubAnn = onValue(annRef, (snapshot) => {
            const anns: Announcement[] = [];
            snapshot.forEach((child) => {
                anns.push({ ...child.val(), id: child.key! });
            });
            setAnnouncements(anns.reverse());
        });

        return () => { unsubLive(); unsubAnn(); };
    }, []);

    const quickActions = [
        { label: "Live Classes", description: "Join live sessions", href: "/dashboard/live-classes", icon: Video, color: "from-blue-500 to-cyan-500", show: userData?.is_live },
        { label: "Recorded Classes", description: "Watch at your pace", href: "/dashboard/recorded-classes", icon: BookOpen, color: "from-violet-500 to-purple-500", show: userData?.is_record_class },
        { label: "Quizzes", description: "Test your knowledge", href: "/dashboard/quizzes", icon: Trophy, color: "from-pink-500 to-rose-500", show: true },
        { label: "Mock Tests", description: "Full-length practice", href: "/dashboard/mock-tests", icon: FileText, color: "from-amber-500 to-orange-500", show: true },
        { label: "Rankings", description: "See your standing", href: "/dashboard/rankings", icon: Sparkles, color: "from-teal-500 to-emerald-500", show: true },
        { label: "Announcements", description: "Latest updates", href: "/dashboard/announcements", icon: Megaphone, color: "from-green-500 to-lime-500", show: true },
    ];

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Welcome Banner */}
            <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[var(--primary)]/10 via-transparent to-transparent rounded-full blur-2xl" />
                <div className="relative">
                    <h1 className="text-2xl sm:text-3xl font-bold">
                        Welcome back, <span className="gradient-text">{userData?.name?.split(" ")[0]}</span> 👋
                    </h1>
                    <p className="mt-2 text-[var(--muted-foreground)] max-w-lg">
                        Continue your MCA entrance preparation. Stay consistent and track your progress.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                        {userData?.is_live && (
                            <span className="inline-flex items-center rounded-full bg-blue-500/10 border border-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-400">
                                <Video className="h-3 w-3 mr-1.5" />
                                Live Access
                            </span>
                        )}
                        {userData?.is_record_class && (
                            <span className="inline-flex items-center rounded-full bg-violet-500/10 border border-violet-500/20 px-3 py-1 text-xs font-semibold text-violet-400">
                                <BookOpen className="h-3 w-3 mr-1.5" />
                                Recorded Access
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {quickActions
                        .filter((a) => a.show)
                        .map((action) => (
                            <Link key={action.href} href={action.href}>
                                <Card className="hover:border-[var(--primary)]/40 hover:shadow-lg hover:shadow-[var(--primary)]/5 transition-all duration-300 cursor-pointer group h-full">
                                    <CardContent className="p-4 text-center">
                                        <div
                                            className={`mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${action.color} transition-transform duration-300 group-hover:scale-110`}
                                        >
                                            <action.icon className="h-5 w-5 text-white" />
                                        </div>
                                        <p className="text-sm font-medium">{action.label}</p>
                                        <p className="text-[10px] text-[var(--muted-foreground)] mt-0.5 hidden sm:block">{action.description}</p>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Upcoming Live Classes */}
                {userData?.is_live && (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Video className="h-4 w-4 text-blue-500" />
                                Upcoming Classes
                            </CardTitle>
                            <Link href="/dashboard/live-classes">
                                <Button variant="ghost" size="sm" className="text-xs">
                                    View All <ArrowRight className="h-3 w-3 ml-1" />
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent>
                            {upcomingClasses.length === 0 ? (
                                <div className="text-center py-8">
                                    <Video className="h-8 w-8 mx-auto mb-2 text-[var(--muted-foreground)] opacity-50" />
                                    <p className="text-sm text-[var(--muted-foreground)]">No upcoming classes</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {upcomingClasses.map((cls) => (
                                        <div
                                            key={cls.id}
                                            className="flex items-center justify-between rounded-xl border border-[var(--border)] p-3.5 transition-colors hover:bg-[var(--muted)]/30"
                                        >
                                            <div className="space-y-1 min-w-0 flex-1">
                                                <p className="text-sm font-medium truncate">{cls.title}</p>
                                                <div className="flex items-center gap-3 text-xs text-[var(--muted-foreground)]">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {format(new Date(cls.scheduledAt), "MMM d")}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {format(new Date(cls.scheduledAt), "h:mm a")}
                                                    </span>
                                                </div>
                                            </div>
                                            <Badge variant={cls.status === "live" ? "live" : "secondary"} className="ml-2 shrink-0">
                                                {cls.status === "live" ? "● LIVE" : cls.status}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Recent Announcements */}
                <Card className={!userData?.is_live ? "lg:col-span-2" : ""}>
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Megaphone className="h-4 w-4 text-green-500" />
                            Recent Announcements
                        </CardTitle>
                        <Link href="/dashboard/announcements">
                            <Button variant="ghost" size="sm" className="text-xs">
                                View All <ArrowRight className="h-3 w-3 ml-1" />
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {announcements.length === 0 ? (
                            <div className="text-center py-8">
                                <Megaphone className="h-8 w-8 mx-auto mb-2 text-[var(--muted-foreground)] opacity-50" />
                                <p className="text-sm text-[var(--muted-foreground)]">No announcements yet</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {announcements.map((ann) => (
                                    <div key={ann.id} className="rounded-xl border border-[var(--border)] p-3.5 hover:bg-[var(--muted)]/30 transition-colors">
                                        <p className="text-sm font-medium">{ann.title}</p>
                                        <p className="mt-1 text-xs text-[var(--muted-foreground)] line-clamp-2">{ann.content}</p>
                                        <p className="mt-2 text-[10px] text-[var(--muted-foreground)]">
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
