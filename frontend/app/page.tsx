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
          {!isUploaded ? (
            <div className="bg-white dark:bg-slate-950 p-10 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 max-w-md w-full text-center mt-10">
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">Upload Master CV</h3>
              <p className="text-sm text-slate-500 mb-6">PDF or DOCX format</p>
              
              <label 
                htmlFor="cv-upload"
                className={`border-2 border-dashed rounded-xl p-8 transition-all flex flex-col items-center cursor-pointer w-full
                  ${isLoading 
                    ? 'border-blue-400 bg-blue-50 dark:bg-slate-900 cursor-wait' 
                    : 'border-slate-300 dark:border-slate-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-slate-900'
                  }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={32} className="text-blue-500 mb-3 animate-spin" />
                    <span className="font-medium text-slate-700 dark:text-slate-300 text-sm">Parsing with AI...</span>
                    <span className="text-xs text-slate-500 mt-2">Extracting skills & history</span>
                  </>
                ) : (
                  <>
                    <UploadCloud size={32} className="text-blue-500 mb-3" />
                    <span className="font-medium text-slate-700 dark:text-slate-300 text-sm">Click to upload</span>
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
          ) : (
            <PdfViewer cvData={cvData} />
          )}
        </div>
      </div>
    </main>
  );
}
