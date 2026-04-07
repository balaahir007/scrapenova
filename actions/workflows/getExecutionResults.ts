"use server"

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GetExecutionResults(executionId: string) {
    const { userId } = auth();
    
    if (!userId) {
        throw new Error("Unauthorized");
    }

    // Get the execution with all related phases
    const execution = await prisma.workflowExecution.findFirst({
        where: {
            id: executionId,
            userId
        },
        include: {
            phases: {
                orderBy: {
                    number: 'asc'
                }
            },
            workflow: true
        }
    });

    if (!execution) {
        console.error("Execution not found:", executionId, "for user:", userId);
        throw new Error("Execution not found");
    }

    console.log("[GET_RESULTS] Raw execution from DB:", {
        id: execution.id,
        status: execution.status,
        phasesCount: execution.phases.length,
        phases: execution.phases.map(p => ({
            id: p.id,
            number: p.number,
            nodeId: p.nodeId,
            resultsRaw: p.results,
            resultsParsed: p.results ? Object.keys(JSON.parse(p.results)).length : 0
        }))
    });

    // Parse the stored JSON strings and convert dates
    const result = {
        ...execution,
        createdAt: execution.createdAt.toISOString(),
        updatedAt: execution.updatedAt.toISOString(),
        startedAt: execution.startedAt?.toISOString() || null,
        completedAt: execution.completedAt?.toISOString() || null,
        logs: JSON.parse(execution.logs || "[]"),
        phases: execution.phases.map(phase => ({
            ...phase,
            createdAt: phase.createdAt.toISOString(),
            updatedAt: phase.updatedAt.toISOString(),
            startedAt: phase.startedAt?.toISOString() || null,
            completedAt: phase.completedAt?.toISOString() || null,
            logs: JSON.parse(phase.logs || "[]"),
            results: JSON.parse(phase.results || "{}")
        }))
    };

    console.log("[GET_RESULTS] Parsed results:", {
        phasesCount: result.phases.length,
        totalResults: result.phases.reduce((sum, p) => sum + Object.keys(p.results).length, 0)
    });

    return result;
}

export async function GetWorkflowExecutions(workflowId: string) {
    const { userId } = auth();
    
    if (!userId) {
        throw new Error("Unauthorized");
    }

    const executions = await prisma.workflowExecution.findMany({
        where: {
            workflowId,
            userId
        },
        include: {
            phases: {
                select: {
                    id: true,
                    number: true,
                    status: true,
                    nodeId: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        },
        take: 50
    });

    return executions.map(exec => ({
        ...exec,
        logs: JSON.parse(exec.logs || "[]")
    }));
}
