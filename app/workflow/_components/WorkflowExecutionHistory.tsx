"use client";

import React, { useEffect, useState } from "react";
import { GetWorkflowExecutions } from "@/actions/workflows/getExecutionResults";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { CheckCircle, XCircle, Clock, Eye } from "lucide-react";
import { format } from "date-fns";

interface WorkflowExecutionListProps {
  workflowId: string;
}

export function WorkflowExecutionHistory({ workflowId }: WorkflowExecutionListProps) {
  const [executions, setExecutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchExecutions() {
      try {
        const result = await GetWorkflowExecutions(workflowId);
        setExecutions(result);
      } catch (error) {
        console.error("Failed to fetch executions:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchExecutions();
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

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading executions...</div>;
  }

  if (executions.length === 0) {
    return <div className="text-sm text-muted-foreground">No executions yet</div>;
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold">Recent Executions:</p>
      <div className="space-y-1 max-h-64 overflow-y-auto">
        {executions.slice(0, 5).map((exec) => (
          <Link
            key={exec.id}
            href={`/workflow/execution/${exec.id}`}
            className="flex items-center gap-2 p-2 rounded-md hover:bg-muted transition-colors"
          >
            {getStatusIcon(exec.status)}
            <div className="flex-1 min-w-0">
              <div className="text-xs text-muted-foreground">
                {format(new Date(exec.createdAt), "MMM d, HH:mm")}
              </div>
            </div>
            <Badge variant="outline" className="text-xs">
              {exec.status}
            </Badge>
            <Eye className="w-3 h-3 text-muted-foreground" />
          </Link>
        ))}
      </div>
    </div>
  );
}
