import React, { useState, useEffect } from 'react';
import { X, Clock, Paperclip, MessageSquare, User, Calendar, Flag, Save } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import { todoApi } from '../../services/api/todoApi';
import TaskComments from '../tasks/TaskComments';
import TaskAttachments from '../tasks/TaskAttachments';
import TimeTracker from '../tasks/TimeTracker';

const priorityColors = {
  CRITICAL: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
  HIGH: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
  MEDIUM: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
  LOW: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
};

const statusOptions = [
  'BACKLOG', 'PENDING', 'IN_PROGRESS', 'REVIEW', 'COMPLETED', 'BLOCKED'
];

const TaskDetailModal = ({ isOpen, onClose, task, onUpdate }) => {
  const { showNotification } = useNotification();
  const [activeTab, setActiveTab] = useState('details');
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState(task);
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [timeEntries, setTimeEntries] = useState([]);

  useEffect(() => {
    if (task && isOpen) {
      setEditedTask(task);
      loadComments();
      loadAttachments();
      loadTimeEntries();
    }
  }, [task, isOpen]);

  const loadComments = async () => {
    try {
      const data = await todoApi.getComments(task.id);
      setComments(data);
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  };

  const loadAttachments = async () => {
    try {
      const data = await todoApi.getAttachments(task.id);
      setAttachments(data);
    } catch (error) {
      console.error('Failed to load attachments:', error);
    }
  };

  const loadTimeEntries = async () => {
    try {
      const data = await todoApi.getTimeEntries(task.id);
      setTimeEntries(data);
    } catch (error) {
      console.error('Failed to load time entries:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const updated = await todoApi.updateTodo(task.id, editedTask);
      onUpdate(updated);
      setIsEditing(false);
      showNotification('Task updated successfully', 'success');
    } catch (error) {
      showNotification('Failed to update task', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (content) => {
    try {
      await todoApi.addComment(task.id, content);
      loadComments();
      showNotification('Comment added', 'success');
    } catch (error) {
      showNotification('Failed to add comment', 'error');
    }
  };

  const handleUploadAttachment = async (file) => {
    try {
      await todoApi.uploadAttachment(task.id, file);
      loadAttachments();
      showNotification('File uploaded successfully', 'success');
    } catch (error) {
      showNotification('Failed to upload file', 'error');
    }
  };

  const handleDeleteAttachment = async (attachmentId) => {
    try {
      await todoApi.deleteAttachment(attachmentId);
      loadAttachments();
      showNotification('Attachment deleted', 'success');
    } catch (error) {
      showNotification('Failed to delete attachment', 'error');
    }
  };

  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${priorityColors[task.priority]}`}>
                {task.priority}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                #{task.id}
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex px-6 -mb-px">
              {['details', 'comments', 'attachments', 'time'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-3 px-4 text-sm font-medium capitalize border-b-2 ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
            {activeTab === 'details' && (
              <div className="space-y-4">
                {isEditing ? (
                  <div>
                    <input
                      type="text"
                      value={editedTask.item}
                      onChange={(e) => setEditedTask({ ...editedTask, item: e.target.value })}
                      className="w-full text-xl font-semibold bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500 dark:text-white"
                    />
                    <textarea
                      value={editedTask.description || ''}
                      onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                      className="w-full mt-4 p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      rows="4"
                      placeholder="Add description..."
                    />
                  </div>
                ) : (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {task.item}
                    </h3>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">
                      {task.description || 'No description provided'}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Flag className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-gray-500 dark:text-gray-400">Status:</span>
                      {isEditing ? (
                        <select
                          value={editedTask.status}
                          onChange={(e) => setEditedTask({ ...editedTask, status: e.target.value })}
                          className="ml-2 p-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:bg-gray-700 dark:text-white"
                        >
                          {statusOptions.map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="ml-2 font-medium dark:text-white">{task.status}</span>
                      )}
                    </div>

                    <div className="flex items-center text-sm">
                      <User className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-gray-500 dark:text-gray-400">Assignee:</span>
                      <span className="ml-2 font-medium dark:text-white">
                        {task.assignedTo?.name || 'Unassigned'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-gray-500 dark:text-gray-400">Due Date:</span>
                      <span className="ml-2 font-medium dark:text-white">
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                      </span>
                    </div>

                    <div className="flex items-center text-sm">
                      <Clock className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-gray-500 dark:text-gray-400">Created:</span>
                      <span className="ml-2 font-medium dark:text-white">
                        {new Date(task.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {task.labels && task.labels.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Labels:</span>
                    {task.labels.map((label, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'comments' && (
              <TaskComments
                comments={comments}
                onAddComment={handleAddComment}
              />
            )}

            {activeTab === 'attachments' && (
              <TaskAttachments
                attachments={attachments}
                onUpload={handleUploadAttachment}
                onDelete={handleDeleteAttachment}
              />
            )}

            {activeTab === 'time' && (
              <TimeTracker
                taskId={task.id}
                timeEntries={timeEntries}
                onTimeUpdate={loadTimeEntries}
              />
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-end space-x-3">
              {isEditing ? (
                <>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditedTask(task);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30"
                >
                  Edit Task
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;