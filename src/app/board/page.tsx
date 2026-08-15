"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { 
  GripVertical, 
  Users, 
  MessageSquare, 
  ArrowRight, 
  Kanban, 
  CheckCircle2, 
  Clock, 
  Layers,
  Sparkles,
  BarChart3
} from "lucide-react";

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
  { id: "new", label: "1. New Intake", desc: "Raw customer signals", color: "bg-slate-100/90 text-slate-800", dot: "bg-slate-500" },
  { id: "triaged", label: "2. Triaged", desc: "Prioritized by AI/Product", color: "bg-amber-50/90 text-amber-900", dot: "bg-amber-500" },
  { id: "planned", label: "3. Planned", desc: "Committed to roadmap", color: "bg-purple-50/90 text-purple-900", dot: "bg-purple-500" },
  { id: "in_development", label: "4. In Dev", desc: "Active sprint execution", color: "bg-blue-50/90 text-blue-900", dot: "bg-blue-500" },
  { id: "testing", label: "5. Testing / QA", desc: "Staging verification", color: "bg-orange-50/90 text-orange-900", dot: "bg-orange-500" },
  { id: "shipped", label: "6. Shipped", desc: "Live in production", color: "bg-emerald-50/90 text-emerald-900", dot: "bg-emerald-600" },
];

export default function BoardPage() {
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch("/api/requests");
    const data = await res.json();
    setItems(data.filter((i: FeedbackItem) => i.stage !== "declined"));
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDragging(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = async (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    if (!dragging) return;
    const item = items.find(i => i.id === dragging);
    if (!item || item.stage === stageId) {
      setDragging(null);
      setDragOver(null);
      return;
    }
    setItems(prev => prev.map(i => i.id === dragging ? { ...i, stage: stageId } : i));
    await fetch(`/api/requests/${dragging}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage: stageId, note: `Moved to ${stageId} on Kanban board` })
    });
    setDragging(null);
    setDragOver(null);
  };

  return (
    <div className="min-h-screen pb-12">
      {/* Top Header */}
      <header className="glass-header px-8 py-4 flex items-center justify-between sticky top-0 z-30 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#051F20] flex items-center justify-center text-white shadow-md shadow-[#051F20]/10">
            <Layers className="w-5 h-5 text-[#8EB69B]" />
          </div>
          <div>
            <span className="font-extrabold text-base text-[#051F20] tracking-tight block">
              FeedbackOS
            </span>
            <span className="text-[11px] text-[#536E67] font-medium block">
              Lifecycle Kanban Board
            </span>
          </div>
        </div>

        {/* Centered Switcher */}
        <nav className="flex items-center gap-1.5 p-1 bg-white/70 backdrop-blur-md rounded-full border border-[#E2E8E4] shadow-xs">
          <Link
            href="/"
            className="px-4 py-1.5 rounded-full text-xs font-semibold text-[#536E67] hover:text-[#051F20] hover:bg-white/80 transition-all flex items-center gap-1.5"
          >
            Dashboard
          </Link>
          <Link
            href="/board"
            className="px-4 py-1.5 rounded-full text-xs font-bold bg-[#051F20] text-[#DAF1DE] shadow-xs transition-all flex items-center gap-1.5"
          >
            <Kanban className="w-3.5 h-3.5 text-[#8EB69B]" />
            Lifecycle Board
          </Link>
          <Link
            href="/insights"
            className="px-4 py-1.5 rounded-full text-xs font-semibold text-[#536E67] hover:text-[#051F20] hover:bg-white/80 transition-all flex items-center gap-1.5"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Telemetry &amp; Analytics
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-[#051F20] bg-[#DAF1DE] px-3.5 py-1.5 rounded-full border border-[#C4E5CA] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#235347] animate-pulse" />
            Drag &amp; Drop Enabled
          </span>
        </div>
      </header>

      {/* Board Content */}
      <div className="px-8 max-w-[1700px] mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-[#051F20] tracking-tight">
              Lifecycle Delivery Pipeline
            </h1>
            <p className="text-xs text-[#536E67] font-medium mt-1">
              Drag feedback cards across stages to automatically update delivery status and log immutable audit entries.
            </p>
          </div>
        </div>

        {/* Lanes Grid */}
        {loading ? (
          <div className="p-20 text-center text-[#536E67] flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-3 border-[#235347] border-t-transparent rounded-full animate-spin mb-3" />
            <span className="text-sm font-medium">Loading lifecycle lanes...</span>
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-6 items-stretch select-none">
            {STAGES.map(stg => {
              const stageItems = items.filter(i => i.stage === stg.id);
              const isDragTarget = dragOver === stg.id;

              return (
                <div
                  key={stg.id}
                  className={`flex flex-col flex-shrink-0 w-[285px] rounded-3xl p-3.5 transition-all ${
                    isDragTarget
                      ? "bg-[#DAF1DE]/70 border-2 border-[#235347] shadow-lg scale-[1.01]"
                      : "glass-card border border-white/80"
                  }`}
                  onDragOver={e => { e.preventDefault(); setDragOver(stg.id); }}
                  onDragLeave={() => setDragOver(null)}
                  onDrop={e => handleDrop(e, stg.id)}
                >
                  {/* Lane Header */}
                  <div className="px-2 py-1.5 mb-2.5">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${stg.dot}`} />
                        <span className="text-xs font-extrabold text-[#051F20] tracking-tight">
                          {stg.label}
                        </span>
                      </div>
                      <span className="text-xs font-extrabold text-[#051F20] bg-white px-2.5 py-0.5 rounded-full border border-[#E2E8E4] shadow-2xs">
                        {stageItems.length}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#536E67] font-medium">
                      {stg.desc}
                    </div>
                  </div>

                  {/* Cards Container */}
                  <div className="flex-1 overflow-y-auto space-y-3 p-1 min-h-[160px]">
                    {stageItems.map(item => (
                      <div
                        key={item.id}
                        draggable
                        onDragStart={e => handleDragStart(e, item.id)}
                        onDragEnd={() => { setDragging(null); setDragOver(null); }}
                        className={`bg-white rounded-2xl p-4 border border-[#E2E8E4] shadow-xs hover:shadow-md hover:border-[#235347] transition-all cursor-grab active:cursor-grabbing group ${
                          dragging === item.id ? "opacity-30 scale-95" : ""
                        }`}
                      >
                        <div className="flex items-start gap-2 mb-2">
                          <GripVertical className="w-3.5 h-3.5 text-[#84A39B] mt-0.5 flex-shrink-0 group-hover:text-[#235347] transition-colors" />
                          <Link
                            href={`/feedback/${item.id}`}
                            onClick={e => e.stopPropagation()}
                            className="font-bold text-xs text-[#051F20] leading-snug group-hover:text-[#235347] transition-colors line-clamp-2"
                          >
                            {item.title}
                          </Link>
                        </div>

                        <div className="flex items-center justify-between text-[11px] font-semibold my-2.5 pb-2 border-b border-[#F5F8F6]">
                          <span className="capitalize text-[#536E67] bg-[#F5F8F6] px-2 py-0.5 rounded-full">
                            {item.product_area}
                          </span>
                          <span className="text-[#235347] font-mono font-bold">
                            {item.revenue_impact}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px]">
                          <div className="flex items-center gap-2 text-[#536E67] font-medium">
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3 text-[#235347]" />
                              {item.accounts_count}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="w-3 h-3 text-[#235347]" />
                              {item.mentions}
                            </span>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            item.priority === "high" ? "bg-rose-50 text-rose-700 border border-rose-200" :
                            item.priority === "medium" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                            "bg-slate-50 text-slate-600 border border-slate-200"
                          }`}>
                            {item.priority}
                          </span>
                        </div>
                      </div>
                    ))}

                    {stageItems.length === 0 && (
                      <div className={`h-24 border-2 border-dashed rounded-2xl flex items-center justify-center text-xs font-semibold transition-all ${
                        isDragTarget ? "border-[#235347] text-[#051F20] bg-[#DAF1DE]" : "border-slate-200 text-slate-400"
                      }`}>
                        {isDragTarget ? "Drop to Move" : "Empty Lane"}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}