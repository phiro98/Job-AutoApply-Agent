'use client';

import React, { useState } from 'react';
import { Send, Upload, FileText, CheckCircle } from 'lucide-react';

export default function ChatInterface({ cvData, setCvData }: { cvData: any, setCvData: any }) {
  const [messages, setMessages] = useState([
    { id: 1, role: 'system', text: "CV successfully parsed! Your ground truth profile is set. Please paste a Job Description to begin tailoring." }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;
    
    const newMsg = { id: Date.now(), role: 'user', text: input };
    setMessages(prev => [...prev, newMsg]);
    setInput('');
    setIsProcessing(true);
    
    try {
      // Hit the JD analyzer
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jd/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jd_text: input, ground_truth_cv: cvData })
      });
      
      const data = await res.json();
      
      if (res.ok && data.analysis) {
        // Construct reply message
        const reply = `Analysis Complete! Match Score: ${data.analysis.match_score}%\n\n` +
                      `Missing Skills: ${data.analysis.missing_skills?.join(', ') || 'None'}\n\n` +
                      `I've proposed some tailored bullets for your CV based on this JD. Shall I apply them?`;
                      
        setMessages(prev => [...prev, { id: Date.now() + 1, role: 'system', text: reply }]);
        
        // For demonstration, let's automatically append a skill if there are missing skills
        // and modify a bullet if proposed edits exist, to show the PDF updating.
        let updatedCV = { ...cvData };
        if (data.analysis.missing_skills && data.analysis.missing_skills.length > 0) {
          updatedCV.skills = [...(updatedCV.skills || []), ...data.analysis.missing_skills];
        }
        if (data.analysis.proposed_edits && data.analysis.proposed_edits.length > 0) {
          const edit = data.analysis.proposed_edits[0];
          // Simple string replace on the first job's bullets just to show it updating
          if (updatedCV.work_history && updatedCV.work_history[0] && updatedCV.work_history[0].bullets) {
            updatedCV.work_history[0].bullets = updatedCV.work_history[0].bullets.map((b: string) => 
               b === edit.original_bullet ? edit.tailored_bullet : b
            );
            // If the original bullet wasn't found exactly, just append the tailored one for visual feedback
            if (!updatedCV.work_history[0].bullets.includes(edit.tailored_bullet)) {
              updatedCV.work_history[0].bullets.push(edit.tailored_bullet);
            }
          }
        }
        
        setCvData(updatedCV);
      } else {
        setMessages(prev => [...prev, { id: Date.now() + 1, role: 'system', text: "Sorry, I couldn't process that JD." }]);
      }
    } catch (e) {
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'system', text: "Network error occurred." }]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-grow p-4 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-br-none' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none shadow-sm'
            }`}>
              <p className="text-sm">{msg.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions (State Machine Stage Buttons) */}
      <div className="px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar">
        <button className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs rounded-full border border-emerald-100 dark:border-emerald-800 whitespace-nowrap hover:bg-emerald-100 transition-colors">
          <FileText size={14} /> Paste JD
        </button>
      </div>

      {/* Input area */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-full px-4 py-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
          <input 
            type="text" 
            className="flex-grow bg-transparent outline-none text-sm dark:text-white" 
            placeholder="Type your message or upload JD..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={handleSend}
            className="ml-2 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors flex-shrink-0"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
