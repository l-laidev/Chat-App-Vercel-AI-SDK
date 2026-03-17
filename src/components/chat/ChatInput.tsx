import { Task } from "@/types/chat";
import { useState } from "react";
import z from "zod";

export function ChatInput({ sendMessage, selectedModel, status, task }: { sendMessage: Function, selectedModel: string, status: string, task: z.infer<typeof Task> }) {
    const [input, setInput] = useState('');

    return <form onSubmit={(e) => {
        e.preventDefault();
        sendMessage({
            text: input,
            metadata: {
                model: selectedModel,
                temperature: 0.7,
                task: task,
            }
        });
        setInput('');
    }} className="p-4 border-t">
        <div className="flex gap-2">
            <input
                value={input}
                onChange={(e) => {
                    setInput(e.target.value);
                }}
                placeholder="Type your message..."
                className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={status != 'ready'}
            />
            <button
                type="submit"
                disabled={status != 'ready' || !input.trim()}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
            >Send</button>
        </div>
    </form>
}