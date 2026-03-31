import React, { useState } from 'react';
import axios from 'axios';
import UploadZone from './components/UploadZone';
import ResultDisplay from './components/ResultDisplay';
import { Camera, Hexagon } from 'lucide-react';

function App() {
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [fileData, setFileData] = useState({ url: null, name: null });

  const handleUpload = async (file, previewUrl) => {
    setIsUploading(true);
    setFileData({ url: previewUrl, name: file.name });
    
    // Create FormData for the API request
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:8000/api/detect', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Simulate slight delay for dramatic effect if response is extremely fast
      setTimeout(() => {
        setResult(response.data);
        setIsUploading(false);
      }, 800);
      
    } catch (error) {
      console.error('Upload error:', error);
      alert(error.response?.data?.detail || 'An error occurred during analysis. Make sure the backend Server is running!');
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setFileData({ url: null, name: null });
  };

  return (
    <div className="min-h-screen flex flex-col pt-12 pb-20 px-4 sm:px-6 relative">
      
      {/* Decorative Blob Elements */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-primary/20 rounded-full mix-blend-screen filter blur-[100px] opacity-40 animate-pulse-slow pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-accent/20 rounded-full mix-blend-screen filter blur-[100px] opacity-40 animate-pulse-slow pointer-events-none" style={{ animationDelay: '1.5s' }}></div>

      <main className="flex-grow flex flex-col items-center max-w-7xl mx-auto w-full z-10">
        
        {/* Header Section */}
        <div className="text-center mb-12 transform transition-all">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Hexagon size={64} className="text-primary rotate-90" strokeWidth={1.5} />
              <Camera size={28} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white/90" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
            Deepfake <span className="text-primary">Detector</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto font-light leading-relaxed">
            Harnessing the power of advanced EfficientNet forensics to authenticate media provenance and issue cryptographically secure digital credentials.
          </p>
        </div>

        {/* Dynamic Content Area */}
        <div className="w-full">
          {!result ? (
            <UploadZone onUpload={handleUpload} isUploading={isUploading} />
          ) : (
             <ResultDisplay 
               result={result} 
               fileUrl={fileData.url} 
               fileName={fileData.name} 
               onReset={handleReset} 
             />
          )}
        </div>

      </main>

      {/* Footer */}
      <footer className="mt-16 text-center text-gray-500 text-sm z-10 font-medium">
        <p>Deepfake Analysis Project &copy; {new Date().getFullYear()}</p>
        <p className="mt-1 text-gray-600 font-normal">Powered by React, FastAPI, & ONNX Runtime</p>
      </footer>
    </div>
  );
}

export default App;
