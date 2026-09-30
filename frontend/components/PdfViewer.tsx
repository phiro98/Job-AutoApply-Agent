'use client';

import React from 'react';
import { Download } from 'lucide-react';

export default function PdfViewer({ cvData }: { cvData?: any }) {
  if (!cvData) {
    return (
      <div className="w-full max-w-2xl bg-white shadow-xl rounded-lg overflow-hidden border border-slate-200 flex flex-col h-full min-h-[600px] items-center justify-center text-slate-500">
        No CV data available.
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl bg-white shadow-xl rounded-lg overflow-hidden border border-slate-200 flex flex-col h-full min-h-[600px]">
      <div className="bg-slate-50 border-b border-slate-200 p-3 flex justify-between items-center">
        <span className="text-sm font-medium text-slate-600">Document.pdf</span>
        <button className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded transition-colors">
          <Download size={16} />
        </button>
      </div>
      
      <div className="flex-grow p-8 bg-white overflow-y-auto">
        <div className="max-w-xl mx-auto space-y-6">
          <div className="border-b-2 border-slate-800 pb-4 text-center">
            <h1 className="text-3xl font-serif text-slate-900">{cvData.personal_details?.name || 'Applicant'}</h1>
            <p className="text-sm text-slate-600 mt-2">
              {[
                cvData.personal_details?.email, 
                cvData.personal_details?.phone, 
                ...(cvData.personal_details?.links || [])
              ].filter(Boolean).join(' | ')}
            </p>
          </div>
          
          {cvData.work_history && cvData.work_history.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wider">Experience</h2>
              
              {cvData.work_history.map((job: any, i: number) => (
                <div key={i} className="relative pl-4 border-l-2 border-blue-200 mb-4">
                  <div className="absolute w-2 h-2 bg-blue-500 rounded-full -left-[5px] top-1.5"></div>
                  <h3 className="font-semibold text-slate-900">{job.title} @ {job.company}</h3>
                  <p className="text-xs text-slate-500 mb-2">{job.dates}</p>
                  <ul className="list-disc list-outside ml-4 text-sm text-slate-700 space-y-1">
                    {job.bullets?.map((bullet: string, j: number) => (
                      <li key={j}>{bullet}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {cvData.skills && cvData.skills.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wider">Skills</h2>
              <div className="flex flex-wrap gap-2 text-sm text-slate-700">
                {cvData.skills.join(', ')}
              </div>
            </div>
          )}

          {cvData.education && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wider">Education</h2>
              <div className="text-sm text-slate-700">
                {cvData.education}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
