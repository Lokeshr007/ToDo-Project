import { Calendar } from "lucide-react";

/**
 * Component to display when there are no tasks for today.
 */
function EmptyTaskState({ onCreateClick }) {
  return (
    <div className="text-center py-8">
      <Calendar size={40} className="mx-auto text-slate-500 mb-3" />
      <p className="text-slate-400">No tasks scheduled for today</p>
      <button 
        onClick={onCreateClick}
        className="mt-3 text-sm bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
      >
        Create Task
      </button>
    </div>
  );
}

export default EmptyTaskState;
