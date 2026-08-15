"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Sparkles, 
  ArrowRight, 
  Kanban, 
  BarChart3, 
  RotateCcw,
  Check,
  ShieldCheck,
  ChevronDown,
  Layers,
  ArrowUpRight,
  Building2,
  DollarSign,
  Zap,
  CheckCircle2,
  X
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
  raw_feedback: string;
  account_names: string;
  created_at: string;
}

const STAGES = ["","new","triaged","planned","in_development","testing","shipped","declined"];
const AREAS = ["","missions","dashboard","fleet","reports","streaming","integrations","other"];
const PRIORITIES = ["","high","medium","low"];

const stageLabel: Record<string,string> = {
  new:"1. New Intake", triaged:"2. Triaged", planned:"3. Planned", in_development:"4. In Dev", testing:"5. Testing / QA", shipped:"6. Shipped", declined:"Declined"
};

const stageColors: Record<string,string> = {
  new: "bg-slate-100 text-slate-700 border-slate-200",
  triaged: "bg-amber-50 text-amber-800 border-amber-200",
  planned: "bg-purple-50 text-purple-800 border-purple-200",
  in_development: "bg-blue-50 text-blue-800 border-blue-200",
  testing: "bg-orange-50 text-orange-800 border-orange-200",
  shipped: "bg-emerald-50 text-emerald-800 border-emerald-200",
  declined: "bg-rose-50 text-rose-800 border-rose-200"
};

export default function FeedbackOSHome() {
  const [hasEntered, setHasEntered] = useState(false);
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stage, setStage] = useState("");
  const [priority, setPriority] = useState("");
  const [area, setArea] = useState("");

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (stage) p.set("stage", stage);
    if (priority) p.set("priority", priority);
    if (area) p.set("area", area);
    const res = await fetch(`/api/requests?${p}`);
    const data: FeedbackItem[] = await res.json();
    setItems(data);
    setLoading(false);
  }, [search, stage, priority, area]);

  useEffect(() => {
    const t = setTimeout(fetchItems, 150);
    return () => clearTimeout(t);
  }, [fetchItems]);

  const total = items.length;
  const inDevCount = items.filter(i => i.stage === "in_development").length;
  const shippedCount = items.filter(i => i.stage === "shipped").length;
  const totalRev = items.reduce((acc, curr) => acc + (curr.revenue_impact_num || 0), 0);

  return (
    <div className="min-h-screen relative overflow-x-hidden flex flex-col justify-between">
      
      {/* ========================================================================= */}
      {/* 1. MINIMAL HERO ENTRANCE                                                  */}
      {/* ========================================================================= */}
      <AnimatePresence mode="wait">
        {!hasEntered && (
          <motion.div
            key="minimal-hero"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -25, transition: { duration: 0.35, ease: "easeInOut" } }}
            className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center max-w-4xl mx-auto min-h-screen"
          >
            {/* Live Sync Pill */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/80 border border-[#CBD8CE] shadow-xs text-xs font-bold text-[#051F20] mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-[#235347] animate-pulse" />
              <span>FeedbackOS v2.4</span>
              <span className="w-1 h-1 rounded-full bg-[#84A39B]" />
              <span className="text-[#536E67]">55 Enterprise Requests Seeded</span>
            </motion.div>

            {/* Title */}
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-6xl sm:text-7xl md:text-8xl font-black text-[#051F20] tracking-tight leading-none mb-6"
            >
              Feedback<span className="text-[#235347]">OS</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-base sm:text-lg text-[#536E67] font-medium max-w-2xl mx-auto leading-relaxed mb-10"
            >
              Turn scattered customer feedback into a traceable, autonomous product lifecycle - from raw customer voice to production delivery and closed-loop validation.
            </motion.p>

            {/* Lucide Icon Pills */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap items-center justify-center gap-3 mb-12"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 border border-[#E2E8E4] text-xs font-bold text-[#051F20] shadow-xs">
                <Building2 className="w-3.5 h-3.5 text-[#235347]" />
                51 Enterprise Accounts
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 border border-[#E2E8E4] text-xs font-bold text-[#235347] shadow-xs">
                <DollarSign className="w-3.5 h-3.5 text-[#235347]" />
                $6.8M ARR Tracked
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#DAF1DE] border border-[#C4E5CA] text-xs font-bold text-[#051F20] shadow-xs">
                <Zap className="w-3.5 h-3.5 text-[#051F20]" />
                Powered by Gemini 3.7 Flash
              </span>
            </motion.div>

            {/* Action Button */}
            <motion.button
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setHasEntered(true)}
              className="px-9 py-4 rounded-full bg-[#051F20] hover:bg-[#0B2B26] text-[#DAF1DE] font-extrabold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all flex items-center gap-3 cursor-pointer group"
            >
              <span>View Product Feedback</span>
              <ArrowRight className="w-5 h-5 text-[#8EB69B] group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 2. DASHBOARD VIEW                                                         */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {hasEntered && (
          <motion.div
            key="dashboard-view"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="w-full pb-16"
          >
            {/* Header */}
            <header className="glass-header px-8 py-4 flex items-center justify-between sticky top-0 z-30 mb-8 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#051F20] flex items-center justify-center text-white shadow-md shadow-[#051F20]/10">
                  <Layers className="w-5 h-5 text-[#8EB69B]" />
                </div>
                <div>
                  <span className="font-extrabold text-base text-[#051F20] tracking-tight block">
                    FeedbackOS
                  </span>
                  <span className="text-[11px] text-[#536E67] font-medium block">
                    Product Lifecycle Manager
                  </span>
                </div>
              </div>

              {/* Nav */}
              <nav className="flex items-center gap-1.5 p-1 bg-white/70 backdrop-blur-md rounded-full border border-[#E2E8E4] shadow-xs">
                <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-[#051F20] text-[#DAF1DE] shadow-xs flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8EB69B]" />
                  Dashboard
                </span>
                <Link
                  href="/board"
                  className="px-4 py-1.5 rounded-full text-xs font-semibold text-[#536E67] hover:text-[#051F20] hover:bg-white/80 transition-all flex items-center gap-1.5"
                >
                  <Kanban className="w-3.5 h-3.5" />
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

              {/* Minimal Hero Toggle */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setHasEntered(false)}
                  className="text-xs font-bold text-[#051F20] bg-white/80 hover:bg-white px-4 py-2 rounded-full border border-[#CBD8CE] transition-all cursor-pointer shadow-2xs flex items-center gap-1.5"
                >
                  <X className="w-3 h-3" /> FeedbackOS Minimal
                </button>
              </div>
            </header>

            {/* Sub-Header */}
            <div className="px-8 max-w-[1600px] mx-auto flex items-center justify-between flex-wrap gap-4 mb-6">
              <div>
                <h2 className="text-3xl font-extrabold text-[#051F20] tracking-tight">
                  Product Feedback Stream
                </h2>
                <p className="text-xs text-[#536E67] font-medium mt-1">
                  Manage, prioritize, and track all customer requests in one traceable lifecycle.
                </p>
              </div>

              <Link
                href="/board"
                className="px-5 py-2.5 rounded-full bg-[#051F20] hover:bg-[#0B2B26] text-[#DAF1DE] text-xs font-bold shadow-sm hover:shadow-md transition-all flex items-center gap-2"
              >
                <Kanban className="w-4 h-4 text-[#8EB69B]" />
                Open Kanban Board
              </Link>
            </div>

            {/* 4 Frosted Cards */}
            <div className="px-8 max-w-[1600px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
              <div className="glass-card p-6 flex flex-col justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#536E67]">Total Feedback Signals</span>
                <div className="my-2">
                  <div className="text-3xl font-extrabold text-[#051F20]">55 Items</div>
                  <div className="text-xs text-[#235347] font-semibold mt-1">51 Enterprise accounts linked</div>
                </div>
                <div className="w-full bg-[#E8F2EA] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#235347] h-full w-[100%]" />
                </div>
              </div>

              <div className="glass-card p-6 flex flex-col justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#536E67]">Total ARR at Stake</span>
                <div className="my-2">
                  <div className="text-3xl font-extrabold text-[#051F20]">${(totalRev / 1000).toFixed(0)}K</div>
                  <div className="text-xs text-[#235347] font-semibold mt-1">Filtered revenue impact</div>
                </div>
                <div className="w-full bg-[#E8F2EA] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#235347] h-full w-[80%]" />
                </div>
              </div>

              <div className="glass-card p-6 flex flex-col justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#536E67]">In Active Sprint</span>
                <div className="my-2">
                  <div className="text-3xl font-extrabold text-[#051F20]">{inDevCount} Features</div>
                  <div className="text-xs text-blue-700 font-semibold mt-1">Active engineering delivery</div>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full w-[50%]" />
                </div>
              </div>

              <div className="glass-card p-6 flex flex-col justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#536E67]">Shipped &amp; Validated</span>
                <div className="my-2">
                  <div className="text-3xl font-extrabold text-[#051F20]">{shippedCount} Features</div>
                  <div className="text-xs text-emerald-700 font-semibold mt-1">Closed feedback loops</div>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full w-[100%]" />
                </div>
              </div>
            </div>

            {/* Filter Toolbar */}
            <div className="px-8 max-w-[1600px] mx-auto mb-6">
              <div className="glass-card p-3.5 flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[260px]">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#84A39B]" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search feedback, accounts, or product areas..."
                    className="w-full pl-10 pr-4 py-2 bg-white/80 border border-[#E2E8E4] rounded-full text-xs font-medium text-[#051F20] placeholder-[#84A39B] focus:outline-none focus:border-[#235347] focus:ring-2 focus:ring-[#235347]/10"
                  />
                </div>

                <select
                  value={stage}
                  onChange={e => setStage(e.target.value)}
                  className="py-2 px-3.5 bg-white/80 border border-[#E2E8E4] rounded-full text-xs font-semibold text-[#1E332E] focus:outline-none focus:border-[#235347]"
                >
                  {STAGES.map(s => (
                    <option key={s} value={s}>{s ? `Stage: ${stageLabel[s]}` : "All Stages"}</option>
                  ))}
                </select>

                <select
                  value={area}
                  onChange={e => setArea(e.target.value)}
                  className="py-2 px-3.5 bg-white/80 border border-[#E2E8E4] rounded-full text-xs font-semibold text-[#1E332E] focus:outline-none focus:border-[#235347]"
                >
                  {AREAS.map(a => (
                    <option key={a} value={a}>{a ? `Area: ${a.charAt(0).toUpperCase() + a.slice(1)}` : "All Areas"}</option>
                  ))}
                </select>

                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value)}
                  className="py-2 px-3.5 bg-white/80 border border-[#E2E8E4] rounded-full text-xs font-semibold text-[#1E332E] focus:outline-none focus:border-[#235347]"
                >
                  {PRIORITIES.map(p => (
                    <option key={p} value={p}>{p ? `Priority: ${p.toUpperCase()}` : "All Priorities"}</option>
                  ))}
                </select>

                {(search || stage || priority || area) && (
                  <button
                    onClick={() => { setSearch(""); setStage(""); setPriority(""); setArea(""); }}
                    className="px-4 py-2 bg-[#DAF1DE] text-[#051F20] rounded-full text-xs font-bold hover:bg-white border border-[#C4E5CA] transition-colors cursor-pointer"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>

            {/* Table */}
            <div className="px-8 max-w-[1600px] mx-auto">
              <div className="glass-card overflow-hidden">
                {loading ? (
                  <div className="p-20 text-center text-[#536E67] flex flex-col items-center justify-center">
                    <div className="w-8 h-8 border-3 border-[#235347] border-t-transparent rounded-full animate-spin mb-3" />
                    <span className="text-sm font-medium">Loading feedback items...</span>
                  </div>
                ) : items.length === 0 ? (
                  <div className="p-20 text-center text-[#536E67]">
                    <p className="text-base font-bold text-[#051F20]">No feedback signals matched</p>
                    <p className="text-xs text-[#84A39B] mt-1">Try resetting the filters or searching for another keyword.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[#E2E8E4] bg-[#F5F8F6]/80 text-[11px] font-bold uppercase tracking-wider text-[#536E67]">
                          <th className="py-4 px-6">Feedback Title &amp; Summary</th>
                          <th className="py-4 px-4">Product Area</th>
                          <th className="py-4 px-4">Stage</th>
                          <th className="py-4 px-4 text-center">Accounts</th>
                          <th className="py-4 px-4 text-center">Mentions</th>
                          <th className="py-4 px-4">Revenue Impact</th>
                          <th className="py-4 px-4 text-center">Priority</th>
                          <th className="py-4 px-6 text-right">Quick Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E2E8E4]/60 text-sm">
                        {items.map((item) => (
                          <tr
                            key={item.id}
                            className="hover:bg-white/80 transition-colors group"
                          >
                            <td className="py-4 px-6 max-w-[420px]">
                              <Link href={`/feedback/${item.id}`} className="block">
                                <div className="font-bold text-[#051F20] group-hover:text-[#235347] transition-colors">
                                  {item.title}
                                </div>
                                <div className="text-xs text-[#536E67] truncate mt-0.5 font-normal">
                                  {item.summary}
                                </div>
                              </Link>
                            </td>
                            <td className="py-4 px-4">
                              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#E8F2EA] text-[#163832] border border-[#CBD8CE] capitalize">
                                {item.product_area}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${stageColors[item.stage] || "bg-slate-100 text-slate-700"}`}>
                                {stageLabel[item.stage] || item.stage}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-center">
                              <span className="font-bold text-[#051F20] text-xs bg-white px-2.5 py-1 rounded-full border border-[#E2E8E4]">
                                {item.accounts_count}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-center">
                              <span className="font-bold text-[#051F20] text-xs bg-white px-2.5 py-1 rounded-full border border-[#E2E8E4]">
                                {item.mentions}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <span className="font-bold text-[#235347] font-mono text-xs">
                                {item.revenue_impact}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-center">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                item.priority === "high" ? "bg-rose-50 text-rose-700 border border-rose-200" :
                                item.priority === "medium" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                                "bg-slate-50 text-slate-600 border border-slate-200"
                              }`}>
                                {item.priority}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-right">
                              <Link
                                href={`/feedback/${item.id}`}
                                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white border border-[#E2E8E4] hover:border-[#235347] hover:bg-[#DAF1DE] text-xs font-bold text-[#051F20] shadow-2xs transition-all"
                              >
                                Inspect <ArrowRight className="w-3.5 h-3.5 text-[#235347]" />
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}