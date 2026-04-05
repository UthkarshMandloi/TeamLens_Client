"use client";

import { useTaskStore, Task } from "@/store/useTaskStore";
import { Sparkles, Clock, CheckCircle2, CircleDashed } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export function TaskBoard() {
  const { tasks, updateTaskStatus } = useTaskStore();

  const columns: { id: Task["status"]; label: string; icon: React.ReactNode; color: string }[] = [
    { id: "todo", label: "To Do", icon: <CircleDashed className="w-4 h-4" />, color: "text-zinc-400" },
    { id: "in-progress", label: "In Progress", icon: <Clock className="w-4 h-4" />, color: "text-indigo-400" },
    { id: "done", label: "Done", icon: <CheckCircle2 className="w-4 h-4" />, color: "text-emerald-400" },
  ];

  return (
    <div className="h-[600px] w-full rounded-xl border border-zinc-800 bg-zinc-950/50 backdrop-blur-md shadow-2xl flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
        <Sparkles className="w-4 h-4 text-indigo-500" />
        <h2 className="text-sm font-medium tracking-wider text-zinc-100 uppercase">
          AI Allocation Board
        </h2>
      </div>

      {/* Board Columns */}
      <div className="flex-1 grid grid-cols-3 divide-x divide-zinc-800/50 p-4 gap-4 overflow-hidden">
        {columns.map((col) => (
          <div key={col.id} className="flex flex-col h-full">
            <div className={`flex items-center gap-2 mb-4 font-semibold ${col.color}`}>
              {col.icon}
              <span className="text-sm">{col.label}</span>
              <span className="ml-auto bg-zinc-800 text-zinc-300 text-xs py-0.5 px-2 rounded-full">
                {tasks.filter((t) => t.status === col.id).length}
              </span>
            </div>

            <ScrollArea className="flex-1">
              <div className="flex flex-col gap-3 pr-3">
                {tasks
                  .filter((t) => t.status === col.id)
                  .map((task) => (
                    <div
                      key={task.id}
                      className="group bg-zinc-900/80 border border-zinc-800 hover:border-indigo-500/50 p-4 rounded-lg shadow-sm transition-all cursor-pointer"
                      onClick={() => {
                        // Quick click to advance status for the prototype demo
                        const nextStatus = task.status === 'todo' ? 'in-progress' : task.status === 'in-progress' ? 'done' : 'todo';
                        updateTaskStatus(task.id, nextStatus);
                      }}
                    >
                      <p className="text-sm text-zinc-200 mb-3 leading-relaxed">
                        {task.task}
                      </p>
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-[10px] font-bold border border-indigo-500/30">
                            {task.assignee?.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-xs font-medium text-zinc-400">@{task.assignee}</span>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-500 px-2 py-1 bg-black/50 rounded-md">
                          {task.deadline}
                        </span>
                      </div>
                    </div>
                  ))}
                {tasks.filter((t) => t.status === col.id).length === 0 && (
                  <div className="text-center text-zinc-600 text-xs py-8 border-2 border-dashed border-zinc-800/50 rounded-lg">
                    No tasks
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        ))}
      </div>
    </div>
  );
}