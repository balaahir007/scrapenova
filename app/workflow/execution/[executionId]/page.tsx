import React, { Suspense } from "react";
import { notFound } from "next/navigation";
import { GetExecutionResults } from "@/actions/workflows/getExecutionResults";
import { ExecutionResultsView } from "../../_components/ExecutionResultsView";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface PageProps {
  params: {
    executionId: string;
  };
}

export default function ExecutionResultPage({ params }: PageProps) {
  return (
    <div className="flex-1 flex flex-col h-full bg-background">
      {/* Header with navigation */}
      <div className="border-b border-border p-4 bg-card">
        <div className="flex items-center gap-2 mb-4">
          <Link 
            href="/workflows"
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Workflows
          </Link>
        </div>
        <h1 className="text-3xl font-bold">Execution Results</h1>
        <p className="text-sm text-muted-foreground mt-1">ID: {params.executionId}</p>
      </div>

      {/* Results content */}
      <div className="flex-1 overflow-auto p-6">
        <Suspense fallback={<ExecutionResultsSkeleton />}>
          <ExecutionResultsContent executionId={params.executionId} />
        </Suspense>
      </div>
    </div>
  );
}

async function ExecutionResultsContent({ executionId }: { executionId: string }) {
  try {
    const execution = await GetExecutionResults(executionId);
    if (!execution || !execution.id) {
      console.error("Execution not found or invalid:", executionId);
      notFound();
    }
    return <ExecutionResultsView execution={execution} />;
  } catch (error) {
    console.error("Error fetching execution results:", error);
    notFound();
  }
}

function ExecutionResultsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-96 w-full" />
      <Skeleton className="h-48 w-full" />
    </div>
  );
}
