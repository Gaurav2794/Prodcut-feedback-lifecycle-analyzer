"use client";
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  GripVertical,
  Users,
  MessageSquare,
  ArrowRight,
  ArrowLeft,
  Kanban,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  BarChart3,
  Search,
  Filter,
  DollarSign,
  Plus,
  RotateCcw,
  Building2,
  ExternalLink,
} from "lucide-react";
import GlobalHeader from "@/components/GlobalHeader";
import CommandPalette from "@/components/CommandPalette";
import QuickInspectorDrawer from "@/components/QuickInspectorDrawer";
import NewFeedbackModal from "@/components/NewFeedbackModal";
import AICopilotDrawer from "@/components/AICopilotDrawer";
import { useToast } from "@/components/Toast";

interface FeedbackItem {
  id: string;
  title: string;
  product_area: string;
  stage: string;
  priority: string;
  category: string;
  owner: string;
  mentions: number;
  accounts_count: number;
  revenue_impact: string;
  revenue_impact_num: number;
  summary: string;
}

const STAGES = [
  {
    id: "new",
    label: "1. Intake",
    desc: "Raw customer signals",
    color: "bg-slate-100/90 text-slate-800 border-slate-300",
    dot: "bg-slate-500",
    glow: "ring-slate-300",
  },
  {
    id: "triaged",
    label: "2. Triaged",
    desc: "Prioritized by AI/Product",
    color: "bg-amber-50/90 text-amber-900 border-amber-300",
    dot: "bg-amber-500",
    glow: "ring-amber-300",
  },
  {
    id: "planned",
    label: "3. Planned",
    desc: "Committed to roadmap",
    color: "bg-purple-50/90 text-purple-900 border-purple-300",
    dot: "bg-purple-500",
    glow: "ring-purple-300",
  },
  {
    id: "in_development",
    label: "4. In Dev",
    desc: "Active sprint execution",
    color: "bg-blue-50/90 text-blue-900 border-blue-300",
    dot: "bg-blue-500",
    glow: "ring-blue-300",
  },
  {
    id: "testing",
    label: "5. QA / Test",
    desc: "Staging verification",
    color: "bg-orange-50/90 text-orange-900 border-orange-300",
    dot: "bg-orange-500",
    glow: "ring-orange-300",
  },
  {
    id: "shipped",
    label: "6. Shipped",
    desc: "Live in production",
    color: "bg-emerald-50/90 text-emerald-900 border-emerald-300",
    dot: "bg-emerald-600",
    glow: "ring-emerald-300",
  },
];

const AREAS = ["", "missions", "dashboard", "fleet", "reports", "streaming", "integrations", "other"];
const PRIORITIES = ["", "high", "medium", "low"];

export default function BoardPage() {
  const { success, error } = useToast();
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // In-board filters
  const [search, setSearch] = useState("");
  const [areaFilter, setAreaFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [activeMobileStage, setActiveMobileStage] = useState<string | null>(null);

  // Modals & Drawers
  const [inspectingId, setInspectingId] = useState<string | null>(null);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);

  const columnRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/requests");
      const data = await res.json();
      setItems(data.filter((i: FeedbackItem) => i.stage !== "declined"));
    } catch (e: any) {
      error("Error loading board", e.message);
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    load();
  }, [load]);

  // Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDragging(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = async (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    if (!dragging) return;
    const item = items.find((i) => i.id === dragging);
    if (!item || item.stage === stageId) {
      setDragging(null);
      setDragOver(null);
      return;
    }

    setItems((prev) => prev.map((i) => (i.id === dragging ? { ...i, stage: stageId } : i)));
    success(`Moved to ${stageId.toUpperCase()}`, item.title);

    try {
      await fetch(`/api/requests/${dragging}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: stageId, note: `Moved to ${stageId} on Kanban board` }),
      });
    } catch (e: any) {
      error("Failed to move card", e.message);
      load();
    }

    setDragging(null);
    setDragOver(null);
  };

  // 1-Click Fast Move Arrow Buttons
  const handleMoveStage = async (id: string, currentStage: string, direction: "prev" | "next") => {
    const stageIds = STAGES.map((s) => s.id);
    const currIdx = stageIds.indexOf(currentStage);
    if (currIdx === -1) return;

    const targetIdx = direction === "next" ? currIdx + 1 : currIdx - 1;
    if (targetIdx < 0 || targetIdx >= stageIds.length) return;

    const targetStage = stageIds[targetIdx];
    const item = items.find((i) => i.id === id);

    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, stage: targetStage } : i)));
    success(`Moved to ${targetStage.toUpperCase()}`, item?.title || "");

    try {
      await fetch(`/api/requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: targetStage, note: `Moved to ${targetStage} via fast buttons` }),
      });
    } catch (e: any) {
      error("Failed to move card", e.message);
      load();
    }
  };

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        !search ||
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.summary.toLowerCase().includes(search.toLowerCase());
      const matchArea = !areaFilter || item.product_area === areaFilter;
      const matchPriority = !priorityFilter || item.priority === priorityFilter;
      return matchSearch && matchArea && matchPriority;
    });
  }, [items, search, areaFilter, priorityFilter]);

  const allItemIds = useMemo(() => filteredItems.map((i) => i.id), [filteredItems]);

  const scrollToColumn = (stageId: string) => {
    setActiveMobileStage(stageId);
    const el = columnRefs.current[stageId];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-between pb-24 md:pb-12">
      {/* Global Header */}
      <GlobalHeader
        onOpenSearch={() => setIsCommandOpen(true)}
        onOpenNewFeedback={() => setIsNewModalOpen(true)}
        onOpenCopilot={() => setIsCopilotOpen(true)}
      />

      <main className="flex-1 w-full max-w-[1700px] mx-auto px-4 sm:px-8 py-5 sm:py-6 space-y-5 sm:space-y-6">
        {/* Board Sub-Header & Controls */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#051F20] tracking-tight flex items-center gap-2.5">
              Lifecycle Kanban Board
              <span className="text-xs font-bold bg-[#DAF1DE] text-[#051F20] px-2.5 py-0.5 rounded-full border border-[#C4E5CA]">
                {filteredItems.length} Signals
              </span>
            </h1>
            <p className="text-xs text-[#536E67] font-medium mt-1">
              Drag &amp; drop or use fast arrows to advance features through 6 auditable stages.
            </p>
          </div>

          {/* In-Board Filter Toolbar */}
          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial sm:min-w-[190px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#84A39B]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter board..."
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-[#CBD8CE] rounded-full text-xs font-medium text-[#051F20] placeholder-[#84A39B] focus:outline-none focus:border-[#235347]"
              />
            </div>

            <select
              value={areaFilter}
              onChange={(e) => setAreaFilter(e.target.value)}
              className="py-1.5 px-3 bg-white border border-[#CBD8CE] rounded-full text-xs font-semibold text-[#1E332E] focus:outline-none focus:border-[#235347]"
            >
              {AREAS.map((a) => (
                <option key={a} value={a}>
                  {a ? `Area: ${a.charAt(0).toUpperCase() + a.slice(1)}` : "All Areas"}
                </option>
              ))}
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="py-1.5 px-3 bg-white border border-[#CBD8CE] rounded-full text-xs font-semibold text-[#1E332E] focus:outline-none focus:border-[#235347]"
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p ? `Priority: ${p.toUpperCase()}` : "All Priorities"}
                </option>
              ))}
            </select>

            {(search || areaFilter || priorityFilter) && (
              <button
                onClick={() => {
                  setSearch("");
                  setAreaFilter("");
                  setPriorityFilter("");
                }}
                className="p-1.5 rounded-full text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200"
                title="Reset filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Mobile Stage Selector Tabs (For small phones) */}
        <div className="flex lg:hidden items-center gap-1.5 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none">
          {STAGES.map((s) => {
            const count = filteredItems.filter((i) => i.stage === s.id).length;
            const isActive = activeMobileStage === s.id;
            return (
              <button
                key={s.id}
                onClick={() => scrollToColumn(s.id)}
                className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
                  isActive
                    ? "bg-[#051F20] text-[#DAF1DE] shadow-xs"
                    : "bg-white text-[#536E67] border border-[#CBD8CE]"
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${s.dot}`} />
                <span>{s.label}</span>
                <span className="text-[10px] opacity-75">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Kanban Board (Horizontally swipable on mobile/tablet, 6-col grid on desktop) */}
        {loading ? (
          <div className="glass-card p-24 text-center text-[#536E67] flex flex-col items-center justify-center rounded-3xl">
            <div className="w-8 h-8 border-3 border-[#235347] border-t-transparent rounded-full animate-spin mb-3" />
            <span className="text-sm font-semibold">Loading Kanban stages...</span>
          </div>
        ) : (
          <div className="flex lg:grid lg:grid-cols-3 xl:grid-cols-6 overflow-x-auto gap-4 items-start pb-4 snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0">
            {STAGES.map((s, colIdx) => {
              const stageItems = filteredItems.filter((i) => i.stage === s.id);
              const colArr = stageItems.reduce((acc, curr) => acc + (curr.revenue_impact_num || 0), 0);
              const isOver = dragOver === s.id;

              return (
                <div
                  key={s.id}
                  ref={(el) => {
                    columnRefs.current[s.id] = el;
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(s.id);
                  }}
                  onDragLeave={() => setDragOver(null)}
                  onDrop={(e) => handleDrop(e, s.id)}
                  className={`glass-card p-3 rounded-2xl flex flex-col min-h-[500px] sm:min-h-[550px] min-w-[280px] sm:min-w-[320px] lg:min-w-0 snap-center transition-all flex-shrink-0 lg:flex-shrink ${
                    isOver
                      ? "ring-2 ring-[#235347] bg-[#DAF1DE]/30 scale-[1.01]"
                      : "border border-[#E2E8E4]"
                  }`}
                >
                  {/* Column Header */}
                  <div className="p-2 mb-2 border-b border-[#E2E8E4]/80">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${s.dot}`} />
                        <span className="text-xs font-black text-[#051F20] tracking-tight">
                          {s.label}
                        </span>
                      </div>
                      <span className="text-[11px] font-extrabold px-2 py-0.2 rounded-full bg-white border border-[#CBD8CE] text-[#051F20]">
                        {stageItems.length}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-[#536E67] font-semibold mt-1">
                      <span className="truncate">{s.desc}</span>
                      <span className="font-mono font-bold text-[#235347]">
                        ${(colArr / 1000).toFixed(0)}k
                      </span>
                    </div>
                  </div>

                  {/* Cards Stack */}
                  <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[calc(100vh-320px)] sm:max-h-[calc(100vh-280px)] pr-0.5">
                    {stageItems.length === 0 ? (
                      <div className="p-8 text-center text-[11px] text-[#84A39B] border-2 border-dashed border-[#CBD8CE]/60 rounded-xl">
                        Drop items here
                      </div>
                    ) : (
                      stageItems.map((item) => (
                        <div
                          key={item.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, item.id)}
                          className={`bg-white/90 p-3 rounded-xl border border-[#CBD8CE] shadow-2xs hover:shadow-md hover:border-[#235347] transition-all cursor-grab active:cursor-grabbing group ${
                            dragging === item.id ? "opacity-40 scale-95" : ""
                          }`}
                        >
                          {/* Card Area & Priority */}
                          <div className="flex items-center justify-between gap-1 mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#163832] bg-[#E8F2EA] px-2 py-0.2 rounded-md capitalize truncate max-w-[90px]">
                              {item.product_area}
                            </span>
                            <span
                              className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded-md ${
                                item.priority === "high"
                                  ? "bg-rose-100 text-rose-800"
                                  : item.priority === "medium"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {item.priority}
                            </span>
                          </div>

                          {/* Title (Clickable to open drawer) */}
                          <button
                            onClick={() => setInspectingId(item.id)}
                            className="text-left w-full cursor-pointer group-hover:text-[#235347]"
                          >
                            <h4 className="text-xs font-bold text-[#051F20] group-hover:text-[#235347] transition-colors leading-snug line-clamp-2">
                              {item.title}
                            </h4>
                          </button>

                          {/* ARR & Accounts */}
                          <div className="flex items-center justify-between text-[11px] mt-2.5 pt-2 border-t border-[#F1F5F3]">
                            <span className="font-mono font-bold text-[#235347]">
                              {item.revenue_impact}
                            </span>
                            <span className="text-[10px] text-[#536E67] font-semibold">
                              {item.accounts_count} accts • {item.mentions} quotes
                            </span>
                          </div>

                          {/* Fast Move Buttons (Prev / Next) */}
                          <div className="mt-2.5 pt-2 border-t border-[#F1F5F3] flex items-center justify-between">
                            <button
                              disabled={colIdx === 0}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveStage(item.id, item.stage, "prev");
                              }}
                              className="p-1 rounded-md hover:bg-[#F5F8F6] disabled:opacity-20 disabled:cursor-not-allowed text-[#536E67]"
                              title="Move back one stage"
                            >
                              <ArrowLeft className="w-3 h-3" />
                            </button>

                            <button
                              onClick={() => setInspectingId(item.id)}
                              className="text-[10px] font-bold text-[#235347] hover:underline"
                            >
                              Inspect
                            </button>

                            <button
                              disabled={colIdx === STAGES.length - 1}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveStage(item.id, item.stage, "next");
                              }}
                              className="p-1 rounded-md hover:bg-[#DAF1DE] disabled:opacity-20 disabled:cursor-not-allowed text-[#235347]"
                              title="Advance to next stage"
                            >
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Slide-over Quick Inspector Drawer */}
      <QuickInspectorDrawer
        itemId={inspectingId}
        onClose={() => setInspectingId(null)}
        allItemIds={allItemIds}
        onNavigateItem={(newId) => setInspectingId(newId)}
        onItemUpdated={load}
      />

      {/* Global Command Palette (⌘K) */}
      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        onOpenNewFeedback={() => setIsNewModalOpen(true)}
        onOpenCopilot={() => setIsCopilotOpen(true)}
        onSelectFeedback={(id) => setInspectingId(id)}
      />

      {/* Ingest Feedback Signal Modal */}
      <NewFeedbackModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSuccess={load}
      />

      {/* Portfolio AI Copilot Drawer */}
      <AICopilotDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        onSelectFeedback={(id) => setInspectingId(id)}
      />
    </div>
  );
}