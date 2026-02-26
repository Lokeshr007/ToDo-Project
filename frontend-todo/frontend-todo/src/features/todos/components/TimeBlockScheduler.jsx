import React, { useState, useEffect } from 'react';
import {
  Clock,
  Plus,
  X,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Save,
  Trash2,
  Edit2,
  Check,
  Sun,
  Moon,
  Coffee,
  Briefcase,
  BookOpen,
  Heart,
  Zap
} from 'lucide-react';
import { format, addDays, subDays, parseISO, isSameDay } from 'date-fns';
import { useAuth } from '@/app/providers/AuthContext';
import { timeBlockApi } from '../api/timeBlockApi';
import { todoApi } from '@/services/api/todoApi';
import toast from 'react-hot-toast';

const TimeBlockScheduler = ({ onBlockSelect, selectedDate = new Date() }) => {
  const [blocks, setBlocks] = useState([]);
  const [todos, setTodos] = useState([]);
  const [currentDate, setCurrentDate] = useState(selectedDate);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingBlock, setEditingBlock] = useState(null);
  const [draggedBlock, setDraggedBlock] = useState(null);
  const [viewMode, setViewMode] = useState('day'); // day, week
  const [stats, setStats] = useState({
    totalPlanned: 0,
    totalCompleted: 0,
    focusScore: 0,
    productivity: 0
  });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '09:00',
    endTime: '10:00',
    category: 'work',
    color: '#8b5cf6',
    todoId: '',
    priority: 'medium',
    recurring: false,
    recurringType: 'daily'
  });

  const categories = [
    { id: 'work', label: 'Work', icon: Briefcase, color: '#8b5cf6' },
    { id: 'study', label: 'Study', icon: BookOpen, color: '#10b981' },
    { id: 'personal', label: 'Personal', icon: Heart, color: '#ef4444' },
    { id: 'break', label: 'Break', icon: Coffee, color: '#f59e0b' },
    { id: 'fitness', label: 'Fitness', icon: Zap, color: '#3b82f6' }
  ];

  useEffect(() => {
    fetchBlocks();
    fetchTodos();
  }, [currentDate]);

  useEffect(() => {
    calculateStats();
  }, [blocks]);

  const fetchBlocks = async () => {
    try {
      const startDate = format(currentDate, 'yyyy-MM-dd');
      const endDate = viewMode === 'day' 
        ? startDate 
        : format(addDays(currentDate, 7), 'yyyy-MM-dd');
      
      const data = await timeBlockApi.getTimeBlocks(startDate, endDate);
      setBlocks(data);
    } catch (error) {
      console.error('Failed to fetch time blocks:', error);
      toast.error('Failed to load schedule');
    }
  };

  const fetchTodos = async () => {
    try {
      const data = await todoApi.getTodos();
      setTodos(data.filter(todo => todo.status !== 'COMPLETED'));
    } catch (error) {
      console.error('Failed to fetch todos:', error);
    }
  };

  const calculateStats = () => {
    const todayBlocks = blocks.filter(block => 
      isSameDay(parseISO(block.startTime), currentDate)
    );

    const totalMinutes = todayBlocks.reduce((acc, block) => {
      const start = parseISO(block.startTime);
      const end = parseISO(block.endTime);
      return acc + (end - start) / (1000 * 60);
    }, 0);

    const completedBlocks = todayBlocks.filter(b => b.completed).length;
    const completionRate = todayBlocks.length > 0 
      ? (completedBlocks / todayBlocks.length) * 100 
      : 0;

    const focusScore = Math.min(100, Math.round(
      (totalMinutes / 480) * 100 // Based on 8-hour focus day
    ));

    setStats({
      totalPlanned: totalMinutes,
      totalCompleted: completedBlocks,
      focusScore,
      productivity: Math.round(completionRate)
    });
  };

  const createTimeBlock = async () => {
    if (!formData.title.trim()) {
      toast.error('Please enter a block title');
      return;
    }

    try {
      const startDateTime = `${format(currentDate, 'yyyy-MM-dd')}T${formData.startTime}:00`;
      const endDateTime = `${format(currentDate, 'yyyy-MM-dd')}T${formData.endTime}:00`;

      if (new Date(endDateTime) <= new Date(startDateTime)) {
        toast.error('End time must be after start time');
        return;
      }

      const blockData = {
        ...formData,
        startTime: startDateTime,
        endTime: endDateTime,
        date: format(currentDate, 'yyyy-MM-dd')
      };

      const response = await timeBlockApi.createTimeBlock(blockData);
      setBlocks(prev => [...prev, response]);
      setShowCreateModal(false);
      resetForm();
      toast.success('Time block created successfully');

      // If linked to a todo, update todo
      if (formData.todoId) {
        toast.success('Task linked to time block');
      }
    } catch (error) {
      console.error('Failed to create time block:', error);
      toast.error('Failed to create time block');
    }
  };

  const updateTimeBlock = async () => {
    if (!editingBlock) return;

    try {
      const startDateTime = `${format(currentDate, 'yyyy-MM-dd')}T${formData.startTime}:00`;
      const endDateTime = `${format(currentDate, 'yyyy-MM-dd')}T${formData.endTime}:00`;

      const blockData = {
        ...formData,
        startTime: startDateTime,
        endTime: endDateTime
      };

      const response = await timeBlockApi.updateTimeBlock(editingBlock.id, blockData);
      setBlocks(prev => prev.map(b => b.id === editingBlock.id ? response : b));
      setEditingBlock(null);
      setShowCreateModal(false);
      resetForm();
      toast.success('Time block updated successfully');
    } catch (error) {
      console.error('Failed to update time block:', error);
      toast.error('Failed to update time block');
    }
  };

  const deleteTimeBlock = async (id) => {
    if (!window.confirm('Are you sure you want to delete this time block?')) return;

    try {
      await timeBlockApi.deleteTimeBlock(id);
      setBlocks(prev => prev.filter(b => b.id !== id));
      toast.success('Time block deleted');
    } catch (error) {
      console.error('Failed to delete time block:', error);
      toast.error('Failed to delete time block');
    }
  };

  const toggleBlockCompletion = async (block) => {
    try {
      const updated = await timeBlockApi.updateTimeBlock(block.id, {
        ...block,
        completed: !block.completed,
        completedAt: !block.completed ? new Date().toISOString() : null
      });
      
      setBlocks(prev => prev.map(b => b.id === block.id ? updated : b));
      
      if (!block.completed) {
        toast.success('Great job! Block completed 🎉');
        
        // If linked to todo, check if it should be auto-completed
        if (block.todoId) {
          setTimeout(() => {
            if (window.confirm('Would you like to mark the linked task as complete?')) {
              todoApi.updateTodoStatus(block.todoId, 'COMPLETED');
            }
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Failed to update block:', error);
    }
  };

  const handleDragStart = (block) => {
    setDraggedBlock(block);
  };

  const handleDrop = (targetTime) => {
    if (!draggedBlock) return;

    // Calculate new time based on drop position
    const duration = parseISO(draggedBlock.endTime) - parseISO(draggedBlock.startTime);
    const newStartTime = new Date(`${format(currentDate, 'yyyy-MM-dd')}T${targetTime}:00`);
    const newEndTime = new Date(newStartTime.getTime() + duration);

    // Update block with new time
    updateTimeBlock({
      ...draggedBlock,
      startTime: newStartTime.toISOString(),
      endTime: newEndTime.toISOString()
    });

    setDraggedBlock(null);
    toast.success('Time block rescheduled');
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      startTime: '09:00',
      endTime: '10:00',
      category: 'work',
      color: '#8b5cf6',
      todoId: '',
      priority: 'medium',
      recurring: false,
      recurringType: 'daily'
    });
  };

  const editBlock = (block) => {
    setEditingBlock(block);
    setFormData({
      title: block.title,
      description: block.description || '',
      startTime: format(parseISO(block.startTime), 'HH:mm'),
      endTime: format(parseISO(block.endTime), 'HH:mm'),
      category: block.category,
      color: block.color,
      todoId: block.todoId || '',
      priority: block.priority,
      recurring: block.recurring || false,
      recurringType: block.recurringType || 'daily'
    });
    setShowCreateModal(true);
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let i = 0; i < 24; i++) {
      const hour = i.toString().padStart(2, '0');
      slots.push(`${hour}:00`);
      slots.push(`${hour}:30`);
    }
    return slots;
  };

  const getBlocksForTime = (time) => {
    const timeStr = `${format(currentDate, 'yyyy-MM-dd')}T${time}:00`;
    const timeDate = new Date(timeStr).getTime();

    return blocks.filter(block => {
      const start = parseISO(block.startTime).getTime();
      const end = parseISO(block.endTime).getTime();
      return timeDate >= start && timeDate < end;
    });
  };

  const getCategoryIcon = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.icon : Briefcase;
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Clock className="text-purple-400" size={24} />
            Time Block Scheduler
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                viewMode === 'day'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Day
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                viewMode === 'week'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Week
            </button>
          </div>
        </div>

        {/* Date Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentDate(subDays(currentDate, viewMode === 'day' ? 1 : 7))}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <ChevronLeft size={20} className="text-slate-400" />
          </button>
          
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-slate-400" />
            <span className="text-white font-medium">
              {viewMode === 'day' 
                ? format(currentDate, 'EEEE, MMMM d, yyyy')
                : `${format(currentDate, 'MMM d')} - ${format(addDays(currentDate, 7), 'MMM d, yyyy')}`}
            </span>
          </div>

          <button
            onClick={() => setCurrentDate(addDays(currentDate, viewMode === 'day' ? 1 : 7))}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <ChevronRight size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-3 mt-6">
          <div className="bg-slate-700/30 rounded-xl p-3">
            <p className="text-sm text-slate-400">Planned Today</p>
            <p className="text-2xl font-bold text-white">
              {Math.round(stats.totalPlanned / 60)}h {stats.totalPlanned % 60}m
            </p>
          </div>
          <div className="bg-slate-700/30 rounded-xl p-3">
            <p className="text-sm text-slate-400">Completed</p>
            <p className="text-2xl font-bold text-green-400">
              {stats.totalCompleted}/{blocks.filter(b => isSameDay(parseISO(b.startTime), currentDate)).length}
            </p>
          </div>
          <div className="bg-slate-700/30 rounded-xl p-3">
            <p className="text-sm text-slate-400">Focus Score</p>
            <p className="text-2xl font-bold text-purple-400">{stats.focusScore}%</p>
          </div>
          <div className="bg-slate-700/30 rounded-xl p-3">
            <p className="text-sm text-slate-400">Productivity</p>
            <p className="text-2xl font-bold text-blue-400">{stats.productivity}%</p>
          </div>
        </div>

        {/* Add Block Button */}
        <button
          onClick={() => {
            setEditingBlock(null);
            resetForm();
            setShowCreateModal(true);
          }}
          className="w-full mt-4 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={18} />
          Add Time Block
        </button>
      </div>

      {/* Time Grid */}
      <div className="p-6 max-h-[600px] overflow-y-auto">
        <div className="space-y-1">
          {generateTimeSlots().map((time, index) => {
            const blocksAtTime = getBlocksForTime(time);
            const isHour = time.endsWith(':00');

            return (
              <div
                key={time}
                className={`relative flex group ${
                  isHour ? 'h-12' : 'h-8'
                } border-t border-slate-700/50`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(time)}
              >
                {/* Time Label */}
                <div className="w-16 text-xs text-slate-500 py-1">
                  {time}
                </div>

                {/* Block Container */}
                <div className="flex-1 relative">
                  {blocksAtTime.map((block, blockIndex) => {
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
                        className={`absolute left-0 right-0 rounded-lg p-2 cursor-move transition-all ${
                          block.completed ? 'opacity-50' : ''
                        }`}
                        style={{
                          backgroundColor: block.color + '20',
                          borderLeft: `4px solid ${block.color}`,
                          top: 0,
                          height: `calc(${(parseISO(block.endTime) - parseISO(block.startTime)) / (1000 * 60 * 30)} * 2rem)`,
                          zIndex: 10
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1">
                              <CategoryIcon size={12} style={{ color: block.color }} />
                              <p className="text-xs font-medium text-white truncate">
                                {block.title}
                              </p>
                            </div>
                            <p className="text-xs text-slate-400">
                              {startTime} - {endTime}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => toggleBlockCompletion(block)}
                              className={`p-1 rounded hover:bg-slate-700 ${
                                block.completed ? 'text-green-400' : 'text-slate-400'
                              }`}
                            >
                              <Check size={12} />
                            </button>
                            <button
                              onClick={() => editBlock(block)}
                              className="p-1 hover:bg-slate-700 rounded text-slate-400"
                            >
                              <Edit2 size={12} />
                            </button>
                            <button
                              onClick={() => deleteTimeBlock(block.id)}
                              className="p-1 hover:bg-slate-700 rounded text-red-400"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Drop Zone Indicator */}
                  {draggedBlock && !blocksAtTime.length && (
                    <div className="absolute inset-0 border-2 border-dashed border-purple-500/50 rounded-lg bg-purple-500/10" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">
                {editingBlock ? 'Edit Time Block' : 'Create Time Block'}
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingBlock(null);
                  resetForm();
                }}
                className="p-1 hover:bg-slate-700 rounded"
              >
                <X size={18} className="text-slate-400" />
              </button>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Block title *"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                autoFocus
              />

              <textarea
                placeholder="Description (optional)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="2"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">End Time</label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-xl text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Category</label>
                <div className="grid grid-cols-3 gap-2">
                  {categories.map(cat => {
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setFormData({ 
                          ...formData, 
                          category: cat.id,
                          color: cat.color 
                        })}
                        className={`flex flex-col items-center p-2 rounded-xl border transition-colors ${
                          formData.category === cat.id
                            ? 'border-purple-500 bg-purple-500/10'
                            : 'border-slate-600 hover:border-slate-500'
                        }`}
                      >
                        <Icon size={18} style={{ color: cat.color }} />
                        <span className="text-xs text-slate-300 mt-1">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Link to Task (Optional)</label>
                <select
                  value={formData.todoId}
                  onChange={(e) => setFormData({ ...formData, todoId: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-xl text-white"
                >
                  <option value="">No linked task</option>
                  {todos.map(todo => (
                    <option key={todo.id} value={todo.id}>{todo.title}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="recurring"
                  checked={formData.recurring}
                  onChange={(e) => setFormData({ ...formData, recurring: e.target.checked })}
                  className="rounded border-slate-600"
                />
                <label htmlFor="recurring" className="text-sm text-slate-300">
                  Recurring block
                </label>
                
                {formData.recurring && (
                  <select
                    value={formData.recurringType}
                    onChange={(e) => setFormData({ ...formData, recurringType: e.target.value })}
                    className="ml-2 px-2 py-1 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekdays">Weekdays</option>
                    <option value="weekly">Weekly</option>
                  </select>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingBlock(null);
                    resetForm();
                  }}
                  className="px-4 py-2 text-slate-400 hover:bg-slate-700 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={editingBlock ? updateTimeBlock : createTimeBlock}
                  disabled={!formData.title.trim()}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl disabled:opacity-50 flex items-center gap-2"
                >
                  <Save size={16} />
                  {editingBlock ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeBlockScheduler;