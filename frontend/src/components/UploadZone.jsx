import React, { useCallback, useState } from 'react';
import { UploadCloud, FileImage, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const UploadZone = ({ onUpload, isUploading }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file) => {
    if (!file.type.startsWith('image/')) {
      alert('Only image files are currently supported.');
      return;
    }
    
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const clearSelection = (e) => {
    e.stopPropagation();
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const submitUpload = () => {
    if (selectedFile) {
      onUpload(selectedFile, previewUrl);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div 
        className={`relative border-2 border-dashed rounded-2xl p-8 transition-all duration-300 ease-in-out cursor-pointer overflow-hidden
          ${dragActive ? 'border-primary bg-primary/10' : 'border-white/20 glass-panel hover:border-primary/50'}
          ${selectedFile ? 'min-h-[300px]' : 'min-h-[200px] flex flex-col items-center justify-center'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input 
          type="file" 
          id="file-upload" 
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 hidden" 
          onChange={handleChange}
          accept="image/*"
        />

        <AnimatePresence mode="wait">
          {!selectedFile ? (
            <motion.div 
              key="upload-prompt"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center text-center z-20 pointer-events-none"
            >
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4 text-primary">
                <UploadCloud size={32} />
              </div>
              <p className="text-xl font-medium text-white mb-2">Drag & drop your media here</p>
              <p className="text-sm text-gray-400 mb-6">Supports JPG, PNG (Max 5MB)</p>
              <button 
                onClick={() => document.getElementById('file-upload').click()}
                className="pointer-events-auto px-6 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-sm font-medium transition-colors"
              >
                Browse Files
              </button>
            </motion.div>
          ) : (
            <motion.div 
              key="file-preview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0 w-full h-full z-20 flex flex-col"
            >
              <div className="relative w-full h-full p-4 flex flex-col items-center justify-center pointer-events-none">
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="max-h-[220px] max-w-full object-contain rounded-lg shadow-2xl z-10"
                />
                <button 
                  onClick={clearSelection}
                  className="pointer-events-auto absolute top-4 right-4 p-2 bg-black/50 hover:bg-danger/80 rounded-full backdrop-blur-md text-white transition-colors z-30"
                >
                  <X size={20} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {selectedFile && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center bg-surface/40 border border-white/10 p-4 rounded-xl"
        >
          <div className="flex items-center space-x-3 truncate flex-1 pr-4">
            <div className="p-2 bg-primary/20 rounded-lg text-primary">
              <FileImage size={24} />
            </div>
            <div className="flex flex-col truncate">
              <span className="text-sm font-medium text-white truncate">{selectedFile.name}</span>
              <span className="text-xs text-gray-400">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
            </div>
          </div>
          <button 
            onClick={submitUpload}
            disabled={isUploading}
            className={`px-6 py-3 rounded-lg font-semibold shadow-lg transition-all flex items-center space-x-2
              ${isUploading 
                ? 'bg-primary/50 cursor-not-allowed hidden' 
                : 'bg-primary hover:bg-blue-600 active:scale-95 text-white shadow-primary/20 hover:shadow-primary/40'
              }`}
          >
            {isUploading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Processing Models...</span>
              </>
            ) : (
              <span>Analyze Media</span>
            )}
          </button>
        </motion.div>
      )}

      {isUploading && (
        <motion.div
           initial={{ opacity: 0, height: 0 }}
           animate={{ opacity: 1, height: 'auto' }}
           className="w-full bg-surface/50 border border-primary/30 p-6 rounded-xl text-center space-y-4 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
        >
          <div className="relative inline-flex items-center justify-center">
            <Loader2 size={40} className="text-primary animate-spin" />
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full"></div>
          </div>
          <div className="space-y-1">
             <h3 className="text-lg font-semibold text-primary animate-pulse w-full">Artificial Intelligence Analysis in Progress</h3>
             <p className="text-sm text-gray-400">Extracting deep pixel features and passing through the Custom EfficientNet B0...</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default UploadZone;
