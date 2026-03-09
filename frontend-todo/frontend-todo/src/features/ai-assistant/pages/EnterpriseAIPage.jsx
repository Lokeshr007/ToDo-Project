import { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Loader, 
  Sparkles,
  BookOpen,
  Target,
  Clock,
  Brain,
  Zap,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Download,
  X
} from 'lucide-react';
import { useAIContext } from '../hooks/useAIContext';

function EnterpriseAIChat({ 
  sessionId: initialSessionId,
  onSessionChange,
  onTaskGenerated,
  className = '' 
}) {
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [suggestions, setSuggestions] = useState([
    "Create a 60-day web development plan",
    "I need help with learning React",
    "Can you create a study schedule for me?",
    "What's the best way to learn programming?",
    "Help me prepare for coding interviews"
  ]);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const { 
    sessionId,
    context,
    loading,
    messageHistory,
    sendMessage,
    getLearningInsights
  } = useAIContext(initialSessionId);

  const insights = getLearningInsights();

  useEffect(() => {
    if (onSessionChange && sessionId) {
      onSessionChange(sessionId);
    }
  }, [sessionId, onSessionChange]);

  useEffect(() => {
    scrollToBottom();
  }, [messageHistory]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;

    const message = input;
    setInput('');
    setShowSuggestions(false);

    try {
      await sendMessage(message);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
    inputRef.current?.focus();
  };

  const getMessageIcon = (role) => {
    return role === 'user' ? (
      <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
        <User size={16} className="text-white" />
      </div>
    ) : (
      <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
        <Bot size={16} className="text-white" />
      </div>
    );
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex flex-col h-full bg-slate-800/50 backdrop-blur-lg rounded-xl border border-slate-700 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg">
              <Brain size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-white font-medium">AI Learning Assistant</h3>
              <p className="text-xs text-slate-400">
                {sessionId ? 'Context active' : 'New conversation'}
              </p>
            </div>
          </div>

          {context && (
            <div className="flex items-center gap-2">
              <div className="px-2 py-1 bg-green-500/20 rounded-lg">
                <span className="text-xs text-green-400">
                  {context.learningStyle} Learner
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Context Summary */}
        {context && (
          <div className="mt-3 flex flex-wrap gap-2">
            {context.strengths?.map((strength, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-green-500/10 text-green-400 rounded-full text-xs border border-green-500/30"
              >
                ✓ {strength}
              </span>
            ))}
            {context.weaknesses?.map((weakness, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-yellow-500/10 text-yellow-400 rounded-full text-xs border border-yellow-500/30"
              >
                ⚠ {weakness}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messageHistory.length === 0 && (
          <div className="text-center py-8">
            <div className="inline-flex p-4 bg-purple-500/20 rounded-full mb-4">
              <Sparkles size={32} className="text-purple-400" />
            </div>
            <h4 className="text-white font-medium mb-2">
              How can I help with your learning journey?
            </h4>
            <p className="text-sm text-slate-400 mb-6">
              Ask me to create study plans, explain concepts, or help you stay on track
            </p>

            {showSuggestions && (
              <div className="space-y-2 max-w-md mx-auto">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left p-3 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg text-sm text-slate-300 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {messageHistory.map((message, index) => (
          <div
            key={index}
            className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === 'assistant' && getMessageIcon('assistant')}
            
            <div
              className={`max-w-[70%] ${
                message.role === 'user'
                  ? 'bg-purple-600 text-white rounded-t-2xl rounded-l-2xl'
                  : 'bg-slate-700/50 text-slate-200 rounded-t-2xl rounded-r-2xl'
              } p-3`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              
              {message.insights && (
                <div className="mt-2 pt-2 border-t border-slate-600/50">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Clock size={10} />
                    <span>{formatTimestamp(message.timestamp)}</span>
                  </div>
                </div>
              )}
            </div>

            {message.role === 'user' && getMessageIcon('user')}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            {getMessageIcon('assistant')}
            <div className="bg-slate-700/50 rounded-t-2xl rounded-r-2xl p-4">
              <Loader size={20} className="text-purple-400 animate-spin" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about your learning plan..."
            className="flex-1 px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
            rows="1"
            disabled={loading}
          />
          
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || loading}
            className="p-3 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg text-white transition-colors"
          >
            {loading ? (
              <Loader size={20} className="animate-spin" />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={() => setInput("Create a 60-day learning plan for web development")}
            className="px-3 py-1 bg-slate-700/30 hover:bg-slate-700/50 rounded-full text-xs text-slate-300 transition-colors"
          >
            Web Dev Plan
          </button>
          <button
            onClick={() => setInput("What should I learn next?")}
            className="px-3 py-1 bg-slate-700/30 hover:bg-slate-700/50 rounded-full text-xs text-slate-300 transition-colors"
          >
            Next Steps
          </button>
          <button
            onClick={() => setInput("Help me with my current task")}
            className="px-3 py-1 bg-slate-700/30 hover:bg-slate-700/50 rounded-full text-xs text-slate-300 transition-colors"
          >
            Need Help
          </button>
        </div>
      </div>
    </div>
  );
}

export default EnterpriseAIChat;
