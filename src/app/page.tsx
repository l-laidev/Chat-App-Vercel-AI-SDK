'use client';

import { useChat } from "@ai-sdk/react";
import { useState } from "react";

export default function ChatPage() {
  const [ input, setInput ] = useState('');
  const { messages, status, sendMessage } = useChat();

  return (
    <div className="flex flex-col h-screen max-w-2xl max-auto p-4">
      <div className="flex-1 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-4 rounded-lg text-black ${
              msg.role == 'user'
              ? 'bg-blue-100 ml-auto max-w-[80%]'
              : 'bg-gray-100 mr-auto max-w-[80%]'
            }`}
          >
            <p className="whitespace-pre-wrap">
              {msg.parts.map((part, index) => (
                <span key={index}>{part.type == 'text' && part.text}</span>
              ))}
            </p>
          </div>
        ))}
      </div>

      <form onSubmit={(e) => {
        e.preventDefault();
        sendMessage({
          // role: 'user',
          text: input,
          metadata: {
            temperature: 0.7,
            model: 'gemini-2.5-flash-lite',
          }
        });
        setInput('');
      }} className="flex gap-2 pt-4">
        <input 
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
          }}
          placeholder="Type your message"
          className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={status != 'ready'}
        />
        <button 
          type="submit"
          disabled={status != 'ready' || !input.trim()}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          {status != 'ready'? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  )
}