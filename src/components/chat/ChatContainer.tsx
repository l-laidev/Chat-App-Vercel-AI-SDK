import { ChatInput } from "./ChatInput";
import { ChatStatus, UIMessage } from "ai";
import { MessageList } from "./MessageList";
import { Task } from "@/types/chat";
import z from "zod";

type parameters = {
    messages: UIMessage[]
    status: ChatStatus
    sendMessage: Function
    error: Error | undefined
    stop: Function
    selectedModel: string
    task: z.infer<typeof Task>
};

export function ChatContainer({ messages, status, sendMessage, error, stop, selectedModel, task }: parameters) {
    return <div>
        <MessageList
            messages={messages}
            sendMessage={sendMessage}
            status={status}
            stop={stop}
            error={error}
        />
        <ChatInput sendMessage={sendMessage} selectedModel={selectedModel} status={status} task={task} />
    </div>
}