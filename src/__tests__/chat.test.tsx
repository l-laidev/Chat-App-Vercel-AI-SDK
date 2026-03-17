import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { ChatContainer } from '@/components/chat/ChatContainer';
import { describe, it, expect, vi, test } from 'vitest';
import { useChat } from '@ai-sdk/react';

vi.mock('@ai-sdk/react', () => ({
    useChat: () => ({
        messages: [
            {
                id: 123, role: 'user', parts: [
                    { 'type': 'text', text: 'Hello' },
                ]
            },
            {
                id: 456, role: 'assistant', parts: [
                    { 'type': 'text', text: 'Hi, there!' },
                ]
            }
        ],
        sendMessage: vi.fn(),
        error: '',
        stop: vi.fn(),
        setMessages: vi.fn(),
    })
}));

describe('ChatPage', () => {
    it('renders messages correctly', () => {
        const { messages, status, sendMessage, error, stop } = vi.mocked(useChat)();
        const selectedModel = 'gemini-2.5-flash';
        const task: 'chat' | 'sentiment' = 'chat';

        const params = { messages, status, sendMessage, error, stop, selectedModel, task };

        render(<ChatContainer {...params} />);
        expect(screen.getByText('Hello')).toBeDefined();
        expect(screen.getByText('Hi, there!')).toBeDefined();
    });

    it('disables send button when loading', async () => {
        const { messages, sendMessage, error, stop } = vi.mocked(useChat)();
        const selectedModel = 'gemini-2.5-flash';
        const task: 'chat' | 'sentiment' = 'chat';

        const status = 'submitted';
        const params = { messages, status, sendMessage, error, stop, selectedModel, task };


        // render(<ChatContainer {...params} />);
        const chatInput = screen.getByPlaceholderText('Type your message...').parentElement;
        if (chatInput) { expect(within(chatInput).getByRole('button', { name: "Send" })).toBeDisabled(); }
    });
})
