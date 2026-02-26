
export const extractTextFromFile = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const fileType = file.name.split('.').pop().toLowerCase();
    
    reader.onload = async (e) => {
      try {
        let text = e.target.result;
        
        // Handle different file types
        if (fileType === 'pdf') {
          // For PDFs, we'd need pdf.js or similar
          // For now, return placeholder
          text = '[PDF content would be extracted here]';
        } else if (fileType === 'docx') {
          // For DOCX, would need mammoth.js or similar
          text = '[DOCX content would be extracted here]';
        }
        
        resolve(text);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(reader.error);
    
    if (fileType === 'txt' || fileType === 'md' || fileType === 'text') {
      reader.readAsText(file);
    } else {
      // For other file types, just return the name
      resolve(`File: ${file.name}\nType: ${fileType}\nSize: ${file.size} bytes`);
    }
  });
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Get file icon based on type
 */
export const getFileIcon = (fileName) => {
  const ext = fileName?.split('.').pop()?.toLowerCase();
  
  const icons = {
    pdf: '📄',
    doc: '📝',
    docx: '📝',
    txt: '📃',
    md: '📑',
    ppt: '📊',
    pptx: '📊',
    xls: '📈',
    xlsx: '📈',
    jpg: '🖼️',
    jpeg: '🖼️',
    png: '🖼️',
    gif: '🎨',
    mp4: '🎥',
    mp3: '🎵',
    zip: '🗜️',
    rar: '🗜️'
  };
  
  return icons[ext] || '📁';
};

/**
 * Get file color based on type
 */
export const getFileColor = (fileName) => {
  const ext = fileName?.split('.').pop()?.toLowerCase();
  
  const colors = {
    pdf: 'text-red-400',
    doc: 'text-blue-400',
    docx: 'text-blue-400',
    txt: 'text-green-400',
    md: 'text-purple-400',
    ppt: 'text-orange-400',
    pptx: 'text-orange-400',
    xls: 'text-emerald-400',
    xlsx: 'text-emerald-400',
    jpg: 'text-pink-400',
    jpeg: 'text-pink-400',
    png: 'text-pink-400',
    zip: 'text-yellow-400'
  };
  
  return colors[ext] || 'text-slate-400';
};

/**
 * Validate file type
 */
export const isValidFileType = (file, allowedTypes) => {
  const ext = file.name.split('.').pop()?.toLowerCase();
  return allowedTypes.includes(ext);
};

/**
 * Validate file size
 */
export const isValidFileSize = (file, maxSizeMB) => {
  return file.size <= maxSizeMB * 1024 * 1024;
};

/**
 * Read file as data URL
 */
export const readFileAsDataURL = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Read file as text
 */
export const readFileAsText = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsText(file);
  });
};