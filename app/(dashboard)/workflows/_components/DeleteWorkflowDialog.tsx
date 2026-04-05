"use client";

import deleteWorkflow from "@/actions/workflows/deleteWorkflow";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogAction,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Dispatch, SetStateAction, useState, useTransition } from "react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  workflowName: string;
  workflowId: string;
}

const DeleteWorkflowDialog = ({
  open,
  setOpen,
  workflowName,
  workflowId,
}: Props) => {
  const [confirmText, setConfirmText] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
        </AlertDialogHeader>

        <div className="flex flex-col py-4 gap-2">
          <p className="text-sm text-muted-foreground">
            If you are sure, enter <b>{workflowName}</b> to continue
          </p>

          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>

          <AlertDialogAction
            disabled={confirmText !== workflowName || isPending}
            onClick={() => {
              toast.loading("Deleting workflow...", { id: workflowId });

              startTransition(async () => {
                try {
                  await deleteWorkflow(workflowId);
                  toast.success("Workflow deleted successfully", {
                    id: workflowId,
                  });
                  setOpen(false);
                  setConfirmText("");
                } catch {
                  toast.error("Something went wrong", { id: workflowId });
                }
              });
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteWorkflowDialog;
