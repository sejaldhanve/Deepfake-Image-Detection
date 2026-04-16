import React, { useState } from 'react';
import axios from 'axios';
import UploadZone from './components/UploadZone';
import ResultDisplay from './components/ResultDisplay';
import { Camera, Hexagon } from 'lucide-react';
import ParticlesBackground from './components/ParticlesBackground';
import TerminalMonitor from './components/TerminalMonitor';

const BACKEND_URL = 'https://deepfake-image-detection-cffq.onrender.com';

function App() {
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [fileData, setFileData] = useState({ url: null, name: null });
  const [logs, setLogs] = useState([]);

  const addLog = (msg) => {
    setLogs(prev => [...prev, msg]);
  };

  const handleUpload = async (file, previewUrl) => {
    setIsUploading(true);
    setFileData({ url: previewUrl, name: file.name });
    setLogs([]);
    
    addLog(`[SYS] Initializing Forensic Modules...`);
    setTimeout(() => addLog(`[IO] Reading file: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`), 300);
    setTimeout(() => addLog(`[EXIF] Extracting Exif metadata parameters...`), 800);
    setTimeout(() => addLog(`[SCAN] Initializing EfficientNet B0 analysis...`), 1500);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${BACKEND_URL}/api/detect`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setTimeout(() => {
        addLog(`[API] Received response from model: ${response.data.prediction}`);
        addLog(`[SYS] Analysis complete with ${response.data.confidence.toFixed(1)}% confidence.`);
        setResult(response.data);
        setIsUploading(false);
      }, 2500);

    } catch (error) {
      console.error('Upload error:', error);
      setTimeout(() => {
        addLog(`[ERROR] Connection failed: ${error.message}`);
        addLog(`[SYS] Aborting operation.`);
        alert(error.response?.data?.detail || error.message || 'An error occurred during analysis. Make sure the backend Server is running!');
        setIsUploading(false);
      }, 2500);
    }
  };

  const handleReset = () => {
    setResult(null);
    setFileData({ url: null, name: null });
    setLogs([]);
  };

  return (
    <div className="min-h-screen flex flex-col pt-12 pb-20 px-4 sm:px-6 relative bg-[#0a0a0a]">
      
      {/* Interactive geometric background replacing old blobs */}
      <ParticlesBackground />

      <main className="flex-grow flex flex-col lg:flex-row items-start justify-center max-w-[90rem] mx-auto w-full z-10 gap-8">
        
        {/* Main Interface */}
        <div className="flex-1 w-full max-w-4xl flex flex-col items-center">
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
        </div>

        {/* Right Sidebar Terminal Area */}
        <div className="hidden lg:flex flex-col w-[350px] xl:w-[400px] shrink-0 sticky top-12 mt-32">
          <TerminalMonitor logs={logs} />
        </div>

      </main>

      {/* Footer */}
      <footer className="mt-16 text-center text-gray-500 text-sm z-10 font-medium pb-6 pt-10">
        <p>Deepfake Analysis Project &copy; {new Date().getFullYear()}</p>
        <p className="mt-1 text-gray-600 font-normal">Powered by React, FastAPI, & ONNX Runtime</p>
      </footer>
    </div>
  );
}

export default App;
