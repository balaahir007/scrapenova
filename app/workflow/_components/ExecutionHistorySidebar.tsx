"use client";

import React, { useEffect, useState } from "react";
import { GetWorkflowExecutions } from "@/actions/workflows/getExecutionResults";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { CheckCircle, XCircle, Clock, ChevronRight, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface WorkflowExecutionListProps {
  workflowId: string;
}

export default function ExecutionHistorySidebar({ workflowId }: WorkflowExecutionListProps) {
  const [executions, setExecutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchExecutions() {
      try {
        setLoading(true);
        const result = await GetWorkflowExecutions(workflowId);
        setExecutions(result);
        setError(null);
      } catch (err) {
        setError("Failed to load executions");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchExecutions();
    // Refresh every 10 seconds
    const interval = setInterval(fetchExecutions, 10000);
    return () => clearInterval(interval);
  }, [workflowId]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "FAILED":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "RUNNING":
        return <Clock className="w-4 h-4 text-yellow-500 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="w-80 border-l border-border bg-card flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold">Execution Results</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Click any execution to view detailed results
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="p-4 text-sm text-destructive">{error}</div>
        ) : executions.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground text-center">
            <p>No executions yet.</p>
            <p className="mt-2">Click Execute to run this workflow.</p>
          </div>
        ) : (
          <div className="space-y-2 p-3">
            {executions.map((exec, idx) => (
              <Link
                key={exec.id}
                href={`/workflow/execution/${exec.id}`}
                className={cn(
                  "block p-3 rounded-lg border transition-all duration-200",
                  "hover:bg-muted hover:border-primary",
                  "cursor-pointer group"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    {getStatusIcon(exec.status)}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium">
                        Execution {executions.length - idx}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {format(new Date(exec.createdAt), "MMM d, HH:mm:ss")}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform opacity-0 group-hover:opacity-100" />
                </div>
                <div className="mt-2 flex gap-1">
                  <Badge
                    variant={exec.status === "COMPLETED" ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {exec.status}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {exec.phases?.length || 0} phases
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-border bg-muted/50 text-xs text-muted-foreground">
        <p>💡 Click any result above to view:</p>
        <ul className="mt-2 space-y-1 ml-2">
          <li>✓ Execution summary</li>
          <li>✓ Node outputs</li>
          <li>✓ Full logs</li>
        </ul>
      </div>
    </div>
  );
}
