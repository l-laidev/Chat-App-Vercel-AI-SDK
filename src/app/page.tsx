'use client';

import { UIMessage, useChat, useCompletion } from "@ai-sdk/react";
import { useCallback, useEffect, useState } from "react";

export default function ChatPage() {
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash-lite');
  const [ input, setInput ] = useState('');

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

  const retryLast = useCallback(() => {
    if(messages.length >= 2) {
      sendMessage()
    }
  }, [messages, sendMessage])

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

        {/* all messages */}
        {messages.map((message) => <MessageBubble key={message.id} message={message} />)}

        {status != 'ready' && status != 'error' && (
          <div className="flex items-center gap-2 text-gray-500">
            <div className="animate-pulse">●</div>
            <span>AI is thinking...</span>
            <button onClick={stop} className="text-red-500 text-sm">Stop</button>
          </div>
        )}

        {status == 'error' && (
          <div className="p-4 bg-red-50 text-red-600 rounded-lg">
            <p>Error: {error?.message}</p>
            <button onClick={retryLast} className="text-sm underline">Retry</button>
          </div>
        )}

        <form onSubmit={(e) => {
          e.preventDefault();
          sendMessage({
            text: input,
            metadata: {
              model: selectedModel,
              temperature: 0.7,
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
      </div>
    </div>
  )
}

function MessageBubble({message}: {message: UIMessage}) {
  const isUser = message.role == 'user';

  return (
    <div className={`flex ${isUser? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] p-4 rounded-2xl ${
        isUser
        ? 'bg-blue-500 text-white rounded-br-md'
        : 'bg-gray-100 text-gray-900 rounded-bl-md'
      }`}>
        {message.parts.map((part, index) => (
          <p key={index} className="whitespace-pre-wrap">{part.type =='text' && part.text}</p>
        ))}
      </div>
    </div>
  )
}