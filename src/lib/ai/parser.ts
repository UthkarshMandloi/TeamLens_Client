// client/src/lib/ai/parser.ts

export interface ParsedCommand {
  isCommand: boolean;
  type?: 'ASSIGN';
  assignee?: string;
  task?: string;
  deadline?: string;
  originalText: string;
}

export function parseChatCommand(text: string): ParsedCommand {
  const trimmed = text.trim();

  // 1. Fast fail if it's a normal chat message
  if (!trimmed.startsWith('/assign')) {
    return { isCommand: false, originalText: text };
  }

  // 2. The Extraction Engine
  // Matches: /assign @username [the task description] (by/on) [deadline]
  // Example: /assign @yamini to integrate the MongoDB schema by Friday
  const assignRegex = /^\/assign\s+@(\w+)\s+(.*?)(?:\s+(?:by|on|due)\s+(.+))?$/i;
  const match = trimmed.match(assignRegex);

  if (match) {
    return {
      isCommand: true,
      type: 'ASSIGN',
      assignee: match[1], // e.g., yamini
      task: match[2].trim(), // e.g., to integrate the MongoDB schema
      deadline: match[3]?.trim() || 'No deadline specified', // e.g., Friday
      originalText: text,
    };
  }

  // 3. Fallback for incorrect syntax
  return { 
    isCommand: true, 
    type: 'ASSIGN', 
    originalText: text, 
    task: "Syntax Error. Use: /assign @user [task] by [deadline]" 
  };
}