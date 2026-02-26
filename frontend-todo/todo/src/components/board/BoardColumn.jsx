// frontend/src/components/board/BoardColumn.jsx
import { Droppable, Draggable } from "react-beautiful-dnd";
import { MoreHorizontal, AlertCircle } from "lucide-react";
import { useState } from "react";
import BoardTaskCard from "./BoardTaskCard";
import AddTaskModal from "../AddTaskModal";

function BoardColumn({ column, isDraggingOver }) {
  const [showMenu, setShowMenu] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);

  const columnColors = {
    TODO: "bg-slate-100",
    IN_PROGRESS: "bg-blue-50",
    REVIEW: "bg-yellow-50",
    DONE: "bg-green-50",
    CUSTOM: "bg-slate-100"
  };

  const columnHeaders = {
    TODO: "To Do",
    IN_PROGRESS: "In Progress",
    REVIEW: "Review",
    DONE: "Done",
    CUSTOM: column.name
  };

  const bgColor = columnColors[column.type] || columnColors.CUSTOM;
  const headerText = columnHeaders[column.type] || column.name;

  const isAtWipLimit = column.wipLimit && column.tasks.length >= column.wipLimit;

  return (
    <div className={`rounded-xl ${bgColor} p-3 h-full flex flex-col`}>
      
      {/* Column Header */}
      <div className="flex items-center justify-between mb-3 px-2">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-slate-700">{headerText}</h3>
          <span className="text-xs bg-white/60 px-2 py-1 rounded-full">
            {column.tasks.length}{column.wipLimit ? `/${column.wipLimit}` : ''}
          </span>
          {isAtWipLimit && (
            <AlertCircle size={14} className="text-yellow-600" />
          )}
        </div>
        
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 hover:bg-white/60 rounded"
          >
            <MoreHorizontal size={16} />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border py-1 z-20">
              <button
                onClick={() => {
                  setShowAddTask(true);
                  setShowMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50"
              >
                Add Task
              </button>
              <button
                onClick={() => {
                  // Edit column
                  setShowMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50"
              >
                Edit Column
              </button>
              <button
                onClick={() => {
                  // Clear column
                  setShowMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                Clear All Tasks
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tasks */}
      <div className="flex-1 overflow-y-auto min-h-[200px]">
        <div className="space-y-2">
          {column.tasks.map((task, index) => (
            <Draggable
              key={task.id}
              draggableId={task.id.toString()}
              index={index}
            >
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  className={`${snapshot.isDragging ? 'shadow-xl rotate-1' : ''}`}
                >
                  <BoardTaskCard task={task} />
                </div>
              )}
            </Draggable>
          ))}
          {column.tasks.length === 0 && (
            <div className="text-center py-8 text-sm text-slate-400 border-2 border-dashed border-slate-300 rounded-lg">
              Drop tasks here
            </div>
          )}
        </div>
      </div>

      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={showAddTask}
        onClose={() => setShowAddTask(false)}
        onTaskAdded={(newTask) => {
          // Handle task added
          setShowAddTask(false);
        }}
        defaultColumnId={column.id}
      />
    </div>
  );
}

export default BoardColumn;