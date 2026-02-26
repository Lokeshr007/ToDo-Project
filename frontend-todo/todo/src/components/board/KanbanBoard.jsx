// frontend/src/components/board/KanbanBoard.jsx
import { useState } from "react";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import BoardColumn from "./BoardColumn";

function KanbanBoard({ columns, onTaskMove, onAddColumn }) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = async (result) => {
    setIsDragging(false);

    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    // Same column
    if (source.droppableId === destination.droppableId) {
      // Handle reordering within same column
      // You can implement this if needed
      return;
    }

    // Moving between columns
    await onTaskMove({
      taskId: parseInt(draggableId),
      fromColumnId: parseInt(source.droppableId),
      toColumnId: parseInt(destination.droppableId),
      newIndex: destination.index,
      oldIndex: source.index
    });
  };

  return (
    <DragDropContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 h-full">
        {columns.map((column) => (
          <Droppable key={column.id} droppableId={column.id.toString()}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`w-80 flex-shrink-0 ${
                  snapshot.isDraggingOver ? 'bg-blue-50' : ''
                }`}
              >
                <BoardColumn
                  column={column}
                  isDraggingOver={snapshot.isDraggingOver}
                />
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}

        {/* Add Column Placeholder */}
        <button
          onClick={onAddColumn}
          className="w-80 flex-shrink-0 h-20 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center text-slate-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Add Column
        </button>
      </div>
    </DragDropContext>
  );
}

export default KanbanBoard;