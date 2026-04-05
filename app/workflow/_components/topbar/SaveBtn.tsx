// [ScrapeNova theme applied] — SaveBtn.tsx
"use client"

import { UpdateWorkflow } from "@/actions/workflows/updateWorkflow"
import { Button } from "@/components/ui/button"
import { useReactFlow } from "@xyflow/react"
import { CheckIcon, Loader2 } from "lucide-react"
import React, { useState } from "react"
import { toast } from "sonner"

function SaveBtn({ workflowId }: { workflowId: string }) {
  const { toObject } = useReactFlow()
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    try {
      setIsLoading(true)

      const workflowDefinition = JSON.stringify(toObject())

      await UpdateWorkflow({
        id: workflowId,
        definition: workflowDefinition,
      })

      toast.success("Flow saved successfully")
    } catch (error) {
      console.error(error)
      toast.error("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      className="btn-secondary flex items-center gap-2"
      disabled={isLoading}
      onClick={handleSave}
    >
      {isLoading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <CheckIcon size={16} className="stroke-cyan-500" />
      )}
      {isLoading ? "Saving..." : "Save"}
    </Button>
  )
}

export default SaveBtn
