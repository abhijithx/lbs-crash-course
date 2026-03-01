"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { ref, onValue, query, orderByChild } from "firebase/database";
import { db } from "@/lib/firebase";
import type { RecordedClass } from "@/lib/types";
import { MonitorPlay, Play, AlertCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function RecordedClassesPage() {
    const { userData } = useAuth();
    const [classes, setClasses] = useState<RecordedClass[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const recRef = query(ref(db, "recordedClasses"), orderByChild("createdAt"));
        const unsub = onValue(recRef, (snapshot) => {
            const list: RecordedClass[] = [];
            snapshot.forEach((child) => {
                list.push({ ...child.val(), id: child.key! });
            });
            setClasses(list.reverse());
        });
        return () => unsub();
    }, []);

    if (!userData?.is_record_class) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                <AlertCircle className="h-12 w-12 text-[var(--muted-foreground)] mb-4" />
                <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
                <p className="text-[var(--muted-foreground)]">
                    Your current package does not include recorded classes.
                    <br />
                    Upgrade your package to access the video library.
                </p>
            </div>
        );
    }

    const filtered = classes.filter(
        (c) =>
            c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.section.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Group by subject
    const grouped = filtered.reduce<Record<string, RecordedClass[]>>((acc, cls) => {
        if (!acc[cls.subject]) acc[cls.subject] = [];
        acc[cls.subject].push(cls);
        return acc;
    }, {});

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <MonitorPlay className="h-6 w-6 text-violet-500" />
                        Recorded Classes
                    </h1>
                    <p className="text-[var(--muted-foreground)] mt-1">
                        Watch recorded video lectures at your pace
                    </p>
                </div>
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
                    <Input
                        placeholder="Search classes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>

            {Object.keys(grouped).length === 0 ? (
                <div className="text-center py-12 text-[var(--muted-foreground)]">
                    <MonitorPlay className="h-10 w-10 mx-auto mb-2" />
                    <p className="font-medium">No recorded classes available</p>
                    <p className="text-sm">New content will appear here when published.</p>
                </div>
            ) : (
                Object.entries(grouped).map(([subject, subjectClasses]) => (
                    <div key={subject}>
                        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full gradient-primary" />
                            {subject}
                        </h2>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {subjectClasses.map((cls) => (
                                <a
                                    key={cls.id}
                                    href={cls.youtubeUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group block"
                                >
                                    <Card className="h-full hover:border-[var(--primary)]/40 hover:shadow-lg transition-all duration-300">
                                        <CardContent className="p-5">
                                            <div className="flex items-start gap-3">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 group-hover:bg-violet-500/20 transition-colors">
                                                    <Play className="h-5 w-5 text-violet-500" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium group-hover:text-[var(--primary)] transition-colors line-clamp-2">
                                                        {cls.title}
                                                    </p>
                                                    <p className="text-xs text-[var(--muted-foreground)] mt-1">
                                                        {cls.section}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </a>
                            ))}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}
