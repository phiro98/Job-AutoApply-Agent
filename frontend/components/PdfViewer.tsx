'use client';

import React, { useState } from 'react';
import { Download, MapPin, Mail, Phone, Linkedin, Github, Globe, Loader2 } from 'lucide-react';

export default function PdfViewer({ cvData }: { cvData?: any }) {
  const [isDownloading, setIsDownloading] = useState(false);

  if (!cvData) {
    return (
      <div className="w-full max-w-2xl bg-white shadow-xl rounded-lg overflow-hidden border border-slate-200 flex flex-col h-full min-h-[600px] items-center justify-center text-slate-500">
        No CV data available.
      </div>
    );
  }

  const handleDownload = async () => {
    const printContent = document.getElementById('cv-preview-content');
    if (!printContent || isDownloading) return;

    setIsDownloading(true);
    const rawName = cvData.personal_details?.name || 'Tailored';
    const candidateName = rawName.replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `${candidateName}_CV.pdf`;

    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${cvData.personal_details?.name || 'CV'}</title>
          <style>
            @page {
              size: A4;
              margin: 15mm 20mm 20mm 20mm;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              line-height: 1.5;
              color: #1e293b;
              margin: 0;
              padding: 0;
            }
            .text-center { text-align: center; }
            .text-3xl { font-size: 24px; font-weight: bold; margin-bottom: 4px; margin-top: 0; color: #0f172a; font-family: Georgia, serif; }
            .text-sm { font-size: 13px; }
            .text-xs { font-size: 11px; }
            .mt-2 { margin-top: 8px; }
            .mt-1 { margin-top: 4px; }
            .text-slate-600 { color: #475569; }
            .text-slate-500 { color: #64748b; }
            .text-slate-700 { color: #334155; }
            .text-slate-900 { color: #0f172a; }
            .border-b-2 { border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 20px; }

            /* Contact details bar - robust inline-block styling for WeasyPrint */
            .contact-bar {
              text-align: center !important;
              margin-top: 6px !important;
              margin-bottom: 4px !important;
              line-height: 1.8 !important;
            }
            .contact-item {
              display: inline-block !important;
              white-space: nowrap !important;
              margin: 2px 7px !important;
              font-size: 11.5px !important;
              color: #475569 !important;
              vertical-align: middle !important;
            }
            .contact-item svg {
              display: inline-block !important;
              vertical-align: -2px !important;
              margin-right: 4px !important;
              width: 12px !important;
              height: 12px !important;
            }
            .contact-item a {
              color: #2563eb !important;
              text-decoration: none !important;
              white-space: nowrap !important;
            }

            h2 {
              font-size: 14px;
              font-weight: bold;
              text-transform: uppercase;
              letter-spacing: 0.08em;
              color: #0f172a;
              margin-top: 20px;
              margin-bottom: 10px;
              border-bottom: 1px solid #cbd5e1;
              padding-bottom: 4px;
            }
            h3 { font-size: 14px; font-weight: 600; margin-bottom: 3px; margin-top: 0; color: #0f172a; }
            .mb-1 { margin-bottom: 4px; }
            .mb-1\\.5 { margin-bottom: 6px; }
            .mb-2 { margin-bottom: 8px; }
            .mb-4 { margin-bottom: 16px; }
            ul { margin-top: 6px; margin-bottom: 14px; padding-left: 20px; }
            li { margin-bottom: 4px; font-size: 12px; color: #334155; line-height: 1.45; }
            .relative { position: relative; }
            .pl-4 { padding-left: 16px; }
            .border-l-2 { border-left: 2px solid #93c5fd; }
            .border-blue-200 { border-color: #bfdbfe; }
            .space-y-1 > * + * { margin-top: 4px; }
            .space-y-4 > * + * { margin-top: 16px; }
            .space-y-6 > * + * { margin-top: 24px; }
            .font-semibold { font-weight: 600; }
            .font-bold { font-weight: bold; }
            .uppercase { text-transform: uppercase; }
            .tracking-wider { letter-spacing: 0.05em; }
            .bg-blue-50 {
              background-color: #eff6ff;
              border: 1px solid #dbeafe;
              display: inline-block;
              padding: 2px 8px;
              border-radius: 4px;
              font-size: 11px;
              font-weight: 500;
              color: #1d4ed8;
              margin-right: 4px;
              margin-bottom: 4px;
              white-space: nowrap;
            }
            .text-blue-700 { color: #1d4ed8; }
            .rounded { border-radius: 4px; }
            svg { display: inline-block; vertical-align: middle; width: 12px; height: 12px; margin-right: 3px; }
            a { color: #2563eb; text-decoration: none; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cv/download_pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html: fullHtml, filename })
      });

      if (!response.ok) throw new Error('Server returned error when generating PDF');

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.warn("Direct server download failed, falling back to client-side PDF export:", err);
      // Fallback: Dynamic client-side download via html2pdf
      try {
        if (!(window as any).html2pdf) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
            script.onload = () => resolve();
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }
        const opt = {
          margin: [12, 15, 15, 15],
          filename: filename,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        await (window as any).html2pdf().from(printContent).set(opt).save();
      } catch (clientErr) {
        console.error("Client-side fallback failed:", clientErr);
        // Fallback to window.print if all else fails
        window.print();
      }
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl bg-white shadow-xl rounded-lg overflow-hidden border border-slate-200 flex flex-col h-full min-h-[600px]">
      <div className="bg-slate-50 border-b border-slate-200 p-3 flex justify-between items-center">
        <span className="text-sm font-medium text-slate-600">Document.pdf</span>
        <button 
          onClick={handleDownload} 
          disabled={isDownloading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-md shadow-sm transition-all cursor-pointer" 
          title="Download PDF file directly"
        >
          {isDownloading ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span>Generating PDF...</span>
            </>
          ) : (
            <>
              <Download size={14} />
              <span>Download PDF</span>
            </>
          )}
        </button>
      </div>
      
      <div className="flex-grow p-8 bg-white overflow-y-auto">
        <div id="cv-preview-content" className="max-w-xl mx-auto space-y-6">
          <div className="border-b-2 border-slate-800 pb-4 text-center">
            <h1 className="text-3xl font-serif text-slate-900">{cvData.personal_details?.name || 'Applicant'}</h1>
            <div className="contact-bar text-center mt-2 text-sm text-slate-600">
              {cvData.personal_details?.email && (
                <span className="contact-item inline-flex items-center gap-1 whitespace-nowrap mx-2 my-0.5">
                  <Mail size={14} className="shrink-0" />
                  <span>{cvData.personal_details.email}</span>
                </span>
              )}
              {cvData.personal_details?.phone && (
                <span className="contact-item inline-flex items-center gap-1 whitespace-nowrap mx-2 my-0.5">
                  <Phone size={14} className="shrink-0" />
                  <span>{cvData.personal_details.phone}</span>
                </span>
              )}
              {cvData.personal_details?.location && (
                <span className="contact-item inline-flex items-center gap-1 whitespace-nowrap mx-2 my-0.5">
                  <MapPin size={14} className="shrink-0" />
                  <span>{cvData.personal_details.location}</span>
                </span>
              )}
              {cvData.personal_details?.links?.map((link: string, i: number) => {
                const isLinkedin = link.toLowerCase().includes('linkedin');
                const isGithub = link.toLowerCase().includes('github');
                const cleanDisplay = link.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
                return (
                  <span key={i} className="contact-item inline-flex items-center gap-1 whitespace-nowrap mx-2 my-0.5">
                    {isLinkedin ? <Linkedin size={14} className="shrink-0" /> : isGithub ? <Github size={14} className="shrink-0" /> : <Globe size={14} className="shrink-0" />} 
                    <a href={link.startsWith('http') ? link : `https://${link}`} target="_blank" rel="noreferrer" className="hover:text-blue-600 hover:underline">
                      {cleanDisplay}
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
              <div className="flex flex-col gap-3 text-sm text-slate-700">
                {cvData.skills.map((skillGroup: any, i: number) => {
                  if (typeof skillGroup === 'string') {
                    return (
                      <span key={i} className="inline-block px-2.5 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700 mr-1.5 mb-1.5">
                        {skillGroup}
                      </span>
                    );
                  }
                  
                  return (
                    <div key={i} className="mb-1">
                      <h3 className="font-semibold text-slate-800 mb-1.5">{skillGroup.category || 'Technical'}</h3>
                      <div className="flex flex-wrap gap-2">
                        {skillGroup.items?.map((item: string, j: number) => (
                          <span 
                            key={j} 
                            className="px-2.5 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
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
