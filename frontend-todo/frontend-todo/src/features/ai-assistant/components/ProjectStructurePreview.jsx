import { useState } from 'react';
import { 
  FolderTree,
  Layout,
  Columns,
  CheckCircle,
  Clock,
  Tag,
  Users,
  Calendar,
  ChevronRight,
  ChevronDown,
  Plus,
  Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function ProjectStructurePreview({ projectStructure, onViewProject }) {
  const [expandedBoards, setExpandedBoards] = useState({});
  const navigate = useNavigate();

  if (!projectStructure) return null;

  const toggleBoard = (boardIndex) => {
    setExpandedBoards(prev => ({ ...prev, [boardIndex]: !prev[boardIndex] }));
  };

  const handleViewProject = () => {
    if (onViewProject) {
      onViewProject(projectStructure.createdProjectId);
    } else {
      navigate(`/app/projects/${projectStructure.createdProjectId}`);
    }
  };

  const getColumnColor = (type) => {
    switch(type?.toLowerCase()) {
      case 'todo': return 'bg-gray-500';
      case 'in_progress': return 'bg-blue-500';
      case 'review': return 'bg-purple-500';
      case 'done': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl border border-slate-700 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg">
            <FolderTree size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Project Structure</h3>
            <p className="text-sm text-slate-400">{projectStructure.projectName}</p>
          </div>
        </div>

        <button
          onClick={handleViewProject}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm flex items-center gap-2"
        >
          <Eye size={16} />
          View Project
        </button>
      </div>

      {/* Project Info */}
      <div className="mb-6 p-4 bg-slate-700/30 rounded-lg">
        <p className="text-sm text-slate-300">{projectStructure.projectDescription}</p>
        <div className="flex items-center gap-4 mt-3">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Layout size={12} />
            {projectStructure.boards?.length || 0} Boards
          </span>
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Columns size={12} />
            {projectStructure.boards?.reduce((sum, b) => sum + (b.columns?.length || 0), 0)} Columns
          </span>
        </div>
      </div>

      {/* Boards */}
      <div className="space-y-4">
        {projectStructure.boards?.map((board, boardIndex) => (
          <div key={boardIndex} className="bg-slate-700/30 rounded-lg overflow-hidden">
            {/* Board Header */}
            <div
              onClick={() => toggleBoard(boardIndex)}
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-700/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: board.boardColor }}
                />
                <div>
                  <h4 className="text-white font-medium">{board.boardName}</h4>
                  <p className="text-xs text-slate-400">{board.columns?.length || 0} columns</p>
                </div>
              </div>
              <button className="text-slate-400">
                {expandedBoards[boardIndex] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
              </button>
            </div>

            {/* Columns */}
            {expandedBoards[boardIndex] && (
              <div className="p-4 border-t border-slate-600/50">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {board.columns?.map((column, colIndex) => (
                    <div
                      key={colIndex}
                      className="p-3 bg-slate-800/50 rounded-lg"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-2 h-2 rounded-full ${getColumnColor(column.columnType)}`} />
                        <span className="text-sm text-white font-medium">{column.columnName}</span>
                        {column.wipLimit > 0 && (
                          <span className="text-xs text-slate-400 ml-auto">
                            WIP: {column.wipLimit}
                          </span>
                        )}
                      </div>
                      
                      {/* Tasks Preview */}
                      {column.tasks && column.tasks.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {column.tasks.slice(0, 3).map((task, taskIndex) => (
                            <div
                              key={taskIndex}
                              className="p-2 bg-slate-700/30 rounded text-xs text-slate-300"
                            >
                              {task.title}
                            </div>
                          ))}
                          {column.tasks.length > 3 && (
                            <p className="text-xs text-slate-500 text-center">
                              +{column.tasks.length - 3} more
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Success Message */}
      <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
        <div className="flex items-start gap-3">
          <CheckCircle size={18} className="text-green-400 mt-0.5" />
          <div>
            <p className="text-sm text-green-400 font-medium">Project Created Successfully!</p>
            <p className="text-xs text-slate-400 mt-1">
              Your learning path has been organized into boards and columns. 
              Start working through your tasks day by day.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectStructurePreview;
