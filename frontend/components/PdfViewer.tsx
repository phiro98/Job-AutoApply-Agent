'use client';

import React from 'react';
import { Download } from 'lucide-react';

export default function PdfViewer() {
  return (
    <div className="w-full max-w-2xl bg-white shadow-xl rounded-lg overflow-hidden border border-slate-200 flex flex-col h-full min-h-[600px]">
      <div className="bg-slate-50 border-b border-slate-200 p-3 flex justify-between items-center">
        <span className="text-sm font-medium text-slate-600">Document.pdf</span>
        <button className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded transition-colors">
          <Download size={16} />
        </button>
      </div>
      
      {/* Mock PDF Content Area */}
      <div className="flex-grow p-8 bg-white overflow-y-auto">
        <div className="max-w-xl mx-auto space-y-6">
          <div className="border-b-2 border-slate-800 pb-4 text-center">
            <h1 className="text-3xl font-serif text-slate-900">Jane Doe</h1>
            <p className="text-sm text-slate-600 mt-2">Software Engineer | jane.doe@example.com | (555) 123-4567</p>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wider">Experience</h2>
            
            <div className="relative pl-4 border-l-2 border-blue-200">
              <div className="absolute w-2 h-2 bg-blue-500 rounded-full -left-[5px] top-1.5"></div>
              <h3 className="font-semibold text-slate-900">Senior Developer @ TechCorp</h3>
              <p className="text-xs text-slate-500 mb-2">2021 - Present</p>
              <ul className="list-disc list-outside ml-4 text-sm text-slate-700 space-y-1">
                <li>Architected scalable microservices using Python and FastAPI.</li>
                <li className="bg-yellow-100 px-1 rounded">Optimized database queries resulting in a 40% performance increase. (Highlighted: tailored to JD)</li>
                <li>Led a team of 5 engineers delivering features ahead of schedule.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
