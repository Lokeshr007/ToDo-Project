// D:\AllProjects\ToDoProject\frontend-todo\frontend-todo\src\features\ai-assistant\components\AIFileAnalyzer.jsx
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  FileText,
  Upload,
  Loader,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Clock,
  Type,
  Hash,
  List,
  Table,
  Calendar,
  Brain,
  Zap,
  File,
  X,
  Sparkles,
  Target,
  BookOpen
} from 'lucide-react';

function AIFileAnalyzer({ onAnalysisComplete, onCancel, className = '' }) {
  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [analysisStage, setAnalysisStage] = useState('');

  const onDrop = useCallback(async (acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors[0]?.code === 'file-too-large') {
        setError('File too large. Max size: 20MB');
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        setError('Invalid file type. Accepted: PDF, DOC, DOCX, TXT, MD');
      } else {
        setError('Invalid file. Please try again.');
      }
      return;
    }

    const selectedFile = acceptedFiles[0];
    setFile(selectedFile);
    setError(null);
    await analyzeFile(selectedFile);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md']
    },
    maxSize: 20 * 1024 * 1024, // 20MB
    maxFiles: 1
  });

  const analyzeFile = async (file) => {
    setProcessing(true);
    
    const stages = [
      { progress: 10, stage: 'Reading file content...' },
      { progress: 25, stage: 'Extracting text...' },
      { progress: 40, stage: 'Analyzing document structure...' },
      { progress: 55, stage: 'Detecting topics and themes...' },
      { progress: 70, stage: 'Identifying learning objectives...' },
      { progress: 85, stage: 'Building knowledge graph...' },
      { progress: 95, stage: 'Generating insights...' },
      { progress: 100, stage: 'Analysis complete!' }
    ];

    for (const stage of stages) {
      await new Promise(resolve => setTimeout(resolve, 300));
      setProgress(stage.progress);
      setAnalysisStage(stage.stage);
    }

    // Mock analysis result
    const mockAnalysis = {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.name.split('.').pop(),
      characterCount: Math.floor(Math.random() * 20000) + 5000,
      wordCount: Math.floor(Math.random() * 3000) + 1000,
      lineCount: Math.floor(Math.random() * 200) + 50,
      paragraphCount: Math.floor(Math.random() * 50) + 10,
      hasHeadings: true,
      hasBulletPoints: true,
      hasNumberedLists: true,
      hasTables: Math.random() > 0.5,
      estimatedReadingTimeMinutes: Math.floor(Math.random() * 20) + 5,
      complexity: ['SIMPLE', 'MODERATE', 'COMPLEX'][Math.floor(Math.random() * 3)],
      topics: [
        'JavaScript Fundamentals',
        'React Components',
        'State Management',
        'API Integration',
        'Testing',
        'Deployment',
        'Performance Optimization'
      ].slice(0, Math.floor(Math.random() * 5) + 3),
      hasDates: true,
      detectedDates: [
        'Week 1',
        'Day 7',
        'Milestone: 30 days',
        'Final project: Day 60'
      ],
      structure: {
        sections: Math.floor(Math.random() * 10) + 5,
        subsections: Math.floor(Math.random() * 20) + 10,
        hasSummary: Math.random() > 0.3,
        hasPrerequisites: Math.random() > 0.4
      },
      learningObjectives: [
        'Understand core concepts',
        'Build practical projects',
        'Master advanced techniques',
        'Develop best practices'
      ],
      estimatedDuration: Math.floor(Math.random() * 60) + 30,
      difficulty: ['Beginner', 'Intermediate', 'Advanced'][Math.floor(Math.random() * 3)]
    };

    setAnalysis(mockAnalysis);
    setProcessing(false);
    
    if (onAnalysisComplete) {
      onAnalysisComplete(mockAnalysis, file);
    }
  };

  const resetAnalysis = () => {
    setFile(null);
    setAnalysis(null);
    setError(null);
    setProgress(0);
    setAnalysisStage('');
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`bg-slate-800/50 backdrop-blur-lg rounded-xl border border-slate-700 ${className}`}>
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg">
              <Brain size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">AI File Analyzer</h3>
              <p className="text-sm text-slate-400">Upload a document for intelligent analysis</p>
            </div>
          </div>
          {onCancel && (
            <button
              onClick={onCancel}
              className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        {!file && !processing && (
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
              transition-all duration-200
              ${isDragActive 
                ? 'border-blue-500 bg-blue-500/10' 
                : error
                  ? 'border-red-500 bg-red-500/10'
                  : 'border-slate-600 hover:border-blue-500 hover:bg-slate-700/30'
              }
            `}
          >
            <input {...getInputProps()} />
            <Upload 
              size={48} 
              className={`mx-auto mb-4 ${
                isDragActive ? 'text-blue-400' : error ? 'text-red-400' : 'text-slate-500'
              }`} 
            />
            <p className="text-white text-lg mb-2">
              {isDragActive ? 'Drop your file here' : 'Drag & drop your document'}
            </p>
            <p className="text-sm text-slate-400 mb-4">
              or <span className="text-blue-400 hover:text-blue-300">browse files</span>
            </p>
            
            {error && (
              <div className="mt-4 p-3 bg-red-500/10 rounded-lg">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500 mt-4">
              <span>PDF, DOC, DOCX, TXT, MD</span>
              <span className="w-1 h-1 bg-slate-600 rounded-full" />
              <span>Max 20MB</span>
            </div>
          </div>
        )}

        {processing && (
          <div className="text-center py-8">
            <div className="relative w-24 h-24 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-slate-700" />
              <div 
                className="absolute inset-0 rounded-full border-4 border-blue-500 transition-all duration-300"
                style={{ 
                  clipPath: `polygon(0 0, 100% 0, 100% 100%, 0 100%)`,
                  transform: `rotate(${progress * 3.6}deg)`
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-white">{progress}%</span>
              </div>
            </div>
            <p className="text-white mb-2">{analysisStage}</p>
            <p className="text-sm text-slate-400">
              This may take a few moments...
            </p>
          </div>
        )}

        {analysis && !processing && (
          <div className="space-y-6">
            {/* File Info */}
            <div className="flex items-center gap-4 p-4 bg-slate-700/30 rounded-lg">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <FileText size={24} className="text-blue-400" />
              </div>
              <div className="flex-1">
                <h4 className="text-white font-medium">{analysis.fileName}</h4>
                <p className="text-sm text-slate-400">
                  {formatFileSize(analysis.fileSize)} • {analysis.fileType.toUpperCase()}
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-white">{analysis.wordCount} words</div>
                <div className="text-xs text-slate-400">{analysis.characterCount} characters</div>
              </div>
            </div>

            {/* Analysis Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-700/30 p-3 rounded-lg text-center">
                <Clock size={18} className="mx-auto text-blue-400 mb-1" />
                <p className="text-sm font-medium text-white">{analysis.estimatedReadingTimeMinutes}m</p>
                <p className="text-xs text-slate-400">Reading Time</p>
              </div>
              <div className="bg-slate-700/30 p-3 rounded-lg text-center">
                <Type size={18} className="mx-auto text-purple-400 mb-1" />
                <p className="text-sm font-medium text-white">{analysis.paragraphCount}</p>
                <p className="text-xs text-slate-400">Paragraphs</p>
              </div>
              <div className="bg-slate-700/30 p-3 rounded-lg text-center">
                <List size={18} className="mx-auto text-green-400 mb-1" />
                <p className="text-sm font-medium text-white">{analysis.lineCount}</p>
                <p className="text-xs text-slate-400">Lines</p>
              </div>
              <div className="bg-slate-700/30 p-3 rounded-lg text-center">
                <BarChart3 size={18} className="mx-auto text-yellow-400 mb-1" />
                <p className="text-sm font-medium text-white">{analysis.complexity}</p>
                <p className="text-xs text-slate-400">Complexity</p>
              </div>
            </div>

            {/* Document Structure */}
            <div>
              <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                <BookOpen size={16} className="text-purple-400" />
                Document Structure
              </h4>
              <div className="flex flex-wrap gap-2">
                {analysis.hasHeadings && (
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs border border-blue-500/30">
                    Headings
                  </span>
                )}
                {analysis.hasBulletPoints && (
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs border border-purple-500/30">
                    Bullet Points
                  </span>
                )}
                {analysis.hasNumberedLists && (
                  <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-xs border border-green-500/30">
                    Numbered Lists
                  </span>
                )}
                {analysis.hasTables && (
                  <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-xs border border-yellow-500/30">
                    Tables
                  </span>
                )}
                {analysis.hasDates && (
                  <span className="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-xs border border-red-500/30">
                    Dates/Timeline
                  </span>
                )}
              </div>
            </div>

            {/* Topics Detected */}
            <div>
              <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                <Target size={16} className="text-green-400" />
                Topics Detected
              </h4>
              <div className="flex flex-wrap gap-2">
                {analysis.topics.map((topic, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs border border-indigo-500/30"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            {/* Learning Objectives */}
            {analysis.learningObjectives && (
              <div>
                <h4 className="text-sm font-medium text-white mb-3">Learning Objectives</h4>
                <ul className="space-y-2">
                  {analysis.learningObjectives.map((obj, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-slate-300">
                      <CheckCircle size={14} className="text-green-400 mt-0.5" />
                      {obj}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Timeline Detection */}
            {analysis.hasDates && analysis.detectedDates && (
              <div>
                <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                  <Calendar size={14} className="text-orange-400" />
                  Timeline Indicators
                </h4>
                <div className="bg-slate-700/30 p-3 rounded-lg">
                  {analysis.detectedDates.map((date, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-slate-300 mb-1 last:mb-0">
                      <Zap size={12} className="text-orange-400" />
                      {date}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-700">
              <div className="bg-slate-700/30 p-3 rounded-lg">
                <p className="text-xs text-slate-400">Estimated Duration</p>
                <p className="text-lg font-bold text-white">{analysis.estimatedDuration} days</p>
              </div>
              <div className="bg-slate-700/30 p-3 rounded-lg">
                <p className="text-xs text-slate-400">Difficulty Level</p>
                <p className="text-lg font-bold text-white">{analysis.difficulty}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => onAnalysisComplete(analysis, file)}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all flex items-center justify-center gap-2"
              >
                <Zap size={18} />
                Generate Learning Plan
              </button>
              <button
                onClick={resetAnalysis}
                className="px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Upload Different
              </button>
            </div>

            {/* AI Confidence Note */}
            <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
              <div className="flex items-start gap-2">
                <Sparkles size={14} className="text-purple-400 mt-0.5" />
                <p className="text-xs text-slate-300">
                  AI confidence: <span className="text-purple-400 font-medium">92%</span> • 
                  This document appears to be a well-structured learning plan suitable for a 60-day format.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AIFileAnalyzer;