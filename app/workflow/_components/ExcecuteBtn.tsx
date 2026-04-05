"use client";

import useExcecutionPlan from "@/components/hooks/useExcecutionPlan";
import { cn } from "@/lib/utils";
import { LoaderIcon, PlayIcon } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import {RunWorkflow} from "@/actions/workflows/runWorkFlow";
import { useReactFlow } from "@xyflow/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

function ExcecuteBtn({ workflowId }: { workflowId: string }) {
  const generate = useExcecutionPlan();
  const router = useRouter();
  
  const {toObject} = useReactFlow()
  const mutation = useMutation({
    mutationFn: RunWorkflow,
    onSuccess: (data) => {
      toast.success(data.message || "Workflow executed successfully");
      console.log("Workflow executed:", data);
      
      // Navigate to execution results page
      setTimeout(() => {
        router.push(`/workflow/execution/${data.executionId}`);
      }, 500);
    },
    onError: (error: any) => {
      const errorMessage = error?.message || "Failed to execute workflow";
      toast.error(errorMessage);
      console.error("Workflow execution failed:", error);
    }
  });

  const handleClick = async () => {
    const plan = generate();
    
    if (!plan) {
      toast.error("Failed to generate execution plan");
      return;
    }

    try {
      mutation.mutate({ workflowId, flowDefinition: JSON.stringify(toObject()) });
    } catch (error: any) {
      toast.error(error?.message || "An error occurred");
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={mutation.isPending}
      className={cn(
        "inline-flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-semibold",
        "transition-all duration-150 active:scale-[0.97]",
        "disabled:cursor-not-allowed disabled:opacity-60",
        "btn-primary"
      )}
    >
      {mutation.isPending ? (
        <>
          <LoaderIcon size={14} className="animate-spin" />
          Running…
        </>
      ) : (
        <>
          <PlayIcon size={14} className="fill-current stroke-none" />
          Execute
        </>
      )}
    </button>
  );
}

export default ExcecuteBtn;