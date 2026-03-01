"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ref, onValue } from "firebase/database";
import { db } from "@/lib/firebase";
import type { UserData } from "@/lib/types";
import { Users, Search, Mail, Phone } from "lucide-react";

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [tab, setTab] = useState("verified");
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const usersRef = ref(db, "users");
        const unsub = onValue(usersRef, (snapshot) => {
            const list: UserData[] = [];
            snapshot.forEach((child) => {
                const data = child.val();
                if (data.role !== "admin") {
                    list.push({ ...data, uid: child.key! });
                }
            });
            setUsers(list);
        });
        return () => unsub();
    }, []);

    const verified = users.filter((u) => u.status === "verified");
    const rejected = users.filter((u) => u.status === "rejected");

    const filterUsers = (list: UserData[]) =>
        list.filter(
            (u) =>
                u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.phone?.includes(searchTerm)
        );

    const renderUserList = (list: UserData[]) => {
        const filtered = filterUsers(list);
        if (filtered.length === 0) {
            return (
                <div className="text-center py-12 text-[var(--muted-foreground)]">
                    <Users className="h-10 w-10 mx-auto mb-2" />
                    <p>No users found</p>
                </div>
            );
        }
        return (
            <div className="space-y-3">
                {filtered.map((user) => (
                    <Card key={user.uid} className="hover:border-[var(--primary)]/20 transition-all">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between gap-3 flex-wrap">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full gradient-primary text-sm font-bold text-white shrink-0">
                                        {user.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-medium">{user.name}</p>
                                        <div className="flex items-center gap-3 text-xs text-[var(--muted-foreground)]">
                                            <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{user.email}</span>
                                            <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{user.phone}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {user.is_live && <Badge variant="default" className="text-[10px]">Live</Badge>}
                                    {user.is_record_class && <Badge variant="secondary" className="text-[10px]">Recorded</Badge>}
                                    {user.status === "rejected" && (
                                        <Badge variant="destructive" className="text-[10px]">Rejected</Badge>
                                    )}
                                </div>
                            </div>
                            {user.rejectionReason && (
                                <p className="mt-2 text-xs text-[var(--destructive)] bg-[var(--destructive)]/10 p-2 rounded-lg">
                                    Reason: {user.rejectionReason}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Users className="h-6 w-6 text-green-500" />
                        User Management
                    </h1>
                    <p className="text-[var(--muted-foreground)] mt-1">
                        {verified.length} verified · {rejected.length} rejected
                    </p>
                </div>
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
                    <Input placeholder="Search users..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
                </div>
            </div>

            <Tabs value={tab} onValueChange={setTab}>
                <TabsList>
                    <TabsTrigger value="verified">Verified ({verified.length})</TabsTrigger>
                    <TabsTrigger value="rejected">Rejected ({rejected.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="verified">{renderUserList(verified)}</TabsContent>
                <TabsContent value="rejected">{renderUserList(rejected)}</TabsContent>
            </Tabs>
        </div>
    );
}
