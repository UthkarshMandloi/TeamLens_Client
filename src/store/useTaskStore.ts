import { create } from 'zustand';
import { ParsedCommand } from '@/lib/ai/parser';

export interface Task extends ParsedCommand {
    id: string;
    status: 'todo' | 'in-progress' | 'done';
    createdAt: Date;
}

interface TaskStore {
    tasks: Task[];
    addTask: (task: Task) => void;
    updateTaskStatus: (id: string, status: Task['status']) => void;
}

export const useTaskStore = create<TaskStore>((set) => ({
    tasks: [],

    addTask: (task) =>
        set((state) => ({
            tasks: [...state.tasks, task]
        })),

    updateTaskStatus: (id, status) =>
        set((state) => ({
            tasks: state.tasks.map((task) =>
                task.id === id ? { ...task, status } : task
            ),
        })),
}));