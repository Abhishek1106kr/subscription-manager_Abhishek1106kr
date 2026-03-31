import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function CollegeBotChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I'm CollegeBot powered by google/gemma-3-27b-it. How can I assist you today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll Down
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
        // Pointing to our proxied endpoint (Vite intercepts /api/chat and routes to our local Python server on port 5001)
        const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: userMessage.content })
        });

        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || `Server Error: ${res.status}`);
        }
      
        const data = await res.json();
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply || "No reply generated." }]);
    } catch (error: any) {
        setMessages((prev) => [...prev, { role: "assistant", content: `❌ Connection issue: ${error.message || "Could not connect to the Python AI server. Please make sure port 5001 is running."}` }]);
    } finally {
        setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      { role: "assistant", content: "Hi! I'm CollegeBot. Let's start over!" }
    ]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full bg-gradient-to-r from-teal-500 to-indigo-600 text-white shadow-[0_0_20px_rgba(20,184,166,0.4)] hover:shadow-[0_0_30px_rgba(20,184,166,0.6)] hover:scale-105 transition-all duration-300 ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[90vw] max-w-[380px] h-[580px] max-h-[85vh] rounded-[20px] shadow-2xl flex flex-col overflow-hidden bg-white/95 dark:bg-zinc-950/90 backdrop-blur-xl border border-white/20 dark:border-zinc-800/50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          
          <div className="p-4 bg-gradient-to-r from-teal-500/90 to-indigo-600/90 backdrop-blur-md flex justify-between items-center text-white border-b border-white/10">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <h3 className="font-semibold text-sm tracking-wide">CollegeBot AI</h3>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={clearChat} className="text-white/80 hover:text-white transition-colors text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded backdrop-blur-md">Refresh</button>
              <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-transparent">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl p-3 text-sm flex gap-3 ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-sm shadow-md' : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 rounded-tl-sm border border-zinc-200 dark:border-zinc-700/50 shadow-sm'}`}>
                  {msg.role === 'assistant' && <Bot className="w-4 h-4 mt-0.5 shrink-0 opacity-70 text-teal-500" />}
                  <span className="leading-relaxed whitespace-pre-wrap">{msg.content}</span>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl rounded-tl-sm p-4 bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/50 text-zinc-900 dark:text-zinc-100">
                  <div className="flex gap-1.5 items-center">
                    <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800/50 flex gap-2 items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything..."
              className="flex-1 bg-zinc-100/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-700/50 text-zinc-900 dark:text-white text-sm rounded-[16px] px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-teal-500 placeholder:text-zinc-500 dark:placeholder:text-zinc-400"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="p-2.5 rounded-full bg-teal-500 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-teal-400 transition-colors shrink-0 shadow-md"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
