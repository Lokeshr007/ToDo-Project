import { useState, useEffect } from 'react';
import { timeBlockApi } from '../api/timeBlockApi';
import { taskToast } from '@/shared/components/QuantumToaster';

export const useTimeBlocks = (startDate, endDate) => {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (startDate && endDate) {
      fetchBlocks();
    }
  }, [startDate, endDate]);

  const fetchBlocks = async () => {
    try {
      setLoading(true);
      const data = await timeBlockApi.getTimeBlocks(startDate, endDate);
      setBlocks(data);
      setError(null);
    } catch (err) {
      setError(err);
      console.error('Failed to fetch time blocks:', err);
    } finally {
      setLoading(false);
    }
  };

  const createBlock = async (blockData) => {
    try {
      const newBlock = await timeBlockApi.createTimeBlock(blockData);
      setBlocks(prev => [...prev, newBlock]);
      taskToast.success('Time block created');
      return newBlock;
    } catch (err) {
      taskToast.error('Failed to create time block');
      throw err;
    }
  };

  const updateBlock = async (id, blockData) => {
    try {
      const updated = await timeBlockApi.updateTimeBlock(id, blockData);
      setBlocks(prev => prev.map(b => b.id === id ? updated : b));
      taskToast.success('Time block updated');
      return updated;
    } catch (err) {
      taskToast.error('Failed to update time block');
      throw err;
    }
  };

  const deleteBlock = async (id) => {
    try {
      await timeBlockApi.deleteTimeBlock(id);
      setBlocks(prev => prev.filter(b => b.id !== id));
      taskToast.success('Time block deleted');
    } catch (err) {
      taskToast.error('Failed to delete time block');
      throw err;
    }
  };

  const reorderBlocks = async (reorderedBlocks) => {
    try {
      await timeBlockApi.reorderTimeBlocks(reorderedBlocks);
      setBlocks(reorderedBlocks);
      taskToast.success('Blocks reordered');
    } catch (err) {
      taskToast.error('Failed to reorder blocks');
      throw err;
    }
  };

  const getTotalFocusTime = () => {
    return blocks.reduce((total, block) => {
      const start = new Date(block.startTime);
      const end = new Date(block.endTime);
      return total + (end - start) / (1000 * 60); // minutes
    }, 0);
  };

  return {
    blocks,
    loading,
    error,
    createBlock,
    updateBlock,
    deleteBlock,
    reorderBlocks,
    getTotalFocusTime,
    refreshBlocks: fetchBlocks
  };
};
