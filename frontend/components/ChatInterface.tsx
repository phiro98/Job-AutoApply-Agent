'use client';

import React, { useState } from 'react';
import { Send, Upload, FileText, CheckCircle } from 'lucide-react';

export default function ChatInterface() {
  const [messages, setMessages] = useState([
    { id: 1, role: 'system', text: "CV successfully parsed! Your ground truth profile is set. Please paste a Job Description to begin tailoring." }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    
    const newMsg = { id: Date.now(), role: 'user', text: input };
    setMessages([...messages, newMsg]);
    setInput('');
    
    // Stub response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        role: 'system', 
        text: "I received your message. I am ready to process your JD when you paste it." 
      }]);
    }, 1000);
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
