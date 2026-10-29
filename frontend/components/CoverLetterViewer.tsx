'use client';

import React, { useState } from 'react';
import { Download, Edit3, Eye, Loader2, FileText } from 'lucide-react';

interface CoverLetterViewerProps {
  coverLetterData: {
    text: string;
    company_name?: string;
    job_title?: string;
  } | null;
  cvData?: any;
  onUpdateText?: (newText: string) => void;
}

export default function CoverLetterViewer({
  coverLetterData,
  cvData,
  onUpdateText
}: CoverLetterViewerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [text, setText] = useState(coverLetterData?.text || '');

  // Keep local text in sync if props update
  React.useEffect(() => {
    if (coverLetterData?.text) {
      setText(coverLetterData.text);
    }
  }, [coverLetterData?.text]);

  const candidateName = cvData?.personal_details?.name || 'Applicant';
  const email = cvData?.personal_details?.email || '';
  const phone = cvData?.personal_details?.phone || '';
  const location = cvData?.personal_details?.location || '';
  const companyName = coverLetterData?.company_name || 'Hiring Team';
  const jobTitle = coverLetterData?.job_title || 'Position';

  const today = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const handleDownload = async () => {
    const printContent = document.getElementById('cover-letter-preview-content');
    if (!printContent || isDownloading) return;

    setIsDownloading(true);
    const safeName = candidateName.replace(/[^a-zA-Z0-9_-]/g, '_');
    const safeCompany = companyName.replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `${safeName}_Cover_Letter_${safeCompany}.pdf`;

    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${candidateName} - Cover Letter</title>
          <style>
            @page {
              size: A4;
              margin: 25mm 25mm 25mm 25mm;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              line-height: 1.6;
              color: #1e293b;
              margin: 0;
              padding: 0;
              font-size: 13px;
            }
            .header {
              border-bottom: 2px solid #0f172a;
              padding-bottom: 12px;
              margin-bottom: 24px;
            }
            .name {
              font-size: 24px;
              font-weight: bold;
              color: #0f172a;
              font-family: Georgia, serif;
              margin-bottom: 4px;
            }
            .contact {
              font-size: 12px;
              color: #475569;
            }
            .date {
              margin-bottom: 20px;
              color: #475569;
            }
            .recipient {
              margin-bottom: 20px;
              line-height: 1.4;
            }
            .recipient-title {
              font-weight: 600;
              color: #0f172a;
            }
            .body-paragraph {
              margin-bottom: 16px;
              text-align: justify;
              color: #334155;
            }
            .closing {
              margin-top: 28px;
            }
            .signoff {
              font-weight: bold;
              color: #0f172a;
              margin-top: 24px;
            }
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

      if (!response.ok) throw new Error('Server error generating Cover Letter PDF');

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
      console.warn("Direct download failed, falling back:", err);
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

  if (!coverLetterData || !coverLetterData.text) {
    return (
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 shadow-xl rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col h-full min-h-[600px] items-center justify-center text-slate-500 p-8 text-center">
        <FileText size={48} className="text-slate-300 dark:text-slate-700 mb-3" />
        <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Cover Letter Not Generated Yet</h3>
        <p className="text-sm text-slate-400 max-w-sm">
          Paste a Job Description in the chat to automatically draft a targeted Cover Letter tailored for this role.
        </p>
      </div>
    );
  }

  // Split letter text into paragraphs
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);

  return (
    <div className="w-full max-w-2xl bg-white shadow-xl rounded-lg overflow-hidden border border-slate-200 flex flex-col h-full min-h-[600px]">
      {/* Top action bar */}
      <div className="bg-slate-50 border-b border-slate-200 p-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-700">Cover_Letter.pdf</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
            {companyName}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (isEditing && onUpdateText) {
                onUpdateText(text);
              }
              setIsEditing(!isEditing);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors"
          >
            {isEditing ? <Eye size={14} /> : <Edit3 size={14} />}
            <span>{isEditing ? 'Preview' : 'Edit'}</span>
          </button>
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-md shadow-sm transition-all cursor-pointer"
          >
            {isDownloading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Download size={14} />
                <span>Download PDF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Document content */}
      <div className="flex-grow p-8 bg-white overflow-y-auto">
        {isEditing ? (
          <div className="flex flex-col h-full space-y-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Edit Cover Letter Body
            </span>
            <textarea
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                if (onUpdateText) onUpdateText(e.target.value);
              }}
              className="w-full flex-grow min-h-[450px] p-4 text-sm text-slate-800 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-sans leading-relaxed resize-none"
              placeholder="Write or edit your cover letter..."
            />
          </div>
        ) : (
          <div id="cover-letter-preview-content" className="max-w-xl mx-auto space-y-5 text-slate-800">
            {/* Formal Header */}
            <div className="header border-b-2 border-slate-800 pb-3">
              <h1 className="name text-2xl font-serif text-slate-900 font-bold">{candidateName}</h1>
              <div className="contact text-xs text-slate-600 mt-1 flex flex-wrap gap-3">
                {email && <span>{email}</span>}
                {phone && <span>• {phone}</span>}
                {location && <span>• {location}</span>}
              </div>
            </div>

            {/* Date */}
            <div className="date text-xs text-slate-500">{today}</div>

            {/* Recipient */}
            <div className="recipient text-sm leading-tight">
              <p className="recipient-title font-semibold text-slate-900">Hiring Manager</p>
              <p className="text-slate-700">{companyName}</p>
              {jobTitle && <p className="text-slate-500 text-xs">Role: {jobTitle}</p>}
            </div>

            {/* Body */}
            <div className="space-y-3.5 text-sm leading-relaxed text-slate-700">
              {paragraphs.map((p, idx) => (
                <p key={idx} className="body-paragraph">
                  {p}
                </p>
              ))}
            </div>

            {/* Closing */}
            <div className="closing pt-4 text-sm text-slate-800">
              <p>Sincerely,</p>
              <p className="signoff font-semibold text-slate-900 mt-4">{candidateName}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
