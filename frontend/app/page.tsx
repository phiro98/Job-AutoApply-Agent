'use client';

import React, { useState, useRef } from 'react';
import ChatInterface from '@/components/ChatInterface';
import PdfViewer from '@/components/PdfViewer';
import { UploadCloud } from 'lucide-react';

export default function Home() {
  const [isUploaded, setIsUploaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // TODO: Actual API call to backend /api/v1/cv/upload goes here
      setIsUploaded(true);
    }
  };

  if (!isUploaded) {
    return (
      <main className="flex h-screen w-full bg-slate-50 dark:bg-slate-900 items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-950 p-10 rounded-2xl shadow-xl max-w-lg w-full text-center border border-slate-200 dark:border-slate-800">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600 mb-4">
            AutoApply Agent
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            Please upload your master CV to initialize the agent.
          </p>
          
          <div 
            className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-12 cursor-pointer hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-slate-900 transition-all flex flex-col items-center"
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadCloud size={48} className="text-blue-500 mb-4" />
            <span className="font-medium text-slate-700 dark:text-slate-300">Click to browse files</span>
            <span className="text-xs text-slate-500 mt-2">PDF or DOCX</span>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept=".pdf,.docx"
            onChange={handleUpload}
          />
        </div>
      </main>
    );
  }

  return (
    <main className="flex h-screen w-full bg-slate-50 dark:bg-slate-900 overflow-hidden">
      {/* Left panel: Chat Interface */}
      <div className="w-1/2 h-full border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900">
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600">
            AutoApply Agent
          </h1>
          <p className="text-sm text-slate-500">Collaborative CV & Cover Letter Tailoring</p>
        </div>
        <div className="flex-grow overflow-hidden">
          <ChatInterface />
        </div>
      </div>

      {/* Right panel: Live Preview & Document Settings */}
      <div className="w-1/2 h-full flex flex-col bg-slate-100 dark:bg-slate-800/50">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300">Document Preview</h2>
          <div className="space-x-2">
            <button className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors">CV</button>
            <button className="px-3 py-1 text-sm bg-slate-100 text-slate-600 rounded-md hover:bg-slate-200 transition-colors">Cover Letter</button>
          </div>
        </div>
        <div className="flex-grow p-6 overflow-auto flex justify-center items-start">
          <PdfViewer />
        </div>
      </div>
    </main>
  );
}
