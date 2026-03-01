"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ref, onValue, update, set } from "firebase/database";
import { db } from "@/lib/firebase";
import type { PendingRegistration } from "@/lib/types";
import { UserPlus, Eye, UserCheck, UserX, Loader2, ExternalLink, Clock } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function AdminRegistrations() {
    const [registrations, setRegistrations] = useState<PendingRegistration[]>([]);
    const [selectedReg, setSelectedReg] = useState<PendingRegistration | null>(null);
    const [showDetail, setShowDetail] = useState(false);
    const [showReject, setShowReject] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        const regRef = ref(db, "pendingRegistrations");
        const unsub = onValue(regRef, (snapshot) => {
            const list: PendingRegistration[] = [];
            snapshot.forEach((child) => {
                const data = child.val();
                if (data.status === "pending") {
                    list.push({ ...data, id: child.key! });
                }
            });
            list.sort((a, b) => b.submittedAt - a.submittedAt);
            setRegistrations(list);
        });
        return () => unsub();
    }, []);

    const handleAddUser = async () => {
        if (!selectedReg) return;
        setProcessing(true);
        try {
            // Generate login ID
            const loginId = selectedReg.email;
            const tempPassword = selectedReg.phone;

            // Create Firebase Auth user via API route
            const response = await fetch("/api/admin/create-user", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: selectedReg.email,
                    password: tempPassword,
                    displayName: selectedReg.name,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to create user");
            }

            const { uid } = await response.json();

            // Determine feature flags from package
            const is_live = selectedReg.selectedPackage === "live_only" || selectedReg.selectedPackage === "both";
            const is_record_class = selectedReg.selectedPackage === "recorded_only" || selectedReg.selectedPackage === "both";

            // Create user record in Realtime DB
            await set(ref(db, `users/${uid}`), {
                name: selectedReg.name,
                email: selectedReg.email,
                phone: selectedReg.phone,
                whatsapp: selectedReg.whatsapp,
                graduationYear: selectedReg.graduationYear,
                role: "student",
                status: "verified",
                is_live,
                is_record_class,
                activeSessionId: "",
                firstLogin: true,
                loginId,
                createdAt: Date.now(),
            });

            // Update pending registration status
            await update(ref(db, `pendingRegistrations/${selectedReg.id}`), {
                status: "approved",
            });

            toast.success(`User ${selectedReg.name} added successfully! Login: ${loginId}, Password: ${tempPassword}`);
            setShowDetail(false);
            setSelectedReg(null);
        } catch (error: unknown) {
            toast.error(`Failed to create user: ${(error as Error).message}`);
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!selectedReg || !rejectionReason.trim()) {
            toast.error("Please enter a rejection reason");
            return;
        }
        setProcessing(true);
        try {
            await update(ref(db, `pendingRegistrations/${selectedReg.id}`), {
                status: "rejected",
                rejectionReason: rejectionReason.trim(),
            });
            toast.success(`Registration for ${selectedReg.name} rejected`);
            setShowReject(false);
            setShowDetail(false);
            setSelectedReg(null);
            setRejectionReason("");
        } catch {
            toast.error("Failed to reject registration");
        } finally {
            setProcessing(false);
        }
    };

    const packageLabel = (pkg: string) => {
        switch (pkg) {
            case "recorded_only": return "Recorded Only";
            case "live_only": return "Live Only";
            case "both": return "Live + Recorded";
            default: return pkg;
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <UserPlus className="h-6 w-6 text-amber-500" />
                    Pending Registrations
                </h1>
                <p className="text-[var(--muted-foreground)] mt-1">
                    Review and approve new student registrations ({registrations.length} pending)
                </p>
            </div>

            {registrations.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center text-[var(--muted-foreground)]">
                        <UserPlus className="h-10 w-10 mx-auto mb-2" />
                        <p className="font-medium">No pending registrations</p>
                        <p className="text-sm">New registrations will appear here</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="rounded-xl border border-[var(--border)] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-[var(--border)] bg-[var(--muted)]/50">
                                    <th className="px-4 py-3 text-left font-medium text-[var(--muted-foreground)]">Name</th>
                                    <th className="px-4 py-3 text-left font-medium text-[var(--muted-foreground)] hidden sm:table-cell">Email</th>
                                    <th className="px-4 py-3 text-left font-medium text-[var(--muted-foreground)] hidden md:table-cell">Phone</th>
                                    <th className="px-4 py-3 text-left font-medium text-[var(--muted-foreground)]">Package</th>
                                    <th className="px-4 py-3 text-left font-medium text-[var(--muted-foreground)] hidden lg:table-cell">Date</th>
                                    <th className="px-4 py-3 text-right font-medium text-[var(--muted-foreground)]">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border)]">
                                {registrations.map((reg) => (
                                    <tr key={reg.id} className="hover:bg-[var(--muted)]/30 transition-colors">
                                        <td className="px-4 py-3 font-medium">{reg.name}</td>
                                        <td className="px-4 py-3 hidden sm:table-cell text-[var(--muted-foreground)]">{reg.email}</td>
                                        <td className="px-4 py-3 hidden md:table-cell text-[var(--muted-foreground)]">{reg.phone}</td>
                                        <td className="px-4 py-3">
                                            <Badge variant="outline" className="text-xs">{packageLabel(reg.selectedPackage)}</Badge>
                                        </td>
                                        <td className="px-4 py-3 hidden lg:table-cell text-[var(--muted-foreground)] text-xs">
                                            {format(new Date(reg.submittedAt), "MMM d, yyyy")}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedReg(reg);
                                                    setShowDetail(true);
                                                }}
                                            >
                                                <Eye className="h-4 w-4 mr-1" />
                                                View
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Detail Dialog */}
            <Dialog open={showDetail} onOpenChange={setShowDetail}>
                <DialogHeader>
                    <DialogTitle>Registration Details</DialogTitle>
                    <DialogDescription>Review the applicant&apos;s information</DialogDescription>
                </DialogHeader>

                {selectedReg && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-[var(--muted-foreground)]">Full Name</p>
                                <p className="font-medium">{selectedReg.name}</p>
                            </div>
                            <div>
                                <p className="text-[var(--muted-foreground)]">Email</p>
                                <p className="font-medium">{selectedReg.email}</p>
                            </div>
                            <div>
                                <p className="text-[var(--muted-foreground)]">Phone</p>
                                <p className="font-medium">{selectedReg.phone}</p>
                            </div>
                            <div>
                                <p className="text-[var(--muted-foreground)]">WhatsApp</p>
                                <p className="font-medium">{selectedReg.whatsapp}</p>
                            </div>
                            <div>
                                <p className="text-[var(--muted-foreground)]">Graduation Year</p>
                                <p className="font-medium">{selectedReg.graduationYear}</p>
                            </div>
                            <div>
                                <p className="text-[var(--muted-foreground)]">Package</p>
                                <Badge>{packageLabel(selectedReg.selectedPackage)}</Badge>
                            </div>
                            <div>
                                <p className="text-[var(--muted-foreground)]">Submitted</p>
                                <p className="font-medium text-xs flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {format(new Date(selectedReg.submittedAt), "MMM d, yyyy h:mm a")}
                                </p>
                            </div>
                        </div>

                        {selectedReg.screenshotDriveUrl && (
                            <div>
                                <p className="text-sm text-[var(--muted-foreground)] mb-2">Payment Screenshot</p>
                                <a
                                    href={selectedReg.screenshotDriveUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-sm text-[var(--primary)] hover:underline"
                                >
                                    <ExternalLink className="h-4 w-4" />
                                    View Screenshot on Drive
                                </a>
                            </div>
                        )}

                        <DialogFooter>
                            <Button
                                variant="destructive"
                                onClick={() => {
                                    setShowReject(true);
                                }}
                                disabled={processing}
                            >
                                <UserX className="h-4 w-4 mr-1" />
                                Reject
                            </Button>
                            <Button
                                onClick={handleAddUser}
                                disabled={processing}
                                className="gradient-primary border-0"
                            >
                                {processing ? (
                                    <><Loader2 className="h-4 w-4 animate-spin mr-1" />Processing...</>
                                ) : (
                                    <><UserCheck className="h-4 w-4 mr-1" />Add User</>
                                )}
                            </Button>
                        </DialogFooter>
                    </div>
                )}
            </Dialog>

            {/* Reject Dialog */}
            <Dialog open={showReject} onOpenChange={setShowReject}>
                <DialogHeader>
                    <DialogTitle>Reject Registration</DialogTitle>
                    <DialogDescription>Enter a reason for rejection</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Rejection Reason *</Label>
                        <Textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Enter the reason for rejecting this registration..."
                            rows={3}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowReject(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleReject} disabled={processing}>
                            {processing ? "Rejecting..." : "Confirm Reject"}
                        </Button>
                    </DialogFooter>
                </div>
            </Dialog>
        </div>
    );
}
