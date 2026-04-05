"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { Workflow } from "@prisma/client";
import { cn } from "@/lib/utils";
import { WorkflowStatus } from "@/types/workflow";
import {
  FileTextIcon,
  MoreVerticalIcon,
  PlayIcon,
  ShuffleIcon,
  TrashIcon,
  CalendarIcon,
} from "lucide-react";
import React, { useState } from "react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import TooltipWrapper from "@/components/TooltipWrapper";
import DeleteWorkflowDialog from "./DeleteWorkflowDialog";

/* ── status config ───────────────────────────────────────────── */
const statusConfig = {
  [WorkflowStatus.DRAFT]: {
    stripe:       "bg-amber-400",
    iconBg:       "bg-amber-50 dark:bg-amber-500/10",
    iconColor:    "text-amber-600 dark:text-amber-400",
    badgeBg:      "bg-amber-50 dark:bg-amber-500/10",
    badgeText:    "text-amber-700 dark:text-amber-400",
    badgeBorder:  "border-amber-200 dark:border-amber-500/30",
    dot:          "bg-amber-400",
    label:        "Draft",
    Icon:         FileTextIcon,
  },
  [WorkflowStatus.PUBLISHED]: {
    stripe:       "bg-cyan-400",
    iconBg:       "bg-cyan-50 dark:bg-cyan-500/10",
    iconColor:    "text-cyan-600 dark:text-cyan-400",
    badgeBg:      "bg-cyan-50 dark:bg-cyan-500/10",
    badgeText:    "text-cyan-700 dark:text-cyan-400",
    badgeBorder:  "border-cyan-200 dark:border-cyan-500/30",
    dot:          "bg-cyan-400",
    label:        "Published",
    Icon:         PlayIcon,
  },
};

/* ── card ────────────────────────────────────────────────────── */
const WorkflowCard = ({ workflow }: { workflow: Workflow }) => {
  const cfg =
    statusConfig[workflow.status as WorkflowStatus] ??
    statusConfig[WorkflowStatus.DRAFT];

  const { Icon } = cfg;

  const createdAt = workflow.createdAt
    ? new Date(workflow.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div
      className={cn(
        "group flex flex-col rounded-xl overflow-hidden",
        "border border-zinc-200 dark:border-zinc-800",
        "bg-white dark:bg-zinc-900",
        "transition-all duration-150",
        "hover:border-zinc-300 dark:hover:border-zinc-700",
        "hover:shadow-sm"
      )}
    >
      {/* colour stripe */}
      <div className={cn("h-[3px] w-full shrink-0", cfg.stripe)} />

      <div className="flex flex-col gap-4 p-[18px]">
        {/* top row: icon + name + menu */}
        <div className="flex items-start gap-3">
          <span
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]",
              cfg.iconBg
            )}
          >
            <Icon size={16} className={cfg.iconColor} strokeWidth={1.8} />
          </span>

          <div className="min-w-0 flex-1">
            <Link
              href={`/workflows/editor/${workflow.id}`}
              className="block truncate text-sm font-medium text-zinc-900 dark:text-zinc-100 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
            >
              {workflow.name}
            </Link>
            {workflow.description ? (
              <p className="mt-0.5 truncate text-xs text-zinc-400 dark:text-zinc-500">
                {workflow.description}
              </p>
            ) : (
              <p className="mt-0.5 text-xs text-zinc-300 dark:text-zinc-600 italic">
                No description
              </p>
            )}
          </div>

          <WorkflowActions
            workflowName={workflow.name}
            workflowId={workflow.id}
          />
        </div>

        {/* footer row: badge + date + edit */}
        <div className="flex items-center justify-between gap-2 border-t border-zinc-100 dark:border-zinc-800 pt-3">
          <div className="flex items-center gap-2.5">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-[3px]",
                "text-[11px] font-medium",
                cfg.badgeBg,
                cfg.badgeText,
                cfg.badgeBorder
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />
              {cfg.label}
            </span>

            {createdAt && (
              <span className="flex items-center gap-1 text-[11px] text-zinc-400 dark:text-zinc-500">
                <CalendarIcon size={11} strokeWidth={1.8} />
                {createdAt}
              </span>
            )}
          </div>

          <Link
            href={`/workflow/editor/${workflow.id}`}
            className={cn(
              "flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5",
              "text-xs font-medium transition-all duration-150",
              "border-zinc-200 dark:border-zinc-700",
              "bg-white dark:bg-zinc-900",
              "text-zinc-500 dark:text-zinc-400",
              "hover:border-cyan-200 dark:hover:border-cyan-500/40",
              "hover:bg-cyan-50 dark:hover:bg-cyan-500/10",
              "hover:text-cyan-600 dark:hover:text-cyan-400"
            )}
          >
            <ShuffleIcon size={12} strokeWidth={2} />
            Edit
          </Link>
        </div>
      </div>
    </div>
  );
};

/* ── dropdown actions ────────────────────────────────────────── */
function WorkflowActions({
  workflowName,
  workflowId,
}: {
  workflowName: string;
  workflowId: string;
}) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <>
      <DeleteWorkflowDialog
        workflowName={workflowName}
        workflowId={workflowId}
        open={showDeleteDialog}
        setOpen={setShowDeleteDialog}
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-7 w-7 shrink-0 rounded-lg",
              "border border-zinc-200 dark:border-zinc-700",
              "text-zinc-400 dark:text-zinc-500",
              "hover:bg-zinc-50 dark:hover:bg-zinc-800",
              "hover:text-zinc-700 dark:hover:text-zinc-200",
              "hover:border-zinc-300 dark:hover:border-zinc-600"
            )}
          >
            <TooltipWrapper content="More actions">
              <MoreVerticalIcon size={14} strokeWidth={2} />
            </TooltipWrapper>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-36 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-md"
        >
          <DropdownMenuLabel className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
            Actions
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-zinc-100 dark:bg-zinc-800" />
          <DropdownMenuItem
            onSelect={() => setShowDeleteDialog(true)}
            className={cn(
              "gap-2 text-xs cursor-pointer",
              "text-red-600 dark:text-red-400",
              "focus:text-red-700 focus:bg-red-50 dark:focus:bg-red-500/10"
            )}
          >
            <TrashIcon size={13} strokeWidth={2} />
            Delete workflow
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

export default WorkflowCard;