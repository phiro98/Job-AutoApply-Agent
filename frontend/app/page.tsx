'use client';

import React, { useState, useRef } from 'react';
import ChatInterface from '@/components/ChatInterface';
import PdfViewer from '@/components/PdfViewer';
import { UploadCloud, Loader2 } from 'lucide-react';

export default function Home() {
  const [isUploaded, setIsUploaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cvData, setCvData] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setIsLoading(true);
      
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cv/upload`, {
          method: 'POST',
          body: formData,
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log("Parsed CV from Gemini:", data.schema);
          setCvData(data.schema);
          setIsUploaded(true);
        } else {
          console.error("Upload failed");
          alert("Failed to parse CV. Ensure Gemini API key is valid.");
        }
      } catch (error) {
        console.error("Error uploading file:", error);
        alert("Network error. Is the Python backend running?");
      } finally {
        setIsLoading(false);
      }
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
          
          <label 
            htmlFor="cv-upload"
            className={`border-2 border-dashed rounded-xl p-12 transition-all flex flex-col items-center block w-full
              ${isLoading 
                ? 'border-blue-400 bg-blue-50 dark:bg-slate-900 cursor-wait' 
                : 'border-slate-300 dark:border-slate-700 cursor-pointer hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-slate-900'
              }`}
          >
            {isLoading ? (
              <>
                <Loader2 size={48} className="text-blue-500 mb-4 animate-spin" />
                <span className="font-medium text-slate-700 dark:text-slate-300">Parsing with Gemini AI...</span>
                <span className="text-xs text-slate-500 mt-2">Extracting skills & history</span>
              </>
            ) : (
              <>
                <UploadCloud size={48} className="text-blue-500 mb-4" />
                <span className="font-medium text-slate-700 dark:text-slate-300">Click to browse files</span>
                <span className="text-xs text-slate-500 mt-2">PDF or DOCX</span>
              </>
            )}
          </label>
          <input 
            id="cv-upload"
            type="file" 
            className="hidden" 
            accept=".pdf,.docx"
            onChange={handleUpload}
            disabled={isLoading}
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
          <ChatInterface cvData={cvData} setCvData={setCvData} />
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
          <PdfViewer cvData={cvData} />
        </div>
      </div>
    </main>
  );
}
