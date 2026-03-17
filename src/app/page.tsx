'use client';

import { ChatContainer } from "@/components/chat/ChatContainer";
import { useChat } from "@ai-sdk/react";
import { useCallback, useState } from "react";

export default function ChatPage() {
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash-lite');

  const { messages, status, sendMessage, error, stop, setMessages } = useChat({
    generateId: () => crypto.randomUUID(),
    
    onFinish: (msg) => {
      console.log('Message done: ', msg.message.id);
    },
    onError: (err) => {
      console.error('Chat Error: ', err);
    },
  });

  const clearChat = useCallback(() => {
    setMessages([]);
  }, [setMessages]);

  

  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto">
      {/* change model, clear chat */}
      <header className="flex items-center justify-between p-4 border-b">
        <h1 className="text-xl font-bold">AI Chat</h1>
        <div className="flex items-center gap-2">
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="gemini-2.5-flash-lite">Gemini 2.5 Flash Lite</option>
            <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
          </select>
          <button type="button" onClick={clearChat} className="p-2 text-gray-500 hover:text-gray-700 hover:cursor-p">
            Clear
          </button>
        </div>
      </header>

      {/* quick messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length == 0 && (
          <div className="text-center text-gray-500 mt-8">
            <p className="text-lg mb-4">How can I help you today?</p>
            <div className="flex flex-wrap justify-center gap-2">
              {['Explain React Server Components', 'Debug my code', 'Write a function'].map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => sendMessage({text: prompt, metadata: {
                    temperature: 0.7,
                    model: 'gemini-2.5-flash-lite',
                  }})}
                  className="px-4 py-2 bg-sky-400 rounded-full hover:bg-gray-200 text-sm text-indigo-900 hover:cursor-pointer"
                >{prompt}</button>
              ))}
            </div>
          </div>
        )}

        <ChatContainer 
          messages={messages} 
          status={status}
          sendMessage={sendMessage}
          error={error}
          stop={stop}
          selectedModel={selectedModel}
        />
      </div>
    </div>
  )
}
