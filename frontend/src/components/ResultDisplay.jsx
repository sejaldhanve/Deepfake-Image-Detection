import React, { useState } from 'react';
import { Download, AlertCircle, CheckCircle, ShieldCheck, DownloadCloud, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { Capacitor } from '@capacitor/core';
import axios from 'axios';

const BACKEND_URL = 'http://192.168.0.103:8000';

const ResultDisplay = ({ result, fileUrl, fileName, fileBlob, onReset }) => {
  const isReal = result.prediction === "REAL";
  const confidence = result.confidence;
  const isHighConfidence = confidence > 85;
  const [downloading, setDownloading] = useState(false);

  const mainColor = isReal ? 'text-success' : 'text-danger';
  const mainBg = isReal ? 'bg-success/20' : 'bg-danger/20';
  const mainBorder = isReal ? 'border-success/30' : 'border-danger/30';
  const shadowGlow = isReal ? 'shadow-[0_0_30px_rgba(16,185,129,0.2)]' : 'shadow-[0_0_30px_rgba(239,68,68,0.2)]';

  const handleDownloadCertificate = async () => {
    setDownloading(true);
    try {
      const formData = new FormData();
      let uploadFile = fileBlob;
      if (!uploadFile) {
         const response = await fetch(fileUrl);
         const blob = await response.blob();
         uploadFile = new File([blob], fileName, { type: blob.type });
      }
      formData.append('file', uploadFile);
      
      const response = await axios.post(
        `${BACKEND_URL}/api/certificate?prediction=${result.prediction}&confidence=${result.confidence}`,
        formData,
        {
          responseType: 'blob',
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      const pdfBlob = response.data;

      if (Capacitor.isNativePlatform()) {
        // --- Mobile: save to device and open share sheet ---
        const { Filesystem, Directory } = await import('@capacitor/filesystem');
        const { Share } = await import('@capacitor/share');

        // Convert blob to base64
        const base64Data = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = reader.result.split(',')[1];
            resolve(base64);
          };
          reader.readAsDataURL(pdfBlob);
        });

        const savedFile = await Filesystem.writeFile({
          path: `Deepfake_Certificate_${fileName}.pdf`,
          data: base64Data,
          directory: Directory.Cache,
        });

        await Share.share({
          title: 'Deepfake Analysis Certificate',
          text: `Certificate for ${fileName}`,
          url: savedFile.uri,
          dialogTitle: 'Save or Share Certificate',
        });
      } else {
        // --- Browser: standard download ---
        const url = window.URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `Deepfake_Certificate_${fileName}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to download certificate: " + error.message);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full max-w-4xl mx-auto"
    >
      <button 
        onClick={onReset}
        className="mb-6 flex items-center space-x-2 text-gray-400 hover:text-white transition-colors cursor-pointer group"
      >
        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        <span>Analyze another file</span>
      </button>

      <div className={`glass-panel rounded-2xl p-8 lg:p-10 ${mainBorder} ${shadowGlow} relative overflow-hidden`}>
        {/* Decorative Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none mix-blend-overlay"></div>

        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-stretch">
          
          {/* Left Column: Image Preview */}
          <div className="w-full md:w-5/12 flex flex-col justify-center">
            <div className={`rounded-xl overflow-hidden border-2 ${mainBorder} relative group`}>
              <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium border border-white/10 z-10 text-white">
                {fileName}
              </div>
              <img src={fileUrl} alt="Analyzed" className="w-full h-auto object-cover select-none" />
              
              {/* Overlay scanning effect */}
              <div className="absolute inset-x-0 top-0 h-1 bg-white/50 blur-[2px] animate-pulse-slow shadow-[0_0_10px_#fff]"></div>
            </div>
          </div>

          {/* Right Column: Analysis Detail */}
          <div className="w-full md:w-7/12 flex flex-col justify-between space-y-6">
            
            <div className="space-y-2 text-center md:text-left">
              <h2 className="text-xl text-gray-400 font-medium tracking-wide uppercase flex items-center justify-center md:justify-start gap-2">
                <ShieldCheck size={20} className="text-primary" />
                Forensic Result
              </h2>
              <div className="flex items-center justify-center md:justify-start gap-4">
                <h1 className={`text-6xl md:text-7xl font-extrabold tracking-tight ${mainColor} uppercase drop-shadow-md`}>
                  {result.prediction}
                </h1>
                {isReal ? <CheckCircle size={48} className={mainColor} /> : <AlertCircle size={48} className={mainColor} />}
              </div>
            </div>

            <div className="bg-black/30 rounded-xl p-6 border border-white/5 shadow-inner">
              <div className="flex justify-between items-end mb-2">
                <span className="text-gray-300 font-medium">Confidence Margin</span>
                <span className={`text-2xl font-bold ${mainColor}`}>{confidence.toFixed(1)}%</span>
              </div>
              
              <div className="w-full bg-surface rounded-full h-4 shadow-inner overflow-hidden relative">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${confidence}%` }}
                  transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
                  className={`h-full rounded-full ${isReal ? 'bg-success' : 'bg-danger'} shadow-[inset_0_2px_4px_rgba(255,255,255,0.3)]`}
                />
              </div>
              
              <p className="text-xs text-gray-500 mt-3 flex justify-between">
                <span>Model Output: {result.prediction} detected</span>
                <span>{isHighConfidence ? 'Highly Certain' : 'Borderline Prediction'}</span>
              </p>
            </div>

            <button
               onClick={handleDownloadCertificate}
               disabled={downloading}
               className={`w-full py-4 rounded-xl font-bold tracking-wide transition-all transform flex items-center justify-center space-x-3
                 ${isReal 
                   ? 'bg-gradient-to-r from-success/90 to-emerald-600 hover:from-success hover:to-emerald-500 shadow-lg shadow-success/30 hover:scale-[1.02]' 
                   : 'bg-gradient-to-r from-danger/90 to-rose-600 hover:from-danger hover:to-rose-500 shadow-lg shadow-danger/30 hover:scale-[1.02]'
                 } text-white
               `}
            >
              {downloading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Generating Certificate...</span>
                </>
              ) : (
                <>
                  <DownloadCloud size={24} />
                  <span>Download Proof of Authenticity (PDF)</span>
                </>
              )}
            </button>
            <p className="text-xs text-center text-gray-500">
              Certificate includes SHA-256 cryptographic hash of your unique file mapping to the neural network inference prediction.
            </p>

          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ResultDisplay;
