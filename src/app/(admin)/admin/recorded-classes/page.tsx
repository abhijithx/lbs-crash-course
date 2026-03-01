"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ref, onValue, push, set, update, remove } from "firebase/database";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import type { RecordedClass } from "@/lib/types";
import { MonitorPlay, Plus, Edit, Trash2, Play } from "lucide-react";
import { toast } from "sonner";

export default function AdminRecordedClassesPage() {
    const { userData } = useAuth();
    const [classes, setClasses] = useState<RecordedClass[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<RecordedClass | null>(null);
    const [form, setForm] = useState({ title: "", subject: "", section: "", youtubeUrl: "" });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const recRef = ref(db, "recordedClasses");
        const unsub = onValue(recRef, (snapshot) => {
            const list: RecordedClass[] = [];
            snapshot.forEach((child) => { list.push({ ...child.val(), id: child.key! }); });
            list.sort((a, b) => b.createdAt - a.createdAt);
            setClasses(list);
        });
        return () => unsub();
    }, []);

    const openCreate = () => { setEditing(null); setForm({ title: "", subject: "", section: "", youtubeUrl: "" }); setShowForm(true); };
    const openEdit = (cls: RecordedClass) => { setEditing(cls); setForm({ title: cls.title, subject: cls.subject, section: cls.section, youtubeUrl: cls.youtubeUrl }); setShowForm(true); };

    const handleSave = async () => {
        if (!form.title || !form.subject || !form.youtubeUrl) { toast.error("Title, subject, and YouTube URL required"); return; }
        setSaving(true);
        try {
            const data = { ...form, createdBy: userData?.uid || "", ...(editing ? {} : { createdAt: Date.now() }) };
            if (editing) { await update(ref(db, `recordedClasses/${editing.id}`), data); toast.success("Updated"); }
            else { await set(push(ref(db, "recordedClasses")), data); toast.success("Created"); }
            setShowForm(false);
        } catch { toast.error("Failed to save"); } finally { setSaving(false); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this recorded class?")) return;
        try { await remove(ref(db, `recordedClasses/${id}`)); toast.success("Deleted"); } catch { toast.error("Failed to delete"); }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2"><MonitorPlay className="h-6 w-6 text-violet-500" />Recorded Classes</h1>
                    <p className="text-[var(--muted-foreground)] mt-1">{classes.length} classes</p>
                </div>
                <Button onClick={openCreate} className="gradient-primary border-0"><Plus className="h-4 w-4 mr-1" /> Add Class</Button>
            </div>

            {classes.length === 0 ? (
                <Card><CardContent className="py-12 text-center text-[var(--muted-foreground)]"><MonitorPlay className="h-10 w-10 mx-auto mb-2" /><p>No recorded classes</p></CardContent></Card>
            ) : (
                <div className="space-y-3">
                    {classes.map((cls) => (
                        <Card key={cls.id} className="hover:border-[var(--primary)]/20 transition-all">
                            <CardContent className="p-4 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 shrink-0"><Play className="h-5 w-5 text-violet-500" /></div>
                                    <div>
                                        <p className="font-medium">{cls.title}</p>
                                        <p className="text-xs text-[var(--muted-foreground)]">{cls.subject} · {cls.section}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={() => openEdit(cls)}><Edit className="h-3.5 w-3.5" /></Button>
                                    <Button variant="outline" size="sm" onClick={() => handleDelete(cls.id)} className="text-[var(--destructive)] hover:bg-[var(--destructive)]/10"><Trash2 className="h-3.5 w-3.5" /></Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <Dialog open={showForm} onOpenChange={setShowForm}>
                <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Recorded Class</DialogTitle></DialogHeader>
                <div className="space-y-4">
                    <div className="space-y-2"><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Lecture title" /></div>
                    <div className="space-y-2"><Label>Subject *</Label><Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="e.g. Data Structures" /></div>
                    <div className="space-y-2"><Label>Section</Label><Input value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} placeholder="e.g. Unit 1" /></div>
                    <div className="space-y-2"><Label>YouTube URL *</Label><Input value={form.youtubeUrl} onChange={(e) => setForm({ ...form, youtubeUrl: e.target.value })} placeholder="https://youtube.com/..." /></div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                        <Button onClick={handleSave} disabled={saving} className="gradient-primary border-0">{saving ? "Saving..." : editing ? "Update" : "Add"}</Button>
                    </DialogFooter>
                </div>
            </Dialog>
        </div>
    );
}
