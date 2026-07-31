"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Eye, EyeOff, Lock, Mail, User } from "lucide-react";
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

const schema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().min(1, "Email is required").email("Enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

type Values = z.infer<typeof schema>;

export default function RegisterPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { register: createAccount } = useAuth();
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = async (v: Values) => {
    setLoading(true);
    try {
      const u = await createAccount(v.name, v.email, v.password);
      setLoading(false);
      toast({
        title: "Account created!",
        description: `Welcome, ${u.displayName ?? v.name}. Let's get set up.`,
        type: "success",
      });
      router.push("/dashboard");
    } catch (e) {
      setLoading(false);
      toast({ title: "Could not create account", description: getAuthErrorMessage(e), type: "error" });
    }
  };

  return (
    <AuthCard title="Create your account" subtitle="Start tracking your money in under a minute">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field label="Full name">
          <div className="relative">
            <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
            <Input
              {...register("name")}
              placeholder="Alex Rahman"
              className="h-11 rounded-xl bg-[var(--background)]/60 pl-10"
              autoComplete="name"
            />
          </div>
          {errors.name && <p className="text-xs text-rose-500">{errors.name.message}</p>}
        </Field>

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

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Password" hint="At least 8 characters">
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
              <Input
                {...register("password")}
                type={showPw ? "text" : "password"}
                placeholder="••••••••"
                className="h-11 rounded-xl bg-[var(--background)]/60 pl-10 pr-10"
                autoComplete="new-password"
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

          <Field label="Confirm password">
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
              <Input
                {...register("confirm")}
                type={showPw ? "text" : "password"}
                placeholder="••••••••"
                className="h-11 rounded-xl bg-[var(--background)]/60 pl-10"
                autoComplete="new-password"
              />
            </div>
            {errors.confirm && <p className="text-xs text-rose-500">{errors.confirm.message}</p>}
          </Field>
        </div>

        <Button type="submit" variant="gradient" size="lg" className="w-full" disabled={loading}>
          {loading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <>
              Create account <ArrowRight className="h-4 w-4" />
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

      <GoogleButton label="Sign up with Google" />

      <p className="mt-6 text-center text-sm text-[var(--muted-foreground)]">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-[var(--primary)] hover:underline">
          Log in
        </Link>
      </p>
    </AuthCard>
  );
}
