import { useState, useCallback } from "react";
import ReactDOM from "react-dom";
import { 
  Sparkles, 
  Brain, 
  Zap, 
  BarChart3, 
  Calendar, 
  Clock, 
  Target,
  FileText,
  Plus
} from "lucide-react";
import FileUploadZone from "@/features/ai-assistant/components/FileUploadZone";
import TaskGenerationPreview from "@/features/ai-assistant/components/TaskGenerationPreview";
import toast from 'react-hot-toast';
import API from "@/services/api";

function TaskIQHeader({ workspaceId, onTasksCreated }) {
  const [showAI, setShowAI] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [generatedTasks, setGeneratedTasks] = useState([]);
  const [selectedTaskIds, setSelectedTaskIds] = useState(new Set());
  const [step, setStep] = useState('upload'); // 'upload' | 'preview'

  const handleFileUpload = async (file) => {
    if (!file) {
      setUploadedFile(null);
      return;
    }
    
    setUploadedFile(file);
    setProcessing(true);
    
    try {
      // Simulate/Trigger AI analysis
      // In a real app, this would hit an endpoint that parses the file and returns task suggestions
      const formData = new FormData();
      formData.append('file', file);
      formData.append('workspaceId', workspaceId);
      
      const response = await API.post('/ai/parse-plan', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      const payload = response.data.data ? response.data.data : response.data;

      if (payload && payload.tasks) {
        setGeneratedTasks(payload.tasks);
        setSelectedTaskIds(new Set(payload.tasks.map((_, i) => `temp-${i}`)));
        setStep('preview');
      } else {
         toast.error("Failed to extract tasks. Ensure the document contains an actionable curriculum.");
      }
    } catch (error) {
      console.error("Failed to analyze file:", error);
      let errMsg = "AI Analysis failed";
      if (error.response?.data?.message) {
         errMsg = error.response.data.message;
      }
      toast.error(errMsg);
    } finally {
      setProcessing(false);
    }
  };

  const handleCreateTasks = async () => {
    setProcessing(true);
    try {
      const tasksToCreate = generatedTasks.filter((_, i) => selectedTaskIds.has(`temp-${i}`));
      
      for (const task of tasksToCreate) {
        await API.post('/todos', {
          item: task.title,
          description: task.description,
          priority: task.priority || 'NORMAL',
          workspaceId: workspaceId,
          storyPoints: task.estimatedHours
        });
      }
      
      toast.success(`Successfully created ${tasksToCreate.length} tasks!`);
      setShowAI(false);
      setStep('upload');
      setUploadedFile(null);
      if (onTasksCreated) onTasksCreated();
    } catch (error) {
      console.error("Failed to create tasks:", error);
      toast.error("Failed to create some tasks");
    } finally {
      setProcessing(false);
    }
  };

  const tasksByWeek = generatedTasks.reduce((acc, task) => {
    const day = task.dayNumber || task.day || 1;
    const week = Math.ceil(day / 7) || 1;
    if (!acc[week]) acc[week] = [];
    acc[week].push(task);
    return acc;
  }, {});

  return (
    <>
      <button
        onClick={() => setShowAI(!showAI)}
        className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all border ${
          showAI 
            ? 'bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-500/20' 
            : 'bg-white/5 text-purple-400 border-white/10 hover:bg-white/10'
        }`}
        title="AI Intellect Assistant"
      >
        <Brain size={18} />
      </button>

      {showAI && ReactDOM.createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-8 md:p-12 overflow-hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300"
            onClick={() => setShowAI(false)}
          />
          
          {/* Panel */}
          <div className="relative w-full max-w-5xl bg-slate-900 border border-white/10 rounded-[2.5rem] sm:rounded-[3rem] shadow-[0_0_80px_-15px_rgba(168,85,247,0.4)] overflow-hidden flex flex-col h-[85vh] max-h-[850px] animate-in zoom-in-95 fade-in duration-300">
            {/* Header */}
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-purple-900/20 to-indigo-900/20">
              <div className="flex items-center gap-6">
                <div className="p-4 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-xl shadow-purple-500/20">
                  <Sparkles className="text-white" size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">AI Task Intellect</h3>
                  <p className="text-slate-400 text-sm">Transform your study plans and documents into actionable tasks.</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAI(false)}
                className="p-3 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
              >
                <Plus className="rotate-45" size={28} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              {step === 'upload' ? (
                <FileUploadZone 
                  onFileUpload={handleFileUpload}
                  processing={processing}
                  uploadedFile={uploadedFile}
                />
              ) : (
                <TaskGenerationPreview 
                  tasks={generatedTasks}
                  tasksByWeek={tasksByWeek}
                  selectedTasks={selectedTaskIds}
                  onToggleTask={(id) => {
                    const newSet = new Set(selectedTaskIds);
                    if (newSet.has(id)) newSet.delete(id);
                    else newSet.add(id);
                    setSelectedTaskIds(newSet);
                  }}
                  onToggleAll={() => {
                    if (selectedTaskIds.size === generatedTasks.length) setSelectedTaskIds(new Set());
                    else setSelectedTaskIds(new Set(generatedTasks.map((_, i) => `temp-${i}`)));
                  }}
                  onSave={handleCreateTasks}
                  onRegenerate={() => setStep('upload')}
                  onBack={() => setStep('upload')}
                  processing={processing}
                />
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

export default TaskIQHeader;
