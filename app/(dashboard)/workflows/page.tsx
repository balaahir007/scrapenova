// [ScrapeNova theme applied] — page.tsx
import { GetWorkFLowsForUser } from "@/actions/workflows/getWorkflowsUser";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, InboxIcon } from "lucide-react";
import React, { Suspense } from "react";
import CreateWorkflowDialog from "./_components/CreateWorkflowDialog";
import WorkflowCard from "./_components/WorkflowCard";

function Page() {
  return (
    <div className="flex-1 flex flex-col h-full ">
      <div className="flex justify-between">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold">Workflows</h1>
          <p className="text-muted-foreground">Manage your workflows</p>
        </div>
        <CreateWorkflowDialog/>
      </div>

      <div className="h-full py-6">
        <Suspense fallback={<UserWorkflowsSkeleton />}>
          <UserWorkflows />
        </Suspense>
      </div>
    </div>
  );
}

function UserWorkflowsSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-32 w-full" />
      ))}
    </div>
  );
}

async function UserWorkflows() {
  const workflows = await GetWorkFLowsForUser();
  
  if (!workflows) {
    return (
      <Alert variant={"destructive"}>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Something went wrong, Please try again later
        </AlertDescription>
      </Alert>
    );
  }

  // Fixed: Changed != to === and added return statement
  if (workflows.length === 0) {
    return (
      <div className="flex flex-col gap-4 h-full items-center justify-center">
        <div className="rounded-full bg-cyan-100 dark:bg-cyan-900/30 w-20 h-20 flex items-center justify-center">
          <InboxIcon size={40} className="icon-active" />
        </div>
        <div className="flex flex-col gap-1 text-center">
          <p className="font-bold">No workflow created yet</p>
          <p className="text-sm text-muted-foreground">
            Click the button to create your first workflow
          </p>
        </div>
        <CreateWorkflowDialog triggerText="Create your first workflow" />
      </div>
    );
  }

  // Display workflows when they exist
  return (
    <div className="grid grid-cols-1 gap-4">
      {workflows.map((workflow) => (
        <WorkflowCard workflow={workflow} key={workflow.id} />
      ))}
    </div>
  );
}

export default Page;
