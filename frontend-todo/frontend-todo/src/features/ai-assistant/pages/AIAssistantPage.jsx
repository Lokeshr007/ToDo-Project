// frontend/src/features/todos/pages/AiAssistant.jsx
import { useState, useEffect } from "react";
import { 
  Bot, 
  Upload, 
  FileText, 
  Calendar, 
  CheckCircle, 
  AlertCircle,
  Sparkles,
  Clock,
  ListTodo,
  Download,
  X,
  ChevronRight,
  ChevronLeft,
  Save,
  RefreshCw,
  BookOpen,
  Target,
  Zap,
  Brain,
  MessageSquare,
  Send,
  Loader,
  CheckCheck,
  AlertTriangle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import { format, addDays } from 'date-fns';

import API from "@/services/api";
import { useWorkspace } from "@/app/providers/WorkspaceContext";
import FileUploadZone from "../components/FileUploadZone";
import PlanPreview from "../components/PlanPreview";
import TaskGenerationPreview from "../components/TaskGenerationPreview";
import AIAssistantChat from "../components/AIAssistantChat";
import useAIAssistant from "../hooks/useAIAssistant";

function AiAssistant() {
  const [currentStep, setCurrentStep] = useState(1); // 1: Upload, 2: Preview, 3: Generate, 4: Review
  const [uploadedFile, setUploadedFile] = useState(null);
  const [parsedPlan, setParsedPlan] = useState(null);
  const [generatedTasks, setGeneratedTasks] = useState([]);
  const [selectedTasks, setSelectedTasks] = useState(new Set());
  const [processing, setProcessing] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  
  const navigate = useNavigate();
  const { currentWorkspace } = useWorkspace();
  const { 
    parsePlan, 
    generateTasksFromPlan, 
    saveTasks, 
    loading,
    error 
  } = useAIAssistant();

  // Handle file upload
  const handleFileUpload = async (file) => {
    setUploadedFile(file);
    setProcessing(true);
    
    try {
      const plan = await parsePlan(file);
      setParsedPlan(plan);
      setCurrentStep(2);
      
      toast.success('Study plan parsed successfully!', {
        icon: '📚',
        duration: 3000
      });
    } catch (err) {
      toast.error('Failed to parse study plan. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  // Handle plan confirmation and task generation
  const handleConfirmPlan = async () => {
    setProcessing(true);
    
    try {
      const tasks = await generateTasksFromPlan(parsedPlan);
      setGeneratedTasks(tasks);
      
      // Select all tasks by default
      const taskIds = new Set(tasks.map(t => t.id || `temp-${Math.random()}`));
      setSelectedTasks(taskIds);
      
      setCurrentStep(3);
      
      toast.success(`Generated ${tasks.length} tasks for your 60-day plan!`, {
        icon: '✨',
        duration: 3000
      });
    } catch (err) {
      toast.error('Failed to generate tasks. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  // Toggle task selection
  const toggleTaskSelection = (taskId) => {
    setSelectedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  // Select/deselect all tasks
  const toggleAllTasks = () => {
    if (selectedTasks.size === generatedTasks.length) {
      setSelectedTasks(new Set());
    } else {
      const taskIds = new Set(generatedTasks.map(t => t.id || `temp-${Math.random()}`));
      setSelectedTasks(taskIds);
    }
  };

  // Save selected tasks to Todo system
  const handleSaveTasks = async () => {
    if (selectedTasks.size === 0) {
      toast.error('Please select at least one task to save');
      return;
    }

    setProcessing(true);
    
    try {
      const tasksToSave = generatedTasks.filter(t => 
        selectedTasks.has(t.id || `temp-${Math.random()}`)
      );
      
      const savedCount = await saveTasks(tasksToSave, currentWorkspace?.id);
      
      toast.success(
        <div>
          <p className="font-medium">Success! 🎉</p>
          <p className="text-sm">{savedCount} tasks added to your Todo list</p>
        </div>,
        { duration: 5000 }
      );
      
      setCurrentStep(4);
      
      // Navigate to todos after 3 seconds
      setTimeout(() => {
        navigate('/app/todos');
      }, 3000);
      
    } catch (err) {
      toast.error('Failed to save tasks. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  // Handle regeneration
  const handleRegenerate = async () => {
    setProcessing(true);
    
    try {
      const tasks = await generateTasksFromPlan(parsedPlan, { regenerate: true });
      setGeneratedTasks(tasks);
      
      const taskIds = new Set(tasks.map(t => t.id || `temp-${Math.random()}`));
      setSelectedTasks(taskIds);
      
      toast.success('Tasks regenerated successfully!');
    } catch (err) {
      toast.error('Failed to regenerate tasks.');
    } finally {
      setProcessing(false);
    }
  };

  // Add chat message
  const handleSendMessage = async (message) => {
    setChatMessages(prev => [...prev, { role: 'user', content: message }]);
    
    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I can help you modify the plan. What would you like to change? You can ask me to adjust daily tasks, change priorities, or reorganize the schedule." 
      }]);
    }, 1000);
  };

  // Reset the entire flow
  const resetFlow = () => {
    setCurrentStep(1);
    setUploadedFile(null);
    setParsedPlan(null);
    setGeneratedTasks([]);
    setSelectedTasks(new Set());
    setChatMessages([]);
  };

  // Render based on current step
  const renderStep = () => {
    switch(currentStep) {
      case 1:
        return (
          <UploadStep 
            onFileUpload={handleFileUpload}
            processing={processing}
            uploadedFile={uploadedFile}
          />
        );
      
      case 2:
        return (
          <PreviewStep 
            plan={parsedPlan}
            onConfirm={handleConfirmPlan}
            onBack={() => setCurrentStep(1)}
            processing={processing}
            onOpenChat={() => setShowChat(true)}
          />
        );
      
      case 3:
        return (
          <GenerateStep 
            tasks={generatedTasks}
            selectedTasks={selectedTasks}
            onToggleTask={toggleTaskSelection}
            onToggleAll={toggleAllTasks}
            onSave={handleSaveTasks}
            onRegenerate={handleRegenerate}
            onBack={() => setCurrentStep(2)}
            processing={processing}
            onOpenChat={() => setShowChat(true)}
          />
        );
      
      case 4:
        return (
          <SuccessStep 
            taskCount={selectedTasks.size}
            onViewTasks={() => navigate('/app/todos')}
            onCreateAnother={resetFlow}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg">
                <Bot size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  AI Study Plan Assistant
                </h1>
                <p className="text-slate-400 text-sm mt-1">
                  Transform your study plans into actionable daily tasks
                </p>
              </div>
            </div>

            {/* Progress Steps */}
            <div className="hidden md:flex items-center gap-2">
              <StepIndicator step={1} currentStep={currentStep} label="Upload" />
              <ChevronRight size={16} className="text-slate-600" />
              <StepIndicator step={2} currentStep={currentStep} label="Preview" />
              <ChevronRight size={16} className="text-slate-600" />
              <StepIndicator step={3} currentStep={currentStep} label="Generate" />
              <ChevronRight size={16} className="text-slate-600" />
              <StepIndicator step={4} currentStep={currentStep} label="Review" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderStep()}
      </div>

      {/* Floating Chat Button */}
      <button
        onClick={() => setShowChat(true)}
        className="fixed bottom-6 right-6 p-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 z-20"
      >
        <MessageSquare size={24} />
      </button>

      {/* Chat Modal */}
      {showChat && (
        <AIAssistantChat
          messages={chatMessages}
          onSendMessage={handleSendMessage}
          onClose={() => setShowChat(false)}
          context={parsedPlan}
        />
      )}
    </div>
  );
}

// Step Indicator Component
function StepIndicator({ step, currentStep, label }) {
  const isActive = currentStep === step;
  const isCompleted = currentStep > step;
  
  return (
    <div className="flex items-center gap-2">
      <div className={`
        w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
        ${isActive ? 'bg-purple-600 text-white' : 
          isCompleted ? 'bg-green-600 text-white' : 
          'bg-slate-700 text-slate-400'}
      `}>
        {isCompleted ? <CheckCircle size={14} /> : step}
      </div>
      <span className={`text-sm ${isActive ? 'text-white' : 'text-slate-500'}`}>
        {label}
      </span>
    </div>
  );
}

// Upload Step Component
function UploadStep({ onFileUpload, processing, uploadedFile }) {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-8 border border-slate-700">
        <div className="text-center mb-8">
          <div className="inline-flex p-4 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full mb-4">
            <Upload size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Upload Your Study Plan
          </h2>
          <p className="text-slate-400">
            Upload a PDF, DOC, or TXT file containing your 60-day study plan
          </p>
        </div>

        <FileUploadZone 
          onFileUpload={onFileUpload}
          processing={processing}
          uploadedFile={uploadedFile}
          acceptedTypes={['.pdf', '.doc', '.docx', '.txt']}
          maxSize={10 * 1024 * 1024} // 10MB
        />

        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="bg-slate-700/30 p-4 rounded-lg">
            <FileText size={20} className="text-purple-400 mb-2" />
            <h3 className="text-white font-medium mb-1">Supported Formats</h3>
            <p className="text-sm text-slate-400">PDF, DOC, DOCX, TXT</p>
          </div>
          <div className="bg-slate-700/30 p-4 rounded-lg">
            <Calendar size={20} className="text-purple-400 mb-2" />
            <h3 className="text-white font-medium mb-1">60-Day Planning</h3>
            <p className="text-sm text-slate-400">Perfect for long-term goals</p>
          </div>
        </div>

        {/* Example Plans */}
        <div className="mt-8 border-t border-slate-700 pt-8">
          <h3 className="text-lg font-medium text-white mb-4 text-center">
            Need inspiration? Try these templates
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button 
              onClick={() => onFileUpload({ name: 'Web Development Roadmap.pdf' })}
              className="text-left p-3 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              <p className="text-white font-medium">🌐 Web Development</p>
              <p className="text-sm text-slate-400">60-day full stack roadmap</p>
            </button>
            <button 
              onClick={() => onFileUpload({ name: 'Language Learning Plan.pdf' })}
              className="text-left p-3 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              <p className="text-white font-medium">🗣️ Language Learning</p>
              <p className="text-sm text-slate-400">60-day fluency builder</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Preview Step Component
function PreviewStep({ plan, onConfirm, onBack, processing, onOpenChat }) {
  if (!plan) return null;
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <PlanPreview 
          plan={plan} 
          onConfirm={onConfirm}
          onBack={onBack}
          processing={processing}
        />
      </div>
      
      <div className="lg:col-span-1">
        <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700 sticky top-24">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Brain size={20} className="text-purple-400" />
            AI Suggestions
          </h3>
          
          <div className="space-y-4">
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Sparkles size={16} className="text-purple-400 mt-1" />
                <div>
                  <p className="text-sm text-white mb-2">
                    Based on your plan, I recommend:
                  </p>
                  <ul className="text-xs text-slate-300 space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle size={10} className="text-green-400" />
                      Break down large topics into smaller daily chunks
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle size={10} className="text-green-400" />
                      Include review days every week
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle size={10} className="text-green-400" />
                      Set aside 30 mins for practice
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            <button
              onClick={onOpenChat}
              className="w-full p-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-white flex items-center justify-center gap-2 transition-colors"
            >
              <MessageSquare size={16} />
              Chat with AI Assistant
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Generate Step Component
function GenerateStep({ 
  tasks, 
  selectedTasks, 
  onToggleTask, 
  onToggleAll, 
  onSave, 
  onRegenerate, 
  onBack, 
  processing,
  onOpenChat 
}) {
  // Group tasks by week for better visualization
  const tasksByWeek = tasks.reduce((acc, task) => {
    const week = Math.ceil(task.day / 7);
    if (!acc[week]) acc[week] = [];
    acc[week].push(task);
    return acc;
  }, {});
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <TaskGenerationPreview 
          tasks={tasks}
          tasksByWeek={tasksByWeek}
          selectedTasks={selectedTasks}
          onToggleTask={onToggleTask}
          onToggleAll={onToggleAll}
          onSave={onSave}
          onRegenerate={onRegenerate}
          onBack={onBack}
          processing={processing}
        />
      </div>
      
      <div className="lg:col-span-1">
        <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700 sticky top-24">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Zap size={20} className="text-yellow-400" />
            Quick Stats
          </h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-700/30 p-3 rounded-lg text-center">
                <p className="text-2xl font-bold text-white">{tasks.length}</p>
                <p className="text-xs text-slate-400">Total Tasks</p>
              </div>
              <div className="bg-slate-700/30 p-3 rounded-lg text-center">
                <p className="text-2xl font-bold text-white">{selectedTasks.size}</p>
                <p className="text-xs text-slate-400">Selected</p>
              </div>
            </div>
            
            <div className="bg-slate-700/30 p-4 rounded-lg">
              <p className="text-sm text-white mb-2">📊 Breakdown by Week</p>
              <div className="space-y-2">
                {Object.entries(tasksByWeek).map(([week, weekTasks]) => (
                  <div key={week} className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Week {week}</span>
                    <span className="text-white font-medium">{weekTasks.length} tasks</span>
                  </div>
                ))}
              </div>
            </div>
            
            <button
              onClick={onOpenChat}
              className="w-full p-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-white flex items-center justify-center gap-2 transition-colors"
            >
              <MessageSquare size={16} />
              Refine with AI
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Success Step Component
function SuccessStep({ taskCount, onViewTasks, onCreateAnother }) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-8 border border-slate-700 text-center">
        <div className="inline-flex p-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-6">
          <CheckCheck size={40} className="text-white" />
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-2">
          Tasks Successfully Created! 🎉
        </h2>
        <p className="text-slate-400 mb-6">
          {taskCount} tasks have been added to your Todo list
        </p>
        
        <div className="bg-slate-700/30 p-6 rounded-xl mb-8">
          <h3 className="text-lg font-medium text-white mb-3">What's next?</h3>
          <ul className="space-y-3 text-left">
            <li className="flex items-start gap-3 text-slate-300">
              <div className="p-1 bg-purple-500/20 rounded mt-0.5">
                <ListTodo size={14} className="text-purple-400" />
              </div>
              <span className="text-sm">View and manage your new tasks in the Todo list</span>
            </li>
            <li className="flex items-start gap-3 text-slate-300">
              <div className="p-1 bg-purple-500/20 rounded mt-0.5">
                <Clock size={14} className="text-purple-400" />
              </div>
              <span className="text-sm">Set reminders and track your progress daily</span>
            </li>
            <li className="flex items-start gap-3 text-slate-300">
              <div className="p-1 bg-purple-500/20 rounded mt-0.5">
                <Target size={14} className="text-purple-400" />
              </div>
              <span className="text-sm">Check off completed tasks and stay on track with your 60-day goal</span>
            </li>
          </ul>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onViewTasks}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center justify-center gap-2"
          >
            <ListTodo size={18} />
            View My Tasks
          </button>
          <button
            onClick={onCreateAnother}
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg flex items-center justify-center gap-2"
          >
            <Upload size={18} />
            Create Another Plan
          </button>
        </div>
      </div>
    </div>
  );
}

export default AiAssistant;