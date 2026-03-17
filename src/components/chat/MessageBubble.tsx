import { TextUIPart, UIMessage } from "ai";

type ToolCall = { type: string, toolCallId: string, state: string, output: unknown }

const UserMessage = ({ textMessages }: { textMessages: TextUIPart[] }) => (
    <div className="flex justify-end">
        <div className="max-w-[80%] p-4 rounded-2xl bg-blue-500 text-white rounded-br-md" >
            {textMessages.map((textMessage, index) => (
                <p key={index} className="whitespace-pre-wrap">{textMessage.text}</p>
            ))}
        </div>
    </div>
);
const AssistantMessage = ({ textMessages }: { textMessages: TextUIPart[] }) => (
    <div className="flex justify-start">
        <div className="max-w-[80%] p-4 rounded-2xl bg-gray-100 text-gray-900 rounded-bl-md" >
            {textMessages.map((textMessage, index) => (
                <p key={index} className="whitespace-pre-wrap">{textMessage.text}</p>
            ))}
        </div>
    </div>
);
const ToolCard = ({ toolCall }: { toolCall: ToolCall }) => (
    <div className="p-3 my-2 bg-purple-50 border border-purple-200 rounded-lg">
        <div className="text-sm font-bold text-mauve-500">
            🔧 {toolCall.type}
        </div>
        {toolCall.state === 'output-available' && (
            <pre className="mt-2 text-xs bg-white p-2 rounded overflow-x-auto text-blue-700">
                {JSON.stringify(toolCall.output, null, 2)}
            </pre>
        )}
    </div>
)

export function MessageBubble({ message }: { message: UIMessage }) {
    const toolCalls: ToolCall[] = message.parts.filter((part) => part.type.includes('tool')).map((part) => (
        {
            type: part.type,
            // @ts-ignore: this property exists, based on the actual object
            toolCallId: part.toolCallId,
            // @ts-ignore: this property exists, based on the actual object
            state: part.state,
            // @ts-ignore: this property exists, based on the actual object
            output: part.output
        }
    ))
    const textMessages = message.parts.filter((part) => part.type == 'text')

    return (
        <div>
            {message.role == 'user' && <UserMessage textMessages={textMessages} />}
            {message.role == 'assistant' && (
                <div>
                    {toolCalls.map((toolCall) => <ToolCard key={toolCall.toolCallId} toolCall={toolCall} />)}
                    <AssistantMessage textMessages={textMessages} />
                </div>
            )}
        </div>
    );
}