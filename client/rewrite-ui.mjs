import fs from 'fs';

let content = fs.readFileSync('src/app/page.tsx', 'utf8');

const returnIndex = content.indexOf('return (');
if (returnIndex === -1) throw new Error("Could not find return (");

const topPart = content.substring(0, returnIndex);

const newJSX = `return (
    <div className="flex flex-col h-screen bg-[#050505] text-white font-sans overflow-hidden relative selection:bg-indigo-500/30">
      {/* Background ambient glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-600/10 blur-[150px] pointer-events-none mix-blend-screen"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-emerald-600/10 blur-[150px] pointer-events-none mix-blend-screen"></div>

      <AnimatePresence>
        {isWhiteboardOpen && <Whiteboard onClose={() => setIsWhiteboardOpen(false)} />}
      </AnimatePresence>

      {/* Top Navigation Bar: Minimal & Glassmorphic */}
      <header className="w-full h-16 sm:h-20 border-b border-white/5 bg-white/[0.01] backdrop-blur-2xl z-30 flex items-center justify-center px-4 sm:px-6 shadow-sm">
        <div className="w-full max-w-5xl flex items-center justify-between">
          
          {/* Logo & Assistant Status */}
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 relative flex items-center justify-center rounded-[1rem] bg-gradient-to-br from-indigo-500/20 to-purple-600/20 shadow-inner border border-white/10 overflow-hidden">
                <div className="absolute inset-0 bg-white/5 backdrop-blur-sm z-0"></div>
                <div className="relative z-10 w-16 h-16">
                  <Lottie animationData={getAnimation()} loop={true} />
                </div>
             </div>
             <div className="flex flex-col">
               <h1 className="text-lg font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-cyan-300 leading-tight">AI Tutor</h1>
               <div className="flex items-center gap-2 mt-[-2px]">
                 <span className="relative flex h-1.5 w-1.5">
                   <span className={\`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 \${animState !== 'idle' ? 'bg-emerald-400' : 'bg-indigo-400'}\`}></span>
                   <span className={\`relative inline-flex rounded-full h-1.5 w-1.5 \${animState !== 'idle' ? 'bg-emerald-500' : 'bg-indigo-500'}\`}></span>
                 </span>
                 <span className="text-[10px] font-medium text-white/40 uppercase tracking-widest">{animState}</span>
               </div>
             </div>
          </div>

          {/* Quick Tools */}
          <div className="flex items-center gap-2">
             <button onClick={() => setIsWhiteboardOpen(true)} className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-xl transition-all shadow-sm">
                <span className="text-sm">✍️</span> <span className="hidden sm:inline text-xs font-medium text-indigo-200">Scratchpad</span>
             </button>
             <button onClick={downloadChat} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5" title="Save Chat">💾</button>
             <button onClick={clearChat} className="p-2 bg-white/5 hover:bg-red-500/20 hover:border-red-500/30 rounded-xl transition-all border border-white/5" title="Clear">🗑️</button>
          </div>

        </div>
      </header>

      {/* Settings Sub-bar */}
      <div className="w-full bg-black/20 border-b border-white/5 z-20">
         <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-2 flex flex-wrap items-center gap-x-6 gap-y-2">
            <div className="flex items-center gap-2">
               <span className="text-[10px] font-semibold tracking-widest text-white/30 uppercase">Board</span>
               <select value={board} onChange={(e)=>setBoard(e.target.value)} className="bg-transparent text-xs text-white/80 hover:text-white outline-none cursor-pointer [&>option]:bg-neutral-900">
                 <option value="CBSE">CBSE</option>
                 <option value="ICSE">ICSE</option>
                 <option value="SSC">SSC</option>
               </select>
            </div>
            <div className="flex items-center gap-2">
               <span className="text-[10px] font-semibold tracking-widest text-white/30 uppercase">Grade</span>
               <select value={grade} onChange={(e)=>setGrade(e.target.value)} className="bg-transparent text-xs text-white/80 hover:text-white outline-none cursor-pointer [&>option]:bg-neutral-900">
                 {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(g => <option key={g} value={g}>Class {g}</option>)}
               </select>
            </div>
            <div className="flex items-center gap-2">
               <span className="text-[10px] font-semibold tracking-widest text-white/30 uppercase">Topic</span>
               <select value={topic} onChange={(e)=>setTopic(e.target.value)} className="bg-transparent text-xs text-white/80 hover:text-white outline-none cursor-pointer [&>option]:bg-neutral-900">
                 {["General Math", "Algebra", "Geometry", "Calculus", "Trigonometry", "Statistics"].map(t => <option key={t} value={t}>{t}</option>)}
               </select>
            </div>
         </div>
      </div>

      {/* Main Chat Canvas */}
      <main className="flex-1 w-full max-w-4xl mx-auto flex flex-col relative z-10 overflow-hidden px-4">
        
        {messages.length === 0 ? (
          /* Empty State - Big Beautiful Lottie */
          <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} className="flex-1 flex flex-col items-center justify-center text-center pb-20">
             <div className="w-56 h-56 sm:w-72 sm:h-72 relative mb-6">
                <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-[80px]"></div>
                <Lottie animationData={getAnimation()} loop={true} className="w-full h-full relative z-10 drop-shadow-[0_0_40px_rgba(99,102,241,0.3)]" />
             </div>
             <h2 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40 tracking-tight mb-4">
                What are we solving today?
             </h2>
             <p className="text-white/40 max-w-md text-sm sm:text-base leading-relaxed">
                Your AI math tutor is ready. Ask a question, paste an image, or use the scratchpad to draw your problem directly.
             </p>
          </motion.div>
        ) : (
          /* Chat Stream */
          <div className="flex-1 overflow-y-auto space-y-6 sm:space-y-8 scroll-smooth py-6 pb-20 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full pr-2">
            {messages.map((msg) => (
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                key={msg.id}
                className={\`flex \${msg.sender === "user" ? "justify-end" : "justify-start"}\`}
              >
                {msg.sender === "ai" && (
                  <div className="w-8 h-8 rounded-[0.8rem] bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mr-3 mt-auto mb-2 flex-shrink-0">
                    <span className="text-xs">✨</span>
                  </div>
                )}
                <div
                  className={\`max-w-[90%] sm:max-w-[80%] p-4 sm:p-5 shadow-2xl leading-relaxed text-[15px] \${
                    msg.sender === "user"
                      ? "bg-white/10 backdrop-blur-md rounded-[1.5rem] rounded-br-sm text-white border border-white/10"
                      : "bg-gradient-to-b from-white/[0.05] to-transparent backdrop-blur-xl border border-white/5 rounded-[1.5rem] rounded-bl-sm text-gray-200"
                  }\`}
                >
                  {msg.attachment && (
                    <img src={msg.attachment} alt="attachment" className="mb-4 max-h-72 rounded-xl max-w-full object-cover shadow-lg border border-white/10" />
                  )}
                  {msg.text && <div className="whitespace-pre-wrap">{msg.text}</div>}
                </div>
              </motion.div>
            ))}
            
            {/* Thinking Indicator integrated into stream */}
            {animState === "thinking" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
                 <div className="w-8 h-8 rounded-[0.8rem] bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mr-3 mt-auto mb-2 flex-shrink-0">
                    <span className="text-xs">🤔</span>
                 </div>
                 <div className="max-w-[80%] px-5 py-4 bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-[1.5rem] rounded-bl-sm flex items-center gap-2">
                   <span className="w-2 h-2 rounded-full bg-amber-500/50 animate-bounce"></span>
                   <span className="w-2 h-2 rounded-full bg-amber-500/50 animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                   <span className="w-2 h-2 rounded-full bg-amber-500/50 animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                 </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} className="h-8" />
          </div>
        )}

      </main>

      {/* Bottom Input Area: Floating Pill */}
      <div className="w-full absolute bottom-0 left-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent pt-10 pb-6 px-4 z-20 pointer-events-none">
          <div className="max-w-3xl mx-auto relative pointer-events-auto">
            
            <AnimatePresence>
              {attachmentPreview && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute bottom-full mb-3 left-4 p-1.5 bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/20 shadow-2xl"
                >
                  <img src={attachmentPreview} alt="upload preview" className="h-20 w-20 rounded-xl object-cover" />
                  <button 
                    onClick={() => setAttachmentPreview(null)}
                    className="absolute -top-2 -right-2 bg-neutral-800 border border-white/20 text-white rounded-full w-6 h-6 flex items-center justify-center text-[10px] font-bold shadow-xl hover:scale-110 transition-transform"
                  >
                    ✕
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="w-full flex items-center bg-white/[0.04] backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-2xl p-2 transition-all focus-within:border-white/20 focus-within:bg-white/[0.06]">
              
              <button
                onClick={handleMicClick}
                className={\`p-3.5 rounded-full transition-all duration-300 flex-shrink-0 flex items-center justify-center group \${
                  isRecording
                    ? "bg-red-500/20 text-red-400 border border-red-500/30"
                    : "hover:bg-white/5 text-gray-400 border border-transparent"
                }\`}
              >
                <span className="text-xl group-hover:scale-110 transition-transform">{isRecording ? "🔴" : "🎤"}</span>
              </button>
              
              <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileSelect} />
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-3.5 rounded-full hover:bg-white/5 text-gray-400 border border-transparent transition-all flex-shrink-0 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-indigo-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span className="text-xl group-hover:scale-110 transition-transform relative z-10 block">📎</span>
              </button>
              
              <input
                type="text"
                className="flex-1 w-full min-w-0 bg-transparent text-white px-3 py-3 outline-none placeholder-gray-500/80 text-[15px] font-medium"
                placeholder="Message AI Tutor..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
              />
              
              <button
                onClick={() => handleSend()}
                disabled={!inputValue.trim() && !attachmentPreview}
                className="ml-2 bg-white text-black hover:bg-neutral-200 disabled:bg-white/10 disabled:text-white/30 px-6 py-3.5 rounded-full transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] font-bold text-sm tracking-wide disabled:shadow-none"
              >
                Send
              </button>
            </div>

            <div className="text-center mt-3">
              <p className="text-[10px] text-white/30 font-medium tracking-wide">AI Tutor can make mistakes. Verify important answers.</p>
            </div>

          </div>
      </div>

    </div>
  );
}
`;

fs.writeFileSync('src/app/page.tsx', topPart + newJSX);
console.log("Rewrote page.tsx!");
