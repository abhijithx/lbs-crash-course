"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Dialog, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ref, onValue, push, set, update } from "firebase/database";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import type { LiveClass, LiveClassStatus } from "@/lib/types";
import { Video, Plus, Edit, Calendar, Clock, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const statusOptions = [
    { value: "upcoming", label: "Upcoming" },
    { value: "live", label: "Live" },
    { value: "completed", label: "Completed" },
];

export default function AdminLiveClassesPage() {
    const { userData } = useAuth();
    const [classes, setClasses] = useState<LiveClass[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<LiveClass | null>(null);
    const [form, setForm] = useState({
        title: "",
        subject: "",
        scheduledAt: "",
        meetLink: "",
        status: "upcoming" as LiveClassStatus,
        recordingUrl: "",
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const liveRef = ref(db, "liveClasses");
        const unsub = onValue(liveRef, (snapshot) => {
            const list: LiveClass[] = [];
            snapshot.forEach((child) => { list.push({ ...child.val(), id: child.key! }); });
            list.sort((a, b) => b.scheduledAt - a.scheduledAt);
            setClasses(list);
        });
        return () => unsub();
    }, []);

    const openCreate = () => {
        setEditing(null);
        setForm({ title: "", subject: "", scheduledAt: "", meetLink: "", status: "upcoming", recordingUrl: "" });
        setShowForm(true);
    };

    const openEdit = (cls: LiveClass) => {
        setEditing(cls);
        setForm({
            title: cls.title,
            subject: cls.subject,
            scheduledAt: new Date(cls.scheduledAt).toISOString().slice(0, 16),
            meetLink: cls.meetLink || "",
            status: cls.status,
            recordingUrl: cls.recordingUrl || "",
        });
        setShowForm(true);
    };

    const handleSave = async () => {
        if (!form.title || !form.subject || !form.scheduledAt) {
            toast.error("Title, subject, and date/time are required");
            return;
        }
        setSaving(true);
        try {
            const data = {
                title: form.title,
                subject: form.subject,
                scheduledAt: new Date(form.scheduledAt).getTime(),
                meetLink: form.meetLink,
                status: form.status,
                recordingUrl: form.recordingUrl,
                createdBy: userData?.uid || "",
                ...(editing ? {} : { createdAt: Date.now() }),
            };

            if (editing) {
                await update(ref(db, `liveClasses/${editing.id}`), data);
                toast.success("Live class updated");
            } else {
                await set(push(ref(db, "liveClasses")), data);
                toast.success("Live class created");
            }
            setShowForm(false);
        } catch {
            toast.error("Failed to save");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Video className="h-6 w-6 text-blue-500" />Live Classes
                    </h1>
                    <p className="text-[var(--muted-foreground)] mt-1">{classes.length} total classes</p>
                </div>
                <Button onClick={openCreate} className="gradient-primary border-0">
                    <Plus className="h-4 w-4 mr-1" /> Create Class
                </Button>
            </div>

            {classes.length === 0 ? (
                <Card><CardContent className="py-12 text-center text-[var(--muted-foreground)]">
                    <Video className="h-10 w-10 mx-auto mb-2" />
                    <p>No live classes created yet</p>
                </CardContent></Card>
            ) : (
                <div className="space-y-3">
                    {classes.map((cls) => (
                        <Card key={cls.id} className="hover:border-[var(--primary)]/20 transition-all">
                            <CardContent className="p-5 flex items-center justify-between gap-3 flex-wrap">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="font-semibold">{cls.title}</p>
                                        <Badge variant={cls.status === "live" ? "live" : cls.status === "completed" ? "secondary" : "default"}>
                                            {cls.status}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-[var(--muted-foreground)]">{cls.subject}</p>
                                    <div className="flex items-center gap-3 text-xs text-[var(--muted-foreground)] mt-1">
                                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{format(new Date(cls.scheduledAt), "MMM d, yyyy")}</span>
                                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{format(new Date(cls.scheduledAt), "h:mm a")}</span>
                                        {cls.meetLink && <span className="flex items-center gap-1"><ExternalLink className="h-3 w-3" />Link set</span>}
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => openEdit(cls)}>
                                    <Edit className="h-4 w-4 mr-1" /> Edit
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <Dialog open={showForm} onOpenChange={setShowForm}>
                <DialogHeader>
                    <DialogTitle>{editing ? "Edit" : "Create"} Live Class</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="space-y-2"><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Class title" /></div>
                    <div className="space-y-2"><Label>Subject *</Label><Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="e.g. Mathematics" /></div>
                    <div className="space-y-2"><Label>Date & Time *</Label><Input type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} /></div>
                    <div className="space-y-2"><Label>Google Meet Link</Label><Input value={form.meetLink} onChange={(e) => setForm({ ...form, meetLink: e.target.value })} placeholder="https://meet.google.com/..." /></div>
                    <div className="space-y-2"><Label>Status</Label><Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as LiveClassStatus })} options={statusOptions} /></div>
                    {form.status === "completed" && (
                        <div className="space-y-2"><Label>Recording URL</Label><Input value={form.recordingUrl} onChange={(e) => setForm({ ...form, recordingUrl: e.target.value })} placeholder="YouTube recording URL" /></div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                        <Button onClick={handleSave} disabled={saving} className="gradient-primary border-0">
                            {saving ? "Saving..." : editing ? "Update" : "Create"}
                        </Button>
                    </DialogFooter>
                </div>
            </Dialog>
        </div>
    );
}
