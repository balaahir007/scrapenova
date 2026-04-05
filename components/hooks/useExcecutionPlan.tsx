import { FlowToExcecutionPlan, FlowToExcecutionPlanErrorType } from "@/lib/workflow/excecutionplan"
import { AppNode } from "@/types/appNode"
import { useReactFlow } from "@xyflow/react"
import { useCallback } from "react"
import useFlowValidation from "./useFlowValidation"
import { toast } from "sonner"
import { se } from "date-fns/locale"

const useExcecutionPlan = ()=>{
    const {toObject} =useReactFlow()
    const {setInvalidInputs,clearErrors} = useFlowValidation();
    const handleError = useCallback((error : any)=>{
        switch(error.type) {
            case FlowToExcecutionPlanErrorType.NO_ENTRY_POINT:
                toast.error("No entry point found in the workflow")
                break;
            case FlowToExcecutionPlanErrorType.INVALID_INPUTS:
                toast.error("Invalid inputs found in the workflow")
                setInvalidInputs(error.invalidElements || [])
                break;
            default:
                toast.error("An unknown error occurred while generating the execution plan")
                break
        }
    },[setInvalidInputs])
    const generateExcecutionPlan = useCallback(()=>{
        const {nodes,edges} = toObject();
        const {excecutionPlan,error} = FlowToExcecutionPlan(nodes as AppNode[],edges);
        if (error) {
            handleError(error);
            return;
        }
        clearErrors();
        return excecutionPlan;
    },[toObject,handleError,clearErrors]) 
    return generateExcecutionPlan;
}
export default useExcecutionPlan