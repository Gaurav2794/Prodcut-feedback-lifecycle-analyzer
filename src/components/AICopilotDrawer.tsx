"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Sparkles,
  Send,
  Loader2,
  Bot,
  User,
  Zap,
  TrendingUp,
  Layers,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import { useToast } from "./Toast";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface AICopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFeedback?: (id: string) => void;
}

const STARTER_PROMPTS = [
  "What are our top 5 revenue-impact feedback signals?",
  "Summarize high-priority requests for the Fleet module",
  "Which features are currently in Active Development?",
  "What new intake requests have ARR over $100,000?",
];

export default function AICopilotDrawer({
  isOpen,
  onClose,
  onSelectFeedback,
}: AICopilotDrawerProps) {
  const { error } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! I am your **FeedbackOS AI Copilot**. I analyze all 55+ customer feedback signals across 51 enterprise accounts and $6.8M ARR. How can I assist with your product roadmap or sprint triage today?",
      timestamp: "Just now",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (queryText?: string) => {
    const q = (queryText || input).trim();
    if (!q || loading) return;

    const userMsg: Message = {
      id: Math.random().toString(),
      role: "user",
      content: q,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });

      if (!res.ok) {
        throw new Error("Copilot response error");
      }

      const data = await res.json();
      const botMsg: Message = {
        id: Math.random().toString(),
        role: "assistant",
        content: data.answer || "No response received.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (e: any) {
      error("Copilot Error", e.message || "Failed to process query.");
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          role: "assistant",
          content: "Sorry, I encountered an issue analyzing the feedback portfolio. Please try again.",
          timestamp: "Now",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#051F20]/40 backdrop-blur-xs"
          />

          {/* Drawer Box */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="relative w-full max-w-lg bg-white h-full shadow-2xl border-l border-[#CBD8CE] flex flex-col z-10 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 px-6 border-b border-[#E2E8E4] flex items-center justify-between bg-gradient-to-r from-[#051F20] to-[#0B2B26] text-white">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-[#163832] flex items-center justify-center text-[#DAF1DE] border border-[#235347]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                    Portfolio AI Copilot
                    <span className="text-[9px] font-bold bg-[#235347] text-[#DAF1DE] px-1.5 py-0.2 rounded-full">
                      Gemini 3.7
                    </span>
                  </h3>
                  <p className="text-[11px] text-[#8EB69B]">
                    Natural language queries across $6.8M ARR
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1 rounded-full text-[#8EB69B] hover:text-white hover:bg-[#163832] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F8FAF9]">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {m.role === "assistant" && (
                    <div className="w-7 h-7 rounded-xl bg-[#051F20] text-[#DAF1DE] flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-xs ${
                      m.role === "user"
                        ? "bg-[#051F20] text-[#DAF1DE]"
                        : "bg-white text-[#1E332E] border border-[#E2E8E4]"
                    }`}
                  >
                    <div className="whitespace-pre-line font-normal">{m.content}</div>
                    <div
                      className={`text-[9px] mt-1.5 text-right ${
                        m.role === "user" ? "text-[#8EB69B]" : "text-[#84A39B]"
                      }`}
                    >
                      {m.timestamp}
                    </div>
                  </div>

                  {m.role === "user" && (
                    <div className="w-7 h-7 rounded-xl bg-[#235347] text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-xl bg-[#051F20] text-[#DAF1DE] flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-white p-3 rounded-2xl border border-[#E2E8E4] flex items-center gap-2 text-xs text-[#536E67]">
                    <Loader2 className="w-4 h-4 animate-spin text-[#235347]" />
                    Analyzing customer dataset with Gemini...
                  </div>
                </div>
              )}
            </div>

            {/* Starter Pills */}
            <div className="p-3 bg-white border-t border-[#E2E8E4]">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#84A39B] mb-2 px-1">
                Suggested Inquiries
              </div>
              <div className="flex flex-wrap gap-1.5">
                {STARTER_PROMPTS.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(p)}
                    className="text-[11px] font-medium text-[#1E332E] bg-[#F5F8F6] hover:bg-[#DAF1DE] hover:text-[#051F20] px-2.5 py-1 rounded-full border border-[#CBD8CE] transition-all text-left truncate max-w-full cursor-pointer"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-[#F8FAF9] border-t border-[#E2E8E4]">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything about feedback signals, ARR, or squads..."
                  className="flex-1 px-4 py-2.5 bg-white border border-[#CBD8CE] rounded-full text-xs font-medium text-[#051F20] focus:outline-none focus:border-[#235347] focus:ring-2 focus:ring-[#235347]/10"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="p-2.5 rounded-full bg-[#051F20] hover:bg-[#0B2B26] text-[#DAF1DE] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-xs"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
