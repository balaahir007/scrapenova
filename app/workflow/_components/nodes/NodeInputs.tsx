import { cn } from "@/lib/utils";
import { TaskParam } from "@/types/task";
import { Handle, Position, useEdges } from "@xyflow/react";
import React, { ReactNode } from "react";
import NodeParamField from "./NodeParamField";
import { ColorForHandle } from "./Common";
import useFlowValidation from "@/components/hooks/useFlowValidation";

export function NodeInputs({ children }: { children: ReactNode }) {
  return <div className="flex flex-col divide-y gap-2">{children}</div>;
}

export function NodeInput({ input, nodeId }: { input: TaskParam, nodeId : string }) {
  const edges = useEdges()

  const  isConnected = edges.some(edg => edg.targetHandle === input.name && edg.target === nodeId)

  const {invalidInputs} = useFlowValidation();
  const hasError = invalidInputs.find((node)=> node.nodeId === nodeId)?.inputs.find((invalidInput) => invalidInput === input.name)
  return (
    <div className={cn("flex items-center gap-2 relative", hasError && "text-destructive",hasError && "bg-destructive/30")}>
      <NodeParamField param={input} nodeId={nodeId} disabled={isConnected} />
      {!input.hideHandle && (
        <Handle
          id={input.name}
          isConnectable={!isConnected}
          type="target"
          position={Position.Left}
          className={cn(
            "!bg-muted-foreground !border-2 !border-background !left-0 !w-4 !h-4 ",ColorForHandle[input.type]
          )}
        />
      )}
      
    </div>
  );
}
