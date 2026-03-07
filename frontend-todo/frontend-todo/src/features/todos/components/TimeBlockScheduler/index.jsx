import React, { useState, useEffect, useCallback } from 'react';
import { Briefcase, BookOpen, Heart, Coffee, Zap } from 'lucide-react';
import { format, addDays, subDays, parseISO, isSameDay } from 'date-fns';
import { timeBlockApi } from '../../api/timeBlockApi';
import { todoApi } from '@/services/api/todoApi';
import toast from 'react-hot-toast';

import TimeBlockHeader from './TimeBlockHeader';
import TimeBlockStats from './TimeBlockStats';
import TimeBlockGrid from './TimeBlockGrid';
import TimeBlockModal from './TimeBlockModal';

const TimeBlockScheduler = ({ onBlockSelect, selectedDate = new Date() }) => {
  const [blocks, setBlocks] = useState([]);
  const [todos, setTodos] = useState([]);
  const [currentDate, setCurrentDate] = useState(selectedDate);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingBlock, setEditingBlock] = useState(null);
  const [draggedBlock, setDraggedBlock] = useState(null);
  const [viewMode, setViewMode] = useState('day');
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

  const fetchBlocks = useCallback(async () => {
    try {
      const startDate = format(currentDate, 'yyyy-MM-dd');
      const endDate = viewMode === 'day' 
        ? startDate 
        : format(addDays(currentDate, 7), 'yyyy-MM-dd');
      
      const data = await timeBlockApi.getTimeBlocks(startDate, endDate);
      setBlocks(data || []);
    } catch (error) {
      console.error('Failed to fetch time blocks:', error);
      toast.error('Failed to load schedule');
    }
  }, [currentDate, viewMode]);

  const fetchTodos = useCallback(async () => {
    try {
      const data = await todoApi.getTodos();
      setTodos((data || []).filter(todo => todo.status !== 'COMPLETED'));
    } catch (error) {
      console.error('Failed to fetch todos:', error);
    }
  }, []);

  useEffect(() => {
    fetchBlocks();
    fetchTodos();
  }, [fetchBlocks, fetchTodos]);

  const calculateStats = useCallback(() => {
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

    const focusScore = Math.min(100, Math.round((totalMinutes / 480) * 100));

    setStats({
      totalPlanned: totalMinutes,
      totalCompleted: completedBlocks,
      focusScore,
      productivity: Math.round(completionRate)
    });
  }, [blocks, currentDate]);

  useEffect(() => {
    calculateStats();
  }, [calculateStats]);

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error('Please enter a session title');
      return;
    }

    try {
      const startDateTime = `${format(currentDate, 'yyyy-MM-dd')}T${formData.startTime}:00`;
      const endDateTime = `${format(currentDate, 'yyyy-MM-dd')}T${formData.endTime}:00`;

      if (new Date(endDateTime) <= new Date(startDateTime)) {
        toast.error('Conclusion time must be post-commencement');
        return;
      }

      const blockData = {
        ...formData,
        startTime: startDateTime,
        endTime: endDateTime,
        date: format(currentDate, 'yyyy-MM-dd')
      };

      if (editingBlock) {
        const response = await timeBlockApi.updateTimeBlock(editingBlock.id, blockData);
        setBlocks(prev => prev.map(b => b.id === editingBlock.id ? response : b));
        toast.success('Focus session updated');
      } else {
        const response = await timeBlockApi.createTimeBlock(blockData);
        setBlocks(prev => [...prev, response]);
        toast.success('Focus session initialized');
      }

      setShowCreateModal(false);
      setEditingBlock(null);
      resetForm();
    } catch (error) {
      console.error('Failed to save time block:', error);
      toast.error('System failure: Could not save session');
    }
  };

  const deleteTimeBlock = async (id) => {
    if (!window.confirm('Erase this focus session?')) return;
    try {
      await timeBlockApi.deleteTimeBlock(id);
      setBlocks(prev => prev.filter(b => b.id !== id));
      toast.success('Session erased');
    } catch (error) {
      console.error('Failed to delete time block:', error);
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
      if (!block.completed) toast.success('Focus session achieved 🎉');
    } catch (error) {
      console.error('Failed to update block:', error);
    }
  };

  const handleDrop = async (targetTime) => {
    if (!draggedBlock) return;
    const duration = parseISO(draggedBlock.endTime) - parseISO(draggedBlock.startTime);
    const newStartTime = new Date(`${format(currentDate, 'yyyy-MM-dd')}T${targetTime}:00`);
    const newEndTime = new Date(newStartTime.getTime() + duration);

    try {
      const response = await timeBlockApi.updateTimeBlock(draggedBlock.id, {
        ...draggedBlock,
        startTime: newStartTime.toISOString(),
        endTime: newEndTime.toISOString()
      });
      setBlocks(prev => prev.map(b => b.id === draggedBlock.id ? response : b));
      toast.success('Session rescheduled');
    } catch (err) {
      toast.error('Relocation failed');
    }
    setDraggedBlock(null);
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

  const generateTimeSlots = () => {
    const slots = [];
    for (let i = 4; i < 24; i++) { // Start from 4 AM for better viewport
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
    <div className="bg-slate-800/40 backdrop-blur-2xl rounded-3xl border border-slate-700/50 shadow-2xl overflow-hidden max-w-4xl mx-auto">
      <TimeBlockHeader 
        currentDate={currentDate}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onPrevDate={() => setCurrentDate(subDays(currentDate, viewMode === 'day' ? 1 : 7))}
        onNextDate={() => setCurrentDate(addDays(currentDate, viewMode === 'day' ? 1 : 7))}
        onAddBlock={() => { setEditingBlock(null); resetForm(); setShowCreateModal(true); }}
      />

      <TimeBlockStats 
        stats={stats} 
        blockCount={blocks.filter(b => isSameDay(parseISO(b.startTime), currentDate)).length} 
      />

      <TimeBlockGrid 
        generateTimeSlots={generateTimeSlots}
        getBlocksForTime={getBlocksForTime}
        handleDrop={handleDrop}
        handleDragStart={setDraggedBlock}
        draggedBlock={draggedBlock}
        getCategoryIcon={getCategoryIcon}
        toggleBlockCompletion={toggleBlockCompletion}
        editBlock={(block) => {
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
        }}
        deleteTimeBlock={deleteTimeBlock}
      />

      <TimeBlockModal 
        show={showCreateModal}
        onClose={() => { setShowCreateModal(false); setEditingBlock(null); resetForm(); }}
        editingBlock={editingBlock}
        formData={formData}
        setFormData={setFormData}
        onSave={handleSave}
        categories={categories}
        todos={todos}
      />
    </div>
  );
};

export default TimeBlockScheduler;
