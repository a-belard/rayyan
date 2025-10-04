'use client';

import { useState, useEffect } from 'react';
import { ChatInput } from '@/components/chat/ChatInput';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { MessageList } from '@/components/chat/MessageList';
import { ThreadList } from '@/components/chat/ThreadList';
import { NewThreadButton } from '@/components/chat/NewThreadButton';
import { EmptyChatState } from '@/components/chat/EmptyChatState';
import { threadsApi, agentApi } from '@/lib/api';
import type { Thread, Message } from '@/lib/api';

export default function ChatPage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [currentThread, setCurrentThread] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');

  // TODO: Get from auth context - using valid UUID for testing
  const userId = '00000000-0000-0000-0000-000000000001';

  // Load threads on mount
  useEffect(() => {
    loadThreads();
  }, []);

  // Load messages when thread changes
  useEffect(() => {
    if (currentThread) {
      loadMessages(currentThread.id);
    }
  }, [currentThread]);

  const loadThreads = async () => {
    try {
      const data = await threadsApi.list(userId);
      setThreads(data);
    } catch (error) {
      console.error('Failed to load threads:', error);
      setThreads([]);
    }
  };

  const loadMessages = async (threadId: string) => {
    try {
      const data = await agentApi.getMessages(threadId, userId);
      setMessages(data);
    } catch (error) {
      console.error('Failed to load messages:', error);
      setMessages([]);
    }
  };

  const createThread = async () => {
    try {
      const newThread = await threadsApi.create(userId, {
        title: 'New Conversation',
        metadata: {},
      });
      setThreads([newThread, ...threads]);
      setCurrentThread(newThread);
      setMessages([]);
    } catch (error) {
      console.error('Failed to create thread:', error);
    }
  };

  const sendMessage = async (content: string) => {
    if (!currentThread) {
      // Create a new thread if none selected
      await createThread();
      // Wait a bit for the thread to be created
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    if (!currentThread) return;

    // Add user message to UI immediately
    const userMessage: Partial<Message> = {
      id: 'temp-' + Date.now(),
      role: 'user',
      content,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage as Message]);
    setIsLoading(true);
    setStreamingMessage('');

    try {
      // Stream the agent response
      const reader = await agentApi.sendMessage(currentThread.id, {
        content,
        user_id: userId,
      });

      const decoder = new TextDecoder();
      let buffer = '';
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;
          
          if (line.startsWith('event: ')) {
            const event = line.slice(7).trim();
            // Next line should be data
            continue;
          }
          
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            
            try {
              const parsed = JSON.parse(data);
              
              // Check what event this is by looking at the structure
              if (parsed.content && !parsed.message_id) {
                // Token event
                fullContent += parsed.content;
                setStreamingMessage(fullContent);
              } else if (parsed.message_id) {
                // Done event
                const assistantMessage: Partial<Message> = {
                  id: parsed.message_id,
                  role: 'assistant',
                  content: parsed.content || fullContent,
                  created_at: new Date().toISOString(),
                };
                setMessages(prev => [...prev, assistantMessage as Message]);
                setStreamingMessage('');
                fullContent = '';
              } else if (parsed.type === 'tool_call') {
                // Tool call started
                console.log('Tool call:', parsed.tool);
              }
            } catch (e) {
              console.error('Failed to parse SSE data:', data, e);
            }
          }
        }
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to send message:', error);
      setIsLoading(false);
      setStreamingMessage('');
    }

    // Reload threads to update counts
    loadThreads();
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Thread List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <NewThreadButton onClick={createThread} disabled={isLoading} />
        <ThreadList
          threads={threads}
          currentThread={currentThread}
          onSelectThread={(thread: Thread) => setCurrentThread(thread)}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <ChatHeader currentThread={currentThread} />

        {/* Messages */}
        {!currentThread && messages.length === 0 ? (
          <EmptyChatState onNewChat={createThread} />
        ) : (
          <MessageList
            messages={messages}
            streamingMessage={streamingMessage}
            isLoading={isLoading}
          />
        )}

        {/* Input */}
        <div className="border-t border-gray-200 bg-white shadow-lg">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <ChatInput
              onSend={sendMessage}
              disabled={isLoading}
              placeholder={
                isLoading
                  ? 'Agent is thinking...'
                  : 'Ask about irrigation, soil health, pests, weather...'
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
