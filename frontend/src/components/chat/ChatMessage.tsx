import { FC } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: any;
  created_at: string;
  thread_id?: string;
  position?: number;
}

interface ChatMessageProps {
  message: Message;
  isStreaming?: boolean;
}

export const ChatMessage: FC<ChatMessageProps> = ({ message, isStreaming = false }) => {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isSystem) {
    return (
      <div className="flex justify-center mb-4">
        <div className="px-4 py-2 bg-blue-50 text-blue-700 text-sm rounded-full border border-blue-200">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6 animate-fade-in`}>
      <div className={`flex gap-3 max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-lg ${
          isUser ? 'bg-green-600' : 'bg-gradient-to-br from-green-400 to-green-600'
        }`}>
          {isUser ? '👤' : '🌾'}
        </div>

        {/* Message Content */}
        <div className="flex flex-col gap-1">
          {/* Header with name and time */}
          <div className={`flex items-center gap-2 text-xs ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
            <span className={`font-semibold ${isUser ? 'text-green-700' : 'text-gray-700'}`}>
              {isUser ? 'You' : 'AgriAdvisor'}
            </span>
            <span className="text-gray-400">
              {formatTime(message.created_at)}
            </span>
            {isStreaming && (
              <span className="text-xs text-green-600 animate-pulse flex items-center gap-1">
                <span className="inline-block w-2 h-2 bg-green-600 rounded-full animate-bounce"></span>
                typing...
              </span>
            )}
          </div>

          {/* Message Bubble */}
          <div
            className={`px-4 py-3 rounded-2xl shadow-sm ${
              isUser
                ? 'bg-gradient-to-br from-green-600 to-green-700 text-white rounded-tr-sm'
                : 'bg-white text-gray-800 border border-gray-200 rounded-tl-sm'
            }`}
          >
            <div className="whitespace-pre-wrap leading-relaxed text-[15px]">
              {message.content}
            </div>
            
            {/* Tool Calls */}
            {message.metadata?.tool_calls && message.metadata.tool_calls.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <details className="text-xs text-gray-600">
                  <summary className="cursor-pointer hover:text-gray-800 font-medium flex items-center gap-1">
                    🔧 Used {message.metadata.tool_calls.length} tool{message.metadata.tool_calls.length > 1 ? 's' : ''}
                  </summary>
                  <div className="mt-2 space-y-1.5 pl-2">
                    {message.metadata.tool_calls.map((call: any, i: number) => (
                      <div key={i} className="font-mono text-xs bg-gray-50 px-2 py-1 rounded">
                        → {call.tool}
                      </div>
                    ))}
                  </div>
                </details>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
