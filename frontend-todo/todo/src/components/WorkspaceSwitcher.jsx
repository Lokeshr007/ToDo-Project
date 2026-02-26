import React, { useState } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { ChevronDown, Plus, Settings } from 'lucide-react';
import CreateWorkspaceModal from './workspace/CreateWorkspaceModal';

const WorkspaceSwitcher = () => {
  const { workspaces, currentWorkspace, switchWorkspace, loading } = useWorkspace();
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  if (loading) {
    return (
      <div className="px-4 py-2">
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <span className="truncate">
            {currentWorkspace?.name || 'Select Workspace'}
          </span>
          <ChevronDown className="w-4 h-4 ml-2" />
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute left-0 right-0 z-20 mt-2 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="py-1 max-h-60 overflow-auto">
                {workspaces.map((workspace) => (
                  <button
                    key={workspace.id}
                    onClick={() => {
                      switchWorkspace(workspace.id);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      currentWorkspace?.id === workspace.id
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'text-gray-700 dark:text-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{workspace.name}</span>
                      {workspace.role && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {workspace.role.toLowerCase()}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    setShowCreateModal(true);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Workspace
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <CreateWorkspaceModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </>
  );
};

export default WorkspaceSwitcher;