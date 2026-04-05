"use client";

import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { parseChatCommand, ParsedCommand } from "@/lib/ai/parser";
import { useTaskStore } from "@/store/useTaskStore";

// Initialize socket connection outside component to avoid reconnects on render
const socket: Socket = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000");

interface Message {
    id: string;
    text: string;
    sender: "user" | "system";
    timestamp: Date;
    isTask?: boolean;
    taskData?: ParsedCommand;
}

export function ChatWindow() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    const addTask = useTaskStore((state) => state.addTask);

    useEffect(() => {
        // Listen for incoming transmissions
        socket.on("chat_message", (data: string) => {
            setMessages((prev) => [
                ...prev,
                {
                    id: Math.random().toString(36).substring(7),
                    text: data,
                    sender: "user",
                    timestamp: new Date(),
                },
            ]);
        });

        // 🧠 Listen for newly created tasks from the server
        socket.on("task_created", (task) => {
            addTask(task); // Save it to the global store for the Kanban board
        });

        return () => {
            socket.off("chat_message");
            socket.off("task_created");
        };
    }, [addTask]);

    // Auto-scroll to bottom on new message
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const sendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const parsed = parseChatCommand(input);

        if (parsed.isCommand && parsed.type === 'ASSIGN') {
            // 🚀 BOOM: It's a task. Add it locally as a system message.
            setMessages((prev) => [
                ...prev,
                {
                    id: Math.random().toString(36).substring(7),
                    text: input,
                    sender: "system",
                    timestamp: new Date(),
                    isTask: true,
                    taskData: parsed,
                },
            ]);

            // Tell the backend to formally log this task (we will build this backend listener later)
            socket.emit("create_task", parsed);
        } else {
            // 💬 It's a normal message. Send it to the room.
            socket.emit("chat_message", input);
        }

        setInput("");
    };

    return (
        <div className="flex flex-col h-[600px] w-full max-w-2xl mx-auto rounded-xl border border-zinc-800 bg-zinc-950/50 backdrop-blur-md shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <h2 className="text-sm font-medium tracking-wider text-zinc-100 uppercase">
                        TeamLens Hub
                    </h2>
                </div>
                <Sparkles className="w-4 h-4 text-zinc-500" />
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4">
                <div className="flex flex-col gap-4">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-zinc-500 mt-20">
                            <p className="text-sm">Initiate secure connection...</p>
                            <p className="text-xs mt-1">Try typing: /assign @user to setup database by Friday</p>
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${msg.isTask
                                    ? "bg-zinc-900 border border-emerald-500/30 text-zinc-100 self-center w-full shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                                    : msg.sender === "user"
                                        ? "bg-zinc-800 text-zinc-100 self-end rounded-tr-sm"
                                        : "bg-indigo-500/10 border border-indigo-500/20 text-indigo-100 self-start rounded-tl-sm shadow-[0_0_15px_rgba(99,102,241,0.1)]"
                                    }`}
                            >
                                {msg.isTask && msg.taskData?.assignee ? (
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-2 border-b border-emerald-500/20 pb-2">
                                            <Sparkles className="w-4 h-4 text-emerald-400" />
                                            <span className="font-semibold text-emerald-400 tracking-wide">TASK ALLOCATED</span>
                                        </div>
                                        <p className="text-zinc-300 mt-1">
                                            <span className="font-bold text-white">@{msg.taskData.assignee}</span> has been assigned:
                                        </p>
                                        <p className="bg-black/50 p-2 rounded-md font-mono text-xs text-emerald-200">
                                            {msg.taskData.task}
                                        </p>
                                        <div className="flex justify-end text-xs text-zinc-500 mt-1">
                                            Deadline: <span className="text-zinc-300 ml-1">{msg.taskData.deadline}</span>
                                        </div>
                                    </div>
                                ) : (
                                    msg.text
                                )}
                            </div>
                        ))
                    )}
                    <div ref={scrollRef} />
                </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 bg-zinc-900/80 border-t border-zinc-800">
                <form onSubmit={sendMessage} className="flex gap-2">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type a message or use /assign..."
                        className="flex-1 bg-zinc-950 border-zinc-800 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500 text-zinc-100 placeholder:text-zinc-600"
                    />
                    <Button
                        type="submit"
                        size="icon"
                        className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)] transition-all"
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </form>
            </div>
        </div>
    );
}