"use server"

import { FlowToExcecutionPlan } from "@/lib/workflow/excecutionplan";
import { executeWorkflowPlan } from "@/lib/workflow/executor";
import { WorkflowExcecutionPlan } from "@/types/workflow";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { AppNode } from "@/types/appNode";
import { Edge } from "@xyflow/react";

export async function RunWorkflow(from : {
    workflowId: string,
    flowDefinition: string
}) {
  const {userId} = auth();
  console.log("Running workflow with id", from.workflowId)
    if(!userId){
        throw new Error("Unauthorized")
    }
    const {workflowId, flowDefinition} = from;
    if(!workflowId){
        throw new Error("Workflow ID is required")
    }

    const workflow = await prisma.workflow.findUnique({
        where : {
            userId,
            id : workflowId
        }
    })
    if(!workflow){
        throw new Error("Workflow not found")
    }
    
    if(!flowDefinition){
        throw new Error("Flow definition is required")
    }
    
    const flow = JSON.parse(flowDefinition);
    const nodes: AppNode[] = flow.nodes || [];
    const edges: Edge[] = flow.edges || [];
    
    const result = FlowToExcecutionPlan(nodes, edges);

    if(result.error){
        throw new Error(`Execution plan error: ${result.error.type} - ${result.error.message}`)
    }
    if(!result.excecutionPlan){
        throw new Error("Failed to generate execution plan")
    }

    const excutionPlan: WorkflowExcecutionPlan = result.excecutionPlan;
    console.log("Generated execution plan", excutionPlan)

    // Create workflow execution record
    const execution = await prisma.workflowExecution.create({
        data: {
            workflowId,
            userId,
            status: "RUNNING",
            trigger: "MANUAL",
            logs: JSON.stringify([`Execution started at ${new Date().toISOString()}`]),
            startedAt: new Date()
        }
    });

    try {
        // Execute the workflow plan and get results
        const executionResults = await executeWorkflowPlan(excutionPlan, nodes);
        
        console.log("[RUN_WORKFLOW] Execution complete. Results:", {
            phasesCount: executionResults.phases.length,
            phases: executionResults.phases.map(p => ({
                number: p.number,
                nodeResultsCount: Object.keys(p.results).length,
                nodeIds: Object.keys(p.results)
            }))
        });

        // Store execution phase results in database
        for (const phaseResult of executionResults.phases) {
            // Get all nodes for this phase - find the phase object that matches
            const phaseNode = excutionPlan.find(p => p.phase === phaseResult.number);
            if (!phaseNode) {
                console.log(`[RUN_WORKFLOW] Warning: No phase node found for phase ${phaseResult.number}`);
                continue;
            }

            console.log(`[RUN_WORKFLOW] Processing Phase ${phaseResult.number}, hasNodes=${phaseNode.nodes.length}`);

            // Store results for each node in the phase
            for (const node of phaseNode.nodes) {
                const nodeResult = phaseResult.results[node.id];
                if (!nodeResult) {
                    console.log(`[RUN_WORKFLOW] Warning: No result for node ${node.id}`);
                    continue;
                }

                console.log(`[RUN_WORKFLOW] Saving node ${node.id}:`, {
                    success: nodeResult.success,
                    outputKeys: Object.keys(nodeResult.outputs),
                    outputsJSON: JSON.stringify(nodeResult.outputs).substring(0, 200)
                });

                await prisma.executionPhase.create({
                    data: {
                        executionId: execution.id,
                        number: phaseResult.number,
                        status: nodeResult.success ? "COMPLETED" : "FAILED",
                        nodeId: node.id,
                        nodeData: JSON.stringify(node.data),
                        logs: JSON.stringify(nodeResult.logs),
                        results: JSON.stringify(nodeResult.outputs),
                        error: nodeResult.error || null,
                        startedAt: new Date(),
                        completedAt: new Date()
                    }
                });
                
                console.log(`[RUN_WORKFLOW] ✓ Saved node ${node.id}`);
            }
        }

        // Combine all logs
        const allLogs = [
            `Execution started at ${new Date().toISOString()}`,
            ...executionResults.finalLogs,
            `Execution completed at ${new Date().toISOString()}`
        ];

        // Update execution status to completed
        await prisma.workflowExecution.update({
            where: { id: execution.id },
            data: {
                status: "COMPLETED",
                completedAt: new Date(),
                logs: JSON.stringify(allLogs)
            }
        });

        return {
            success: true,
            executionId: execution.id,
            message: "Workflow executed successfully",
            logs: allLogs
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        
        // Update execution with error status
        await prisma.workflowExecution.update({
            where: { id: execution.id },
            data: {
                status: "FAILED",
                completedAt: new Date(),
                error: errorMessage,
                logs: JSON.stringify([
                    `Execution started at ${new Date().toISOString()}`,
                    errorMessage,
                    `Execution failed at ${new Date().toISOString()}`
                ])
            }
        });

        throw new Error(`Workflow execution failed: ${errorMessage}`)
    }
}