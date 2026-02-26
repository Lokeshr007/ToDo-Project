// frontend/src/features/ai-assistant/components/FileUploadZone.jsx
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { 
  Upload, 
  File, 
  FileText, 
  X, 
  CheckCircle, 
  AlertCircle,
  Loader,
  RefreshCw
} from "lucide-react";

function FileUploadZone({ 
  onFileUpload, 
  processing, 
  uploadedFile,
  acceptedTypes = ['.pdf', '.doc', '.docx', '.txt'],
  maxSize = 10 * 1024 * 1024 // 10MB default
}) {
  const [error, setError] = useState(null);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    setError(null);
    
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors[0]?.code === 'file-too-large') {
        setError(`File too large. Max size: ${maxSize / (1024 * 1024)}MB`);
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        setError(`Invalid file type. Accepted: ${acceptedTypes.join(', ')}`);
      } else {
        setError('Invalid file. Please try again.');
      }
      return;
    }
    
    if (acceptedFiles.length > 0) {
      onFileUpload(acceptedFiles[0]);
    }
  }, [onFileUpload, acceptedTypes, maxSize]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    maxSize,
    maxFiles: 1
  });

  const removeFile = (e) => {
    e.stopPropagation();
    onFileUpload(null);
  };

  const getFileIcon = (fileName) => {
    const ext = fileName?.split('.').pop()?.toLowerCase();
    switch(ext) {
      case 'pdf':
        return <FileText size={24} className="text-red-400" />;
      case 'doc':
      case 'docx':
        return <FileText size={24} className="text-blue-400" />;
      case 'txt':
        return <FileText size={24} className="text-green-400" />;
      default:
        return <File size={24} className="text-purple-400" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
          transition-all duration-200
          ${isDragActive 
            ? 'border-purple-500 bg-purple-500/10' 
            : uploadedFile 
              ? 'border-green-500 bg-green-500/10' 
              : error
                ? 'border-red-500 bg-red-500/10'
                : 'border-slate-600 hover:border-purple-500 hover:bg-slate-700/30'
          }
        `}
      >
        <input {...getInputProps()} />
        
        {processing ? (
          <div className="py-8">
            <Loader size={48} className="mx-auto text-purple-400 animate-spin mb-4" />
            <p className="text-white">Processing your file...</p>
            <p className="text-sm text-slate-400 mt-2">This may take a few seconds</p>
          </div>
        ) : uploadedFile ? (
          <div className="py-4">
            <div className="flex items-center justify-center mb-4">
              {getFileIcon(uploadedFile.name)}
            </div>
            <p className="text-white font-medium">{uploadedFile.name}</p>
            <p className="text-sm text-slate-400 mt-1">
              {formatFileSize(uploadedFile.size)}
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <CheckCircle size={16} className="text-green-400" />
              <span className="text-sm text-green-400">File uploaded successfully</span>
            </div>
            <button
              onClick={removeFile}
              className="mt-4 text-sm text-red-400 hover:text-red-300 flex items-center gap-1 mx-auto"
            >
              <X size={14} />
              Remove and upload different file
            </button>
          </div>
        ) : error ? (
          <div className="py-8">
            <AlertCircle size={48} className="mx-auto text-red-400 mb-4" />
            <p className="text-red-400">{error}</p>
            <p className="text-sm text-slate-400 mt-4">
              Click or drag to try again
            </p>
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
              {isDragActive 
                ? 'Drop your file here' 
                : 'Drag & drop your study plan here'}
            </p>
            <p className="text-sm text-slate-400 mb-4">
              or <span className="text-purple-400 hover:text-purple-300">browse files</span>
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
              <span>Supported: {acceptedTypes.join(', ')}</span>
              <span className="w-1 h-1 bg-slate-600 rounded-full" />
              <span>Max: {maxSize / (1024 * 1024)}MB</span>
            </div>
          </>
        )}
      </div>

      {/* Tips Section */}
      {!uploadedFile && !error && !processing && (
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
          <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
            <AlertCircle size={14} className="text-purple-400" />
            Tips for best results:
          </h4>
          <ul className="text-xs text-slate-300 space-y-1">
            <li>• Include clear daily or weekly topics</li>
            <li>• Specify study hours per day if possible</li>
            <li>• Mention milestones or deadlines</li>
            <li>• Use bullet points for better parsing</li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default FileUploadZone;