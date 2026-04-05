import { LucideProps } from "lucide-react";
import { TaskParam, Tasktype } from "./task";
import { AppNode } from "./appNode";

export enum WorkflowStatus {
    DRAFT = "DRAFT",
    PUBLISHED = 'PUBLISHED'
}

export type WorkflowTask = {
    label : string;
     icon : React.FC<LucideProps>;
     type : Tasktype;
     isEntryPoint? : boolean;
     inputs : TaskParam[];
     outputs : TaskParam[];
     credits? : number;
      

}
export type WorkflowExceutionPlanPhase  = {
    phase : number,
    nodes : AppNode[],  }

export type WorkflowExcecutionPlan = WorkflowExceutionPlanPhase[]