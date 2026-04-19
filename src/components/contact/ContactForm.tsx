"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Send, Loader2, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export function ContactForm() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate form submission
    setTimeout(() => {
      toast.success("Message sent successfully! We will get back to you soon.");
      setLoading(false);
      (e.target as HTMLFormElement).reset();
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="lg:col-span-3"
    >
      <Card className="rounded-[2.5rem] border-border bg-card shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 h-40 w-40 bg-linear-to-br from-primary/5 to-transparent rounded-bl-full pointer-events-none" />

        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Send className="h-5 w-5 text-primary" />
            Send us a Message
          </CardTitle>
          <CardDescription className="text-base">
            Fill out the form below and we&apos;ll get back to you within 24 hours.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold ml-1">Full Name</Label>
              <Input 
                id="name" 
                placeholder="John Doe" 
                className="h-12 rounded-xl bg-secondary/20 border-border focus:ring-primary" 
                required 
                aria-required="true"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold ml-1">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="john@example.com" 
                className="h-12 rounded-xl bg-secondary/20 border-border focus:ring-primary" 
                required 
                aria-required="true"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="subject" className="text-sm font-semibold ml-1">Subject</Label>
              <Input 
                id="subject" 
                placeholder="Question about course" 
                className="h-12 rounded-xl bg-secondary/20 border-border focus:ring-primary" 
                required 
                aria-required="true"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="message" className="text-sm font-semibold ml-1">Message</Label>
              <Textarea 
                id="message" 
                placeholder="How can we help you?" 
                className="min-h-40 rounded-2xl bg-secondary/20 border-border focus:ring-primary resize-none" 
                required 
                aria-required="true"
              />
            </div>
            <div className="sm:col-span-2">
              <Button 
                type="submit" 
                className="w-full gradient-primary border-0 h-14 rounded-2xl text-lg font-bold shadow-xl shadow-primary/30 hover:-translate-y-1 transition-all" 
                disabled={loading}
                aria-label="Submit contact form"
              >
                {loading ? (
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                ) : (
                  <Zap className="h-5 w-5 mr-2" />
                )}
                Send Message
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
