"use client";

import React, { useState, useEffect, useRef } from "react";
import Lottie from "lottie-react";
import { motion, AnimatePresence } from "framer-motion";
import { idleAnimation, talkingAnimation, thinkingAnimation } from "./LottieAnimations";
import { puter } from '@heyputer/puter.js';
import { Whiteboard } from "./Whiteboard";

type Message = {
  id: string;
  sender: "user" | "ai";
  text: string;
  attachment?: string;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "ai",
      text: "Hello! I am your AI Math Tutor. What math problem would you like to solve today?",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [board, setBoard] = useState("CBSE");
  const [grade, setGrade] = useState("5");
  const [topic, setTopic] = useState("General Math");
  const [animState, setAnimState] = useState<"idle" | "thinking" | "talking">("idle");
  const [isRecording, setIsRecording] = useState(false);
  const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Web Speech API references
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    // Scroll to bottom when messages update
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    // Initialize Speech Recognition
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = "en-US";

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputValue(transcript);
          // Optional: Auto-send after voice finishes recording
          // handleSend(transcript);
        };

        recognitionRef.current.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsRecording(false);
        };
      } else {
        console.warn("Speech recognition is not supported in this browser.");
      }

      synthRef.current = window.speechSynthesis;
    }
  }, []);

  const handleMicClick = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  const speakText = (text: string) => {
    if (!synthRef.current) return;
    
    // Stop any ongoing speech
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    utterance.pitch = 1.1;

    utterance.onstart = () => setAnimState("talking");
    utterance.onend = () => setAnimState("idle");

    synthRef.current.speak(utterance);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setAttachmentPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async (textToSend: string = inputValue) => {
    if (!textToSend.trim() && !attachmentPreview) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: textToSend,
      attachment: attachmentPreview || undefined,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setAttachmentPreview(null);
    setAnimState("thinking");
    
    // Cancel any ongoing speech when user sends a new message
    if (synthRef.current) {
        synthRef.current.cancel();
    }

    try {
      const prompt = `You are a friendly and encouraging AI Math Tutor. The student is in Grade ${grade} and follows the ${board} curriculum. They need help with ${topic}. Answer concisely and step-by-step. The student says: "${textToSend}" ${attachmentPreview ? "[The user has attached an image of a math problem for context]" : ""}`;
      
      const response = await puter.ai.chat(prompt);
      const replyText = (response as any).message?.content as string || "I'm not sure how to respond to that.";

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: replyText,
      };

      setMessages((prev) => [...prev, aiMsg]);
      speakText(replyText);
    } catch (error) {
      console.error("Error fetching AI response:", error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: "Sorry, I am having trouble connecting to the server.",
      };
      setMessages((prev) => [...prev, errorMsg]);
      setAnimState("idle");
    }
  };

  const downloadChat = () => {
    const chatContent = messages
      .map((m) => `${m.sender === "ai" ? "Tutor" : "Student"}: ${m.text}`)
      .join("\n\n");
    const blob = new Blob([chatContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `AI_Math_Tutor_Session_${new Date().toISOString().split("T")[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearChat = () => {
    if (window.confirm("Are you sure you want to clear the conversation?")) {
      setMessages([
        {
          id: "1",
          sender: "ai",
          text: "Hello! I am your AI Math Tutor. What math problem would you like to solve today?",
        },
      ]);
    }
  };

  const getAnimation = () => {
    switch (animState) {
      case "idle":
        return idleAnimation;
      case "thinking":
        return thinkingAnimation;
      case "talking":
        return talkingAnimation;
      default:
        return idleAnimation;
    }
  };

  const selectClassName = "appearance-none bg-white/5 hover:bg-white/10 text-white/90 px-4 py-2 pr-8 text-sm rounded-xl border border-white/10 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all cursor-pointer bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%23a1a1aa%22%3E%3Cpath%20d%3D%22M5.293%207.293a1%201%200%20011.414%200L10%2010.586l3.293-3.293a1%201%200%20111.414%201.414l-4%204a1%201%200%2001-1.414%200l-4-4a1%201%200%20010-1.414z%22/%3E%3C/svg%3E')] bg-no-repeat bg-[position:right_0.5rem_center] backdrop-blur-md";
  const optionClassName = "bg-neutral-800 text-white";

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#050505] text-white font-sans overflow-hidden relative selection:bg-indigo-500/30">
      {/* Background ambient glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-600/20 blur-[120px] pointer-events-none"></div>

      <AnimatePresence>
        {isWhiteboardOpen && <Whiteboard onClose={() => setIsWhiteboardOpen(false)} />}
      </AnimatePresence>

      {/* Left Area: Chat Area */}
      <div className="flex flex-col w-full md:w-2/3 lg:w-3/4 h-full relative z-10 p-2 sm:p-4 pb-0">
        {/* Header Options */}
        <div className="flex items-center justify-between p-4 flex-wrap gap-4 bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-20 transition-all">
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30">
              <span className="text-xl font-bold">✨</span>
            </div>
            <h1 className="text-xl font-bold font-sans text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 whitespace-nowrap tracking-tight">
              AI Math Tutor
            </h1>
            <button
              onClick={() => setIsWhiteboardOpen(true)}
              className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-3 py-2 rounded-xl text-sm font-medium transition-all shadow-lg flex items-center gap-2"
              title="Open Scratchpad"
            >
              <span className="text-lg">✍️</span> <span className="hidden sm:inline">Scratchpad</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <select title="Board" value={board} onChange={(e) => setBoard(e.target.value)} className={selectClassName}>
              <option value="CBSE" className={optionClassName}>CBSE</option>
              <option value="ICSE" className={optionClassName}>ICSE</option>
              <option value="SSC" className={optionClassName}>SSC</option>
            </select>
            <select title="Grade" value={grade} onChange={(e) => setGrade(e.target.value)} className={selectClassName}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((g) => (
                <option key={g} value={g} className={optionClassName}>Grade {g}</option>
              ))}
            </select>
            <select title="Topic" value={topic} onChange={(e) => setTopic(e.target.value)} className={selectClassName}>
              {["General Math", "Algebra", "Geometry", "Calculus", "Trigonometry", "Statistics"].map((opt) => (
                <option key={opt} value={opt} className={optionClassName}>{opt}</option>
              ))}
            </select>
            <div className="h-6 w-px bg-white/10 mx-1 hidden sm:block shadow-sm"></div>
            <button onClick={downloadChat} className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 transition-all shadow-sm group" title="Download Session">
              <span className="group-hover:scale-110 inline-block transition-transform text-lg">💾</span>
            </button>
            <button onClick={clearChat} className="p-2.5 rounded-xl bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 text-neutral-300 transition-all shadow-sm group" title="Clear Session">
              <span className="group-hover:scale-110 inline-block transition-transform text-lg">🗑️</span>
            </button>
          </div>
        </div>

        {/* Chat Log */}
        <div className="flex-1 p-2 sm:p-6 mt-4 overflow-y-auto space-y-6 scroll-smooth [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">
          {messages.map((msg) => (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", bounce: 0.4, duration: 0.5 }}
              key={msg.id}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.sender === "ai" && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mr-3 mt-auto mb-1 shadow-lg shadow-indigo-500/20 flex-shrink-0">
                  <span className="text-xs">✨</span>
                </div>
              )}
              <div
                className={`max-w-[85%] md:max-w-[75%] p-4 sm:p-5 shadow-2xl leading-relaxed text-[15px] ${
                  msg.sender === "user"
                    ? "bg-gradient-to-tr from-indigo-600 to-blue-500 rounded-[2rem] rounded-br-[0.5rem] text-white border border-white/10"
                    : "bg-white/[0.05] backdrop-blur-xl border border-white/10 rounded-[2rem] rounded-bl-[0.5rem] text-gray-100"
                }`}
              >
                {msg.attachment && (
                  <img src={msg.attachment} alt="attachment" className="mb-4 max-h-64 rounded-xl max-w-full object-contain shadow-md border border-white/10" />
                )}
                {msg.text && <div className="whitespace-pre-wrap">{msg.text}</div>}
              </div>
            </motion.div>
          ))}
          {animState === "thinking" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
               <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mr-3 mt-auto mb-1 shadow-lg shadow-indigo-500/20 flex-shrink-0">
                  <span className="text-xs">✨</span>
               </div>
               <div className="max-w-[80%] px-5 py-4 bg-white/[0.05] backdrop-blur-xl border border-white/10 rounded-[2rem] rounded-bl-[0.5rem] flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-white/50 animate-bounce"></span>
                 <span className="w-2 h-2 rounded-full bg-white/50 animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                 <span className="w-2 h-2 rounded-full bg-white/50 animate-bounce" style={{ animationDelay: '0.4s' }}></span>
               </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} className="h-4" />
        </div>

        {/* Input Area */}
        <div className="py-4 w-full z-20 relative">
            <AnimatePresence>
              {attachmentPreview && (
                <motion.div 
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.9 }}
                  className="absolute bottom-24 left-4 p-1 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl"
                >
                  <img src={attachmentPreview} alt="upload preview" className="h-28 w-28 rounded-xl object-cover" />
                  <button 
                    onClick={() => setAttachmentPreview(null)}
                    className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold shadow-xl hover:scale-110 transition-transform"
                  >
                    ✕
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="flex items-center gap-2 sm:gap-3 p-2 bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-full shadow-2xl relative">
              <button
                onClick={handleMicClick}
                className={`p-3.5 sm:px-4 rounded-full transition-all duration-300 flex-shrink-0 flex items-center justify-center gap-2 group ${
                  isRecording
                    ? "bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse"
                    : "bg-white/5 hover:bg-white/10 text-gray-300 border border-white/5"
                }`}
                title="Toggle Microphone"
              >
                <div className={`w-2.5 h-2.5 rounded-full ${isRecording ? 'bg-red-500 animate-ping' : 'bg-transparent hidden'}`}></div>
                <span className="text-lg group-hover:scale-110 transition-transform">{isRecording ? "🔴" : "🎤"}</span>
              </button>
              
              <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileSelect} />
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-3.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 border border-white/5 transition-all flex-shrink-0 group"
                title="Attach Image"
              >
                <span className="text-lg group-hover:scale-110 transition-transform block">📎</span>
              </button>
              
              <input
                type="text"
                className="flex-1 w-full min-w-0 bg-transparent text-white px-2 py-3 outline-none placeholder-gray-500 text-[15px]"
                placeholder="Ask me anything..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
              />
              
              <button
                onClick={() => handleSend()}
                disabled={!inputValue.trim() && !attachmentPreview}
                className="bg-gradient-to-r flex-shrink-0 from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 disabled:from-white/10 disabled:to-white/10 disabled:text-white/30 text-white px-6 sm:px-8 py-3.5 rounded-full transition-all shadow-lg font-medium text-sm tracking-wide disabled:shadow-none"
              >
                Send
              </button>
            </div>
        </div>
      </div>

      {/* Right Area: Animation Sidebar */}
      <div className="w-full md:w-1/3 lg:w-1/4 h-64 md:h-full bg-black/20 backdrop-blur-3xl border-t md:border-t-0 md:border-l border-white/5 flex flex-col items-center justify-center p-8 relative overflow-hidden z-10 m-2 md:m-4 md:ml-0 rounded-3xl md:rounded-l-none border border-white/10 shadow-2xl">
         <div className="absolute top-6 right-6 flex items-center gap-3">
            <span className="text-[10px] font-mono font-medium text-white/50 tracking-widest uppercase">System Online</span>
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${animState !== 'idle' ? 'bg-emerald-400' : 'bg-indigo-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${animState !== 'idle' ? 'bg-emerald-500' : 'bg-indigo-500'}`}></span>
            </span>
         </div>
         
         <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-900/10 to-transparent pointer-events-none"></div>

         <div className="relative group w-full mt-8 md:mt-0 max-w-[280px]">
           <div className={`absolute -inset-8 opacity-50 blur-3xl transition-all duration-1000 ${
              animState === "talking" ? "bg-emerald-500/50 animate-pulse" : animState === "thinking" ? "bg-amber-500/40 animate-pulse" : "bg-indigo-500/40"
            }`}></div>
            
           <div className="w-full aspect-square rounded-[3rem] bg-white/[0.02] border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)] flex items-center justify-center p-8 relative overflow-hidden backdrop-blur-md group-hover:scale-[1.02] transition-transform duration-500">
               <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/5 to-transparent pointer-events-none rounded-t-[3rem]"></div>
               <Lottie animationData={getAnimation()} loop={true} className="w-full h-full relative z-10 drop-shadow-2xl" />
           </div>
         </div>
        
        <div className="text-center mt-12 z-10">
          <p className="text-[10px] font-medium text-white/40 uppercase tracking-[0.2em] mb-3">Tutor Status</p>
          <span
            className={`inline-flex px-6 py-2 rounded-2xl text-[11px] font-bold tracking-widest uppercase transition-all duration-500 shadow-xl backdrop-blur-md border ${
              animState === "talking"
                ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                : animState === "thinking"
                ? "bg-amber-500/10 text-amber-300 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                : "bg-indigo-500/10 text-indigo-300 border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]"
            }`}
          >
            {animState}
          </span>
        </div>
      </div>
    </div>
  );
}
