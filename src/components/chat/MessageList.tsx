import { useCallback } from "react";
import { MessageBubble } from "./MessageBubble";
import { ChatStatus, UIMessage } from "ai";

type parameters = {
    messages: UIMessage[]
    status: ChatStatus
    sendMessage: Function
    error: Error | undefined
    stop: Function
};

export function MessageList({ messages, sendMessage, status, error }: parameters) {
    const retryLast = useCallback(() => {
        if (messages.length >= 2) {
            sendMessage()
        }
    }, [messages, sendMessage])

    return <div>
        {messages.map((message) => <MessageBubble key={message.id} message={message} />)}

        {status != 'ready' && status != 'error' && (
            <div className="flex items-center gap-2 text-gray-500">
                <div className="animate-pulse">●</div>
                <span>AI is thinking...</span>
                <button onClick={(e) => stop()} className="text-red-500 text-sm">Stop</button>
            </div>
        )}

        {status == 'error' && (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg">
                <p>Error: {error?.message}</p>
                <button onClick={retryLast} className="text-sm underline">Retry</button>
            </div>
        )}
    </div>
}