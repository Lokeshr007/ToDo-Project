import { useState, useCallback } from 'react';
import API from '@/services/api';
import { taskToast } from '@/shared/components/QuantumToaster';

export const useAttachments = () => {
  const [attachments, setAttachments] = useState({}); // { todoId: [] }
  const [loading, setLoading] = useState({}); // { todoId: boolean }

  const fetchAttachments = useCallback(async (todoId) => {
    setLoading(prev => ({ ...prev, [todoId]: true }));
    try {
      const response = await API.get(`/attachments/todo/${todoId}`);
      setAttachments(prev => ({ ...prev, [todoId]: response.data }));
    } catch (error) {
      console.error("Failed to fetch attachments:", error);
    } finally {
      setLoading(prev => ({ ...prev, [todoId]: false }));
    }
  }, []);

  const deleteAttachment = useCallback(async (attachmentId, todoId) => {
    try {
      await API.delete(`/attachments/${attachmentId}`);
      setAttachments(prev => ({
        ...prev,
        [todoId]: prev[todoId].filter(a => a.id !== attachmentId)
      }));
      taskToast.success("Attachment deleted");
    } catch (error) {
      console.error("Failed to delete attachment:", error);
      taskToast.error("Failed to delete attachment");
    }
  }, []);

  const addAttachmentToState = useCallback((todoId, attachment) => {
    setAttachments(prev => ({
      ...prev,
      [todoId]: [...(prev[todoId] || []), attachment]
    }));
  }, []);

  return {
    attachments,
    loadingAttachments: loading,
    fetchAttachments,
    deleteAttachment,
    addAttachmentToState
  };
};
