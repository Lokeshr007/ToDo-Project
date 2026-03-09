// D:\AllProjects\ToDoProject\frontend-todo\frontend-todo\src\features\ai-assistant\pages\AIAssistantPage.jsx
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageSquare, Sparkles, GitBranch, Zap } from 'lucide-react';
import EnterpriseAIChat from '../components/EnterpriseAIChat';
import LearningPathVisualizer from '../components/LearningPathVisualizer';
import TaskGenerationPreview from '../components/TaskGenerationPreview';

function AIAssistantPage() {
  const location = useLocation();
  const [activeView, setActiveView] = useState('chat');

  useEffect(() => {
    // Set active view based on URL path
    if (location.pathname.includes('/plans')) {
      setActiveView('plans');
    } else if (location.pathname.includes('/paths')) {
      setActiveView('paths');
    } else if (location.pathname.includes('/enterprise')) {
      setActiveView('enterprise');
    } else {
      setActiveView('chat');
    }
  }, [location]);

  const renderView = () => {
    switch(activeView) {
      case 'chat':
        return <EnterpriseAIChat fullScreen />;
      case 'plans':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Learning Plans</h2>
            <TaskGenerationPreview tasks={[]} />
          </div>
        );
      case 'paths':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Learning Paths</h2>
            <LearningPathVisualizer />
          </div>
        );
      case 'enterprise':
        return <EnterpriseAIChat fullScreen />;
      default:
        return <EnterpriseAIChat fullScreen />;
    }
  };

  return (
    <div className="h-full bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900">
      {renderView()}
    </div>
  );
}

export default AIAssistantPage;
