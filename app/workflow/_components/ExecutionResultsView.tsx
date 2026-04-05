"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { format } from "date-fns";

interface ExecutionPhase {
  id: string;
  number: number;
  status: string;
  nodeId: string;
  logs: string[];
  results: Record<string, any>;
  error?: string;
  completedAt?: string | Date;
}

interface ExecutionDetails {
  id: string;
  status: string;
  logs: string[];
  phases: ExecutionPhase[];
  createdAt: string | Date;
  completedAt?: string | Date;
}

export function ExecutionResultsView({ execution }: { execution: ExecutionDetails }) {
  const getStatusIcon = (status: string) => {
    switch (status) {
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

  // Safely convert dates
  const getDate = (date: string | Date | undefined) => {
    if (!date) return null;
    return typeof date === 'string' ? new Date(date) : date;
  };

  const createdDate = getDate(execution.createdAt);
  const completedDate = getDate(execution.completedAt);

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Execution Results</h2>
          <p className="text-sm text-muted-foreground">
            {createdDate && format(createdDate, "PPpp")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon(execution.status)}
          <Badge variant={execution.status === "COMPLETED" ? "default" : "destructive"}>
            {execution.status}
          </Badge>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="phases">Phases</TabsTrigger>
          <TabsTrigger value="logs">Full Logs</TabsTrigger>
        </TabsList>

        {/* Summary Tab */}
        <TabsContent value="summary" className="space-y-4">
          <Card className="p-6">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Phases</p>
                <p className="text-2xl font-bold">{execution.phases.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge>{execution.status}</Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Started</p>
                <p className="text-sm font-mono">{createdDate && format(createdDate, "HH:mm:ss")}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="text-sm font-mono">
                  {completedDate && createdDate
                    ? `${Math.round((completedDate.getTime() - createdDate.getTime()) / 1000)}s`
                    : "Running..."}
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Phases Tab */}
        <TabsContent value="phases" className="space-y-4">
          {execution.phases.map((phase, idx) => (
            <Card key={phase.id} className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold">Phase {phase.number}</h3>
                    <p className="text-sm text-muted-foreground">Node: {phase.nodeId}</p>
                  </div>
                  <Badge variant={phase.status === "COMPLETED" ? "default" : phase.status === "FAILED" ? "destructive" : "secondary"}>
                    {phase.status}
                  </Badge>
                </div>

                {/* Node Outputs */}
                {Object.keys(phase.results).length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold">Outputs:</p>
                    <div className="bg-muted p-4 rounded-md">
                      {Object.entries(phase.results).map(([key, value]) => (
                        <div key={key} className="py-2 border-b last:border-b-0">
                          <p className="text-xs text-muted-foreground font-mono">{key}</p>
                          <p className="text-sm font-mono break-words">
                            {typeof value === "string" && value.length > 100
                              ? `${value.substring(0, 100)}...`
                              : JSON.stringify(value)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Phase Logs */}
                {phase.logs.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold">Logs:</p>
                    <div className="bg-black text-green-400 p-4 rounded-md text-xs font-mono max-h-48 overflow-y-auto">
                      {phase.logs.map((log, logIdx) => (
                        <div key={logIdx}>{log}</div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Error */}
                {phase.error && (
                  <div className="bg-red-900/20 border border-red-500/50 p-4 rounded-md">
                    <p className="text-sm text-red-500 font-mono">{phase.error}</p>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </TabsContent>

        {/* Full Logs Tab */}
        <TabsContent value="logs">
          <Card className="p-6">
            <div className="bg-black text-green-400 p-4 rounded-md text-sm font-mono max-h-96 overflow-y-auto">
              {execution.logs.map((log, idx) => (
                <div key={idx}>{log}</div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
