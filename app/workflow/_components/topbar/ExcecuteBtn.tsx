"use client"

import useExcecutionPlan from "@/components/hooks/useExcecutionPlan"
import { Button } from "@/components/ui/button"
import { PlayIcon } from "lucide-react"

function ExcecuteBtn({workflowId}: {workflowId: string}) {
    const generate = useExcecutionPlan()
  return (
    <Button variant="outline" className="flex items-center gap-2" 
    onClick={()=>{
        const plan = generate();
        console.log("-- excecution plan -- ");
        console.log(plan);
    }
    }
    >
      <PlayIcon size={16} className="stroke-orange-400" />
      Excecute
    </Button>
  ) 
}

export default ExcecuteBtn