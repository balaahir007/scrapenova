import { AppNode } from "@/types/appNode";
import { WorkflowExcecutionPlan, WorkflowExceutionPlanPhase } from "@/types/workflow";
import { Tasktype } from "@/types/task";
import { TaskRegistry } from "./task/registery";
import { fetchHtmlContent, extractTextFromHtml, scrapeUrlWithFirecrawl } from "./scrapeHelper";

function extractTitleFromHtml(html: string): string {
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    return titleMatch ? titleMatch[1].trim() : 'Untitled Page';
}

export type ExecutionResult = {
    success: boolean;
    outputs: Record<string, any>;
    logs: string[];
    error?: string;
};

// Scraping execution with real packages
export async function executeTask(
    nodeType: Tasktype,
    inputs: Record<string, any>,
    nodeId: string
): Promise<ExecutionResult> {
    const logs: string[] = [];
    logs.push(`[${new Date().toISOString()}] Starting execution of ${nodeType}`);
    console.log(`[EXECUTOR] executeTask START: type=${nodeType}, nodeId=${nodeId}`);

    try {
        const outputs: Record<string, any> = {};

        // Execute different task types
        if (nodeType === Tasktype.LAUNCH_BROWSER) {
            const url = inputs["Website Url"];
            logs.push(`Creating Firecrawl page context for URL: ${url}`);

            outputs["Web page"] = {
                type: "BROWSER_INSTANCE",
                id: `firecrawl-${Date.now()}`,
                url,
                timestamp: new Date().toISOString()
            };
            logs.push("Firecrawl page context created successfully");
        } 
        else if (nodeType === Tasktype.PAGE_TO_HTML) {
            logs.push("Fetching HTML from page using Firecrawl...");

            try {
                const webPage = inputs["Web page"];
                const url = webPage?.url || inputs["Website Url"];
                const result = await scrapeUrlWithFirecrawl(url);

                outputs["Html"] = result.html;
                outputs["Markdown"] = result.markdown;
                outputs["Web page"] = {
                    type: "BROWSER_INSTANCE",
                    id: webPage?.id || `firecrawl-${Date.now()}`,
                    url,
                    timestamp: new Date().toISOString()
                };
                outputs["Title"] = result.title;
                outputs["Metadata"] = result.metadata;

                logs.push(`HTML fetched via Firecrawl from ${url} (${result.html.length} bytes)`);
                if (result.markdown) {
                    logs.push(`Markdown extracted via Firecrawl (${result.markdown.length} chars)`);
                }
            } catch (error) {
                const errorMsg = error instanceof Error ? error.message : 'Unknown error';
                logs.push(`Error fetching HTML: ${errorMsg}`);
                throw error;
            }
        } 
        else if (nodeType === Tasktype.EXTRACT_TEXT_FROM_ELEMENT) {
            logs.push(`Extracting text using selector: ${inputs["Selector"]}`);
            
            try {
                const html = inputs["Html"];
                
                if (!html) {
                    throw new Error("HTML content not available - please ensure PAGE_TO_HTML is executed first");
                }
                
                const selector = inputs["Selector"] || "body";
                logs.push(`Using selector: "${selector}"`);
                
                // Use the helper function to extract text
                const extractedText = await extractTextFromHtml(html, selector);
                
                if (!extractedText) {
                    logs.push(`⚠️ Warning: No text found for selector "${selector}"`);
                    outputs["Extracted Text"] = "No content found for selector";
                } else {
                    outputs["Extracted Text"] = extractedText;
                    logs.push(`✓ Text extracted successfully (${extractedText.length} characters)`);
                    
                    // Show preview
                    const preview = extractedText.substring(0, 150).replace(/\n/g, ' ');
                    logs.push(`Preview: ${preview}${extractedText.length > 150 ? '...' : ''}`);
                }
            } catch (error) {
                const errorMsg = error instanceof Error ? error.message : 'Unknown error';
                logs.push(`Error extracting text: ${errorMsg}`);
                throw error;
            }
        }

        logs.push(`[${new Date().toISOString()}] Execution completed successfully`);
        console.log(`[EXECUTOR] executeTask SUCCESS: outputs keys=${Object.keys(outputs).join(',')}`);
        return {
            success: true,
            outputs,
            logs
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        logs.push(`[ERROR] ${errorMessage}`);
        console.error(`[EXECUTOR] executeTask ERROR in ${nodeType}:`, errorMessage);
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
    console.log(`[EXECUTOR] executeWorkflowPlan START: ${plan.length} phases`);
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
            console.log(`[EXECUTOR] Phase ${phase.phase} Node ${node.id} result:`, { 
              success: result.success, 
              outputKeys: Object.keys(result.outputs),
              hasError: !!result.error
            });
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

    console.log(`[EXECUTOR] executeWorkflowPlan COMPLETE: returning ${phaseResults.length} phases with ${phaseResults.reduce((sum, p) => sum + Object.keys(p.results).length, 0)} total node results`);
    return {
        phases: phaseResults,
        finalLogs
    };
}
