'use client';

import React, { useState } from 'react';
import { Send, Upload, FileText, CheckCircle } from 'lucide-react';

export default function ChatInterface({ cvData, setCvData }: { cvData: any, setCvData: any }) {
  const [messages, setMessages] = useState([
    { id: 1, role: 'system', text: "CV successfully parsed! Your ground truth profile is set. Please paste a Job Description to begin tailoring." }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasJd, setHasJd] = useState(false);
  const [pendingEdits, setPendingEdits] = useState<any[] | null>(null);
  const [missingSkills, setMissingSkills] = useState<string[] | null>(null);

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;
    
    const newMsg = { id: Date.now(), role: 'user', text: input };
    setMessages(prev => [...prev, newMsg]);
    setInput('');
    setIsProcessing(true);
    
    try {
      if (!hasJd) {
        // State 1: We are expecting a Job Description
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jd/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jd_text: input, ground_truth_cv: cvData })
        });
        
        const data = await res.json();
        
        if (res.ok && data.analysis) {
          const matchScore = data.analysis.match_score ?? '0';
          const mSkills = data.analysis.missing_skills || [];
          const edits = data.analysis.proposed_edits || [];
          
          setHasJd(true);
          setPendingEdits(edits.length > 0 ? edits : null);
          setMissingSkills(mSkills.length > 0 ? mSkills : null);
          
          let reply = `Analysis Complete! Match Score: ${matchScore}%\n\n`;
          if (mSkills.length > 0) {
            reply += `Missing Skills: ${mSkills.join(', ')}\n\n`;
          }
          
          if (edits.length > 0) {
            reply += `Here are the proposed tailored bullets based on the Job Description:\n\n`;
            reply += edits.map((e: any, i: number) => `${i+1}. Instead of: "${e.original_bullet}"\n   Change to: "${e.tailored_bullet}"`).join('\n\n');
            reply += `\n\nShould I 'apply' these updates to your CV?`;
          } else {
            reply += `No specific bullet edits were proposed by the model for this JD.`;
          }
                        
          setMessages(prev => [...prev, { id: Date.now() + 1, role: 'system', text: reply }]);
        } else {
          setMessages(prev => [...prev, { id: Date.now() + 1, role: 'system', text: "Sorry, I couldn't process that JD." }]);
        }
      } else if (pendingEdits || missingSkills) {
        // State 3: We have pending edits and user is responding
        const userText = input.toLowerCase();
        
        if (userText.includes('apply') || userText.includes('yes')) {
          // Apply edits to CV
          let updatedCV = { ...cvData };
          
          if (missingSkills) {
            updatedCV.skills = [...(updatedCV.skills || []), ...missingSkills];
          }
          
          if (pendingEdits && updatedCV.work_history && updatedCV.work_history[0]) {
            pendingEdits.forEach((edit: any) => {
                 updatedCV.work_history[0].bullets = updatedCV.work_history[0].bullets.map((b: string) => 
                    b === edit.original_bullet ? edit.tailored_bullet : b
                 );
                 if (!updatedCV.work_history[0].bullets.includes(edit.tailored_bullet)) {
                     updatedCV.work_history[0].bullets.push(edit.tailored_bullet);
                 }
            });
          }
          
          setCvData(updatedCV);
          setPendingEdits(null);
          setMissingSkills(null);
          
          setMessages(prev => [...prev, { id: Date.now() + 1, role: 'system', text: "Done! I've updated your CV with the tailored bullets and missing skills. Check the live preview on the right!" }]);
        } 
        else {
          setMessages(prev => [...prev, { id: Date.now() + 1, role: 'system', text: "Just say 'apply' when you are ready to update your CV with these changes." }]);
        }
      } else {
        // State 3: General chat placeholder
        setMessages(prev => [...prev, { id: Date.now() + 1, role: 'system', text: "Your CV is already tailored! If you have another JD, just refresh the page for now." }]);
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
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 whitespace-pre-wrap ${
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
