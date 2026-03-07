import React from 'react';
import { format, parseISO } from 'date-fns';
import { Edit2, Trash2, Check } from 'lucide-react';

const TimeBlockGrid = ({ 
  generateTimeSlots, 
  getBlocksForTime, 
  handleDrop, 
  handleDragStart, 
  draggedBlock, 
  getCategoryIcon,
  toggleBlockCompletion,
  editBlock,
  deleteTimeBlock
}) => {
  return (
    <div className="px-8 pb-8 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
      <div className="space-y-0.5">
        {generateTimeSlots().map((time) => {
          const blocksAtTime = getBlocksForTime(time);
          const isHour = time.endsWith(':00');

          return (
            <div
              key={time}
              className={`relative flex group ${
                isHour ? 'h-14' : 'h-10'
              } border-t border-slate-700/30`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(time)}
            >
              <div className={`w-16 text-[10px] font-bold py-2 ${isHour ? 'text-slate-400' : 'text-slate-600'}`}>
                {time}
              </div>

              <div className="flex-1 relative">
                {blocksAtTime.map((block) => {
                  const startTime = format(parseISO(block.startTime), 'HH:mm');
                  const endTime = format(parseISO(block.endTime), 'HH:mm');
                  const isFirst = startTime === time;
                  const CategoryIcon = getCategoryIcon(block.category);

                  if (!isFirst) return null;

                  return (
                    <div
                      key={block.id}
                      draggable
                      onDragStart={() => handleDragStart(block)}
                      className={`absolute left-0 right-1 rounded-xl p-3 cursor-move transition-all group/item shadow-lg ${
                        block.completed ? 'opacity-40 grayscale-[0.5]' : ''
                      }`}
                      style={{
                        backgroundColor: block.color + '15',
                        borderLeft: `4px solid ${block.color}`,
                        top: '2px',
                        height: `calc(${(parseISO(block.endTime) - parseISO(block.startTime)) / (1000 * 60 * 30)} * 2.5rem - 4px)`,
                        zIndex: 10,
                        backdropFilter: 'blur(8px)'
                      }}
                    >
                      <div className="flex items-start justify-between h-full">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <CategoryIcon size={14} style={{ color: block.color }} />
                            <p className="text-sm font-bold text-white truncate leading-none pt-0.5 uppercase tracking-tight">
                              {block.title}
                            </p>
                          </div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase">
                            {startTime} - {endTime}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1.5 opacity-0 group-hover/item:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleBlockCompletion(block); }}
                            className={`p-1.5 rounded-lg hover:bg-slate-700/50 transition-colors ${
                              block.completed ? 'text-green-400' : 'text-slate-400 shadow-sm'
                            }`}
                          >
                            <Check size={14} strokeWidth={3} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); editBlock(block); }}
                            className="p-1.5 hover:bg-slate-700/50 rounded-lg text-slate-400 transition-colors"
                          >
                            <Edit2 size={13} strokeWidth={2.5} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteTimeBlock(block.id); }}
                            className="p-1.5 hover:bg-slate-700/50 rounded-lg text-red-400/70 hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={13} strokeWidth={2.5} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {draggedBlock && !blocksAtTime.length && (
                  <div className="absolute inset-x-0 inset-y-1 border-2 border-dashed border-purple-500/40 rounded-xl bg-purple-500/5 animate-pulse" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TimeBlockGrid;
