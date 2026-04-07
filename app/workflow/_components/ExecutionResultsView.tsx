"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle, Clock, ChevronDown, Copy, Download } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

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

// Component to render output values with proper formatting
function OutputValue({ value }: { value: any }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const isLarge = typeof value === 'string' && value.length > 500;
  const isHtml = typeof value === 'string' && (value.includes('<') || value.includes('>'));
  const displayValue = isLarge ? (expanded ? value : `${value.substring(0, 200)}...`) : value;

  const handleCopy = () => {
    navigator.clipboard.writeText(typeof value === 'string' ? value : JSON.stringify(value, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const content = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', `result-${Date.now()}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-2">
      {isHtml && (
        <div className="text-xs text-blue-500 font-semibold">HTML Content</div>
      )}
      <div className="bg-muted p-3 rounded-md font-mono text-sm break-words relative">
        <div className="whitespace-pre-wrap">
          {typeof displayValue === 'object' ? JSON.stringify(displayValue, null, 2) : displayValue}
        </div>
        <div className="absolute top-2 right-2 flex gap-1">
          {isLarge && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="h-6 w-6 p-0"
              title={expanded ? "Collapse" : "Expand"}
            >
              <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-6 w-6 p-0"
            title="Copy to clipboard"
          >
            <Copy className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            className="h-6 w-6 p-0"
            title="Download"
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>
      {isLarge && (
        <p className="text-xs text-muted-foreground">
          {expanded ? 'Showing all content' : `Showing preview (${displayValue.length} / ${value.length} characters)`}
        </p>
      )}
    </div>
  );
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

  // Count total extracted outputs - handle both direct results and nested structure
  const totalOutputs = execution.phases.reduce((sum, phase) => {
    if (typeof phase.results === 'object' && phase.results !== null) {
      return sum + Object.keys(phase.results).length;
    }
    return sum;
  }, 0);
  
  // Debug log
  console.log("Execution data:", { execution, totalOutputs, phases: execution.phases });

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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="phases">Results</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
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
                <p className="text-sm text-muted-foreground">Outputs Retrieved</p>
                <p className="text-2xl font-bold">{totalOutputs}</p>
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

        {/* Phases/Results Tab */}
        <TabsContent value="phases" className="space-y-4">
          {execution.phases.length === 0 ? (
            <Card className="p-6 text-center text-muted-foreground">
              No execution phases found
            </Card>
          ) : (
            execution.phases.map((phase, idx) => (
              <Card key={phase.id} className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-lg">Phase {phase.number}</h3>
                      <p className="text-sm text-muted-foreground">Node: {phase.nodeId}</p>
                    </div>
                    <Badge variant={phase.status === "COMPLETED" ? "default" : phase.status === "FAILED" ? "destructive" : "secondary"}>
                      {phase.status}
                    </Badge>
                  </div>

                  {/* Node Outputs - Main Results */}
                  {Object.keys(phase.results).length > 0 ? (
                    <div className="space-y-4">
                      <p className="text-sm font-semibold border-b pb-2">📊 Extracted Data:</p>
                      {Object.entries(phase.results).map(([key, value]) => (
                        <div key={key} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-foreground">{key}</p>
                            {typeof value === 'string' && (
                              <span className="text-xs bg-muted px-2 py-1 rounded">
                                {value.length} chars
                              </span>
                            )}
                          </div>
                          <OutputValue value={value} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-muted p-4 rounded-md text-center text-sm text-muted-foreground">
                      No output data for this phase
                    </div>
                  )}

                  {/* Phase Logs */}
                  {phase.logs.length > 0 && (
                    <div className="space-y-2 pt-4 border-t">
                      <p className="text-sm font-semibold">📝 Execution Logs:</p>
                      <div className="bg-black text-green-400 p-4 rounded-md text-xs font-mono max-h-48 overflow-y-auto">
                        {phase.logs.map((log, logIdx) => (
                          <div key={logIdx} className="whitespace-pre-wrap">{log}</div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Error */}
                  {phase.error && (
                    <div className="bg-red-900/20 border border-red-500/50 p-4 rounded-md">
                      <p className="text-sm text-red-600 font-mono">❌ Error: {phase.error}</p>
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Full Logs Tab */}
        <TabsContent value="logs">
          <Card className="p-6">
            <div className="bg-black text-green-400 p-4 rounded-md text-sm font-mono max-h-96 overflow-y-auto whitespace-pre-wrap">
              {execution.logs.length > 0 ? (
                execution.logs.map((log, idx) => <div key={idx}>{log}</div>)
              ) : (
                <p className="text-gray-500">No logs available</p>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* Export Tab */}
        <TabsContent value="export">
          <Card className="p-6 space-y-4">
            <div>
              <h3 className="font-semibold mb-4">Export Execution Results</h3>
              <div className="space-y-2">
                <Button
                  onClick={() => {
                    const data = JSON.stringify(execution, null, 2);
                    const element = document.createElement('a');
                    element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(data));
                    element.setAttribute('download', `execution-${execution.id}.json`);
                    element.style.display = 'none';
                    document.body.appendChild(element);
                    element.click();
                    document.body.removeChild(element);
                  }}
                  className="w-full"
                >
                  Download as JSON
                </Button>
                <Button
                  onClick={() => {
                    let csv = "Phase,NodeId,Status,OutputKey,OutputValue\n";
                    execution.phases.forEach(phase => {
                      Object.entries(phase.results).forEach(([key, value]) => {
                        const valueStr = typeof value === 'string' ? value.replace(/"/g, '""') : JSON.stringify(value);
                        csv += `${phase.number},${phase.nodeId},${phase.status},"${key}","${valueStr}"\n`;
                      });
                    });
                    const element = document.createElement('a');
                    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
                    element.setAttribute('download', `execution-${execution.id}.csv`);
                    element.style.display = 'none';
                    document.body.appendChild(element);
                    element.click();
                    document.body.removeChild(element);
                  }}
                  className="w-full"
                >
                  Download as CSV
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
