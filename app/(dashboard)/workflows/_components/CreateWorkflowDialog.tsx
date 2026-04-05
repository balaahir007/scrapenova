// [ScrapeNova theme applied] — CreateWorkflowDialog.tsx
"use client";
import CustomDialogHeader from "@/components/CustomDialogHeader";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  createWorkflowSchema,
  createWorkflowSchemaType,
} from "@/schema/worflow";
import { Layers2Icon, Loader2 } from "lucide-react";
import React, { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { CreateWorkflow } from "@/actions/workflows/createWorkflow";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

function CreateWorkflowDialog({ triggerText }: { triggerText?: string }) {
  const [open, setOpen] = useState(false); // default should be false
  const form = useForm<createWorkflowSchemaType>({
    resolver: zodResolver(createWorkflowSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const router = useRouter()

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: createWorkflowSchemaType) => {
    return await CreateWorkflow(values); 
  },

    onSuccess: (data) => {
      toast.success("Workflow created", { id: "create-workflow" });
          router.push(`/workflow/editor/${data.id}`);

    },

    onError: () => {
      toast.error("Falied to create workflow", { id: "create-workflow" });
    },
  });

const onSubmit = (values: createWorkflowSchemaType) => {
  toast.loading("creating workflow...", { id: "create-workflow" });
  mutate(values);
};

  return (
    <Dialog open={open} onOpenChange={(open)=>{
        form.reset()
        setOpen(open)
    }}>
      <DialogTrigger asChild>
        <Button className="btn-primary">{triggerText ?? "CreateWorkflow"}</Button>
      </DialogTrigger>

      <DialogContent className="px-0">
        <CustomDialogHeader
          icon={Layers2Icon}
          title="Create workflow"
          subTitle="Start building your workflow"
        />
        <div className="p-6">
          <Form {...form}>
            <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Name
                      <p className="text-xs text-primary">(required)</p>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} className="input" />
                    </FormControl>
                    <FormDescription>
                      Choose a descriptive and unique name
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Description
                      <p className="text-xs text-muted-foreground">
                        (optional)
                      </p>
                    </FormLabel>
                    <FormControl>
                      <Textarea className="resize-none input" {...field} />
                    </FormControl>
                    <FormDescription>
                      Provide a brief description of what your workflow does.
                      <br />
                      This is optional but can help you remember the
                      workflow&apos;s purpose
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="btn-primary w-full" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Proceed"
                )}
              </Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CreateWorkflowDialog;
