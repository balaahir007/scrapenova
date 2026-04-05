import { AppNode } from "@/types/appNode";
import { Tasktype } from "@/types/task";

export function CreateFlowNode(
    nodeType : Tasktype,
    postion? : {x : number,y : number}
) : AppNode {
    return {
        id : crypto.randomUUID(),
        type :  "ScrapeNexaNode",
        dragHandle : ".drag-handle",
        data : {
            type : nodeType,
            inputs : {
            },
        },
        position : postion ?? {x : 0,y : 0}
    }

}