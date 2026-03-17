import { UIMessage } from "ai";

export function MessageBubble({ message }: { message: UIMessage }) {
    const isUser = message.role == 'user';

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-4 rounded-2xl ${isUser
                    ? 'bg-blue-500 text-white rounded-br-md'
                    : 'bg-gray-100 text-gray-900 rounded-bl-md'
                }`}>
                {message.parts.map((part, index) => (
                    <p key={index} className="whitespace-pre-wrap">{part.type == 'text' && part.text}</p>
                ))}
            </div>
        </div>
    )
}