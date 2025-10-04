import { FC, useRef, useEffect } from 'react';
import { ChatMessage } from './ChatMessage';
import type { Message } from '@/lib/api';

interface MessageListProps {
  messages: Message[];
  streamingMessage?: string;
  isLoading?: boolean;
}

export const MessageList: FC<MessageListProps> = ({
  messages,
  streamingMessage,
  isLoading,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}

        {streamingMessage && (
          <ChatMessage
            message={{
              id: 'streaming',
              thread_id: '',
              position: 0,
              role: 'assistant',
              content: streamingMessage,
              metadata: {},
              created_at: new Date().toISOString(),
            }}
            isStreaming
          />
        )}

        {isLoading && !streamingMessage && (
          <div className="flex items-center gap-3 text-gray-600 mb-6">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <span className="text-sm font-medium">AgriAdvisor is analyzing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};
