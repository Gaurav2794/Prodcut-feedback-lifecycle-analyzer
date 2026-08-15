"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Kanban,
  BarChart3,
  Plus,
  ArrowRight,
  Sparkles,
  Command,
  X,
  Layers,
  FileSpreadsheet,
  Zap,
  TrendingUp,
} from "lucide-react";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenNewFeedback?: () => void;
  onOpenCopilot?: () => void;
  onSelectFeedback?: (id: string) => void;
}

interface SearchItem {
  id: string;
  title: string;
  product_area: string;
  stage: string;
  priority: string;
  revenue_impact: string;
}

export default function CommandPalette({
  isOpen,
  onClose,
  onOpenNewFeedback,
  onOpenCopilot,
  onSelectFeedback,
}: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<SearchItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch feedback items when opened
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      fetch("/api/requests")
        .then((r) => r.json())
        .then((data) => setItems(data))
        .catch(() => {});
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Global keybinding listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open triggered by parent if passing open state
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Filter items based on query
  const filteredItems = items.filter((item) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.product_area.toLowerCase().includes(q) ||
      item.stage.toLowerCase().includes(q) ||
      item.priority.toLowerCase().includes(q)
    );
  }).slice(0, 8);

  const quickActions = [
    {
      id: "new-feedback",
      title: "Ingest New Customer Feedback Signal",
      category: "Action",
      icon: Plus,
      action: () => {
        onClose();
        if (onOpenNewFeedback) onOpenNewFeedback();
      },
    },
    {
      id: "ai-copilot",
      title: "Ask Portfolio AI Copilot",
      category: "AI",
      icon: Sparkles,
      action: () => {
        onClose();
        if (onOpenCopilot) onOpenCopilot();
      },
    },
    {
      id: "nav-board",
      title: "Jump to Lifecycle Kanban Board",
      category: "Navigation",
      icon: Kanban,
      action: () => {
        onClose();
        router.push("/board");
      },
    },
    {
      id: "nav-insights",
      title: "Jump to Telemetry & Analytics",
      category: "Navigation",
      icon: BarChart3,
      action: () => {
        onClose();
        router.push("/insights");
      },
    },
  ];

  const totalResults = query
    ? filteredItems.length
    : quickActions.length + filteredItems.length;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, totalResults));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + totalResults) % Math.max(1, totalResults));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (!query && selectedIndex < quickActions.length) {
        quickActions[selectedIndex].action();
      } else {
        const itemIdx = query ? selectedIndex : selectedIndex - quickActions.length;
        const target = filteredItems[itemIdx];
        if (target) {
          onClose();
          if (onSelectFeedback) {
            onSelectFeedback(target.id);
          } else {
            router.push(`/feedback/${target.id}`);
          }
        }
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#051F20]/40 backdrop-blur-sm"
          />

          {/* Modal Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#CBD8CE] overflow-hidden z-10"
          >
            {/* Search Input Bar */}
            <div className="p-4 border-b border-[#E2E8E4] flex items-center gap-3 bg-[#F8FAF9]">
              <Search className="w-5 h-5 text-[#235347]" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search feedback signals, accounts, product areas or type a command..."
                className="w-full bg-transparent text-sm font-semibold text-[#051F20] placeholder-[#84A39B] focus:outline-none"
              />
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#E8F2EA] text-[#235347] border border-[#CBD8CE]">
                ESC
              </span>
            </div>

            {/* Content List */}
            <div className="max-h-96 overflow-y-auto p-2 divide-y divide-[#F1F5F3]">
              {/* Quick Actions (when no query or query matches) */}
              {!query && (
                <div className="py-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#84A39B] px-3 py-1">
                    Quick Commands
                  </div>
                  {quickActions.map((action, idx) => {
                    const isSelected = selectedIndex === idx;
                    const Icon = action.icon;
                    return (
                      <button
                        key={action.id}
                        onClick={action.action}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition-all ${
                          isSelected
                            ? "bg-[#051F20] text-[#DAF1DE]"
                            : "text-[#1E332E] hover:bg-[#F5F8F6]"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon
                            className={`w-4 h-4 ${
                              isSelected ? "text-[#8EB69B]" : "text-[#235347]"
                            }`}
                          />
                          <span>{action.title}</span>
                        </div>
                        <span
                          className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${
                            isSelected
                              ? "bg-[#235347] text-white"
                              : "bg-[#E8F2EA] text-[#235347]"
                          }`}
                        >
                          {action.category}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Feedback Signals List */}
              <div className="py-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#84A39B] px-3 py-1 flex items-center justify-between">
                  <span>Feedback Signals ({filteredItems.length})</span>
                  {query && <span className="text-[9px]">Matching "{query}"</span>}
                </div>

                {filteredItems.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[#536E67]">
                    No feedback signals match your search.
                  </div>
                ) : (
                  filteredItems.map((item, idx) => {
                    const actualIdx = query ? idx : quickActions.length + idx;
                    const isSelected = selectedIndex === actualIdx;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          onClose();
                          if (onSelectFeedback) {
                            onSelectFeedback(item.id);
                          } else {
                            router.push(`/feedback/${item.id}`);
                          }
                        }}
                        onMouseEnter={() => setSelectedIndex(actualIdx)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs transition-all ${
                          isSelected
                            ? "bg-[#051F20] text-[#DAF1DE]"
                            : "text-[#1E332E] hover:bg-[#F5F8F6]"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 pr-4">
                          <div
                            className={`w-2 h-2 rounded-full flex-shrink-0 ${
                              item.priority === "high"
                                ? "bg-rose-500"
                                : item.priority === "medium"
                                ? "bg-amber-500"
                                : "bg-slate-400"
                            }`}
                          />
                          <div className="truncate">
                            <span className="font-bold block truncate">{item.title}</span>
                            <span
                              className={`text-[10px] capitalize ${
                                isSelected ? "text-[#8EB69B]" : "text-[#536E67]"
                              }`}
                            >
                              {item.product_area} • Stage: {item.stage}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span
                            className={`font-mono text-xs font-bold ${
                              isSelected ? "text-[#DAF1DE]" : "text-[#235347]"
                            }`}
                          >
                            {item.revenue_impact}
                          </span>
                          <ArrowRight
                            className={`w-3.5 h-3.5 ${
                              isSelected ? "text-[#8EB69B]" : "text-slate-300"
                            }`}
                          />
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 bg-[#F8FAF9] border-t border-[#E2E8E4] flex items-center justify-between text-[11px] text-[#536E67]">
              <div className="flex items-center gap-3">
                <span>
                  <kbd className="px-1.5 py-0.5 rounded bg-white border border-[#CBD8CE] text-[9px] font-mono">
                    ↑
                  </kbd>{" "}
                  <kbd className="px-1.5 py-0.5 rounded bg-white border border-[#CBD8CE] text-[9px] font-mono">
                    ↓
                  </kbd>{" "}
                  Navigate
                </span>
                <span>
                  <kbd className="px-1.5 py-0.5 rounded bg-white border border-[#CBD8CE] text-[9px] font-mono">
                    ↵
                  </kbd>{" "}
                  Select
                </span>
              </div>
              <span className="font-semibold text-[#235347] flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> FeedbackOS Quick Command
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
