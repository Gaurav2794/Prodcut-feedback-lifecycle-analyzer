"use client";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  Users,
  MessageSquare,
  Layers,
  Kanban,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  Sparkles,
  Search,
  Plus,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import GlobalHeader from "@/components/GlobalHeader";
import CommandPalette from "@/components/CommandPalette";
import QuickInspectorDrawer from "@/components/QuickInspectorDrawer";
import NewFeedbackModal from "@/components/NewFeedbackModal";
import AICopilotDrawer from "@/components/AICopilotDrawer";
import { useToast } from "@/components/Toast";

interface InsightData {
  total: number;
  features: number;
  bugs: number;
  support: number;
  open: number;
  shipped: number;
  topByMentions: {
    id: string;
    title: string;
    product_area: string;
    mentions: number;
    accounts_count: number;
    revenue_impact: string;
    revenue_impact_num: number;
    stage: string;
    priority: string;
  }[];
  topByRevenue: {
    id: string;
    title: string;
    product_area: string;
    mentions: number;
    accounts_count: number;
    revenue_impact: string;
    revenue_impact_num: number;
    stage: string;
    priority: string;
  }[];
  byStage: { stage: string; count: number }[];
  byArea: { product_area: string; count: number }[];
}

const STAGE_LABELS: Record<string, string> = {
  new: "1. Intake",
  triaged: "2. Triaged",
  planned: "3. Planned",
  in_development: "4. In Dev",
  testing: "5. QA / Test",
  shipped: "6. Shipped",
  declined: "Declined",
};

export default function InsightsPage() {
  const { error } = useToast();
  const [data, setData] = useState<InsightData | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals & Drawers
  const [inspectingId, setInspectingId] = useState<string | null>(null);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);

  const loadData = () => {
    fetch("/api/insights")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((e) => {
        error("Failed to load insights", e.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const allItemIds = useMemo(() => {
    if (!data) return [];
    const revIds = (data.topByRevenue || []).map((i) => i.id);
    const menIds = (data.topByMentions || []).map((i) => i.id);
    return Array.from(new Set([...revIds, ...menIds]));
  }, [data]);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-[#536E67]">
        <div className="w-8 h-8 border-3 border-[#235347] border-t-transparent rounded-full animate-spin mb-3" />
        <span className="text-sm font-medium">Loading telemetry analytics...</span>
      </div>
    );
  if (!data) return null;

  const topRev = data.topByRevenue || [];
  const topMentions = data.topByMentions || [];
  const totalRev = topRev.reduce((acc, curr) => acc + (curr.revenue_impact_num || 0), 0);
  const maxAreaCount = Math.max(...(data.byArea || []).map((a) => a.count), 1);
  const maxStageCount = Math.max(...(data.byStage || []).map((s) => s.count), 1);

  return (
    <div className="min-h-screen relative flex flex-col justify-between pb-24 md:pb-16">
      {/* Global Header */}
      <GlobalHeader
        onOpenSearch={() => setIsCommandOpen(true)}
        onOpenNewFeedback={() => setIsNewModalOpen(true)}
        onOpenCopilot={() => setIsCopilotOpen(true)}
      />

      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-8 py-6 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#051F20] tracking-tight">
            Portfolio Telemetry &amp; ARR Analytics
          </h1>
          <p className="text-xs text-[#536E67] font-medium mt-1">
            Real-time pipeline telemetry, revenue prioritization, and cross-account demand leaderboards.
          </p>
        </div>

        {/* 4 KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-5 rounded-2xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#536E67] block mb-1">
              Total Feedback Signals
            </span>
            <div className="text-2xl font-black text-[#051F20]">{data.total} Items</div>
            <p className="text-xs text-[#235347] font-semibold mt-0.5">51 enterprise accounts linked</p>
          </div>

          <div className="glass-card p-5 rounded-2xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#536E67] block mb-1">
              Active Pipeline
            </span>
            <div className="text-2xl font-black text-[#051F20]">{data.open} Requests</div>
            <p className="text-xs text-[#235347] font-semibold mt-0.5">Active customer signals</p>
          </div>

          <div className="glass-card p-5 rounded-2xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#536E67] block mb-1">
              Shipped &amp; Delivered
            </span>
            <div className="text-2xl font-black text-[#051F20]">{data.shipped} Features</div>
            <p className="text-xs text-emerald-700 font-semibold mt-0.5">Production closed-loop</p>
          </div>

          <div className="glass-card p-5 rounded-2xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#536E67] block mb-1">
              Leading Product Area
            </span>
            <div className="text-2xl font-black text-[#051F20] capitalize">
              {data.byArea[0]?.product_area || "Missions"}
            </div>
            <p className="text-xs text-[#235347] font-semibold mt-0.5">
              {data.byArea[0]?.count || 0} active feature requests
            </p>
          </div>
        </div>

        {/* 2 Graphs Row: Product Area & Stage Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Product Area Breakdown */}
          <div className="glass-card p-6 rounded-3xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-extrabold text-[#051F20] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#235347]" /> Feedback by Product Area
              </h3>
              <span className="text-xs text-[#536E67] font-semibold">
                {data.byArea?.length || 0} Module Areas
              </span>
            </div>

            <div className="space-y-3">
              {(data.byArea || []).map((a) => {
                const pct = Math.round((a.count / maxAreaCount) * 100);
                return (
                  <Link
                    key={a.product_area}
                    href={`/?area=${a.product_area}`}
                    className="block group hover:bg-white/60 p-2 rounded-xl transition-all"
                  >
                    <div className="flex items-center justify-between text-xs font-bold mb-1">
                      <span className="capitalize text-[#051F20] group-hover:text-[#235347]">
                        {a.product_area}
                      </span>
                      <span className="text-[#536E67]">{a.count} requests</span>
                    </div>
                    <div className="w-full bg-[#E8F2EA] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#235347] h-full rounded-full transition-all group-hover:bg-[#163832]"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Stage Progression Breakdown */}
          <div className="glass-card p-6 rounded-3xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-extrabold text-[#051F20] flex items-center gap-2">
                <Kanban className="w-4 h-4 text-[#235347]" /> Lifecycle Stage Distribution
              </h3>
              <span className="text-xs text-[#536E67] font-semibold">6 Traceable Stages</span>
            </div>

            <div className="space-y-3">
              {(data.byStage || []).map((s) => {
                const pct = Math.round((s.count / maxStageCount) * 100);
                return (
                  <Link
                    key={s.stage}
                    href={`/?stage=${s.stage}`}
                    className="block group hover:bg-white/60 p-2 rounded-xl transition-all"
                  >
                    <div className="flex items-center justify-between text-xs font-bold mb-1">
                      <span className="text-[#051F20] group-hover:text-[#235347]">
                        {STAGE_LABELS[s.stage] || s.stage}
                      </span>
                      <span className="text-[#536E67]">{s.count} signals</span>
                    </div>
                    <div className="w-full bg-[#E8F2EA] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#051F20] h-full rounded-full transition-all group-hover:bg-[#235347]"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* 2 Leaderboards: Top ARR Impact & Top Account Demand */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top 5 Revenue Impact */}
          <div className="glass-card p-6 rounded-3xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-extrabold text-[#051F20] flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#235347]" /> Top 5 ARR Impact Signals
              </h3>
              <span className="text-xs font-bold text-[#235347] font-mono">
                ${(totalRev / 1000).toFixed(0)}k Combined
              </span>
            </div>

            <div className="divide-y divide-[#E2E8E4]">
              {topRev.slice(0, 5).map((item, idx) => (
                <div
                  key={item.id}
                  onClick={() => setInspectingId(item.id)}
                  className="py-3 flex items-center justify-between gap-3 hover:bg-white/80 rounded-xl px-2 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-[#E8F2EA] text-[#235347] font-extrabold text-xs flex items-center justify-center flex-shrink-0">
                      {idx + 1}
                    </span>
                    <div className="truncate">
                      <div className="font-extrabold text-xs text-[#051F20] group-hover:text-[#235347] truncate">
                        {item.title}
                      </div>
                      <div className="text-[10px] text-[#536E67] capitalize">
                        {item.product_area} • {STAGE_LABELS[item.stage] || item.stage}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="font-mono text-xs font-bold text-[#235347]">
                      {item.revenue_impact}
                    </span>
                    <button className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-[#CBD8CE] text-[#051F20] group-hover:bg-[#DAF1DE]">
                      Inspect
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top 5 Most Requested by Accounts */}
          <div className="glass-card p-6 rounded-3xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-extrabold text-[#051F20] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#235347]" /> Top 5 Account Demand Leaderboard
              </h3>
              <span className="text-xs text-[#536E67] font-semibold">Account Density</span>
            </div>

            <div className="divide-y divide-[#E2E8E4]">
              {topMentions.slice(0, 5).map((item, idx) => (
                <div
                  key={item.id}
                  onClick={() => setInspectingId(item.id)}
                  className="py-3 flex items-center justify-between gap-3 hover:bg-white/80 rounded-xl px-2 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-[#DAF1DE] text-[#051F20] font-extrabold text-xs flex items-center justify-center flex-shrink-0">
                      {idx + 1}
                    </span>
                    <div className="truncate">
                      <div className="font-extrabold text-xs text-[#051F20] group-hover:text-[#235347] truncate">
                        {item.title}
                      </div>
                      <div className="text-[10px] text-[#536E67] capitalize">
                        {item.product_area} • {STAGE_LABELS[item.stage] || item.stage}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs font-extrabold text-[#051F20] bg-white px-2.5 py-0.5 rounded-full border border-[#E2E8E4]">
                      {item.accounts_count} Accounts ({item.mentions} quotes)
                    </span>
                    <button className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-[#CBD8CE] text-[#051F20] group-hover:bg-[#DAF1DE]">
                      Inspect
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Slide-over Quick Inspector Drawer */}
      <QuickInspectorDrawer
        itemId={inspectingId}
        onClose={() => setInspectingId(null)}
        allItemIds={allItemIds}
        onNavigateItem={(newId) => setInspectingId(newId)}
        onItemUpdated={loadData}
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
        onSuccess={loadData}
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