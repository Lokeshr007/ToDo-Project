import React from 'react';
import { StopCircle } from 'lucide-react';
import { formatTime } from '../../utils/dateHelpers';

const ActiveTimer = ({ elapsedTime, onStop }) => {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 border border-red-500/30 rounded-lg">
      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
      <span className="text-sm text-white font-mono">
        {formatTime(elapsedTime)}
      </span>
      <button
        onClick={onStop}
        className="p-1 hover:bg-red-500/30 rounded"
        title="Stop Timer"
      >
        <StopCircle size={16} className="text-red-400" />
      </button>
    </div>
  );
};

export default ActiveTimer;
