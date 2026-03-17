import { ChatInput } from "./ChatInput";
import { ChatStatus, UIMessage } from "ai";
import { MessageList } from "./MessageList";

type parameters = {
    messages: UIMessage[]
    status: ChatStatus
    sendMessage: Function
    error: Error | undefined
    stop: Function
    selectedModel: string
};

export function ChatContainer({ messages, status, sendMessage, error, stop, selectedModel }: parameters) {
    return <div>
        <MessageList
            messages={messages}
            sendMessage={sendMessage}
            status={status}
            stop={stop}
            error={error}
        />
        <ChatInput sendMessage={sendMessage} selectedModel={selectedModel} status={status} />
    </div>
}