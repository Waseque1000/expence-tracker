"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Camera, Moon, Save, Sun } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/label";
import { Select, SelectItem } from "@/components/ui/select";
import { Avatar } from "@/components/ui/avatar";
import { useStore } from "@/lib/store";
import { useTheme } from "@/lib/theme";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  currency: z.enum(["BDT", "USD", "EUR", "INR"]),
  timezone: z.string(),
  language: z.string(),
  monthlyIncome: z.coerce.number().min(0),
});

type Values = z.infer<typeof schema>;

export default function SettingsPage() {
  const { settings, updateSettings } = useStore();
  const { theme, toggle } = useTheme();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, setValue, watch } = useForm<Values>({
    resolver: zodResolver(schema) as never,
    defaultValues: {
      name: settings.name,
      email: settings.email,
      currency: settings.currency,
      timezone: settings.timezone,
      language: settings.language,
      monthlyIncome: settings.monthlyIncome,
    },
  });

  const currency = watch("currency");
  const timezone = watch("timezone");
  const language = watch("language");

  const onSubmit = (v: Values) => {
    setSaving(true);
    setTimeout(() => {
      updateSettings(v);
      setSaving(false);
      toast({ title: "Settings saved", description: "Your preferences were updated.", type: "success" });
    }, 600);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">Manage your profile and preferences</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar name={settings.name} className="h-16 w-16 text-lg" />
                <button
                  onClick={() => toast({ title: "Photo upload coming soon", description: "Cloudinary integration is on the roadmap.", type: "info" })}
                  className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--primary),var(--accent))] text-white shadow-lg cursor-pointer"
                  aria-label="Upload photo"
                >
                  <Camera className="h-3.5 w-3.5" />
                </button>
              </div>
              <div>
                <p className="text-sm font-semibold">{settings.name}</p>
                <p className="text-xs text-[var(--muted-foreground)]">{settings.email}</p>
                <BadgePlan />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.06 }}
        id="settings-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <Card>
          <CardHeader>
            <CardTitle>Account details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name">
              <Input {...register("name")} />
            </Field>
            <Field label="Email">
              <Input {...register("email")} type="email" />
            </Field>
            <Field label="Currency">
              <Select value={currency} onValueChange={(v) => setValue("currency", v as Values["currency"])}>
                {["BDT", "USD", "EUR", "INR"].map((c) => (
                  <SelectItem key={c} value={c}>
                    {c} — {c === "BDT" ? "Bangladeshi Taka" : c === "USD" ? "US Dollar" : c === "EUR" ? "Euro" : "Indian Rupee"}
                  </SelectItem>
                ))}
              </Select>
            </Field>
            <Field label="Monthly income">
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[var(--muted-foreground)]">
                  ৳
                </span>
                <Input {...register("monthlyIncome")} type="number" min="0" className="pl-8" />
              </div>
            </Field>
            <Field label="Timezone">
              <Select value={timezone} onValueChange={(v) => setValue("timezone", v)}>
                {["Asia/Dhaka", "Asia/Kolkata", "UTC", "America/New_York", "Europe/London", "Asia/Singapore"].map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </Select>
            </Field>
            <Field label="Language">
              <Select value={language} onValueChange={(v) => setValue("language", v)}>
                {["English", "বাংলা", "हिन्दी"].map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </Select>
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Theme</p>
              <p className="text-xs text-[var(--muted-foreground)]">
                {theme === "dark" ? "Dark mode is active" : "Light mode is active"}
              </p>
            </div>
            <Button variant="outline" onClick={toggle} className="gap-2">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              Switch to {theme === "dark" ? "light" : "dark"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">Your data</p>
              <p className="text-xs text-[var(--muted-foreground)]">
                All your expenses, budgets, and goals are stored securely in MongoDB.
              </p>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" variant="gradient" className="w-full gap-2 sm:w-auto" disabled={saving}>
          {saving ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save changes
        </Button>
      </motion.form>
    </div>
  );
}

function BadgePlan() {
  return (
    <span className={cn(
      "mt-1.5 inline-block rounded-full bg-[linear-gradient(135deg,var(--primary),var(--accent))] px-2 py-0.5 text-[10px] font-semibold text-white"
    )}>
      PRO PLAN
    </span>
  );
}
