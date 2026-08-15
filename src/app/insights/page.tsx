"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Layers, 
  Kanban,
  CheckCircle2, 
  DollarSign,
  ArrowRight
} from "lucide-react";

interface InsightData {
  total: number;
  features: number;
  bugs: number;
  support: number;
  open: number;
  shipped: number;
  topByMentions: { id: string; title: string; product_area: string; mentions: number; accounts_count: number; revenue_impact: string; revenue_impact_num: number; stage: string; priority: string }[];
  topByRevenue: { id: string; title: string; product_area: string; mentions: number; accounts_count: number; revenue_impact: string; revenue_impact_num: number; stage: string; priority: string }[];
  byStage: { stage: string; count: number }[];
  byArea: { product_area: string; count: number }[];
}

const STAGE_LABELS: Record<string,string> = {
  new: "1. New Intake",
  triaged: "2. Triaged",
  planned: "3. Planned",
  in_development: "4. In Dev",
  testing: "5. Testing / QA",
  shipped: "6. Shipped",
  declined: "Declined"
};

export default function InsightsPage() {
  const [data, setData] = useState<InsightData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/insights")
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { console.error(e); setLoading(false); });
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen text-[#536E67]">
      <div className="w-8 h-8 border-3 border-[#235347] border-t-transparent rounded-full animate-spin mb-3" />
      <span className="text-sm font-medium">Loading telemetry analytics...</span>
    </div>
  );
  if (!data) return null;

  const topRev = data.topByRevenue || [];
  const topMentions = data.topByMentions || [];
  const totalRev = topRev.reduce((acc, curr) => acc + (curr.revenue_impact_num || 0), 0);
  const maxAreaCount = Math.max(...(data.byArea || []).map(a => a.count), 1);

  return (
    <div className="min-h-screen pb-16">
      {/* Glass Header */}
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
              Portfolio Telemetry &amp; Insights
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
            className="px-4 py-1.5 rounded-full text-xs font-semibold text-[#536E67] hover:text-[#051F20] hover:bg-white/80 transition-all flex items-center gap-1.5"
          >
            <Kanban className="w-3.5 h-3.5" />
            Lifecycle Board
          </Link>
          <Link
            href="/insights"
            className="px-4 py-1.5 rounded-full text-xs font-bold bg-[#051F20] text-[#DAF1DE] shadow-xs transition-all flex items-center gap-1.5"
          >
            <BarChart3 className="w-3.5 h-3.5 text-[#8EB69B]" />
            Telemetry &amp; Analytics
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-[#051F20] bg-[#DAF1DE] px-3.5 py-1.5 rounded-full border border-[#C4E5CA] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#235347] animate-pulse" />
            Live Analytics
          </span>
        </div>
      </header>

      {/* Main Stats */}
      <div className="px-8 max-w-[1600px] mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold text-[#051F20] tracking-tight">
            Executive Telemetry &amp; ARR Analytics
          </h1>
          <p className="text-xs text-[#536E67] font-medium mt-1">
            Real-time pipeline distribution, revenue prioritization, and account demand breakdown.
          </p>
        </div>

        {/* 4 Hero Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="glass-card p-6">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#536E67] block mb-2">Total Feedback Signals</span>
            <div className="text-3xl font-extrabold text-[#051F20]">{data.total} Items</div>
            <p className="text-xs text-[#235347] font-semibold mt-1">51 enterprise accounts linked</p>
          </div>

          <div className="glass-card p-6">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#536E67] block mb-2">Open Pipeline</span>
            <div className="text-3xl font-extrabold text-[#051F20]">{data.open} Requests</div>
            <p className="text-xs text-[#235347] font-semibold mt-1">Active customer signals</p>
          </div>

          <div className="glass-card p-6">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#536E67] block mb-2">Shipped &amp; Delivered</span>
            <div className="text-3xl font-extrabold text-[#051F20]">{data.shipped} Features</div>
            <p className="text-xs text-emerald-700 font-semibold mt-1">Production verified</p>
          </div>

          <div className="glass-card p-6">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#536E67] block mb-2">Top Product Area</span>
            <div className="text-3xl font-extrabold text-[#051F20] capitalize">{data.byArea[0]?.product_area || "Missions"}</div>
            <p className="text-xs text-[#235347] font-semibold mt-1">{data.byArea[0]?.count || 0} active feature requests</p>
          </div>
        </div>

        {/* 2 Grids */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Signal Count by Product Area */}
          <div className="glass-card p-6">
            <h2 className="text-sm font-bold text-[#051F20] uppercase tracking-wider mb-4">
              Feedback Signals by Product Area
            </h2>
            <div className="space-y-4">
              {(data.byArea || []).map(a => {
                const pct = Math.round((a.count / maxAreaCount) * 100);
                return (
                  <div key={a.product_area} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="capitalize text-[#051F20]">{a.product_area}</span>
                      <span className="text-[#235347] font-bold">{a.count} requests</span>
                    </div>
                    <div className="w-full bg-[#E8F2EA] h-2.5 rounded-full overflow-hidden">
                      <div className="bg-[#235347] h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stage Breakdown */}
          <div className="glass-card p-6">
            <h2 className="text-sm font-bold text-[#051F20] uppercase tracking-wider mb-4">
              Pipeline Stage Distribution
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {(data.byStage || []).map(s => (
                <div key={s.stage} className="p-4 bg-white/80 border border-[#E2E8E4] rounded-2xl text-center shadow-2xs">
                  <span className="text-[11px] font-bold text-[#536E67] uppercase block mb-1">
                    {STAGE_LABELS[s.stage] || s.stage}
                  </span>
                  <span className="text-2xl font-extrabold text-[#051F20]">{s.count}</span>
                  <span className="text-[10px] text-[#84A39B] block mt-0.5">Signals</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top 5 Revenue Impacting Requests */}
        <div className="glass-card p-6">
          <h2 className="text-sm font-bold text-[#051F20] uppercase tracking-wider mb-4">
            Top Highest Revenue Impact Feature Requests
          </h2>
          <div className="divide-y divide-[#E2E8E4]/60 text-xs">
            {topRev.slice(0, 5).map((req, idx) => (
              <div key={req.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#DAF1DE] text-[#051F20] font-bold flex items-center justify-center text-xs">
                    {idx + 1}
                  </span>
                  <div>
                    <Link href={`/feedback/${req.id}`} className="font-bold text-sm text-[#051F20] hover:text-[#235347] transition-colors">
                      {req.title}
                    </Link>
                    <div className="text-[#536E67] mt-0.5 capitalize flex items-center gap-2">
                      <span>Area: {req.product_area}</span>
                      <span>â€¢</span>
                      <span>{req.accounts_count} Accounts Waiting</span>
                      <span>â€¢</span>
                      <span>{req.mentions} Mentions</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-extrabold text-[#235347] font-mono block">
                    {req.revenue_impact}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-[#536E67] bg-[#E8F2EA] px-2 py-0.5 rounded-full">
                    {req.stage.replace(/_/g, " ")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}