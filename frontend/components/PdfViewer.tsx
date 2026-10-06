'use client';

import React from 'react';
import { Download, MapPin, Mail, Phone, Linkedin, Github, Globe } from 'lucide-react';

export default function PdfViewer({ cvData }: { cvData?: any }) {
  if (!cvData) {
    return (
      <div className="w-full max-w-2xl bg-white shadow-xl rounded-lg overflow-hidden border border-slate-200 flex flex-col h-full min-h-[600px] items-center justify-center text-slate-500">
        No CV data available.
      </div>
    );
  }

  const handleDownload = () => {
    const printContent = document.getElementById('cv-preview-content');
    if (!printContent) return;
    
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    
    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(`
        <html>
          <head>
            <title>\${cvData.personal_details?.name || 'CV'}</title>
            <style>
              body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.5; color: #333; margin: 0; padding: 40px; }
              .text-center { text-align: center; }
              .text-3xl { font-size: 24px; font-weight: bold; margin-bottom: 4px; margin-top: 0; }
              .text-sm { font-size: 14px; }
              .text-xs { font-size: 12px; }
              .mt-2 { margin-top: 8px; }
              .mt-1 { margin-top: 4px; }
              .text-slate-600 { color: #475569; }
              .text-slate-500 { color: #64748b; }
              .text-slate-700 { color: #334155; }
              .text-slate-900 { color: #0f172a; }
              .border-b-2 { border-bottom: 2px solid #1e293b; padding-bottom: 16px; margin-bottom: 24px; }
              h2 { font-size: 16px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; color: #1e293b; margin-top: 24px; margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
              h3 { font-size: 16px; font-weight: 600; margin-bottom: 4px; margin-top: 0; }
              .mb-2 { margin-bottom: 8px; }
              .mb-4 { margin-bottom: 16px; }
              ul { margin-top: 8px; margin-bottom: 16px; padding-left: 20px; }
              li { margin-bottom: 4px; }
              .flex { display: flex; }
              .flex-wrap { flex-wrap: wrap; }
              .gap-2 { gap: 8px; }
              .gap-1 { gap: 4px; }
              .items-center { align-items: center; }
              .justify-center { justify-content: center; }
              .absolute, .rounded-full { display: none; /* Hide timeline dots in print */ }
              .border-l-2 { border-left: none; padding-left: 0; }
              svg { display: inline-block; vertical-align: middle; width: 14px; height: 14px; }
            </style>
          </head>
          <body>
            \${printContent.innerHTML}
          </body>
        </html>
      `);
      doc.close();
      
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        document.body.removeChild(iframe);
      }, 250);
    }
  };

  return (
    <div className="w-full max-w-2xl bg-white shadow-xl rounded-lg overflow-hidden border border-slate-200 flex flex-col h-full min-h-[600px]">
      <div className="bg-slate-50 border-b border-slate-200 p-3 flex justify-between items-center">
        <span className="text-sm font-medium text-slate-600">Document.pdf</span>
        <button onClick={handleDownload} className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded transition-colors" title="Download as PDF">
          <Download size={16} />
        </button>
      </div>
      
      <div className="flex-grow p-8 bg-white overflow-y-auto">
        <div id="cv-preview-content" className="max-w-xl mx-auto space-y-6">
          <div className="border-b-2 border-slate-800 pb-4 text-center">
            <h1 className="text-3xl font-serif text-slate-900">{cvData.personal_details?.name || 'Applicant'}</h1>
            <div className="flex flex-wrap justify-center items-center gap-4 text-sm text-slate-600 mt-2">
              {cvData.personal_details?.email && (
                <span className="flex items-center gap-1"><Mail size={14} /> {cvData.personal_details.email}</span>
              )}
              {cvData.personal_details?.phone && (
                <span className="flex items-center gap-1"><Phone size={14} /> {cvData.personal_details.phone}</span>
              )}
              {cvData.personal_details?.location && (
                <span className="flex items-center gap-1"><MapPin size={14} /> {cvData.personal_details.location}</span>
              )}
              {cvData.personal_details?.links?.map((link: string, i: number) => {
                const isLinkedin = link.toLowerCase().includes('linkedin');
                const isGithub = link.toLowerCase().includes('github');
                return (
                  <span key={i} className="flex items-center gap-1">
                    {isLinkedin ? <Linkedin size={14} /> : isGithub ? <Github size={14} /> : <Globe size={14} />} 
                    <a href={link.startsWith('http') ? link : `https://${link}`} target="_blank" rel="noreferrer" className="hover:text-blue-600 hover:underline">
                      {link.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
                    </a>
                  </span>
                );
              })}
            </div>
          </div>
          
          {(cvData.summary || cvData.bio) && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wider">Professional Summary</h2>
              <div className="text-sm text-slate-700">
                {cvData.summary || cvData.bio}
              </div>
            </div>
          )}
          
          {cvData.skills && cvData.skills.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wider">Skills</h2>
              <div className="flex flex-wrap gap-2 text-sm text-slate-700">
                {cvData.skills.map((s: any) => typeof s === 'string' ? s : JSON.stringify(s)).join(', ')}
              </div>
            </div>
          )}
          
          {cvData.work_history && cvData.work_history.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wider">Experience</h2>
              
              {cvData.work_history.map((job: any, i: number) => (
                <div key={i} className="relative pl-4 border-l-2 border-blue-200 mb-4">
                  <div className="absolute w-2 h-2 bg-blue-500 rounded-full -left-[5px] top-1.5"></div>
                  <h3 className="font-semibold text-slate-900">{job.title} @ {job.company}</h3>
                  <p className="text-xs text-slate-500 mb-2">{job.dates}</p>
                  <ul className="list-disc list-outside ml-4 text-sm text-slate-700 space-y-1">
                    {job.bullets?.map((bullet: any, j: number) => (
                      <li key={j}>{typeof bullet === 'string' ? bullet : JSON.stringify(bullet)}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {Array.isArray(cvData.education) && cvData.education.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wider">Education</h2>
              {cvData.education.map((edu: any, i: number) => (
                <div key={i} className="mb-2">
                  <h3 className="font-semibold text-slate-900">
                    {typeof edu === 'string' ? edu : (typeof edu?.degree_or_course === 'string' ? edu.degree_or_course : '')} 
                    {typeof edu !== 'string' && typeof edu?.institution === 'string' && edu.institution ? ` @ ${edu.institution}` : ''}
                  </h3>
                  {typeof edu?.year === 'string' && <p className="text-xs text-slate-500 mb-1">{edu.year}</p>}
                  {Array.isArray(edu?.details_array) && edu.details_array.length > 0 && (
                    <ul className="list-disc list-outside ml-4 text-sm text-slate-700 space-y-1">
                      {edu.details_array.map((detail: any, j: number) => (
                        <li key={j}>{typeof detail === 'string' ? detail : JSON.stringify(detail)}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {cvData.certifications && cvData.certifications.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wider">Certifications</h2>
              <ul className="list-disc list-outside ml-4 text-sm text-slate-700 space-y-1">
                {cvData.certifications.map((cert: any, i: number) => (
                  <li key={i}>{typeof cert === 'string' ? cert : JSON.stringify(cert)}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
