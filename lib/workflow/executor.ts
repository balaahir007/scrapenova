import { AppNode } from "@/types/appNode";
import { WorkflowExcecutionPlan, WorkflowExceutionPlanPhase } from "@/types/workflow";
import { Tasktype } from "@/types/task";
import { TaskRegistry } from "./task/registery";

export type ExecutionResult = {
    success: boolean;
    outputs: Record<string, any>;
    logs: string[];
    error?: string;
};

// Simulated execution - in production, this would call real APIs/services
export async function executeTask(
    nodeType: Tasktype,
    inputs: Record<string, any>,
    nodeId: string
): Promise<ExecutionResult> {
    const logs: string[] = [];
    logs.push(`[${new Date().toISOString()}] Starting execution of ${nodeType}`);

    try {
        const outputs: Record<string, any> = {};

        // Simulate different task executions
        if (nodeType === Tasktype.LAUNCH_BROWSER) {
            logs.push(`Launching browser with URL: ${inputs["Website Url"]}`);
            await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
            outputs["Web page"] = {
                type: "BROWSER_INSTANCE",
                id: `browser-${Date.now()}`,
                url: inputs["Website Url"],
                timestamp: new Date().toISOString()
            };
            logs.push("Browser launched successfully");
        } 
        else if (nodeType === Tasktype.PAGE_TO_HTML) {
            logs.push("Fetching HTML from page...");
            await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API call
            
            // Simulate fetching HTML content
            const sampleHtml = `
                <html>
                    <head><title>Sample Page</title></head>
                    <body>
                        <h1>Hello World</h1>
                        <p class="content">This is sample extracted content from the webpage</p>
                        <div class="data">Product: Laptop, Price: $999</div>
                    </body>
                </html>
            `;
            
            outputs["Html"] = sampleHtml;
            outputs["Web page"] = inputs["Web page"]; // Pass through browser instance
            logs.push("HTML extracted successfully");
        } 
        else if (nodeType === Tasktype.EXTRACT_TEXT_FROM_ELEMENT) {
            logs.push(`Extracting text using selector: ${inputs["Selector"]}`);
            await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API call
            
            // Simulate text extraction
            const extractedText = "Product: Laptop, Price: $999";
            outputs["Extracted Text"] = extractedText;
            logs.push("Text extracted successfully");
        }

        logs.push(`[${new Date().toISOString()}] Execution completed successfully`);
        return {
            success: true,
            outputs,
            logs
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        logs.push(`[ERROR] ${errorMessage}`);
        return {
            success: false,
            outputs: {},
            logs,
            error: errorMessage
        };
    }
}

export async function executeWorkflowPlan(
    plan: WorkflowExcecutionPlan,
    nodes: AppNode[]
): Promise<{
    phases: Array<{
        number: number;
        results: Record<string, ExecutionResult>;
        logs: string[];
    }>;
    finalLogs: string[];
}> {
    const finalLogs: string[] = [];
    const phaseResults: Array<{
        number: number;
        results: Record<string, ExecutionResult>;
        logs: string[];
    }> = [];

    // Store outputs from previous phases to pass as inputs to next phase
    const contextData: Record<string, Record<string, any>> = {};

    for (const phase of plan) {
        finalLogs.push(`\n--- Phase ${phase.phase} ---`);
        const phaseLogs: string[] = [];
        const phaseNodeResults: Record<string, ExecutionResult> = {};

        for (const node of phase.nodes) {
            phaseLogs.push(`Executing node: ${node.data.type} (${node.id})`);

            // Build inputs for this node from previous phase outputs
            const nodeInputs = { ...node.data.inputs };
            
            // Find connected inputs from previous nodes
            for (const [inputKey, inputValue] of Object.entries(nodeInputs)) {
                if (!inputValue && contextData[node.id]?.[inputKey]) {
                    nodeInputs[inputKey] = contextData[node.id][inputKey];
                }
            }

            // Execute the task
            const result = await executeTask(node.data.type, nodeInputs, node.id);
            phaseNodeResults[node.id] = result;
            
            // Store outputs for next phase
            if (result.success) {
                contextData[node.id] = result.outputs;
            }

            phaseLogs.push(...result.logs);

            if (!result.success) {
                phaseLogs.push(`⚠️ Node ${node.id} failed: ${result.error}`);
            }
        }

        phaseResults.push({
            number: phase.phase,
            results: phaseNodeResults,
            logs: phaseLogs
        });

        finalLogs.push(...phaseLogs);
    }

    return {
        phases: phaseResults,
        finalLogs
    };
}
