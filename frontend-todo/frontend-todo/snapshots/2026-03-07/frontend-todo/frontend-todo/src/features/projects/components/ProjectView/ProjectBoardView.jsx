import React from 'react';
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Plus, Edit2, Trash2, Clock } from 'lucide-react';
import { format } from 'date-fns';

const ProjectBoardView = ({ 
  boards, 
  activeBoardId, 
  hideEmptyColumns, 
  filterTasks, 
  themeStyles, 
  handleDragEnd, 
  getPriorityColor, 
  getStatusColor, 
  updateColumn, 
  deleteColumn, 
  setSelectedTask, 
  setShowTaskModal, 
  createColumn 
}) => {
  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-6 overflow-x-auto pb-8 min-h-[calc(100vh-350px)] scrollbar-thin scrollbar-thumb-slate-700 snap-x">
        {boards
          .filter(board => !activeBoardId || board.id === activeBoardId)
          .map(board => (
            board.columns
              ?.filter(column => {
                if (!hideEmptyColumns) return true;
                const taskCount = filterTasks(column.tasks)?.length || 0;
                return taskCount > 0 || column.type === 'INFLOW' || column.type === 'TODO' || column.type === 'DONE';
              })
              .map(column => (
                <div key={column.id} className="flex-shrink-0 w-85 snap-start">
                  <div className={`${themeStyles.card} rounded-3xl border ${themeStyles.border} p-5 h-full flex flex-col backdrop-blur-md bg-opacity-40 transition-all shadow-xl`}>
                    {/* Column Header */}
                    <div className="flex items-center justify-between mb-6 group/header">
                      <div className="flex items-center gap-3">
                        <h3 className={`font-bold text-base ${themeStyles.text} tracking-tight`}>{column.name}</h3>
                        <span className={`text-[10px] font-bold ${themeStyles.textSecondary} bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/50 uppercase tracking-widest`}>
                          {filterTasks(column.tasks)?.length || 0}
                        </span>
                        {column.wipLimit > 0 && (
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border uppercase tracking-tighter ${
                            (column.tasks?.length || 0) >= column.wipLimit 
                              ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                              : 'bg-green-500/10 text-green-400 border-green-500/20'
                          }`}>
                            WIP: {column.tasks?.length || 0}/{column.wipLimit}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover/header:opacity-100 transition-opacity">
                        <button 
                          onClick={() => {
                            const newName = prompt('Rename Column:', column.name);
                            if (newName && newName !== column.name) updateColumn(column.id, { name: newName });
                          }}
                          className={`p-2 rounded-xl hover:bg-slate-700/50 transition-colors text-slate-500 hover:text-white`}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={() => deleteColumn(column.id)}
                          className={`p-2 rounded-xl hover:bg-red-500/20 transition-colors text-slate-500 hover:text-red-400`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Droppable Zone */}
                    <Droppable droppableId={column.id.toString()}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`flex-1 space-y-4 mb-6 min-h-[250px] transition-all duration-300 rounded-2xl ${
                            snapshot.isDraggingOver ? 'bg-blue-600/5 ring-2 ring-blue-500/20 ring-inset' : ''
                          }`}
                        >
                          {filterTasks(column.tasks)?.map((todo, index) => (
                            <Draggable
                              key={todo.id}
                              draggableId={todo.id.toString()}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`${themeStyles.card} group relative rounded-2xl p-4 border ${themeStyles.border} ${
                                    snapshot.isDragging ? 'shadow-2xl ring-2 ring-blue-500/50 rotate-1 scale-105 z-50' : 'hover:shadow-2xl hover:translate-y-[-2px]'
                                  } transition-all cursor-grab active:cursor-grabbing bg-slate-900/60 backdrop-blur-sm`}
                                  onClick={() => {
                                    setSelectedTask(todo);
                                    setShowTaskModal(true);
                                  }}
                                >
                                  {/* Task Header */}
                                  <div className="flex items-start justify-between mb-3">
                                    <h4 className={`font-bold text-sm ${themeStyles.text} flex-1 leading-snug tracking-tight pr-2`}>{todo.item}</h4>
                                    {todo.priority && (
                                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-lg border uppercase tracking-widest ${getPriorityColor(todo.priority)}`}>
                                        {todo.priority}
                                      </span>
                                    )}
                                  </div>

                                  {todo.description && (
                                    <p className={`text-xs ${themeStyles.textSecondary} mb-4 line-clamp-2 leading-relaxed opacity-70`}>
                                      {todo.description}
                                    </p>
                                  )}

                                  {/* Task Footer Meta */}
                                  <div className="flex items-center gap-3">
                                    {todo.dueDate && (
                                      <span className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${
                                        new Date(todo.dueDate) < new Date() && todo.status !== 'COMPLETED' 
                                          ? 'text-red-400 animate-pulse' 
                                          : themeStyles.textSecondary
                                      }`}>
                                        <Clock size={12} strokeWidth={2.5} />
                                        {format(new Date(todo.dueDate), 'MMM dd')}
                                      </span>
                                    )}
                                    
                                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest ${getStatusColor(todo.status)}`}>
                                      {todo.status || 'PENDING'}
                                    </span>

                                    {todo.assignedTo && (
                                      <div className="ml-auto flex -space-x-2">
                                        <div className={`w-6 h-6 rounded-full ring-2 ring-slate-900 shadow-lg ${themeStyles.accent} flex items-center justify-center text-white text-[10px] font-black uppercase`}>
                                          {todo.assignedTo.name?.[0] || todo.assignedTo.email?.[0] || 'U'}
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {/* Hover Actions */}
                                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                    <button className="p-1.5 rounded-lg bg-slate-800/90 text-slate-300 hover:text-white transition-colors border border-slate-700/50">
                                      <Edit2 size={10} />
                                    </button>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}

                          {filterTasks(column.tasks)?.length === 0 && (
                            <div className={`flex flex-col items-center justify-center h-48 border-2 border-dashed ${themeStyles.border} rounded-2xl opacity-40`}>
                              <p className="text-xs font-bold uppercase tracking-widest">Vacuum</p>
                            </div>
                          )}
                        </div>
                      )}
                    </Droppable>

                    {/* Inline Actions */}
                    <button
                      onClick={() => {
                        setSelectedTask({ columnId: column.id, boardId: board.id });
                        setShowTaskModal(true);
                      }}
                      className={`w-full py-3 rounded-2xl border-2 border-dashed ${themeStyles.border} ${themeStyles.textSecondary} hover:bg-slate-700/30 hover:text-white transition-all flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-widest group/btn`}
                    >
                      <Plus size={16} className="group-hover/btn:scale-125 transition-transform" />
                      Add Task
                    </button>
                  </div>
                </div>
              ))
          ))}

        {/* Create Column Action */}
        <div className="flex-shrink-0 w-85 pb-4">
          <button
            onClick={() => createColumn(boards[0]?.id)}
            className={`w-full h-40 rounded-3xl border-2 border-dashed ${themeStyles.border} bg-slate-800/20 hover:bg-slate-800/40 hover:border-slate-500 transition-all flex flex-col items-center justify-center gap-3 group/newcol`}
          >
            <div className="p-4 bg-slate-700/50 rounded-2xl group-hover/newcol:bg-blue-600/30 transition-colors">
              <Plus size={28} className="text-slate-500 group-hover/newcol:text-blue-400 group-hover/newcol:scale-110 transition-all" />
            </div>
            <span className={`text-xs font-bold uppercase tracking-[0.2em] ${themeStyles.textSecondary} group-hover/newcol:text-white`}>New Column</span>
          </button>
        </div>
      </div>
    </DragDropContext>
  );
};

export default ProjectBoardView;
