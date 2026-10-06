'use client';

import React, { useState } from 'react';
import { Send, Upload, FileText, CheckCircle } from 'lucide-react';

export default function ChatInterface({ cvData, setCvData }: { cvData: any, setCvData: any }) {
  const [messages, setMessages] = useState([
    { id: 1, role: 'system', text: "CV successfully parsed! Your ground truth profile is set. Please paste a Job Description to begin tailoring." }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  type Task = 
    | { type: 'missing_skill', skill: string }
    | { type: 'proposed_edit', original_bullet: string, tailored_bullet: string }
    | { type: 'confirm_skill_bullet', skill: string, bullet: string };

  const [hasJd, setHasJd] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentTaskIndex, setCurrentItemIndex] = useState(0);

  const presentTask = (task: Task) => {
    if (task.type === 'missing_skill') {
      setMessages(prev => [...prev, { id: Date.now() + Math.random(), role: 'system', text: `You are missing the skill: **${task.skill}**. Do you have experience with this? (If yes, please provide context. If no, just say 'no')` }]);
    } else if (task.type === 'proposed_edit') {
      setMessages(prev => [...prev, { id: Date.now() + Math.random(), role: 'system', text: `Proposed edit to align with JD:\n\nInstead of: "${task.original_bullet}"\nChange to: "${task.tailored_bullet}"\n\nShould I apply this? (Yes/No)` }]);
    } else if (task.type === 'confirm_skill_bullet') {
      setMessages(prev => [...prev, { id: Date.now() + Math.random(), role: 'system', text: `Proposed Bullet: "${task.bullet}"\n\nShould I apply this? (Yes/No)` }]);
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
          const matchScore = data.analysis.match_score ?? '0';
          const mSkills = data.analysis.missing_skills || [];
          const edits = data.analysis.proposed_edits || [];
          
          setHasJd(true);
          
          const newTasks: Task[] = [
            ...mSkills.map((s: string) => ({ type: 'missing_skill', skill: s } as Task)),
            ...edits.map((e: any) => ({ type: 'proposed_edit', original_bullet: e.original_bullet, tailored_bullet: e.tailored_bullet } as Task))
          ];
          setTasks(newTasks);
          setCurrentItemIndex(0);
          
          let reply = `Analysis Complete! Match Score: ${matchScore}%\n`;
          setMessages(prev => [...prev, { id: Date.now() + 1, role: 'system', text: reply }]);
          
          if (newTasks.length > 0) {
            setTimeout(() => presentTask(newTasks[0]), 100);
          } else {
            setMessages(prev => [...prev, { id: Date.now() + 2, role: 'system', text: `Your CV is a great match! No edits proposed.` }]);
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
              setTimeout(() => setMessages(prev => [...prev, { id: Date.now() + 2, role: 'system', text: "All updates reviewed!" }]), 500);
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
               updatedCV.skills = [...(updatedCV.skills || []), currentTask.skill];
               if (updatedCV.work_history && updatedCV.work_history[0]) {
                 updatedCV.work_history[0].bullets.push(currentTask.bullet);
               }
            } else if (currentTask.type === 'proposed_edit') {
               if (updatedCV.work_history && updatedCV.work_history[0]) {
                 updatedCV.work_history[0].bullets = updatedCV.work_history[0].bullets.map((b: string) => 
                    b === currentTask.original_bullet ? currentTask.tailored_bullet : b
                 );
               }
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
            setTimeout(() => setMessages(prev => [...prev, { id: Date.now() + 2, role: 'system', text: "All updates reviewed! Your CV is fully tailored." }]), 500);
          }
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
