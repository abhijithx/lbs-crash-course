"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
    const [loadingQuizzes, setLoadingQuizzes] = useState(true);
    const [loadingMocks, setLoadingMocks] = useState(true);

    useEffect(() => {
        setLoadingQuizzes(true);
        setLoadingMocks(true);
        const qRef = ref(db, "rankings");
        const unsub1 = onValue(qRef, (snapshot) => {
            const list: RankData[] = [];
            if (snapshot.exists()) {
                snapshot.forEach((child) => {
                    list.push({ ...child.val(), quizId: child.key! });
                });
            }
            setQuizRankings(list.sort((a: any, b: any) => (b.generatedAt || 0) - (a.generatedAt || 0)));
            setLoadingQuizzes(false);
        });

        const mRef = ref(db, "mockRankings");
        const unsub2 = onValue(mRef, (snapshot) => {
            const list: RankData[] = [];
            if (snapshot.exists()) {
                snapshot.forEach((child) => {
                    list.push({ ...child.val(), quizId: child.key! });
                });
            }
            setMockRankings(list.sort((a: any, b: any) => (b.generatedAt || 0) - (a.generatedAt || 0)));
            setLoadingMocks(false);
        });

        return () => { unsub1(); unsub2(); };
    }, []);

    const getRankStyles = (rank: number) => {
        if (rank === 1) return { icon: <Crown className="h-5 w-5 text-yellow-500" />, bg: "bg-yellow-500/10 border-yellow-500/20" };
        if (rank === 2) return { icon: <Medal className="h-5 w-5 text-slate-400" />, bg: "bg-slate-400/10 border-slate-400/20" };
        if (rank === 3) return { icon: <Medal className="h-5 w-5 text-amber-600" />, bg: "bg-amber-600/10 border-amber-600/20" };
        if (rank <= 5) return { icon: <Award className="h-5 w-5 text-blue-400" />, bg: "bg-blue-400/10 border-blue-400/20" };
        return { icon: <span className="text-xs font-bold text-[var(--muted-foreground)]">#{rank}</span>, bg: "" };
    };

    const renderRankings = (rankings: RankData[], isLoading: boolean) => {
        if (isLoading) return (
            <div className="flex flex-col items-center justify-center py-20 space-y-4 animate-pulse">
                <div className="h-12 w-12 rounded-full bg-[var(--muted)]" />
                <div className="h-4 w-32 bg-[var(--muted)] rounded" />
            </div>
        );

        if (rankings.length === 0) {
            return (
                <div className="text-center py-12 text-[var(--muted-foreground)]">
                    <Trophy className="h-10 w-10 mx-auto mb-2" />
                    <p className="font-medium">No results published yet</p>
                    <p className="text-sm">Leaderboard is visible once a quiz/test is closed by admin.</p>
                </div>
            );
        }

        return rankings.map((rankData) => (
            <Card key={rankData.quizId} className="mb-6 overflow-hidden border-t-2 border-t-[var(--primary)]/50">
                <CardHeader className="bg-[var(--muted)]/20">
                    <CardTitle className="text-base flex items-center justify-between">
                        <span>{rankData.quizTitle}</span>
                        <span className="text-xs font-normal text-[var(--muted-foreground)]">Official Results</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-[var(--border)]/30">
                        {rankData.entries.map((entry) => {
                            const styles = getRankStyles(entry.rank);
                            const isMe = entry.userId === userData?.uid;
                            return (
                                <div
                                    key={entry.userId}
                                    className={`flex items-center gap-4 p-4 transition-colors ${isMe ? "bg-[var(--primary)]/15 font-bold" : styles.bg} ${entry.rank <= 5 ? "bg-[var(--primary)]/5" : ""}`}
                                >
                                    <div className="flex h-10 w-10 items-center justify-center shrink-0">
                                        {styles.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm truncate">
                                            {entry.userName}
                                            {isMe && <Badge className="ml-2 bg-[var(--primary)] text-white border-0">YOU</Badge>}
                                            {entry.rank === 1 && <span className="ml-2 text-[10px] uppercase tracking-wider text-yellow-500 font-bold">Winner</span>}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-bold">{entry.score} / {entry.totalQuestions}</div>
                                        <div className="text-[10px] text-[var(--muted-foreground)]">Points</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        ));
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Trophy className="h-6 w-6 text-yellow-500" />
                        Leaderboard & Rankings
                    </h1>
                    <p className="text-[var(--muted-foreground)] mt-1">Official performance rankings for all members</p>
                </div>
            </div>

            <Tabs value={tab} onValueChange={setTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                    <TabsTrigger value="quizzes">Quiz Leaderboard</TabsTrigger>
                    <TabsTrigger value="mockTests">Mock Tests</TabsTrigger>
                </TabsList>
                <div className="mt-6">
                    <TabsContent value="quizzes">{renderRankings(quizRankings, loadingQuizzes)}</TabsContent>
                    <TabsContent value="mockTests">{renderRankings(mockRankings, loadingMocks)}</TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
