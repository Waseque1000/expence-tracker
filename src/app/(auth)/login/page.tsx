"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/label";
import { GoogleButton } from "@/components/auth/google-button";
import { AuthCard } from "@/components/auth/auth-card";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/lib/auth";
import { getAuthErrorMessage } from "@/lib/auth-errors";

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  remember: z.boolean().optional(),
});

type Values = z.infer<typeof schema>;

export default function LoginPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { login } = useAuth();
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { remember: true },
  });

  const onSubmit = async (v: Values) => {
    setLoading(true);
    try {
      const u = await login(v.email, v.password);
      setLoading(false);
      toast({
        title: "Welcome back!",
        description: `Signed in as ${u.email ?? v.email}`,
        type: "success",
      });
      router.push("/dashboard");
    } catch (e) {
      setLoading(false);
      toast({ title: "Could not log in", description: getAuthErrorMessage(e), type: "error" });
    }
  };

  return (
    <AuthCard title="Welcome back" subtitle="Log in to your ExpenseFlow AI account">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field label="Email">
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
            <Input
              {...register("email")}
              placeholder="you@example.com"
              className="h-11 rounded-xl bg-[var(--background)]/60 pl-10"
              autoComplete="email"
            />
          </div>
          {errors.email && <p className="text-xs text-rose-500">{errors.email.message}</p>}
        </Field>

        <Field label="Password">
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
            <Input
              {...register("password")}
              type={showPw ? "text" : "password"}
              placeholder="••••••••"
              className="h-11 rounded-xl bg-[var(--background)]/60 pl-10 pr-10"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer"
              aria-label={showPw ? "Hide password" : "Show password"}
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-rose-500">{errors.password.message}</p>}
        </Field>

        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] cursor-pointer">
            <input
              type="checkbox"
              {...register("remember")}
              className="h-4 w-4 rounded accent-[var(--primary)]"
            />
            Remember me
          </label>
          <Link href="/forgot-password" className="text-sm font-medium text-[var(--primary)] hover:underline">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" variant="gradient" size="lg" className="w-full" disabled={loading}>
          {loading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <>
              Log in <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-[var(--border)]" />
        <span className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          Or continue with
        </span>
        <div className="h-px flex-1 bg-[var(--border)]" />
      </div>

      <GoogleButton label="Continue with Google" />

      <p className="mt-6 text-center text-sm text-[var(--muted-foreground)]">
        New to ExpenseFlow?{" "}
        <Link href="/register" className="font-semibold text-[var(--primary)] hover:underline">
          Create an account
        </Link>
      </p>
    </AuthCard>
  );
}
