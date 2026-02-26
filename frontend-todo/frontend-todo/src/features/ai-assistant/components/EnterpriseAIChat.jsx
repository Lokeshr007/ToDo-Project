// D:\AllProjects\ToDoProject\frontend-todo\frontend-todo\src\features\ai-assistant\components\EnterpriseAIChat.jsx
import { useState, useEffect, useCallback } from 'react';
import {
  Bot,
  Send,
  Loader,
  Sparkles,
  FileText,
  Calendar,
  ListTodo,
  Target,
  Zap,
  MessageSquare,
  X,
  Download,
  Check,
  AlertCircle,
  Plus,
  FolderOpen,
  Layout,
  CheckCircle,
  Clock,
  Brain,
  Upload,
  Settings,
  RefreshCw,
  Save,
  Share2,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

import { useEnterpriseAI } from '../hooks/useEnterpriseAI';
import ChatInterface from './ChatInterface';
import AIFileAnalyzer from './AIFileAnalyzer';
import TaskGenerationPreview from './TaskGenerationPreview';
import ProjectStructurePreview from './ProjectStructurePreview';
import AIContextPanel from './AIContextPanel';

function EnterpriseAIChat({ 
  workspaceId, 
  initialContext = null,
  onClose, 
  onPlanCreated,
  fullScreen = false,
  className = '' 
}) {
  const [step, setStep] = useState('chat'); // chat, analyze, preview, structure, context
  const [messages, setMessages] = useState([]);
  const [context, setContext] = useState(initialContext);
  const [sessionId, setSessionId] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [generatedTasks, setGeneratedTasks] = useState([]);
  const [selectedTasks, setSelectedTasks] = useState(new Set());
  const [projectStructure, setProjectStructure] = useState(null);
  const [showFileAnalyzer, setShowFileAnalyzer] = useState(false);
  const [showContextPanel, setShowContextPanel] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(fullScreen);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // chat, tasks, structure

  const {
    loading,
    error,
    processMessage,
    processFile,
    refinePlan,
    acceptTasks,
    getContext,
    updateContext,
    clearContext
  } = useEnterpriseAI();

  useEffect(() => {
    // Generate a session ID for this conversation
    const newSessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(newSessionId);

    // Add welcome message
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: `👋 **Welcome to Enterprise AI Learning Assistant!**

I can help you create structured 60-day learning plans from your documents or natural language descriptions.

**What would you like to do?**
• 📄 **Upload a file** - PDF, DOCX, or TXT document
• 💬 **Describe your goals** - e.g., "I want to learn full-stack development"
• 🎯 **Get recommendations** - Ask for study tips or plan adjustments

How can I assist you today?`,
        timestamp: new Date().toISOString()
      }
    ]);

    // Load initial context if provided
    if (initialContext) {
      setContext(initialContext);
    }
  }, []);

  const handleSendMessage = async (content) => {
    // Add user message
    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      // Process with AI
      const response = await processMessage(content, {
        workspaceId,
        sessionId,
        context: {
          ...context,
          currentStep: step,
          hasFile: !!uploadedFile
        }
      });

      // Add AI response
      const aiMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: response.message || response.response,
        timestamp: new Date().toISOString(),
        metadata: response.data
      };
      setMessages(prev => [...prev, aiMessage]);

      // Update context
      setContext(prev => ({
        ...prev,
        ...response.context,
        lastInteraction: new Date().toISOString()
      }));

      // Handle actions
      if (response.actions && response.actions.length > 0) {
        handleAIActions(response.actions, response.data);
      }

      // Handle plan data if present
      if (response.plan) {
        setGeneratedPlan(response.plan);
        setStep('preview');
      }

      if (response.tasks) {
        setGeneratedTasks(response.tasks);
        // Select all tasks by default
        const taskIds = new Set(response.tasks.map(t => t.id));
        setSelectedTasks(taskIds);
      }

      if (response.projectStructure) {
        setProjectStructure(response.projectStructure);
        setStep('structure');
      }

    } catch (err) {
      console.error('Failed to process message:', err);
      
      // Add error message
      const errorMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `❌ **I encountered an error:** ${err.message || 'Please try again.'}`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
      
      toast.error('Failed to process message');
    }
  };

  const handleFileAnalysis = async (analysis, file) => {
    setAnalysisResult(analysis);
    setUploadedFile(file);
    setShowFileAnalyzer(false);
    setStep('analyze');

    // Add message about file analysis
    const analysisMessage = {
      id: `analysis-${Date.now()}`,
      role: 'assistant',
      content: `📊 **File Analysis Complete**

I've analyzed your file **"${file.name}"** and found:

• **${analysis.wordCount}** words across **${analysis.paragraphCount}** paragraphs
• **${analysis.topics.length}** main topics detected
• Estimated reading time: **${analysis.estimatedReadingTimeMinutes} minutes**
• Complexity level: **${analysis.complexity}**

**Detected Topics:**
${analysis.topics.slice(0, 5).map(t => `• ${t}`).join('\n')}

Would you like me to generate a structured 60-day learning plan based on this document?`,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, analysisMessage]);
  };

  const handleGeneratePlan = async () => {
    if (!uploadedFile) {
      toast.error('Please upload a file first');
      return;
    }

    setIsGenerating(true);
    
    try {
      const response = await processFile(uploadedFile, {
        workspaceId,
        sessionId,
        createProjectStructure: true,
        preferences: {
          learningStyle: context?.learningStyle || 'VISUAL',
          attentionSpan: context?.attentionSpan || 45,
          dailyHours: context?.dailyHours || 4
        }
      });

      if (response.data) {
        setGeneratedPlan(response.data.plan);
        setGeneratedTasks(response.data.tasks || []);
        setProjectStructure(response.data.projectStructure);
        
        // Select all tasks by default
        if (response.data.tasks) {
          const taskIds = new Set(response.data.tasks.map(t => t.id));
          setSelectedTasks(taskIds);
        }

        setStep('preview');

        // Add success message
        const successMessage = {
          id: `success-${Date.now()}`,
          role: 'assistant',
          content: `✨ **Plan Generated Successfully!**

I've created a **${response.data.plan?.durationDays || 60}-day learning plan** with **${response.data.tasks?.length || 0} tasks**.

**Here's what I've created:**
• 📋 Comprehensive learning path
• ✅ Daily task breakdown
• 🎯 Key milestones and objectives
• 📊 Progress tracking structure

You can now review, customize, and accept the tasks below.`,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, successMessage]);

        if (onPlanCreated) {
          onPlanCreated(response.data);
        }
      }

    } catch (err) {
      console.error('Failed to generate plan:', err);
      toast.error('Failed to generate plan');
      
      const errorMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `❌ **Failed to generate plan:** ${err.message || 'Please try again.'}`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
      
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAcceptTasks = async () => {
    if (selectedTasks.size === 0) {
      toast.error('Please select at least one task');
      return;
    }

    try {
      const taskIds = Array.from(selectedTasks);
      const result = await acceptTasks(taskIds, workspaceId);

      setStep('structure');

      const successMessage = {
        id: `accept-${Date.now()}`,
        role: 'assistant',
        content: `✅ **Tasks Created Successfully!**

I've created **${result.createdCount || selectedTasks.size} tasks** in your workspace.

**What's next?**
• 📁 View them in your project
• 🎯 Start working through day-by-day
• 📊 Track your progress
• 💬 Ask me for help anytime

Would you like me to explain how to get started with your first tasks?`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, successMessage]);

      toast.success(`Created ${result.createdCount || selectedTasks.size} tasks successfully!`);

    } catch (err) {
      console.error('Failed to create tasks:', err);
      toast.error('Failed to create tasks');
    }
  };

  const handleRefinePlan = async (instructions) => {
    if (!generatedPlan) return;

    try {
      const response = await refinePlan(generatedPlan.id, instructions);

      setGeneratedTasks(response.tasks || []);
      
      // Select all tasks by default
      if (response.tasks) {
        const taskIds = new Set(response.tasks.map(t => t.id));
        setSelectedTasks(taskIds);
      }

      const refineMessage = {
        id: `refine-${Date.now()}`,
        role: 'assistant',
        content: `🔄 **Plan Refined!**

I've updated the plan based on your feedback. The tasks have been adjusted accordingly.

Please review the changes and let me know if you need further adjustments.`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, refineMessage]);

    } catch (err) {
      console.error('Failed to refine plan:', err);
      toast.error('Failed to refine plan');
    }
  };

  const handleAIActions = (actions, data) => {
    actions.forEach(action => {
      switch(action) {
        case 'CREATE_PROJECT':
          toast.success('Project structure ready for review');
          setProjectStructure(data?.projectStructure);
          setStep('structure');
          break;
        case 'CREATE_TASK':
          toast.success('Tasks generated');
          setGeneratedTasks(data?.tasks || []);
          setStep('preview');
          break;
        case 'ANALYZE_FILE':
          setShowFileAnalyzer(true);
          break;
        case 'SHOW_CONTEXT':
          setShowContextPanel(true);
          break;
        default:
          break;
      }
    });
  };

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

  const toggleAllTasks = () => {
    if (selectedTasks.size === generatedTasks.length) {
      setSelectedTasks(new Set());
    } else {
      setSelectedTasks(new Set(generatedTasks.map(t => t.id)));
    }
  };

  const handleExportPlan = () => {
    const exportData = {
      plan: generatedPlan,
      tasks: generatedTasks,
      projectStructure,
      metadata: {
        createdAt: new Date().toISOString(),
        sessionId,
        workspaceId
      }
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `learning-plan-${format(new Date(), 'yyyy-MM-dd')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success('Plan exported successfully');
  };

  const resetChat = () => {
    if (window.confirm('Start a new conversation? Current progress will be saved.')) {
      setMessages([messages[0]]); // Keep welcome message
      setGeneratedPlan(null);
      setGeneratedTasks([]);
      setSelectedTasks(new Set());
      setProjectStructure(null);
      setUploadedFile(null);
      setAnalysisResult(null);
      setStep('chat');
      toast.success('Started new conversation');
    }
  };

  const getSuggestions = () => {
    if (step === 'chat') {
      return [
        "Create a 60-day web development plan",
        "Upload a study guide PDF",
        "I want to learn machine learning",
        "Help me organize my learning schedule",
        "What's the best way to learn React?"
      ];
    } else if (step === 'analyze') {
      return [
        "Generate the learning plan",
        "What topics are covered?",
        "How many hours per day?",
        "Show me the weekly breakdown"
      ];
    } else if (step === 'preview') {
      return [
        "Adjust the difficulty",
        "Add more practice tasks",
        "Focus more on certain topics",
        "Create a lighter schedule"
      ];
    }
    return [];
  };

  return (
    <div className={`
      flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900
      ${isFullScreen ? 'fixed inset-0 z-50' : 'h-full rounded-xl'}
      ${className}
    `}>
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-lg px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow-lg">
            <Brain size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Enterprise AI Assistant</h2>
            <p className="text-xs text-slate-400">
              {step === 'chat' && 'Ready to help'}
              {step === 'analyze' && 'Analyzing document'}
              {step === 'preview' && `${generatedTasks.length} tasks generated`}
              {step === 'structure' && 'Project structure ready'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Context Toggle */}
          <button
            onClick={() => setShowContextPanel(!showContextPanel)}
            className={`p-2 rounded-lg transition-colors ${
              showContextPanel ? 'bg-purple-500/20 text-purple-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Context Settings"
          >
            <Settings size={18} />
          </button>

          {/* Export Button */}
          {(generatedPlan || generatedTasks.length > 0) && (
            <button
              onClick={handleExportPlan}
              className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
              title="Export Plan"
            >
              <Download size={18} />
            </button>
          )}

          {/* Reset Button */}
          <button
            onClick={resetChat}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
            title="New Conversation"
          >
            <RefreshCw size={18} />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
            title={isFullScreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullScreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>

          {/* Close Button */}
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
              title="Close"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Area */}
        <div className={`flex-1 flex flex-col ${showContextPanel ? 'w-2/3' : 'w-full'}`}>
          {/* Upload Progress Banner */}
          {uploadedFile && !generatedPlan && (
            <div className="bg-blue-500/10 border-b border-blue-500/30 px-4 py-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <FileText size={16} className="text-blue-400" />
                  <span className="text-white">{uploadedFile.name}</span>
                  <span className="text-xs text-slate-400">
                    ({(uploadedFile.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
                <button
                  onClick={handleGeneratePlan}
                  disabled={isGenerating}
                  className="px-3 py-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all text-sm flex items-center gap-2 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <Loader size={14} className="animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Zap size={14} />
                      Generate Plan
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Tab Navigation (when we have content) */}
          {(generatedTasks.length > 0 || projectStructure) && (
            <div className="border-b border-slate-800 bg-slate-900/30 px-4">
              <div className="flex gap-4">
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`py-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'chat'
                      ? 'border-purple-500 text-white'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  Chat
                </button>
                <button
                  onClick={() => setActiveTab('tasks')}
                  className={`py-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'tasks'
                      ? 'border-purple-500 text-white'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  Tasks ({generatedTasks.length})
                </button>
                {projectStructure && (
                  <button
                    onClick={() => setActiveTab('structure')}
                    className={`py-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'structure'
                        ? 'border-purple-500 text-white'
                        : 'border-transparent text-slate-400 hover:text-white'
                    }`}
                  >
                    Structure
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Content based on active tab */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'chat' && (
              <ChatInterface
                messages={messages}
                onSendMessage={handleSendMessage}
                isProcessing={loading || isGenerating}
                context={{
                  planTitle: generatedPlan?.title,
                  summary: generatedPlan?.summary,
                  ...context
                }}
                suggestions={getSuggestions()}
                showHeader={false}
                placeholder="Ask me anything about your learning plan..."
              />
            )}

            {activeTab === 'tasks' && generatedTasks.length > 0 && (
              <div className="h-full overflow-y-auto p-4">
                <TaskGenerationPreview
                  tasks={generatedTasks}
                  selectedTasks={selectedTasks}
                  onToggleTask={toggleTaskSelection}
                  onToggleAll={toggleAllTasks}
                  onSave={handleAcceptTasks}
                  onRegenerate={() => handleRefinePlan('Regenerate with same structure')}
                  onBack={() => setActiveTab('chat')}
                  processing={loading}
                />
              </div>
            )}

            {activeTab === 'structure' && projectStructure && (
              <div className="h-full overflow-y-auto p-4">
                <ProjectStructurePreview
                  structure={projectStructure}
                  onViewProject={() => {
                    if (projectStructure.createdProjectId) {
                      window.location.href = `/app/projects/${projectStructure.createdProjectId}`;
                    }
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Context Panel */}
        {showContextPanel && (
          <div className="w-1/3 border-l border-slate-700 bg-slate-800/50 overflow-y-auto">
            <AIContextPanel
              context={context}
              onUpdate={updateContext}
              onClose={() => setShowContextPanel(false)}
            />
          </div>
        )}
      </div>

      {/* File Analyzer Modal */}
      {showFileAnalyzer && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <AIFileAnalyzer
              onAnalysisComplete={handleFileAnalysis}
              onCancel={() => setShowFileAnalyzer(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default EnterpriseAIChat;