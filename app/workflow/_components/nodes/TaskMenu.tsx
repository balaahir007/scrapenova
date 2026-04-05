// [ScrapeNova theme applied] — TaskMenu.tsx
"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { TaskRegistry } from "@/lib/workflow/task/registery";
import { Tasktype } from "@/types/task";
function TaskMenu() {
  return (
    <aside className="w-[300px] min-w-[300px] border-r-2 border-zinc-200 dark:border-zinc-800 h-full p-2 px-4 overflow-auto panel-glow">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Tasks</h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Drag and drop to add tasks</p>
      </div>
      <Accordion
        type="multiple"
        className="w-full"
        defaultValue={["extraction"]}
      >
        <AccordionItem value="extraction">
          <AccordionTrigger className="text-zinc-700 dark:text-zinc-200">Data Extraction</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-2 mt-2">
            <TaskMenuBtn taskType={Tasktype.PAGE_TO_HTML} />
            <TaskMenuBtn taskType={Tasktype.EXTRACT_TEXT_FROM_ELEMENT} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </aside>
  );
}

function TaskMenuBtn({ taskType }: { taskType: Tasktype }) {
  const task = TaskRegistry[taskType];

  const onDragStart = (event: React.DragEvent, type: Tasktype) => {
    event.dataTransfer.setData("application/reactflow", type);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <Button
      variant={"secondary"}
      className="flex justify-between items-center gap-2 border border-cyan-200 dark:border-zinc-700 w-full btn-secondary"
      draggable
      onDragStart={(event) => onDragStart(event, taskType)}
    >
      <div className="flex gap-2 text-zinc-700 dark:text-zinc-200">
        <task.icon size={20} />
        {task.label}
      </div>
    </Button>
  );
}
export default TaskMenu;
