"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import { format } from "date-fns";

interface ExecutionStatus {
  status: "IDLE" | "RUNNING" | "COMPLETED" | "FAILED";
  currentPhase?: number;
  totalPhases?: number;
  messages: string[];
  lastUpdated: Date;
  error?: string;
}

export function ExecutionStatusPanel() {
  const [executionStatus, setExecutionStatus] = useState<ExecutionStatus>({
    status: "IDLE",
    messages: [],
    lastUpdated: new Date(),
  });

  const getStatusIcon = () => {
    switch (executionStatus.status) {
      case "COMPLETED":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "FAILED":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "RUNNING":
        return <Clock className="w-5 h-5 text-yellow-500 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadgeVariant = () => {
    switch (executionStatus.status) {
      case "COMPLETED":
        return "default";
      case "FAILED":
        return "destructive";
      case "RUNNING":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <Card className="p-4 bg-gradient-to-b from-background to-muted/50">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <h3 className="font-semibold">Execution Status</h3>
          </div>
          <Badge variant={getStatusBadgeVariant()}>
            {executionStatus.status}
          </Badge>
        </div>

        {/* Progress Info */}
        {executionStatus.status === "RUNNING" && executionStatus.totalPhases && (
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm font-medium">
              Phase {executionStatus.currentPhase} / {executionStatus.totalPhases}
            </p>
            <div className="mt-2 w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${((executionStatus.currentPhase || 0) / executionStatus.totalPhases) * 100}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Error Message */}
        {executionStatus.error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 rounded-lg flex gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-xs text-red-700 dark:text-red-300">
              {executionStatus.error}
            </p>
          </div>
        )}

        {/* Messages Log */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground">LOGS</p>
          <div className="bg-black dark:bg-zinc-950 text-green-400 p-3 rounded-md text-xs font-mono max-h-48 overflow-y-auto">
            {executionStatus.messages.length === 0 ? (
              <p className="text-gray-500">Waiting for execution...</p>
            ) : (
              executionStatus.messages.map((msg, idx) => (
                <div key={idx} className="break-all">
                  {msg}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Timestamp */}
        <p className="text-xs text-muted-foreground">
          Last updated: {format(executionStatus.lastUpdated, "HH:mm:ss")}
        </p>
      </div>
    </Card>
  );
}
