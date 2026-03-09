// D:\AllProjects\ToDoProject\frontend-todo\frontend-todo\src\features\ai-assistant\components\FileUploader.jsx
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Upload,
  File,
  FileText,
  Image,
  X,
  CheckCircle,
  AlertCircle,
  Loader,
  Zap,
  Brain,
  Sparkles
} from 'lucide-react';

function FileUploader({ onFileSelect, onCancel, className = '' }) {
  const [file, setFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

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

    // Simulate upload progress
    setProcessing(true);
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      setUploadProgress(i);
    }
    setProcessing(false);
    
    if (onFileSelect) {
      onFileSelect(selectedFile);
    }
  }, [onFileSelect]);

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

  const removeFile = (e) => {
    e.stopPropagation();
    setFile(null);
    setError(null);
    setUploadProgress(0);
  };

  const getFileIcon = (file) => {
    const type = file?.type || '';
    if (type.includes('pdf')) return <FileText className="text-red-400" size={24} />;
    if (type.includes('word') || type.includes('document')) return <FileText className="text-blue-400" size={24} />;
    if (type.includes('text')) return <FileText className="text-green-400" size={24} />;
    return <File className="text-purple-400" size={24} />;
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
            <div className="p-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg">
              <Upload size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Upload Learning Material</h3>
              <p className="text-sm text-slate-400">PDF, DOC, DOCX, TXT, MD (Max 20MB)</p>
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
        <div
          {...getRootProps()}
          className={`
            relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
            transition-all duration-200 overflow-hidden
            ${isDragActive 
              ? 'border-purple-500 bg-purple-500/10' 
              : file 
                ? 'border-green-500 bg-green-500/10'
                : error
                  ? 'border-red-500 bg-red-500/10'
                  : 'border-slate-600 hover:border-purple-500 hover:bg-slate-700/30'
            }
          `}
        >
          <input {...getInputProps()} />

          {/* Progress overlay */}
          {processing && (
            <div 
              className="absolute inset-0 bg-purple-500/20 transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          )}

          {file ? (
            <div className="relative z-10">
              <div className="flex items-center justify-center mb-4">
                {getFileIcon(file)}
              </div>
              <p className="text-white font-medium mb-1">{file.name}</p>
              <p className="text-sm text-slate-400 mb-2">{formatFileSize(file.size)}</p>
              
              {processing ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 text-purple-400">
                    <Loader size={16} className="animate-spin" />
                    <span className="text-sm">Uploading... {uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-700 h-1 rounded-full">
                    <div 
                      className="bg-purple-500 h-1 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-center gap-2 text-green-400 mb-3">
                    <CheckCircle size={16} />
                    <span className="text-sm">Ready to process</span>
                  </div>
                  <button
                    onClick={removeFile}
                    className="text-sm text-red-400 hover:text-red-300"
                  >
                    Remove file
                  </button>
                </>
              )}
            </div>
          ) : error ? (
            <div>
              <AlertCircle size={48} className="mx-auto text-red-400 mb-4" />
              <p className="text-red-400 mb-2">{error}</p>
              <p className="text-sm text-slate-400">Click or drag to try again</p>
            </div>
          ) : (
            <>
              <Upload 
                size={48} 
                className={`mx-auto mb-4 ${
                  isDragActive ? 'text-purple-400' : 'text-slate-500'
                }`} 
              />
              <p className="text-white text-lg mb-2">
                {isDragActive ? 'Drop your file here' : 'Drag & drop your file'}
              </p>
              <p className="text-sm text-slate-400 mb-4">
                or <span className="text-purple-400 hover:text-purple-300">browse files</span>
              </p>
              <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <FileText size={12} /> PDF
                </span>
                <span className="flex items-center gap-1">
                  <FileText size={12} /> DOC/DOCX
                </span>
                <span className="flex items-center gap-1">
                  <FileText size={12} /> TXT/MD
                </span>
              </div>
            </>
          )}
        </div>

        {/* AI Features */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="bg-purple-500/10 p-3 rounded-lg">
            <Brain size={18} className="text-purple-400 mb-2" />
            <h4 className="text-sm font-medium text-white mb-1">Smart Analysis</h4>
            <p className="text-xs text-slate-400">AI-powered content understanding</p>
          </div>
          <div className="bg-indigo-500/10 p-3 rounded-lg">
            <Zap size={18} className="text-indigo-400 mb-2" />
            <h4 className="text-sm font-medium text-white mb-1">Auto-Structure</h4>
            <p className="text-xs text-slate-400">Creates organized learning paths</p>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
          <div className="flex items-start gap-2">
            <Sparkles size={14} className="text-blue-400 mt-0.5" />
            <div>
              <p className="text-xs text-blue-300 font-medium mb-1">Pro Tips:</p>
              <ul className="text-xs text-slate-400 space-y-1">
                <li>• Include clear headings and sections</li>
                <li>• Use bullet points for topics</li>
                <li>• Mention timeframes (days/weeks)</li>
                <li>• List prerequisites if any</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FileUploader;
