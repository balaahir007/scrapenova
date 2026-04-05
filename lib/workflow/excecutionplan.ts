import { AppNode, AppNodeMissingInputs } from "@/types/appNode";
import { WorkflowExcecutionPlan, WorkflowExceutionPlanPhase } from "@/types/workflow";
import { Edge, getIncomers } from "@xyflow/react";
import { TaskRegistry } from "./task/registery";

export enum FlowToExcecutionPlanErrorType {
    'NO_ENTRY_POINT' = 'NO_ENTRY_POINT',
    'INVALID_INPUTS' = 'INVALID_INPUTS'
}

type FlowToExcecutionPlan = {
    excecutionPlan?: WorkflowExcecutionPlan;
    error?: {
        type: FlowToExcecutionPlanErrorType;
        message: string;
        invalidElements?: AppNodeMissingInputs[];
    }
}

export function FlowToExcecutionPlan(nodes: AppNode[], edges: Edge[]): FlowToExcecutionPlan {
    const entrypoints = nodes.find(node => TaskRegistry[node.data.type]?.isEntryPoint);

    if (!entrypoints) {
        return {
            error: {
                type: FlowToExcecutionPlanErrorType.NO_ENTRY_POINT,
                message: "No entry point found. Please add a Launch Browser node."
            }
        }
    }
    if (Object.keys(entrypoints.data.inputs).length === 0) {
        return {
            error: {
                type: FlowToExcecutionPlanErrorType.INVALID_INPUTS,
                message: "Entry point has no inputs configured."
            }
        }
    }
    const excecutionPlan: WorkflowExcecutionPlan = [{
        phase: 1,
        nodes: [entrypoints]
    }]
    const inputsWithErrors: AppNodeMissingInputs[] = [];
    const planned = new Set<string>();

    const invalidInputs = getInvalidInputs(entrypoints, edges, planned);
    if (invalidInputs.length > 0) {
        inputsWithErrors.push({
            nodeId: entrypoints.id,
            inputs: invalidInputs
        })
    }
    planned.add(entrypoints.id);

    for (let phase = 2; phase <= nodes.length && planned.size < nodes.length; phase++) {
        const nextPhase: WorkflowExceutionPlanPhase = {
            phase,
            nodes: []
        }
        for (const currentNode of nodes) {
            // if the node is already planned, skip
            if (planned.has(currentNode.id)) continue;
            const invalidInputs = getInvalidInputs(currentNode, edges, planned);
            if (invalidInputs.length > 0) {
                const incomers = getIncomers(currentNode, nodes, edges);
                if (incomers.every(node => planned.has(node.id))) {
                    // all incomers are planned, but some inputs are invalid, this means that the node will fail during execution, we can choose to either skip it or include it in the plan with a warning. For now, we will include it in the plan.
                    console.error("invalid inputs for node ", currentNode.id, invalidInputs);
                    inputsWithErrors.push({
                        nodeId: currentNode.id,
                        inputs: invalidInputs
                    })
                } else {
                    continue;
                }
            }
            nextPhase.nodes.push(currentNode);

        }
        for (const node of nextPhase.nodes) {
            planned.add(node.id);
        }
        excecutionPlan.push(nextPhase);

    }

    if (inputsWithErrors.length > 0) {
        return {
            error: {
                type: FlowToExcecutionPlanErrorType.INVALID_INPUTS,
                message: `Found ${inputsWithErrors.length} node(s) with missing required inputs.`,
                invalidElements: inputsWithErrors
            }
        }
    }
    return { excecutionPlan }
}

function getInvalidInputs(node: AppNode, edges: Edge[], planned: Set<string>) {
    const invalidInputs = [];
    const inputs = TaskRegistry[node.data.type]?.inputs || [];
    for (const input of inputs) {
        const inputValue = node.data.inputs[input.name];
        const inputValueProvided = inputValue?.length > 0;
        if (inputValueProvided) continue; // if the input value is provided, we consider it valid, even if it is invalid, the node will fail during execution, but we want to include it in the plan.
        const incommingEdges = edges.filter((edge) => edge.target === node.id)
        const inputLinkedToOutput = incommingEdges.find(edge => edge.targetHandle === input.name);

        const requiredInputProvidedByVisitedOutput = input.required && inputLinkedToOutput && planned.has(inputLinkedToOutput.source);

        if (requiredInputProvidedByVisitedOutput) {
            continue;
        } else if (!input.required) {
            if (!inputLinkedToOutput) {
                // input is not required and not linked to any output, we can skip it
                continue;
            }
            if (inputLinkedToOutput && planned.has(inputLinkedToOutput.source)) {
                // input is not required but linked to a planned output, we can include it
                continue;
            }

        }
        invalidInputs.push(input.name);
    }
    return invalidInputs;
}