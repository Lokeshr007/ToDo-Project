import React, { useState, useRef } from 'react';
import { Upload, X, Loader, FileText } from 'lucide-react';
import API from '@/services/api';
import { taskToast } from '@/shared/components/QuantumToaster';

const FileUpload = ({ todoId, onUploadSuccess }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 25 * 1024 * 1024) {
        taskToast.error("File size exceeds 25MB limit");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await API.post(`/attachments/upload/${todoId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      taskToast.success(`Uploaded: ${selectedFile.name}`);
      setSelectedFile(null);
      if (onUploadSuccess) onUploadSuccess(response.data);
    } catch (error) {
      console.error("Upload failed", error);
      taskToast.error(error.response?.data?.error || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="mt-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      
      {!selectedFile ? (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-2.5 px-4 bg-gray-800 border-2 border-dashed border-gray-700 hover:border-purple-500/50 hover:bg-gray-800/80 rounded-lg text-gray-400 hover:text-gray-200 transition-all flex items-center justify-center gap-2 group"
          type="button"
        >
          <Upload size={16} className="group-hover:translate-y-[-2px] transition-transform" />
          <span className="text-sm font-medium">Click to upload files</span>
        </button>
      ) : (
        <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between p-3 bg-purple-600/10 border border-purple-500/30 rounded-lg">
            <div className="flex items-center gap-3 min-w-0">
              <FileText size={18} className="text-purple-400" />
              <div className="min-w-0">
                <p className="text-xs font-bold text-purple-200 truncate">{selectedFile.name}</p>
                <p className="text-[10px] text-purple-400/70">{(selectedFile.size / 1024).toFixed(0)} KB</p>
              </div>
            </div>
            <button 
              onClick={() => setSelectedFile(null)}
              className="p-1 hover:bg-purple-500/20 rounded-md text-purple-400 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
          
          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="w-full py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <>
                <Loader size={14} className="animate-spin" />
                Uploading...
              </>
            ) : (
              'Start Upload'
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
