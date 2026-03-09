import { useState } from 'react';
import API from '@/services/api';
import { taskToast } from '@/shared/components/QuantumToaster';

export const useComments = () => {
  const [comments, setComments] = useState({});
  const [loadingComments, setLoadingComments] = useState({});
  const [commentText, setCommentText] = useState({});

  const fetchComments = async (todoId) => {
    if (loadingComments[todoId]) return;
    
    setLoadingComments(prev => ({ ...prev, [todoId]: true }));
    
    try {
      const response = await API.get(`/todos/${todoId}/comments`);
      setComments(prev => ({ ...prev, [todoId]: response.data }));
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    } finally {
      setLoadingComments(prev => ({ ...prev, [todoId]: false }));
    }
  };

  const addComment = async (todoId) => {
    const text = commentText[todoId];
    if (!text?.trim()) return;
    
    try {
      const response = await API.post(`/todos/${todoId}/comments`, { content: text });
      
      setComments(prev => ({
        ...prev,
        [todoId]: [...(prev[todoId] || []), response.data]
      }));
      
      setCommentText(prev => ({ ...prev, [todoId]: '' }));
      taskToast.success("Comment added");
    } catch (error) {
      console.error("Failed to add comment:", error);
      taskToast.error("Failed to add comment");
    }
  };

  const updateCommentText = (todoId, text) => {
    setCommentText(prev => ({ ...prev, [todoId]: text }));
  };

  return {
    comments,
    loadingComments,
    commentText,
    fetchComments,
    addComment,
    updateCommentText
  };
};
