'use client';

import React, { useState } from 'react';
import { Send, Upload, FileText, CheckCircle } from 'lucide-react';

const ChecklistComponent = ({ options, onSubmit }: { options: string[], onSubmit: (selected: string[]) => void }) => {
  const [selected, setSelected] = useState<Set<string>>(new Set(options)); // Pre-check all suggested skills by default for convenience
  const toggle = (opt: string) => {
    const newSet = new Set(selected);
    if (newSet.has(opt)) newSet.delete(opt);
    else newSet.add(opt);
    setSelected(newSet);
  };
  return (
    <div className="flex flex-col gap-2 mt-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          Select technical skills to add to your CV:
        </span>
        <button
          type="button"
          onClick={() => {
            if (selected.size === options.length) {
              setSelected(new Set());
            } else {
              setSelected(new Set(options));
            }
          }}
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
        >
          {selected.size === options.length ? 'Deselect all' : 'Select all'}
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((opt, idx) => {
          const isChecked = selected.has(opt);
          return (
            <label 
              key={idx} 
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-all ${
                isChecked 
                  ? 'bg-blue-50 border-blue-400 text-blue-700 dark:bg-blue-950/60 dark:border-blue-600 dark:text-blue-300' 
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
              }`}
            >
              <input 
                type="checkbox" 
                checked={isChecked} 
                onChange={() => toggle(opt)} 
                className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer" 
              />
              <span>{opt}</span>
            </label>
          );
        })}
      </div>
      <button 
        onClick={() => onSubmit(Array.from(selected))} 
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 shadow-sm transition-all"
      >
        {selected.size > 0 
          ? `Confirm & Add ${selected.size} Skill${selected.size > 1 ? 's' : ''} to CV` 
          : 'None of these (Skip)'}
      </button>
    </div>
  );
};

interface ChatInterfaceProps {
  cvData: any;
  setCvData: any;
  coverLetterData: any;
  setCoverLetterData: any;
  activeTab: 'cv' | 'cover_letter';
  setActiveTab: (tab: 'cv' | 'cover_letter') => void;
}

export default function ChatInterface({ 
  cvData, 
  setCvData, 
  coverLetterData, 
  setCoverLetterData, 
  activeTab, 
  setActiveTab 
}: ChatInterfaceProps) {
  type MessageType = {
    id: number;
    role: 'system' | 'user';
    text: string;
    isChecklist?: boolean;
    options?: string[];
    checklistSubmitted?: boolean;
    isActionPrompt?: boolean;
    actionType?: 'review_cover_letter';
    actionDone?: boolean;
  };
  
  const [messages, setMessages] = useState<MessageType[]>([
    { id: 0, role: 'system', text: "Welcome to AutoApply Agent! Please upload your master CV on the right to get started." }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasInitialCv, setHasInitialCv] = useState(false);
  
  // Track human-in-the-loop updates to weave into cover letter
  const [confirmedSkills, setConfirmedSkills] = useState<string[]>([]);
  const [addedBullets, setAddedBullets] = useState<string[]>([]);
  const [jdMetadata, setJdMetadata] = useState<{ job_title: string; company_name: string } | null>(null);

  React.useEffect(() => {
    if (cvData && !hasInitialCv) {
      setHasInitialCv(true);
      setMessages([
        { id: 1, role: 'system', text: "CV successfully parsed! Your ground truth profile is set. Please paste a Job Description to begin tailoring." }
      ]);
    }
  }, [cvData, hasInitialCv]);
  type Task = 
    | { type: 'missing_skills_checklist', skills: string[] }
    | { type: 'missing_skill', skill: string }
    | { type: 'proposed_edit', original_bullet: string, tailored_bullet: string }
    | { type: 'confirm_skill_bullet', skill: string, bullet: string };

  const [hasJd, setHasJd] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentTaskIndex, setCurrentItemIndex] = useState(0);

  const presentTask = (task: Task) => {
    if (task.type === 'missing_skills_checklist') {
      setMessages(prev => [...prev, { 
        id: Date.now() + Math.random(), 
        role: 'system', 
        text: `Based on the Job Description, here are relevant technical skills not found in your CV. Check the ones you have experience with to add them to your CV:`,
        isChecklist: true,
        options: task.skills
      }]);
    } else if (task.type === 'missing_skill') {
      setMessages(prev => [...prev, { 
        id: Date.now() + Math.random(), 
        role: 'system', 
        text: `You confirmed **${task.skill}**! Share brief context on how you used it so I can draft an experience bullet point for you. (Or type 'skip' if you just want it in your skills section)` 
      }]);
    } else if (task.type === 'proposed_edit') {
      setMessages(prev => [...prev, { id: Date.now() + Math.random(), role: 'system', text: `Proposed edit to align with JD:\n\nInstead of: "${task.original_bullet}"\nChange to: "${task.tailored_bullet}"\n\nShould I apply this? (Yes/No)` }]);
    } else if (task.type === 'confirm_skill_bullet') {
      setMessages(prev => [...prev, { id: Date.now() + Math.random(), role: 'system', text: `Proposed Bullet: "${task.bullet}"\n\nShould I apply this? (Yes/No)` }]);
    }
  };

  const concludeCvTailoring = () => {
    setMessages(prev => [
      ...prev,
      {
        id: Date.now() + 2,
        role: 'system',
        text: `All CV updates reviewed! Your CV is fully tailored.\n\nNow, let's review your Cover Letter: Would you like me to update your Cover Letter with your newly confirmed technical skills and bullet points?`,
        isActionPrompt: true,
        actionType: 'review_cover_letter',
        actionDone: false
      }
    ]);
  };

  const handleSyncCoverLetter = async (msgId: number) => {
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, actionDone: true } : m));
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', text: "Yes, update my Cover Letter with these additions." }]);
    setIsProcessing(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jd/update_cover_letter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_cover_letter: coverLetterData?.text || '',
          job_title: jdMetadata?.job_title || 'Position',
          company_name: jdMetadata?.company_name || 'Hiring Team',
          added_skills: confirmedSkills,
          new_bullets: addedBullets
        })
      });

      const data = await res.json();
      if (res.ok && data.updated_cover_letter) {
        setCoverLetterData({
          ...(coverLetterData || {}),
          text: data.updated_cover_letter,
          company_name: jdMetadata?.company_name || 'Hiring Team',
          job_title: jdMetadata?.job_title || 'Position'
        });
        setActiveTab('cover_letter');
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          role: 'system',
          text: `✓ Cover Letter updated! I've woven in your confirmed skills (${confirmedSkills.join(', ') || 'skills'}).\n\nI have switched your preview to "Cover Letter" on the right. You can review, edit, or download both documents as PDFs.`
        }]);
      } else {
        setActiveTab('cover_letter');
        setMessages(prev => [...prev, { id: Date.now() + 1, role: 'system', text: "Cover letter is ready to view on the right preview tab!" }]);
      }
    } catch (e) {
      setActiveTab('cover_letter');
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'system', text: "Switched preview to Cover Letter tab!" }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeepCoverLetter = (msgId: number) => {
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, actionDone: true } : m));
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', text: "Keep current Cover Letter." }]);
    setActiveTab('cover_letter');
    setMessages(prev => [...prev, {
      id: Date.now() + 1,
      role: 'system',
      text: "Understood! Your baseline Cover Letter is preserved. Switched preview to the Cover Letter tab on the right."
    }]);
  };

  const handleChecklistSubmit = (msgId: number, selectedSkills: string[]) => {
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, checklistSubmitted: true } : m));
    
    const userMsg = selectedSkills.length > 0 
      ? `I want to add: ${selectedSkills.join(', ')}` 
      : `None of these.`;
    
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', text: userMsg }]);
    
    if (selectedSkills.length > 0) {
      // Track confirmed skills for cover letter update
      setConfirmedSkills(prev => Array.from(new Set([...prev, ...selectedSkills])));

      // 1. Immediately update CV skills with confirmed skills!
      let updatedCV = { ...cvData };
      let newSkills = [...(updatedCV.skills || [])];
      
      let targetCatIndex = newSkills.findIndex((s: any) => 
        typeof s === 'object' && s.category && (
          s.category.toLowerCase().includes('technical') || 
          s.category.toLowerCase().includes('hard skill')
        )
      );
      
      if (targetCatIndex === -1 && newSkills.length > 0 && typeof newSkills[0] === 'object') {
        targetCatIndex = 0;
      }
      
      if (targetCatIndex >= 0) {
        const existingItems = new Set(newSkills[targetCatIndex].items || []);
        const toAdd = selectedSkills.filter(s => !existingItems.has(s));
        newSkills[targetCatIndex] = {
          ...newSkills[targetCatIndex],
          items: [...(newSkills[targetCatIndex].items || []), ...toAdd]
        };
      } else {
        newSkills.push({
          category: 'Technical',
          items: selectedSkills
        });
      }
      
      updatedCV.skills = newSkills;
      setCvData(updatedCV);

      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        role: 'system', 
        text: `✓ Added ${selectedSkills.join(', ')} to your CV skills!` 
      }]);

      const newTasks = [
        ...selectedSkills.map(s => ({ type: 'missing_skill', skill: s } as Task)),
        ...tasks.slice(currentTaskIndex + 1)
      ];
      setTasks(newTasks);
      setTimeout(() => presentTask(newTasks[0]), 500);
    } else {
      const nextIndex = currentTaskIndex + 1;
      setCurrentItemIndex(nextIndex);
      if (nextIndex < tasks.length) {
        setTimeout(() => presentTask(tasks[nextIndex]), 500);
      } else {
        setTimeout(() => concludeCvTailoring(), 500);
      }
    }
  };

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
          const company = data.analysis.company_name || 'Hiring Team';
          const title = data.analysis.job_title || 'Target Position';
          const matchScore = data.analysis.match_score || 0;
          const mSkills = data.analysis.missing_skills || [];
          const edits = data.analysis.proposed_edits || [];
          
          setHasJd(true);
          setJdMetadata({ job_title: title, company_name: company });

          // 1. Store the initial Cover Letter generated on 1st call!
          if (data.analysis.cover_letter) {
            setCoverLetterData({
              text: data.analysis.cover_letter,
              company_name: company,
              job_title: title
            });
          }
          
          const newTasks: Task[] = mSkills.length > 0 ? [
            { type: 'missing_skills_checklist', skills: mSkills },
            ...edits.map((e: any) => ({ type: 'proposed_edit', original_bullet: e.original_bullet, tailored_bullet: e.tailored_bullet } as Task))
          ] : [
            ...edits.map((e: any) => ({ type: 'proposed_edit', original_bullet: e.original_bullet, tailored_bullet: e.tailored_bullet } as Task))
          ];
          setTasks(newTasks);
          setCurrentItemIndex(0);
          
          let reply = `Analysis Complete! Match Score: ${matchScore}%\n`;
          reply += `Target Role: **${title}** at **${company}**\n\n`;
          if (data.analysis.cover_letter) {
            reply += `📄 **Baseline Cover Letter drafted!** You can click the "Cover Letter" tab in the Document Preview to inspect it at any time.\n\n`;
          }
          reply += `Let's review your technical skills and experience:`;
          setMessages(prev => [...prev, { id: Date.now() + 1, role: 'system', text: reply }]);
          
          if (newTasks.length > 0) {
            setTimeout(() => presentTask(newTasks[0]), 100);
          } else {
            setTimeout(() => concludeCvTailoring(), 500);
          }
        } else {
          setMessages(prev => [...prev, { id: Date.now() + 1, role: 'system', text: "Sorry, I couldn't process that JD." }]);
        }
      } else if (tasks.length > 0 && currentTaskIndex < tasks.length) {
        // State 2: Processing tasks one by one
        const currentTask = tasks[currentTaskIndex];
        const userText = input.toLowerCase();
        
        if (currentTask.type === 'missing_skill') {
          // Call /refine_bullet
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/refine_bullet`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ skill: currentTask.skill, user_input: input, cv_data: cvData })
          });
          const chatData = await res.json();
          if (chatData.action === 'skip') {
            setMessages(prev => [...prev, { id: Date.now() + 1, role: 'system', text: chatData.message }]);
            
            // Move to next task
            const nextIndex = currentTaskIndex + 1;
            setCurrentItemIndex(nextIndex);
            if (nextIndex < tasks.length) {
              setTimeout(() => presentTask(tasks[nextIndex]), 500);
            } else {
              setTimeout(() => concludeCvTailoring(), 500);
            }
          } else if (chatData.action === 'propose_bullet') {
            // Replace the current task with confirm_skill_bullet
            const newTasks = [...tasks];
            newTasks[currentTaskIndex] = { type: 'confirm_skill_bullet', skill: currentTask.skill, bullet: chatData.tailored_bullet };
            setTasks(newTasks);
            
            setMessages(prev => [...prev, { id: Date.now() + 1, role: 'system', text: `${chatData.message}\n\nProposed Bullet: "${chatData.tailored_bullet}"\n\nShould I apply this? (Yes/No)` }]);
          }
        } 
        else if (currentTask.type === 'proposed_edit' || currentTask.type === 'confirm_skill_bullet') {
          if (userText.includes('yes') || userText.includes('apply')) {
            // Apply edit to CV
            let updatedCV = { ...cvData };
            
            if (currentTask.type === 'confirm_skill_bullet') {
               let newSkills = [...(updatedCV.skills || [])];
               let addedCategoryIndex = newSkills.findIndex((s: any) => typeof s === 'object' && s.category === 'Added Skills');
               if (addedCategoryIndex >= 0) {
                 newSkills[addedCategoryIndex] = {
                   ...newSkills[addedCategoryIndex],
                   items: [...newSkills[addedCategoryIndex].items, currentTask.skill]
                 };
               } else {
                 newSkills.push({ category: 'Added Skills', items: [currentTask.skill] });
               }
               updatedCV.skills = newSkills;
               
               if (updatedCV.work_history && updatedCV.work_history[0]) {
                 updatedCV.work_history[0].bullets.push(currentTask.bullet);
               }
               setAddedBullets(prev => [...prev, currentTask.bullet]);
            } else if (currentTask.type === 'proposed_edit') {
               if (updatedCV.work_history && updatedCV.work_history[0]) {
                 updatedCV.work_history[0].bullets = updatedCV.work_history[0].bullets.map((b: string) => 
                    b === currentTask.original_bullet ? currentTask.tailored_bullet : b
                 );
               }
               setAddedBullets(prev => [...prev, currentTask.tailored_bullet]);
            }
            
            setCvData(updatedCV);
            setMessages(prev => [...prev, { id: Date.now() + 1, role: 'system', text: "Applied!" }]);
          } else {
            setMessages(prev => [...prev, { id: Date.now() + 1, role: 'system', text: "Skipped." }]);
          }
          
          // Move to next task
          const nextIndex = currentTaskIndex + 1;
          setCurrentItemIndex(nextIndex);
          if (nextIndex < tasks.length) {
            setTimeout(() => presentTask(tasks[nextIndex]), 500);
          } else {
            setTimeout(() => concludeCvTailoring(), 500);
          }
        }
      } else {
        // State 3: General chat placeholder
        setMessages(prev => [...prev, { id: Date.now() + 1, role: 'system', text: "Your CV is already tailored! If you have another JD, just refresh the page for now." }]);
      }
    } catch (e: any) {
      console.error("Chat error in handleSend:", e);
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'system', text: e?.message ? `Error: ${e.message}` : "An error occurred while processing the request." }]);
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
              
              {msg.isChecklist && msg.options && !msg.checklistSubmitted && (
                <ChecklistComponent 
                  options={msg.options} 
                  onSubmit={(selected) => handleChecklistSubmit(msg.id, selected)} 
                />
              )}

              {msg.isActionPrompt && msg.actionType === 'review_cover_letter' && !msg.actionDone && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => handleSyncCoverLetter(msg.id)}
                    className="px-3.5 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 shadow-sm transition-all cursor-pointer"
                  >
                    Sync Updates into Cover Letter
                  </button>
                  <button
                    onClick={() => handleKeepCoverLetter(msg.id)}
                    className="px-3.5 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold hover:bg-slate-300 transition-all cursor-pointer"
                  >
                    Keep Current Cover Letter
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions (State Machine Stage Buttons) */}
      <div className="px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar">
        <button 
          className={`flex items-center gap-2 px-3 py-1.5 text-xs rounded-full border whitespace-nowrap transition-colors ${
            !cvData 
              ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed dark:bg-slate-800 dark:border-slate-700 dark:text-slate-500' 
              : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800 hover:bg-emerald-100'
          }`}
          disabled={!cvData}
        >
          <FileText size={14} /> Paste JD
        </button>
      </div>

      {/* Input area */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <div className={`flex items-center bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-full px-4 py-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all ${!cvData ? 'opacity-60 cursor-not-allowed' : ''}`}>
          <input 
            type="text" 
            className="flex-grow bg-transparent outline-none text-sm dark:text-white disabled:cursor-not-allowed" 
            placeholder={!cvData ? "Please upload your CV first..." : "Type your message or upload JD..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={!cvData || isProcessing}
          />
          <button 
            onClick={handleSend}
            disabled={!cvData || isProcessing || !input.trim()}
            className="ml-2 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
