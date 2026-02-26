// D:\AllProjects\ToDoProject\frontend-todo\frontend-todo\src\features\ai-assistant\components\ChatInterface.jsx
import { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  Loader,
  Sparkles,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  FileText,
  Calendar,
  ListTodo,
  Target,
  Zap,
  MessageSquare,
  X,
  Clock,
  CheckCircle,
  AlertCircle,
  Brain
} from 'lucide-react';

function ChatInterface({
  messages = [],
  onSendMessage,
  onClose,
  isProcessing = false,
  context = null,
  suggestions = [],
  className = '',
  showHeader = true,
  placeholder = "Ask me anything about your learning plan..."
}) {
  const [inputValue, setInputValue] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [feedbackGiven, setFeedbackGiven] = useState({});
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (inputRef.current && !isProcessing) {
      inputRef.current.focus();
    }
  }, [isProcessing]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim() && !isProcessing) {
      onSendMessage(inputValue.trim());
      setInputValue('');
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleCopy = async (content, id) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleFeedback = (id, type) => {
    setFeedbackGiven(prev => ({ ...prev, [id]: type }));
    // Could send to analytics here
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const getMessageIcon = (role) => {
    if (role === 'user') {
      return <User size={16} className="text-white" />;
    }
    return <Bot size={16} className="text-white" />;
  };

  const getMessageColor = (role) => {
    return role === 'user' 
      ? 'bg-gradient-to-r from-purple-600 to-indigo-600' 
      : 'bg-gradient-to-r from-slate-700 to-slate-600';
  };

  const suggestedQuestions = suggestions.length > 0 ? suggestions : [
    "Create a 60-day learning plan for web development",
    "How should I structure my daily study sessions?",
    "What topics should I focus on first?",
    "Can you suggest practice projects?",
    "How do I track my progress effectively?",
    "Help me adjust the pace of my learning"
  ];

  return (
    <div className={`flex flex-col h-full bg-slate-800/95 backdrop-blur-lg border-l border-slate-700 ${className}`}>
      {/* Header */}
      {showHeader && (
        <div className="p-4 border-b border-slate-700 flex items-center justify-between bg-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow-lg">
              <Brain size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">AI Learning Assistant</h3>
              <p className="text-xs text-slate-400">
                {context ? 'Context: ' + (context.planTitle || 'Learning Plan') : 'Ask me anything'}
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
              title="Close"
            >
              <X size={18} />
            </button>
          )}
        </div>
      )}

      {/* Context Summary (if available) */}
      {context && context.summary && (
        <div className="p-3 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border-b border-purple-500/30">
          <div className="flex items-start gap-2">
            <Sparkles size={14} className="text-purple-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-slate-300">
              <span className="text-purple-400 font-medium">Context:</span> {context.summary}
            </p>
          </div>
        </div>
      )}

      {/* Messages Container */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6">
            <div className="p-4 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-full mb-4 animate-pulse">
              <MessageSquare size={40} className="text-purple-400" />
            </div>
            <h4 className="text-white font-medium mb-2">Start a Conversation</h4>
            <p className="text-sm text-slate-400 mb-6 max-w-xs">
              I'm your AI learning assistant. Ask me anything about creating or managing your 60-day learning plan.
            </p>
            
            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
              <button
                onClick={() => handleSuggestionClick("Create a 60-day web development plan")}
                className="p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-left transition-colors"
              >
                <FileText size={16} className="text-blue-400 mb-1" />
                <span className="text-xs text-white">Web Dev Plan</span>
              </button>
              <button
                onClick={() => handleSuggestionClick("How to structure daily learning?")}
                className="p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-left transition-colors"
              >
                <Calendar size={16} className="text-green-400 mb-1" />
                <span className="text-xs text-white">Daily Structure</span>
              </button>
              <button
                onClick={() => handleSuggestionClick("Suggest practice projects")}
                className="p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-left transition-colors"
              >
                <Target size={16} className="text-yellow-400 mb-1" />
                <span className="text-xs text-white">Projects</span>
              </button>
              <button
                onClick={() => handleSuggestionClick("How to track progress?")}
                className="p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-left transition-colors"
              >
                <ListTodo size={16} className="text-purple-400 mb-1" />
                <span className="text-xs text-white">Progress</span>
              </button>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={message.id || index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
            >
              <div className={`flex gap-3 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                {/* Avatar */}
                <div className={`
                  flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-lg
                  ${message.role === 'user' 
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600' 
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600'
                  }
                `}>
                  {getMessageIcon(message.role)}
                </div>

                {/* Message Content */}
                <div className="space-y-1">
                  <div
                    className={`
                      p-3 rounded-2xl shadow-lg
                      ${message.role === 'user' 
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-tr-none' 
                        : 'bg-slate-700 text-slate-200 rounded-tl-none'
                      }
                    `}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                    
                    {/* Timestamp */}
                    {message.timestamp && (
                      <div className={`
                        text-[10px] mt-1 flex items-center justify-end gap-1
                        ${message.role === 'user' ? 'text-purple-200' : 'text-slate-400'}
                      `}>
                        <Clock size={8} />
                        {formatTime(message.timestamp)}
                      </div>
                    )}
                  </div>

                  {/* Message Actions (for assistant messages) */}
                  {message.role === 'assistant' && (
                    <div className="flex items-center gap-1 px-2">
                      <button
                        onClick={() => handleCopy(message.content, message.id || index)}
                        className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"
                        title="Copy message"
                      >
                        {copiedId === (message.id || index) ? (
                          <Check size={12} className="text-green-400" />
                        ) : (
                          <Copy size={12} />
                        )}
                      </button>
                      <button
                        onClick={() => handleFeedback(message.id || index, 'like')}
                        className={`p-1 hover:bg-slate-700 rounded transition-colors ${
                          feedbackGiven[message.id || index] === 'like'
                            ? 'text-green-400'
                            : 'text-slate-400 hover:text-white'
                        }`}
                        title="Helpful"
                      >
                        <ThumbsUp size={12} />
                      </button>
                      <button
                        onClick={() => handleFeedback(message.id || index, 'dislike')}
                        className={`p-1 hover:bg-slate-700 rounded transition-colors ${
                          feedbackGiven[message.id || index] === 'dislike'
                            ? 'text-red-400'
                            : 'text-slate-400 hover:text-white'
                        }`}
                        title="Not helpful"
                      >
                        <ThumbsDown size={12} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}

        {/* Typing Indicator */}
        {isProcessing && (
          <div className="flex justify-start animate-fadeIn">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg">
                <Bot size={16} className="text-white" />
              </div>
              <div className="p-4 bg-slate-700 rounded-2xl rounded-tl-none shadow-lg">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {showSuggestions && messages.length > 0 && suggestions.length > 0 && (
        <div className="px-4 py-2 border-t border-slate-700 bg-slate-800/50">
          <p className="text-xs text-slate-400 mb-2 flex items-center gap-1">
            <Zap size={10} className="text-yellow-400" />
            Suggested:
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="text-xs px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-full transition-colors border border-slate-600 hover:border-purple-500"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-slate-700 bg-slate-800/80">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={placeholder}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              rows="1"
              style={{ minHeight: '44px', maxHeight: '120px' }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              disabled={isProcessing}
            />
            {isProcessing && (
              <div className="absolute right-3 bottom-3">
                <Loader size={16} className="text-purple-400 animate-spin" />
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={!inputValue.trim() || isProcessing}
            className="p-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex-shrink-0"
            title="Send message"
          >
            <Send size={18} />
          </button>
        </div>
        <p className="text-[10px] text-slate-500 mt-2 text-center">
          Press Enter to send, Shift+Enter for new line
        </p>
      </form>
    </div>
  );
}

export default ChatInterface;