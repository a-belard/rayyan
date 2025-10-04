import { FC } from 'react';

interface EmptyChatStateProps {
  onNewChat?: () => void;
}

export const EmptyChatState: FC<EmptyChatStateProps> = ({ onNewChat }) => {
  return (
    <div className="flex items-center justify-center h-full bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="text-center text-gray-500 max-w-2xl px-6 animate-fade-in">
        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-5xl shadow-lg">
          🌾
        </div>
        <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
          Welcome to Rayyan AgriAdvisor
        </h2>
        <p className="text-lg mb-8 text-gray-600">
          Your intelligent agricultural assistant for precision farming
        </p>
        <div className="bg-white border border-gray-200 rounded-xl p-8 mb-8 shadow-lg">
          <p className="text-sm font-semibold text-gray-700 mb-5 uppercase tracking-wide">
            Get Expert Insights On
          </p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
              <span className="text-2xl">💧</span>
              <span className="font-medium text-gray-700">Irrigation Management</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
              <span className="text-2xl">🌱</span>
              <span className="font-medium text-gray-700">Fertigation Planning</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
              <span className="text-2xl">🐛</span>
              <span className="font-medium text-gray-700">Pest Control</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
              <span className="text-2xl">🌡️</span>
              <span className="font-medium text-gray-700">Weather Analysis</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
              <span className="text-2xl">🌾</span>
              <span className="font-medium text-gray-700">Soil Health</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
              <span className="text-2xl">📊</span>
              <span className="font-medium text-gray-700">Data-Driven Decisions</span>
            </div>
          </div>
        </div>
        {onNewChat && (
          <button
            onClick={onNewChat}
            className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Start Your First Conversation
          </button>
        )}
      </div>
    </div>
  );
};
