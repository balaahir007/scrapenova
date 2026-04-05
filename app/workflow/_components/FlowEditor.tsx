"use client";

import { Workflow } from "@prisma/client";
import { CreateFlowNode } from "@/lib/workflow/createFlowNode";
import { Tasktype } from "@/types/task";
import {
  addEdge,
  Background,
  BackgroundVariant,
  Connection,
  Controls,
  Edge,
  getOutgoers,
  ReactFlow,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import NodeComponent from "./nodes/NodeComponent";
import { useCallback, useEffect } from "react";
import { AppNode } from "@/types/appNode";
import DeletetableEdge from "./edges/DeletetableEdge";
import { toast } from "sonner";
import { TaskRegistry } from "@/lib/workflow/task/registery";

const nodeTypes = {
  ScrapeNovaNode: NodeComponent,
  
};

const EdgeTypes = {
  default: DeletetableEdge,
};

const snapGrid: [number, number] = [50, 50];

function FlowEditor({ workflow }: { workflow: Workflow }) {
  const [nodes, setNodes, onNodesChange] = useNodesState<AppNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const { setViewport, screenToFlowPosition, updateNodeData } = useReactFlow();
  useEffect(() => {
    try {
      const flow = JSON.parse(workflow.definition);
      if (!flow) return;
      setNodes(flow.nodes || []);
      setEdges(flow.edges || []);

      if (!flow.viewport) return;
      const { x = 0, y = 0, zoom = 1 } = flow.viewport;
      setViewport({
        x,
        y,
        zoom,
      });
    } catch (error) {}
  }, [workflow.definition, setEdges, setNodes, setViewport]);

  const fitViewOptions = { padding: 1 };

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const taskType = event.dataTransfer.getData(
        "application/reactflow",
      ) as Tasktype;

      if (typeof taskType === undefined || !taskType) return;

      const flowPostion = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const newNode = CreateFlowNode(taskType as Tasktype, flowPostion);

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, setNodes],
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge({ ...connection, animated: true }, eds));

      if (!connection.targetHandle) return;
      const node = nodes.find((nd) => nd.id === connection.target);
      if (!node) return;
      const nodeInputs = node.data.inputs;

      updateNodeData(node.id, {
        inputs: {
          ...nodeInputs,
          [connection.targetHandle]: "",
        },
      });
      console.log("@updated Node : ", node.id);
    },
    [setEdges, updateNodeData, nodes],
  );
  const isValidConnection = useCallback((connection: Edge | Connection) => {
    // No Self Connection allowed
    if(connection.source === connection.target) {
      toast.error("Cannot connect a node to itself");
      return false;
    }
    
    // Find the source and target nodes
    const sourceNode = nodes.find((node) => node.id === connection.source);
    const targetNode = nodes.find((node) => node.id === connection.target);
    
    if(!sourceNode || !targetNode){
      toast.error("Invalid connection: nodes not found");
      return false;
    }
    
    // sourceHandle and targetHandle are automatically provided by React Flow's Connection object
    // sourceHandle = the ID of the handle on the source node where the connection starts
    // targetHandle = the ID of the handle on the target node where the connection ends
    
    // Look up the task types from the registry
    const sourceTaskType = TaskRegistry[sourceNode.data.type as keyof typeof TaskRegistry];
    const targetTaskType = TaskRegistry[targetNode.data.type as keyof typeof TaskRegistry];
    
    if(!sourceTaskType || !targetTaskType) {
      toast.error("Invalid task type in connection");
      return false;
    }
    
    // Use targetHandle to find the input on the target node (where the connection lands)
    const input = targetTaskType.inputs.find((i) => i.name === connection.targetHandle);
    
    // Use sourceHandle to find the output on the source node (where the connection comes from)
    const output = sourceTaskType.outputs.find((o) => o.name === connection.sourceHandle);
    
    
    // Validate that the connection targets a valid input
    if (!input) {
      toast.error(`Invalid connection: "${connection.targetHandle}" is not a valid input for ${targetNode.data.type}`);
      return false;
    }
    
    // Validate that the connection comes from a valid output
    if (!output) {
      toast.error(`Invalid connection: "${connection.sourceHandle}" is not a valid output for ${sourceNode.data.type}`);
      return false;
    }
    
    // Check if the input and output types match
    if (input.type !== output.type) {
      toast.error(`Type mismatch: cannot connect ${output.type} to ${input.type}`);
      return false;
    }
    const hasCycle = (node : AppNode,visited = new Set())=>{
      if(visited.has(node.id)) return true;
      visited.add(node.id);

      for (const outoger of getOutgoers(node,nodes,edges)){
        if(outoger.id === connection.source) return true;
        if(hasCycle(outoger,visited)) return true;
      }

    } 
    const detectedCycle = hasCycle(targetNode);
    return !detectedCycle;
  }, [nodes, edges]);
  return (
    <main className="h-full w-full ">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={EdgeTypes}
        onNodesChange={onNodesChange}
        snapGrid={snapGrid}
        snapToGrid
        fitViewOptions={fitViewOptions}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onConnect={onConnect}
        isValidConnection={isValidConnection}
      >
        <Controls position="top-left" fitViewOptions={fitViewOptions} />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </main>
  );
}

export default FlowEditor;

