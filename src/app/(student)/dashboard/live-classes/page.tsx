"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/auth-context";
import { ref, onValue, query, orderByChild } from "firebase/database";
import { db } from "@/lib/firebase";
import type { LiveClass } from "@/lib/types";
import { Video, Calendar, Clock, ExternalLink, Play, AlertCircle } from "lucide-react";
import { format } from "date-fns";

export default function LiveClassesPage() {
    const { userData } = useAuth();
    const [classes, setClasses] = useState<LiveClass[]>([]);
    const [tab, setTab] = useState("upcoming");

    useEffect(() => {
        const liveRef = query(ref(db, "liveClasses"), orderByChild("scheduledAt"));
        const unsub = onValue(liveRef, (snapshot) => {
            const list: LiveClass[] = [];
            snapshot.forEach((child) => {
                list.push({ ...child.val(), id: child.key! });
            });
            setClasses(list.reverse());
        });
        return () => unsub();
    }, []);

    if (!userData?.is_live) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                <AlertCircle className="h-12 w-12 text-[var(--muted-foreground)] mb-4" />
                <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
                <p className="text-[var(--muted-foreground)]">
                    Your current package does not include live classes.
                    <br />
                    Upgrade your package to access live sessions.
                </p>
            </div>
        );
    }

    const upcoming = classes.filter((c) => c.status === "upcoming");
    const live = classes.filter((c) => c.status === "live");
    const completed = classes.filter((c) => c.status === "completed");

    const renderClassCard = (cls: LiveClass) => (
        <Card key={cls.id} className="hover:border-[var(--primary)]/30 transition-all">
            <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{cls.title}</h3>
                            <Badge variant={cls.status === "live" ? "live" : cls.status === "completed" ? "secondary" : "default"}>
                                {cls.status === "live" ? "● LIVE" : cls.status}
                            </Badge>
                        </div>
                        <p className="text-sm text-[var(--muted-foreground)]">{cls.subject}</p>
                        <div className="flex items-center gap-3 text-xs text-[var(--muted-foreground)] mt-2">
                            <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(cls.scheduledAt), "MMM d, yyyy")}
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {format(new Date(cls.scheduledAt), "h:mm a")}
                            </span>
                        </div>
                    </div>
                    <div>
                        {cls.status === "live" && cls.meetLink ? (
                            <a href={cls.meetLink} target="_blank" rel="noopener noreferrer">
                                <Button size="sm" className="gradient-primary border-0">
                                    <ExternalLink className="h-4 w-4 mr-1" />
                                    Join
                                </Button>
                            </a>
                        ) : cls.status === "upcoming" && !cls.meetLink ? (
                            <Badge variant="outline">Link coming soon</Badge>
                        ) : cls.status === "completed" && cls.recordingUrl ? (
                            <a href={cls.recordingUrl} target="_blank" rel="noopener noreferrer">
                                <Button variant="outline" size="sm">
                                    <Play className="h-4 w-4 mr-1" />
                                    Recording
                                </Button>
                            </a>
                        ) : null}
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Video className="h-6 w-6 text-blue-500" />
                    Live Classes
                </h1>
                <p className="text-[var(--muted-foreground)] mt-1">
                    Join live sessions and access recordings
                </p>
            </div>

            <Tabs value={tab} onValueChange={setTab}>
                <TabsList>
                    <TabsTrigger value="upcoming">Upcoming ({upcoming.length + live.length})</TabsTrigger>
                    <TabsTrigger value="completed">Completed ({completed.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="upcoming">
                    {live.length > 0 && (
                        <div className="space-y-3 mb-6">
                            <h3 className="text-sm font-semibold text-red-400 uppercase tracking-wider">Live Now</h3>
                            {live.map(renderClassCard)}
                        </div>
                    )}
                    {upcoming.length === 0 && live.length === 0 ? (
                        <div className="text-center py-12 text-[var(--muted-foreground)]">
                            <VideoEmptyState />
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {upcoming.length > 0 && (
                                <>
                                    <h3 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Upcoming</h3>
                                    {upcoming.map(renderClassCard)}
                                </>
                            )}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="completed">
                    {completed.length === 0 ? (
                        <div className="text-center py-12 text-[var(--muted-foreground)]">
                            No completed classes yet
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {completed.map(renderClassCard)}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}

function VideoEmptyState() {
    return (
        <div className="space-y-2">
            <Video className="h-10 w-10 text-[var(--muted-foreground)] mx-auto" />
            <p className="font-medium">No upcoming classes</p>
            <p className="text-sm">Check back soon for new live sessions!</p>
        </div>
    );
}
