"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ref, onValue } from "firebase/database";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import type { QuizAttempt } from "@/lib/types";
import { Trophy, Medal, Crown, Award } from "lucide-react";

interface RankData {
    quizId: string;
    quizTitle: string;
    entries: { userName: string; score: number; totalQuestions: number; rank: number; userId: string }[];
}

export default function RankingsPage() {
    const { userData } = useAuth();
    const [tab, setTab] = useState("quizzes");
    const [quizRankings, setQuizRankings] = useState<RankData[]>([]);
    const [mockRankings, setMockRankings] = useState<RankData[]>([]);

    const buildRankings = (attempts: QuizAttempt[], idKey: string): RankData[] => {
        const grouped: Record<string, QuizAttempt[]> = {};
        attempts.forEach((a) => {
            const key = ((a as unknown) as Record<string, unknown>)[idKey] as string || a.quizId;
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(a);
        });

        return Object.entries(grouped).map(([id, entries]) => {
            // Best attempt per user
            const bestByUser: Record<string, QuizAttempt> = {};
            entries.forEach((e) => {
                if (!bestByUser[e.userId] || e.score > bestByUser[e.userId].score) {
                    bestByUser[e.userId] = e;
                }
            });

            const sorted = Object.values(bestByUser).sort((a, b) => b.score - a.score);
            return {
                quizId: id,
                quizTitle: `Quiz ${id.substring(0, 6)}`,
                entries: sorted.map((e, i) => ({
                    userName: e.userName,
                    score: e.score,
                    totalQuestions: e.totalQuestions,
                    rank: i + 1,
                    userId: e.userId,
                })),
            };
        });
    };

    useEffect(() => {
        const qRef = ref(db, "quizAttempts");
        const unsub1 = onValue(qRef, (snapshot) => {
            const attempts: QuizAttempt[] = [];
            snapshot.forEach((child) => {
                attempts.push({ ...child.val(), id: child.key! });
            });
            setQuizRankings(buildRankings(attempts, "quizId"));
        });

        const mRef = ref(db, "mockAttempts");
        const unsub2 = onValue(mRef, (snapshot) => {
            const attempts: QuizAttempt[] = [];
            snapshot.forEach((child) => {
                attempts.push({ ...child.val(), id: child.key! });
            });
            setMockRankings(buildRankings(attempts, "mockTestId"));
        });

        return () => { unsub1(); unsub2(); };
    }, []);

    const getRankIcon = (rank: number) => {
        if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
        if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
        if (rank === 3) return <Award className="h-5 w-5 text-amber-600" />;
        return <span className="text-sm font-bold text-[var(--muted-foreground)]">#{rank}</span>;
    };

    const renderRankings = (rankings: RankData[]) => {
        if (rankings.length === 0) {
            return (
                <div className="text-center py-12 text-[var(--muted-foreground)]">
                    <Trophy className="h-10 w-10 mx-auto mb-2" />
                    <p className="font-medium">No rankings yet</p>
                    <p className="text-sm">Rankings will appear after quizzes are completed.</p>
                </div>
            );
        }

        return rankings.map((rankData) => (
            <Card key={rankData.quizId} className="mb-4">
                <CardHeader>
                    <CardTitle className="text-base">{rankData.quizTitle}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {rankData.entries.slice(0, 10).map((entry) => (
                            <div
                                key={entry.userId}
                                className={`flex items-center gap-3 rounded-xl p-3 transition-colors ${entry.userId === userData?.uid
                                    ? "bg-[var(--primary)]/10 border border-[var(--primary)]/30"
                                    : "hover:bg-[var(--muted)]/50"
                                    }`}
                            >
                                <div className="flex h-8 w-8 items-center justify-center">
                                    {getRankIcon(entry.rank)}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">
                                        {entry.userName}
                                        {entry.userId === userData?.uid && (
                                            <span className="text-xs text-[var(--primary)] ml-2">(You)</span>
                                        )}
                                    </p>
                                </div>
                                <div className="text-sm font-bold">
                                    {entry.score}/{entry.totalQuestions}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        ));
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Trophy className="h-6 w-6 text-yellow-500" />
                    Rankings
                </h1>
                <p className="text-[var(--muted-foreground)] mt-1">See where you stand among all aspirants</p>
            </div>

            <Tabs value={tab} onValueChange={setTab}>
                <TabsList>
                    <TabsTrigger value="quizzes">Quiz Rankings</TabsTrigger>
                    <TabsTrigger value="mockTests">Mock Test Rankings</TabsTrigger>
                </TabsList>
                <TabsContent value="quizzes">{renderRankings(quizRankings)}</TabsContent>
                <TabsContent value="mockTests">{renderRankings(mockRankings)}</TabsContent>
            </Tabs>
        </div>
    );
}
