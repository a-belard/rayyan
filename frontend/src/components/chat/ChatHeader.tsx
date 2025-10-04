import { FC } from 'react';
import type { Thread } from '@/lib/api';

interface ChatHeaderProps {
  currentThread: Thread | null;
}

export const ChatHeader: FC<ChatHeaderProps> = ({ currentThread }) => {
  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-2xl shadow-md">
            🌾
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-800">
              Rayyan AgriAdvisor
            </h1>
            <p className="text-sm text-gray-500">
              {currentThread?.title || 'Select a conversation or start a new one'}
            </p>
          </div>
          {currentThread && (
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Active</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
