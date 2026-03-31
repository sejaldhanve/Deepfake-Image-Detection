import React, { useEffect, useRef } from 'react';
import { Terminal } from 'lucide-react';

const TerminalMonitor = ({ logs }) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="w-full max-w-sm h-96 bg-black/80 border border-green-500/30 rounded-lg flex flex-col shadow-[0_0_15px_rgba(34,197,94,0.15)] font-mono text-xs z-10 hidden lg:flex backdrop-blur-md">
      {/* Header */}
      <div className="bg-green-900/40 border-b border-green-500/30 px-3 py-2 flex items-center justify-between rounded-t-lg">
        <div className="flex items-center text-green-400 space-x-2">
          <Terminal size={14} />
          <span className="font-bold tracking-widest uppercase text-[10px]">Forensic Terminal</span>
        </div>
        <div className="flex space-x-1.5 px-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
        </div>
      </div>
      
      {/* Logs Area */}
      <div 
        ref={scrollRef}
        className="flex-1 p-3 overflow-y-auto w-full space-y-1 scrollbar-thin scrollbar-thumb-green-900 scrollbar-track-transparent rounded-b-lg"
      >
        {logs.length === 0 ? (
          <div className="text-green-700/50 italic">Waiting for input...</div>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="text-green-400 opacity-90 break-words flex items-start">
              <span className="text-green-600 mr-2 shrink-0">root@sys:~#</span>
              <span className="whitespace-pre-wrap">{log}</span>
            </div>
          ))
        )}
        {/* Blinking Cursor */}
        <div className="w-2 h-4 bg-green-400 animate-pulse mt-1 inline-block"></div>
      </div>
    </div>
  );
};

export default TerminalMonitor;
