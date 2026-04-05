    "use server";

    import { createWorkflowSchema } from "@/schema/worflow";
    import { WorkflowStatus } from "@/types/workflow";
    import { auth } from "@clerk/nextjs/server";
    import {prisma} from '@/lib/prisma';
import { AppNode } from "@/types/appNode";
import { Edge } from "@xyflow/react";
import { CreateFlowNode } from "@/lib/workflow/createFlowNode";
import { Tasktype } from "@/types/task";

    export async function CreateWorkflow(form: any) {

    const parsed = createWorkflowSchema.safeParse(form);
    if (!parsed.success) throw new Error("Invalid form data");

    const { userId } = auth();
    if (!userId) throw new Error("Unauthenticated");

    const initialFlow :  {nodes : AppNode[],edges : Edge[]} = {nodes : [],edges : []}

    initialFlow.nodes.push(CreateFlowNode(Tasktype.LAUNCH_BROWSER))
    const result = await prisma.workflow.create({
        data: {
        userId,
        status: WorkflowStatus.DRAFT,
        definition:JSON.stringify(initialFlow),
        ...parsed.data,
        },
    });

    return { id: result.id };
    }
