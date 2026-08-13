"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Mail, Send } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/label";
import { AuthCard } from "@/components/auth/auth-card";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/lib/auth";
import { getAuthErrorMessage } from "@/lib/auth-errors";

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
});

type Values = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const { resetPassword } = useAuth();
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = async (v: Values) => {
    setLoading(true);
    try {
      await resetPassword(v.email);
      setLoading(false);
      setSent(true);
      toast({ title: "Reset link sent", description: `Check ${v.email} for instructions`, type: "success" });
    } catch (e) {
      setLoading(false);
      toast({ title: "Could not send reset link", description: getAuthErrorMessage(e), type: "error" });
    }
  };

  return (
    <AuthCard
      title="Reset your password"
      subtitle={
        sent
          ? "If an account exists for that email, a reset link is on its way."
          : "Enter your email and we'll send you a secure reset link."
      }
    >
      <Link
        href="/login"
        className="mb-5 inline-flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
      >
        <ArrowLeft className="h-4 w-4" /> Back to login
      </Link>

      {!sent ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field label="Email">
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
              <Input
                {...register("email")}
                placeholder="you@example.com"
                className="h-11 rounded-xl bg-[var(--background)]/60 pl-10"
              />
            </div>
            {errors.email && <p className="text-xs text-rose-500">{errors.email.message}</p>}
          </Field>
          <Button type="submit" variant="gradient" size="lg" className="w-full" disabled={loading}>
            {loading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>
                Send reset link <Send className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      ) : (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5 text-sm text-emerald-600">
          Check your inbox. The link expires in 30 minutes.
        </div>
      )}
    </AuthCard>
  );
}
