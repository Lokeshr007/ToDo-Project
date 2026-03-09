import React, { useState, useEffect } from 'react';
import { Paperclip, Download, X, Loader, File, FileText, FileImage, FileCode, Trash2 } from 'lucide-react';
import API from '@/services/api';
import { taskToast } from '@/shared/components/QuantumToaster';

const AttachmentList = ({ todoId, attachments, onRefresh, onDelete }) => {
  if (!attachments || attachments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-gray-800/30 rounded-lg border border-dashed border-gray-700">
        <Paperclip size={20} className="text-gray-600 mb-2" />
        <p className="text-xs text-gray-500">No attachments yet</p>
      </div>
    );
  }

  const getFileIcon = (type) => {
    if (!type) return <File size={16} />;
    if (type.includes('image')) return <FileImage size={16} className="text-blue-400" />;
    if (type.includes('pdf')) return <FileText size={16} className="text-red-400" />;
    if (type.includes('code') || type.includes('javascript') || type.includes('java')) return <FileCode size={16} className="text-green-400" />;
    return <File size={16} className="text-gray-400" />;
  };

  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleDownload = (id, fileName) => {
    API({
      url: `/attachments/download/${id}`,
      method: 'GET',
      responseType: 'blob',
    }).then((response) => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    }).catch(err => {
      console.error("Download failed", err);
      tasktaskToast.error("Failed to download file");
    });
  };

  return (
    <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
      {attachments.map((file) => (
        <div 
          key={file.id} 
          className="flex items-center justify-between p-2.5 bg-gray-800 border border-gray-700 rounded-lg group hover:border-purple-500/50 transition-colors"
        >
          <div className="flex items-center gap-3 min-w-0">
            {getFileIcon(file.fileType)}
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-200 truncate">{file.fileName}</p>
              <p className="text-[10px] text-gray-500">{formatSize(file.fileSize)} • {file.uploadedBy}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => handleDownload(file.id, file.fileName)}
              className="p-1.5 hover:bg-gray-700 rounded-md text-gray-400 hover:text-purple-400 transition-colors"
              title="Download"
            >
              <Download size={14} />
            </button>
            <button
              onClick={() => onDelete(file.id)}
              className="p-1.5 hover:bg-gray-700 rounded-md text-gray-400 hover:text-red-400 transition-colors"
              title="Delete"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AttachmentList;
