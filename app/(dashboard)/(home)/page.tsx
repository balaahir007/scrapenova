"use client";

import { Button } from "@/components/ui/button";
import {
  Plus,
  Zap,
  Shield,
  Cpu,
  Database,
  ArrowRight,
  Activity,
  CheckCircle2,
  Clock,
  AlertCircle,
  InboxIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import WorkflowCard from "@/app/(dashboard)/workflows/_components/WorkflowCard";
import { useUser } from "@clerk/nextjs";
import { Suspense } from "react";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { GetWorkFLowsForUser } from "@/actions/workflows/getWorkflowsUser";
import CreateWorkflowDialog from "../workflows/_components/CreateWorkflowDialog";

/* ── stat pill ───────────────────────────────────────────────── */
function StatPill({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3 shadow-sm">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10">
        <Icon size={15} className="text-cyan-600 dark:text-cyan-400" />
      </span>
      <div>
        <p className="text-[11px] font-medium uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
          {label}
        </p>
        <p className="text-lg font-bold leading-none text-zinc-900 dark:text-zinc-100">
          {value}
        </p>
      </div>
    </div>
  );
}

/* ── feature card ─────────────────────────────────────────────── */
function FeatureCard({
  icon: Icon,
  title,
  description,
  accent,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  accent: string;
}) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl",
        "border border-zinc-200 dark:border-zinc-800",
        "bg-white dark:bg-zinc-900 p-6",
        "transition-all duration-200 hover:shadow-md hover:-translate-y-0.5",
        "hover:border-zinc-300 dark:hover:border-zinc-700"
      )}
    >
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: accent }}
      />
      <span
        className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl"
        style={{ background: accent + "18" }}
      >
        <Icon size={20} style={{ color: accent }} />
      </span>
      <h3 className="mb-1 font-semibold text-zinc-900 dark:text-zinc-100">{title}</h3>
      <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">{description}</p>
    </div>
  );
}

/* ── skeleton ────────────────────────────────────────────────── */
function WorkflowSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-36 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />
      ))}
    </div>
  );
}

/* ── server component ────────────────────────────────────────── */
async function UserWorkflows() {
  const workflows = await GetWorkFLowsForUser();

  if (!workflows) {
    return (
      <Alert variant="destructive" className="border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Something went wrong. Please try again later.</AlertDescription>
      </Alert>
    );
  }

  if (workflows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-100 dark:border-cyan-500/20">
          <InboxIcon size={28} className="text-cyan-600 dark:text-cyan-400" />
        </div>
        <h3 className="mb-1.5 text-base font-semibold text-zinc-900 dark:text-zinc-100">
          No workflows yet
        </h3>
        <p className="mb-6 max-w-xs text-sm text-zinc-500 dark:text-zinc-400">
          Build your first scraping workflow in minutes — no code required.
        </p>
        <CreateWorkflowDialog triggerText="Create your first workflow" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {workflows.map((workflow) => (
        <WorkflowCard workflow={workflow} key={workflow.id} />
      ))}
    </div>
  );
}

/* ── page ────────────────────────────────────────────────────── */
export default function DashboardPage() {
  const router = useRouter();
  const { user } = useUser();
  const firstName = user?.firstName ?? "there";

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* grid pattern */}
      

      <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-8">

        {/* greeting */}
        <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-cyan-600 dark:text-cyan-500">
              Dashboard
            </p>
            <h1
              className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100"
              style={{ fontFamily: "&apos;Syne&apos;, sans-serif" }}
            >
              Good morning, {firstName} 👋
            </h1>
            <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
              Here's what's happening with your scraping workflows.
            </p>
          </div>
          <CreateWorkflowDialog />
        </div>

        {/* stat pills */}
        <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatPill icon={Activity}     label="Total"      value="—" />
          <StatPill icon={CheckCircle2} label="Active"     value="—" />
          <StatPill icon={Clock}        label="Runs today" value={0} />
          <StatPill icon={Zap}          label="Credits"    value="∞" />
        </div>

        {/* feature cards */}
        <div className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <FeatureCard icon={Zap}      title="Lightning Fast"    description="Parallel execution for maximum throughput." accent="#06b6d4" />
          <FeatureCard icon={Shield}   title="Secure by Default" description="End-to-end encryption for your credentials." accent="#10b981" />
          <FeatureCard icon={Cpu}      title="AI-Powered"        description="Smart selectors that adapt automatically."   accent="#8b5cf6" />
          <FeatureCard icon={Database} title="Scalable"          description="From one page to millions, it grows with you." accent="#f59e0b" />
        </div>

        {/* workflows panel */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 px-6 py-4">
            <div>
              <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">Your Workflows</h2>
              <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">
                All your scraping projects
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/workflows")}
              className="gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 hover:text-cyan-600 dark:hover:text-cyan-400"
            >
              View all <ArrowRight size={12} />
            </Button>
          </div>

          <div className="p-6">
            <Suspense fallback={<WorkflowSkeleton />}>
              <UserWorkflows />
            </Suspense>
          </div>
        </div>

      </div>
    </div>
  );
}