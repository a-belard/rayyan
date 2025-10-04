import { FC } from 'react';

interface NewThreadButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export const NewThreadButton: FC<NewThreadButtonProps> = ({
  onClick,
  disabled = false,
}) => {
  return (
    <div className="p-4 border-b border-gray-200">
      <button
        onClick={onClick}
        disabled={disabled}
        className="w-full bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <span className="text-lg">+</span>
        <span>New Conversation</span>
      </button>
    </div>
  );
};
