import { ChatWindow } from "@/components/chat/ChatWindow";
import { TaskBoard } from "@/components/tasks/TaskBoard";

export default function Home() {
  return (
    <main className="min-h-screen bg-black p-4 lg:p-8 flex items-center justify-center relative overflow-hidden">
      {/* Background ambient glow - Cinematic Styling */}
      <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-indigo-900/20 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-emerald-900/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-7xl z-10 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: AI Kanban Board (Takes up 7 columns on large screens) */}
        <div className="lg:col-span-7">
          <TaskBoard />
        </div>

        {/* Right Side: Command Chat (Takes up 5 columns on large screens) */}
        <div className="lg:col-span-5">
          <ChatWindow />
        </div>

      </div>
    </main>
  );
}