import { FC } from 'react';
import { Thread } from '@/lib/api';

interface ThreadListProps {
  threads: Thread[];
  currentThread: Thread | null;
  onSelectThread: (thread: Thread) => void;
}

export const ThreadList: FC<ThreadListProps> = ({
  threads,
  currentThread,
  onSelectThread,
}) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No messages';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {threads.length === 0 ? (
        <div className="p-4 text-center text-gray-500 text-sm">
          No conversations yet
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {threads.map(thread => (
            <button
              key={thread.id}
              onClick={() => onSelectThread(thread)}
              className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                currentThread?.id === thread.id ? 'bg-green-50' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {thread.is_pinned && <span className="text-yellow-500">📌</span>}
                    <h3 className="font-medium text-gray-800 truncate">
                      {thread.title || 'Untitled Conversation'}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                    <span>{formatDate(thread.last_message_at)}</span>
                    <span>•</span>
                    <span>{thread.message_count} messages</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
