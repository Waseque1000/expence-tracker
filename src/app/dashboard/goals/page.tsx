"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Plus, Rocket, Target, Trash2, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/ui/empty";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/format";
import type { Goal } from "@/types";

const schema = z.object({
  title: z.string().min(2, "Goal title is required"),
  target: z.coerce.number().positive("Enter a valid target"),
  deadline: z.string().optional(),
});

type Values = z.infer<typeof schema>;

const COLORS = ["#8b5cf6", "#10b981", "#06b6d4", "#ec4899", "#f59e0b"];

export default function GoalsPage() {
  const { goals, addGoal, addToGoal, deleteGoal } = useStore();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [contributeTo, setContributeTo] = useState<Goal | null>(null);
  const [amount, setAmount] = useState("");

  const { register, handleSubmit, reset, formState: { errors } } = useForm<Values>({
    resolver: zodResolver(schema) as never,
    defaultValues: { title: "", target: undefined, deadline: "" },
  });

  const sorted = useMemo(() => [...goals].sort((a, b) => (b.saved / b.target) - (a.saved / a.target)), [goals]);
  const totalTarget = goals.reduce((s, g) => s + g.target, 0);
  const totalSaved = goals.reduce((s, g) => s + g.saved, 0);

  const onSubmit = (v: Values) => {
    addGoal({ ...v, saved: 0, color: COLORS[goals.length % COLORS.length] });
    toast({ title: "Goal created", description: v.title, type: "success" });
    setOpen(false);
    reset({ title: "", target: undefined, deadline: "" });
  };

  const handleContribute = () => {
    if (!contributeTo) return;
    const amt = Number(amount);
    if (!amt || amt <= 0) {
      toast({ title: "Enter a valid amount", type: "error" });
      return;
    }
    addToGoal(contributeTo.id, amt);
    toast({ title: "Contribution added", description: `${contributeTo.title} · +৳${amt.toLocaleString()}`, type: "success" });
    setContributeTo(null);
    setAmount("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Savings goals</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            ৳{totalSaved.toLocaleString()} of ৳{totalTarget.toLocaleString()} saved across {goals.length} goals
          </p>
        </div>
        <Button variant="gradient" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> New goal
        </Button>
      </div>

      {goals.length === 0 ? (
        <EmptyState
          icon={<Target className="h-5 w-5" />}
          title="No goals yet"
          description="Set a savings goal — a new laptop, a trip, an emergency fund — and track your progress."
          action={
            <Button size="sm" onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" /> Create a goal
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {sorted.map((g, i) => {
            const pct = Math.min(100, (g.saved / g.target) * 100);
            const completed = g.saved >= g.target;
            return (
              <motion.div
                key={g.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Card className="group h-full overflow-hidden transition-all hover:-translate-y-0.5 hover:card-shadow-hover">
                  <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${g.color}, ${g.color}88)` }} />
                  <CardHeader className="flex-row items-start justify-between space-y-0">
                    <div className="flex items-center gap-3">
                      <span
                        className="flex h-11 w-11 items-center justify-center rounded-2xl text-white"
                        style={{ background: g.color }}
                      >
                        <Rocket className="h-5 w-5" />
                      </span>
                      <div>
                        <CardTitle className="text-sm">{g.title}</CardTitle>
                        <p className="text-xs text-[var(--muted-foreground)]">
                          {g.deadline ? `Deadline ${formatDate(g.deadline)}` : "No deadline"}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        deleteGoal(g.id);
                        toast({ title: "Goal deleted", description: g.title, type: "info" });
                      }}
                      className="rounded-lg p-1.5 text-[var(--muted-foreground)] transition-all hover:bg-rose-500/10 hover:text-rose-500 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100 cursor-pointer"
                      title="Delete goal"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
                      <p className="text-xl font-bold tracking-tight sm:text-2xl">
                        ৳{g.saved.toLocaleString()}
                        <span className="text-sm font-normal text-[var(--muted-foreground)]">
                          {" "}
                          / ৳{g.target.toLocaleString()}
                        </span>
                      </p>
                      <Badge variant={completed ? "success" : pct >= 60 ? "info" : "secondary"}>
                        {completed ? "Completed 🎉" : `${Math.round(pct)}%`}
                      </Badge>
                    </div>
                    <Progress value={pct} />
                    <div className="mt-3 flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          setContributeTo(g);
                          setAmount("");
                        }}
                      >
                        <TrendingUp className="h-3.5 w-3.5" /> Contribute
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Create a savings goal"
        description="Give your money a mission."
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="goal-form" variant="gradient">
              Create goal
            </Button>
          </>
        }
      >
        <form id="goal-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field label="Goal title">
            <Input {...register("title")} placeholder="e.g. MacBook Pro" />
            {errors.title && <p className="text-xs text-rose-500">{errors.title.message}</p>}
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Target amount">
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[var(--muted-foreground)]">
                  ৳
                </span>
                <Input {...register("target")} type="number" step="1000" min="0" placeholder="250000" className="pl-8" />
              </div>
              {errors.target && <p className="text-xs text-rose-500">{errors.target.message}</p>}
            </Field>
            <Field label="Deadline (optional)">
              <Input {...register("deadline")} type="date" />
            </Field>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!contributeTo}
        onClose={() => setContributeTo(null)}
        title={`Contribute to ${contributeTo?.title ?? ""}`}
        description={`Progress: ${Math.round(((contributeTo?.saved ?? 0) / Math.max(1, contributeTo?.target ?? 1)) * 100)}%`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setContributeTo(null)}>
              Cancel
            </Button>
            <Button variant="gradient" onClick={handleContribute}>
              Add contribution
            </Button>
          </>
        }
      >
        <Field label="Amount">
          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[var(--muted-foreground)]">
              ৳
            </span>
            <Input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" min="0" placeholder="5000" className="pl-8" />
          </div>
        </Field>
      </Modal>
    </div>
  );
}
