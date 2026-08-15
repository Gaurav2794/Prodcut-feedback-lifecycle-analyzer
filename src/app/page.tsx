"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
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
  X,
  LayoutList,
  LayoutGrid,
  AlignJustify,
  ArrowUpDown,
  Download,
  FileSpreadsheet,
  Plus,
  Filter,
  CheckSquare,
  Square,
  Trash2,
  UserCheck,
  ChevronRight,
  SlidersHorizontal,
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
  raw_feedback: string;
  account_names: string;
  created_at: string;
}

type ViewMode = "table" | "grid" | "compact";
type SortField = "revenue_impact_num" | "mentions" | "accounts_count" | "title" | "stage" | "priority";

const STAGES = ["", "new", "triaged", "planned", "in_development", "testing", "shipped", "declined"];
const AREAS = ["", "missions", "dashboard", "fleet", "reports", "streaming", "integrations", "other"];
const PRIORITIES = ["", "high", "medium", "low"];

const STAGE_LABELS: Record<string, string> = {
  new: "1. Intake",
  triaged: "2. Triaged",
  planned: "3. Planned",
  in_development: "4. In Dev",
  testing: "5. QA / Test",
  shipped: "6. Shipped",
  declined: "Declined",
};

const STAGE_COLORS: Record<string, string> = {
  new: "bg-slate-100 text-slate-800 border-slate-300",
  triaged: "bg-amber-50 text-amber-900 border-amber-300",
  planned: "bg-purple-50 text-purple-900 border-purple-300",
  in_development: "bg-blue-50 text-blue-900 border-blue-300",
  testing: "bg-orange-50 text-orange-900 border-orange-300",
  shipped: "bg-emerald-50 text-emerald-900 border-emerald-300",
  declined: "bg-rose-50 text-rose-900 border-rose-300",
};

export default function FeedbackOSHome() {
  const { success, error } = useToast();

  // Entrance & Hero View state
  const [hasEntered, setHasEntered] = useState(false);

  // Data states
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState("");
  const [stage, setStage] = useState("");
  const [priority, setPriority] = useState("");
  const [area, setArea] = useState("");
  const [ownerFilter, setOwnerFilter] = useState("");

  // View & Sort
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [sortField, setSortField] = useState<SortField>("revenue_impact_num");
  const [sortAsc, setSortAsc] = useState(false);

  // Selection & Bulk Actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // Modals & Drawers
  const [inspectingId, setInspectingId] = useState<string | null>(null);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);

  // Fetch Items
  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (search) p.set("search", search);
      if (stage) p.set("stage", stage);
      if (priority) p.set("priority", priority);
      if (area) p.set("area", area);

      const res = await fetch(`/api/requests?${p}`);
      const data: FeedbackItem[] = await res.json();
      setItems(data);
    } catch (e: any) {
      error("Error fetching signals", e.message);
    } finally {
      setLoading(false);
    }
  }, [search, stage, priority, area, error]);

  useEffect(() => {
    const t = setTimeout(fetchItems, 120);
    return () => clearTimeout(t);
  }, [fetchItems]);

  // Client-side filtering & sorting
  const filteredAndSortedItems = useMemo(() => {
    let result = [...items];

    if (ownerFilter) {
      result = result.filter((i) => i.owner === ownerFilter);
    }

    result.sort((a, b) => {
      let comparison = 0;
      if (sortField === "revenue_impact_num") {
        comparison = (a.revenue_impact_num || 0) - (b.revenue_impact_num || 0);
      } else if (sortField === "mentions") {
        comparison = (a.mentions || 0) - (b.mentions || 0);
      } else if (sortField === "accounts_count") {
        comparison = (a.accounts_count || 0) - (b.accounts_count || 0);
      } else if (sortField === "title") {
        comparison = a.title.localeCompare(b.title);
      } else if (sortField === "stage") {
        comparison = a.stage.localeCompare(b.stage);
      } else if (sortField === "priority") {
        const pOrder: Record<string, number> = { high: 3, medium: 2, low: 1 };
        comparison = (pOrder[a.priority] || 0) - (pOrder[b.priority] || 0);
      }
      return sortAsc ? comparison : -comparison;
    });

    return result;
  }, [items, ownerFilter, sortField, sortAsc]);

  const allItemIds = useMemo(() => filteredAndSortedItems.map((i) => i.id), [filteredAndSortedItems]);

  // Aggregate Metrics
  const totalSignals = items.length;
  const inDevCount = items.filter((i) => i.stage === "in_development").length;
  const shippedCount = items.filter((i) => i.stage === "shipped").length;
  const totalRev = items.reduce((acc, curr) => acc + (curr.revenue_impact_num || 0), 0);

  const selectedItems = useMemo(() => items.filter((i) => selectedIds.includes(i.id)), [items, selectedIds]);
  const selectedRev = selectedItems.reduce((acc, curr) => acc + (curr.revenue_impact_num || 0), 0);

  // Sorting helper
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  // Selection helpers
  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredAndSortedItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredAndSortedItems.map((i) => i.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  // Bulk stage change
  const handleBulkStageChange = async (newStage: string) => {
    if (selectedIds.length === 0 || !newStage) return;
    setBulkActionLoading(true);
    try {
      const res = await fetch("/api/requests/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds, action: "stage", value: newStage }),
      });
      if (!res.ok) throw new Error("Bulk update failed");
      success("Bulk Stage Updated", `Moved ${selectedIds.length} items to ${STAGE_LABELS[newStage] || newStage}`);
      setSelectedIds([]);
      fetchItems();
    } catch (e: any) {
      error("Bulk action error", e.message);
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Bulk Squad Assignment
  const handleBulkOwnerChange = async (newOwner: string) => {
    if (selectedIds.length === 0 || !newOwner) return;
    setBulkActionLoading(true);
    try {
      const res = await fetch("/api/requests/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds, action: "owner", value: newOwner }),
      });
      if (!res.ok) throw new Error("Bulk assign failed");
      success("Squad Assigned", `Assigned ${selectedIds.length} items to ${newOwner}`);
      setSelectedIds([]);
      fetchItems();
    } catch (e: any) {
      error("Bulk action error", e.message);
    } finally {
      setBulkActionLoading(false);
    }
  };

  // 1-Click Fast Stage Advance for single row/card
  const handleAdvanceStage = async (id: string, currentStage: string) => {
    const stageSequence = ["new", "triaged", "planned", "in_development", "testing", "shipped"];
    const idx = stageSequence.indexOf(currentStage);
    if (idx === -1 || idx === stageSequence.length - 1) return;
    const nextStage = stageSequence[idx + 1];

    try {
      const res = await fetch(`/api/requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: nextStage, note: `Advanced to ${nextStage}` }),
      });
      if (!res.ok) throw new Error("Stage advance failed");
      success(`Advanced to ${STAGE_LABELS[nextStage]}`, "Lifecycle progression updated");
      fetchItems();
    } catch (e: any) {
      error("Advance failed", e.message);
    }
  };

  // Export to CSV
  const handleExportCSV = (exportSelected = false) => {
    const dataToExport = exportSelected && selectedItems.length > 0 ? selectedItems : filteredAndSortedItems;
    if (dataToExport.length === 0) {
      error("No Data to Export", "There are no feedback signals matching the criteria.");
      return;
    }

    const headers = ["ID", "Title", "Product Area", "Stage", "Priority", "Category", "Squad Owner", "Mentions", "Accounts Count", "Revenue Impact ($)", "Account Names", "Summary", "Verbatim Voice"];
    const csvRows = [headers.join(",")];

    for (const item of dataToExport) {
      const row = [
        `"${item.id}"`,
        `"${(item.title || "").replace(/"/g, '""')}"`,
        `"${item.product_area}"`,
        `"${item.stage}"`,
        `"${item.priority}"`,
        `"${item.category}"`,
        `"${item.owner}"`,
        item.mentions,
        item.accounts_count,
        item.revenue_impact_num,
        `"${(item.account_names || "").replace(/"/g, '""')}"`,
        `"${(item.summary || "").replace(/"/g, '""')}"`,
        `"${(item.raw_feedback || "").replace(/"/g, '""')}"`,
      ];
      csvRows.push(row.join(","));
    }

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `feedbackos_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    success("Export Complete", `Exported ${dataToExport.length} signals to CSV.`);
  };

  // Preset Filters
  const applyPreset = (type: string) => {
    if (type === "top-arr") {
      setSearch("");
      setStage("");
      setPriority("high");
      setArea("");
      setSortField("revenue_impact_num");
      setSortAsc(false);
    } else if (type === "in-dev") {
      setSearch("");
      setStage("in_development");
      setPriority("");
      setArea("");
    } else if (type === "intake") {
      setSearch("");
      setStage("new");
      setPriority("");
      setArea("");
    } else if (type === "shipped") {
      setSearch("");
      setStage("shipped");
      setPriority("");
      setArea("");
    } else if (type === "clear") {
      setSearch("");
      setStage("");
      setPriority("");
      setArea("");
      setOwnerFilter("");
    }
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden flex flex-col justify-between">
      {/* ========================================================================= */}
      {/* 1. BIG FEEDBACKOS HERO ENTRANCE (WITH FRAMER MOTION TRANSITIONS)           */}
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

            {/* Big FeedbackOS Title */}
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
              Turn scattered customer feedback into a traceable, autonomous product lifecycle — from raw customer voice to production delivery and closed-loop validation.
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
      {/* 2. MAIN INTERACTIVE DASHBOARD VIEW                                        */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {hasEntered && (
          <motion.div
            key="dashboard-view"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="w-full pb-24 md:pb-16 flex flex-col justify-between"
          >
            {/* Global Header */}
            <GlobalHeader
              onOpenSearch={() => setIsCommandOpen(true)}
              onOpenNewFeedback={() => setIsNewModalOpen(true)}
              onOpenCopilot={() => setIsCopilotOpen(true)}
              onToggleHero={() => setHasEntered(false)}
            />

            {/* Main Content Workspace */}
            <div className="w-full max-w-[1600px] mx-auto px-3.5 sm:px-8 space-y-5 sm:space-y-6 mt-4 sm:mt-6">
              
              {/* Sub-Header */}
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#051F20] tracking-tight">
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

              {/* 4 Interactive Live Telemetry KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div
                  onClick={() => applyPreset("clear")}
                  className="glass-card p-5 rounded-2xl cursor-pointer hover:border-[#235347] transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#536E67]">
                      Total Signals
                    </span>
                    <Layers className="w-4 h-4 text-[#235347] group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="my-2">
                    <div className="text-2xl font-black text-[#051F20]">{totalSignals} Items</div>
                    <div className="text-xs text-[#235347] font-semibold mt-0.5">
                      51 Enterprise accounts
                    </div>
                  </div>
                  <div className="w-full bg-[#E8F2EA] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#235347] h-full w-[100%]" />
                  </div>
                </div>

                <div
                  onClick={() => applyPreset("top-arr")}
                  className="glass-card p-5 rounded-2xl cursor-pointer hover:border-[#235347] transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#536E67]">
                      ARR at Stake
                    </span>
                    <DollarSign className="w-4 h-4 text-[#235347] group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="my-2">
                    <div className="text-2xl font-black text-[#051F20]">
                      ${(totalRev / 1000).toFixed(0)}K
                    </div>
                    <div className="text-xs text-[#235347] font-semibold mt-0.5">
                      Filtered portfolio impact
                    </div>
                  </div>
                  <div className="w-full bg-[#E8F2EA] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#235347] h-full w-[85%]" />
                  </div>
                </div>

                <div
                  onClick={() => applyPreset("in-dev")}
                  className="glass-card p-5 rounded-2xl cursor-pointer hover:border-blue-500 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#536E67]">
                      In Active Sprint
                    </span>
                    <Zap className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="my-2">
                    <div className="text-2xl font-black text-[#051F20]">{inDevCount} Features</div>
                    <div className="text-xs text-blue-700 font-semibold mt-0.5">
                      Engineering in progress
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full w-[60%]" />
                  </div>
                </div>

                <div
                  onClick={() => applyPreset("shipped")}
                  className="glass-card p-5 rounded-2xl cursor-pointer hover:border-emerald-500 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#536E67]">
                      Shipped &amp; Validated
                    </span>
                    <ShieldCheck className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="my-2">
                    <div className="text-2xl font-black text-[#051F20]">{shippedCount} Delivered</div>
                    <div className="text-xs text-emerald-700 font-semibold mt-0.5">
                      Closed-loop validated
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-600 h-full w-[100%]" />
                  </div>
                </div>
              </div>

              {/* Quick Filter Preset Chips & View Switchers */}
              <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#84A39B] mr-1 flex items-center gap-1">
                    <SlidersHorizontal className="w-3.5 h-3.5" /> Quick Views:
                  </span>
                  <button
                    onClick={() => applyPreset("top-arr")}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      priority === "high"
                        ? "bg-[#051F20] text-[#DAF1DE] shadow-xs"
                        : "bg-white/80 hover:bg-white text-[#1E332E] border border-[#CBD8CE]"
                    }`}
                  >
                    High ARR Impact
                  </button>
                  <button
                    onClick={() => applyPreset("intake")}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      stage === "new"
                        ? "bg-[#051F20] text-[#DAF1DE] shadow-xs"
                        : "bg-white/80 hover:bg-white text-[#1E332E] border border-[#CBD8CE]"
                    }`}
                  >
                    New Intake
                  </button>
                  <button
                    onClick={() => applyPreset("in-dev")}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      stage === "in_development"
                        ? "bg-[#051F20] text-[#DAF1DE] shadow-xs"
                        : "bg-white/80 hover:bg-white text-[#1E332E] border border-[#CBD8CE]"
                    }`}
                  >
                    In Sprint
                  </button>
                  <button
                    onClick={() => applyPreset("shipped")}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      stage === "shipped"
                        ? "bg-[#051F20] text-[#DAF1DE] shadow-xs"
                        : "bg-white/80 hover:bg-white text-[#1E332E] border border-[#CBD8CE]"
                    }`}
                  >
                    Shipped
                  </button>

                  {(search || stage || priority || area || ownerFilter) && (
                    <button
                      onClick={() => applyPreset("clear")}
                      className="px-3 py-1 rounded-full text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all cursor-pointer flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" /> Reset Filters
                    </button>
                  )}
                </div>

                {/* Right Action Switchers: View Modes & Export */}
                <div className="flex items-center gap-2">
                  {/* View Mode Toggle */}
                  <div className="flex items-center bg-white border border-[#CBD8CE] rounded-full p-1 shadow-2xs">
                    <button
                      onClick={() => setViewMode("table")}
                      className={`p-1.5 rounded-full transition-all cursor-pointer ${
                        viewMode === "table"
                          ? "bg-[#051F20] text-[#DAF1DE] shadow-xs"
                          : "text-[#536E67] hover:text-[#051F20]"
                      }`}
                      title="Table View"
                    >
                      <LayoutList className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-1.5 rounded-full transition-all cursor-pointer ${
                        viewMode === "grid"
                          ? "bg-[#051F20] text-[#DAF1DE] shadow-xs"
                          : "text-[#536E67] hover:text-[#051F20]"
                      }`}
                      title="Card Grid View"
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setViewMode("compact")}
                      className={`p-1.5 rounded-full transition-all cursor-pointer ${
                        viewMode === "compact"
                          ? "bg-[#051F20] text-[#DAF1DE] shadow-xs"
                          : "text-[#536E67] hover:text-[#051F20]"
                      }`}
                      title="Compact Feed View"
                    >
                      <AlignJustify className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* CSV Export */}
                  <button
                    onClick={() => handleExportCSV(false)}
                    className="px-3.5 py-1.5 rounded-full bg-white hover:bg-[#F5F8F6] border border-[#CBD8CE] text-xs font-bold text-[#051F20] shadow-2xs flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <Download className="w-3.5 h-3.5 text-[#235347]" />
                    <span className="hidden sm:inline">Export CSV</span>
                  </button>
                </div>
              </div>

              {/* Interactive Search & Filter Toolbar */}
              <div className="glass-card p-3 rounded-2xl flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[240px]">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#84A39B]" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search feedback titles, verbatim quotes, or customer accounts..."
                    className="w-full pl-10 pr-8 py-2 bg-white/90 border border-[#CBD8CE] rounded-full text-xs font-medium text-[#051F20] placeholder-[#84A39B] focus:outline-none focus:border-[#235347] focus:ring-2 focus:ring-[#235347]/10"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value)}
                  className="py-2 px-3 bg-white/90 border border-[#CBD8CE] rounded-full text-xs font-semibold text-[#1E332E] focus:outline-none focus:border-[#235347]"
                >
                  {STAGES.map((s) => (
                    <option key={s} value={s}>
                      {s ? `Stage: ${STAGE_LABELS[s] || s}` : "All Stages"}
                    </option>
                  ))}
                </select>

                <select
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="py-2 px-3 bg-white/90 border border-[#CBD8CE] rounded-full text-xs font-semibold text-[#1E332E] focus:outline-none focus:border-[#235347]"
                >
                  {AREAS.map((a) => (
                    <option key={a} value={a}>
                      {a ? `Area: ${a.charAt(0).toUpperCase() + a.slice(1)}` : "All Areas"}
                    </option>
                  ))}
                </select>

                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="py-2 px-3 bg-white/90 border border-[#CBD8CE] rounded-full text-xs font-semibold text-[#1E332E] focus:outline-none focus:border-[#235347]"
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {p ? `Priority: ${p.toUpperCase()}` : "All Priorities"}
                    </option>
                  ))}
                </select>

                <select
                  value={ownerFilter}
                  onChange={(e) => setOwnerFilter(e.target.value)}
                  className="py-2 px-3 bg-white/90 border border-[#CBD8CE] rounded-full text-xs font-semibold text-[#1E332E] focus:outline-none focus:border-[#235347]"
                >
                  <option value="">All Squads</option>
                  <option value="product">Product</option>
                  <option value="engineering">Engineering</option>
                  <option value="support">Support</option>
                </select>
              </div>

              {/* Floating Bulk Action Bar (When items are selected) */}
              <AnimatePresence>
                {selectedIds.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 15 }}
                    className="sticky top-20 z-20 glass-card-dark p-3.5 px-6 rounded-2xl shadow-xl border border-[#235347] flex items-center justify-between flex-wrap gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-extrabold text-[#DAF1DE] bg-[#163832] px-3 py-1 rounded-full border border-[#235347]">
                        {selectedIds.length} Selected
                      </span>
                      <span className="text-xs text-[#8EB69B] font-mono">
                        ${(selectedRev / 1000).toFixed(0)}K Total ARR
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Bulk Stage Select */}
                      <select
                        defaultValue=""
                        onChange={(e) => {
                          if (e.target.value) {
                            handleBulkStageChange(e.target.value);
                            e.target.value = "";
                          }
                        }}
                        disabled={bulkActionLoading}
                        className="py-1.5 px-3 bg-[#163832] border border-[#235347] rounded-xl text-xs font-bold text-[#DAF1DE] focus:outline-none cursor-pointer"
                      >
                        <option value="" disabled>
                          Move Stage to...
                        </option>
                        <option value="new">1. New Intake</option>
                        <option value="triaged">2. Triaged</option>
                        <option value="planned">3. Planned</option>
                        <option value="in_development">4. In Dev</option>
                        <option value="testing">5. QA / Test</option>
                        <option value="shipped">6. Shipped</option>
                      </select>

                      {/* Bulk Owner Select */}
                      <select
                        defaultValue=""
                        onChange={(e) => {
                          if (e.target.value) {
                            handleBulkOwnerChange(e.target.value);
                            e.target.value = "";
                          }
                        }}
                        disabled={bulkActionLoading}
                        className="py-1.5 px-3 bg-[#163832] border border-[#235347] rounded-xl text-xs font-bold text-[#DAF1DE] focus:outline-none cursor-pointer"
                      >
                        <option value="" disabled>
                          Assign Squad...
                        </option>
                        <option value="product">Product</option>
                        <option value="engineering">Engineering</option>
                        <option value="support">Support</option>
                      </select>

                      {/* Export Selected */}
                      <button
                        onClick={() => handleExportCSV(true)}
                        className="px-3 py-1.5 rounded-xl bg-[#235347] hover:bg-[#2e6d5e] text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" /> Export Selected
                      </button>

                      {/* Clear Selection */}
                      <button
                        onClick={() => setSelectedIds([])}
                        className="p-1.5 text-[#8EB69B] hover:text-white transition-colors"
                        title="Clear selection"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Content Views: Table / Grid / Compact */}
              {loading ? (
                <div className="glass-card p-24 text-center text-[#536E67] flex flex-col items-center justify-center rounded-3xl">
                  <div className="w-8 h-8 border-3 border-[#235347] border-t-transparent rounded-full animate-spin mb-3" />
                  <span className="text-sm font-semibold">Loading product feedback stream...</span>
                </div>
              ) : filteredAndSortedItems.length === 0 ? (
                <div className="glass-card p-20 text-center text-[#536E67] rounded-3xl">
                  <p className="text-base font-bold text-[#051F20]">No feedback signals matched</p>
                  <p className="text-xs text-[#84A39B] mt-1">Try resetting the filters or searching for another keyword.</p>
                  <button
                    onClick={() => applyPreset("clear")}
                    className="mt-4 px-4 py-2 bg-[#DAF1DE] text-[#051F20] rounded-full text-xs font-bold hover:bg-white border border-[#C4E5CA] transition-colors"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : viewMode === "table" ? (
                /* ========================================================================= */
                /* 1. TABLE VIEW WITH SORTABLE HEADERS & ROW ACTIONS                         */
                /* ========================================================================= */
                <div className="glass-card rounded-3xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[#E2E8E4] bg-[#F5F8F6]/90 text-[11px] font-bold uppercase tracking-wider text-[#536E67]">
                          <th className="py-4 px-4 w-10 text-center">
                            <button
                              onClick={handleToggleSelectAll}
                              className="text-[#235347] hover:text-[#051F20] transition-colors"
                            >
                              {selectedIds.length === filteredAndSortedItems.length && filteredAndSortedItems.length > 0 ? (
                                <CheckSquare className="w-4 h-4 text-[#235347]" />
                              ) : (
                                <Square className="w-4 h-4 text-[#84A39B]" />
                              )}
                            </button>
                          </th>
                          <th
                            onClick={() => handleSort("title")}
                            className="py-4 px-4 cursor-pointer hover:text-[#051F20] transition-colors"
                          >
                            <div className="flex items-center gap-1">
                              <span>Feedback Title &amp; Summary</span>
                              <ArrowUpDown className="w-3 h-3 text-[#84A39B]" />
                            </div>
                          </th>
                          <th className="py-4 px-4">Product Area</th>
                          <th
                            onClick={() => handleSort("stage")}
                            className="py-4 px-4 cursor-pointer hover:text-[#051F20] transition-colors"
                          >
                            <div className="flex items-center gap-1">
                              <span>Lifecycle Stage</span>
                              <ArrowUpDown className="w-3 h-3 text-[#84A39B]" />
                            </div>
                          </th>
                          <th
                            onClick={() => handleSort("accounts_count")}
                            className="py-4 px-4 text-center cursor-pointer hover:text-[#051F20] transition-colors"
                          >
                            <div className="flex items-center justify-center gap-1">
                              <span>Accounts</span>
                              <ArrowUpDown className="w-3 h-3 text-[#84A39B]" />
                            </div>
                          </th>
                          <th
                            onClick={() => handleSort("mentions")}
                            className="py-4 px-4 text-center cursor-pointer hover:text-[#051F20] transition-colors"
                          >
                            <div className="flex items-center justify-center gap-1">
                              <span>Mentions</span>
                              <ArrowUpDown className="w-3 h-3 text-[#84A39B]" />
                            </div>
                          </th>
                          <th
                            onClick={() => handleSort("revenue_impact_num")}
                            className="py-4 px-4 cursor-pointer hover:text-[#051F20] transition-colors"
                          >
                            <div className="flex items-center gap-1">
                              <span>Revenue Impact</span>
                              <ArrowUpDown className="w-3 h-3 text-[#84A39B]" />
                            </div>
                          </th>
                          <th
                            onClick={() => handleSort("priority")}
                            className="py-4 px-4 text-center cursor-pointer hover:text-[#051F20] transition-colors"
                          >
                            <div className="flex items-center justify-center gap-1">
                              <span>Priority</span>
                              <ArrowUpDown className="w-3 h-3 text-[#84A39B]" />
                            </div>
                          </th>
                          <th className="py-4 px-6 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E2E8E4]/60 text-xs">
                        {filteredAndSortedItems.map((item) => {
                          const isSelected = selectedIds.includes(item.id);
                          return (
                            <tr
                              key={item.id}
                              className={`hover:bg-white/95 transition-all group ${
                                isSelected ? "bg-[#DAF1DE]/25" : ""
                              }`}
                            >
                              {/* Checkbox */}
                              <td className="py-4 px-4 text-center">
                                <button
                                  onClick={() => handleToggleSelect(item.id)}
                                  className="text-[#235347] hover:text-[#051F20]"
                                >
                                  {isSelected ? (
                                    <CheckSquare className="w-4 h-4 text-[#235347]" />
                                  ) : (
                                    <Square className="w-4 h-4 text-slate-300 group-hover:text-slate-400" />
                                  )}
                                </button>
                              </td>

                              {/* Title & Summary */}
                              <td className="py-4 px-4 max-w-[380px]">
                                <button
                                  onClick={() => setInspectingId(item.id)}
                                  className="text-left w-full block cursor-pointer group-hover:text-[#235347]"
                                >
                                  <div className="font-extrabold text-[#051F20] group-hover:text-[#235347] transition-colors line-clamp-1">
                                    {item.title}
                                  </div>
                                  <div className="text-[11px] text-[#536E67] truncate mt-0.5 font-normal">
                                    {item.summary}
                                  </div>
                                </button>
                              </td>

                              {/* Product Area */}
                              <td className="py-4 px-4">
                                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#E8F2EA] text-[#163832] border border-[#CBD8CE] capitalize">
                                  {item.product_area}
                                </span>
                              </td>

                              {/* Stage with 1-click Fast Advance */}
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                                      STAGE_COLORS[item.stage] || "bg-slate-100 text-slate-700"
                                    }`}
                                  >
                                    {STAGE_LABELS[item.stage] || item.stage}
                                  </span>
                                  {item.stage !== "shipped" && item.stage !== "declined" && (
                                    <button
                                      onClick={() => handleAdvanceStage(item.id, item.stage)}
                                      className="p-1 rounded-full hover:bg-[#DAF1DE] text-[#235347] opacity-0 group-hover:opacity-100 transition-opacity"
                                      title="Advance to next stage"
                                    >
                                      <ChevronRight className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </td>

                              {/* Accounts */}
                              <td className="py-4 px-4 text-center">
                                <span className="font-bold text-[#051F20] text-xs bg-white px-2.5 py-0.5 rounded-full border border-[#E2E8E4]">
                                  {item.accounts_count}
                                </span>
                              </td>

                              {/* Mentions */}
                              <td className="py-4 px-4 text-center">
                                <span className="font-bold text-[#051F20] text-xs bg-white px-2.5 py-0.5 rounded-full border border-[#E2E8E4]">
                                  {item.mentions}
                                </span>
                              </td>

                              {/* Revenue Impact */}
                              <td className="py-4 px-4">
                                <span className="font-extrabold text-[#235347] font-mono text-xs">
                                  {item.revenue_impact}
                                </span>
                              </td>

                              {/* Priority */}
                              <td className="py-4 px-4 text-center">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                    item.priority === "high"
                                      ? "bg-rose-100 text-rose-800 border border-rose-200"
                                      : item.priority === "medium"
                                      ? "bg-amber-100 text-amber-800 border border-amber-200"
                                      : "bg-slate-100 text-slate-700 border border-slate-200"
                                  }`}
                                >
                                  {item.priority}
                                </span>
                              </td>

                              {/* Quick Action Drawer Trigger */}
                              <td className="py-4 px-6 text-right">
                                <button
                                  onClick={() => setInspectingId(item.id)}
                                  className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white border border-[#CBD8CE] hover:border-[#235347] hover:bg-[#DAF1DE] text-xs font-bold text-[#051F20] shadow-2xs transition-all cursor-pointer"
                                >
                                  Inspect <ArrowRight className="w-3 h-3 text-[#235347]" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : viewMode === "grid" ? (
                /* ========================================================================= */
                /* 2. VISUAL CARD GRID VIEW                                                  */
                /* ========================================================================= */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredAndSortedItems.map((item) => (
                    <div
                      key={item.id}
                      className="glass-card p-5 rounded-3xl flex flex-col justify-between hover:border-[#235347] transition-all group"
                    >
                      <div>
                        {/* Card Top Meta */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <div className="flex items-center gap-1.5">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#E8F2EA] text-[#163832] capitalize">
                              {item.product_area}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
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

                          <span className="font-extrabold text-xs font-mono text-[#235347] bg-[#DAF1DE] px-2.5 py-0.5 rounded-full">
                            {item.revenue_impact}
                          </span>
                        </div>

                        {/* Title & Summary */}
                        <button
                          onClick={() => setInspectingId(item.id)}
                          className="text-left w-full cursor-pointer"
                        >
                          <h3 className="text-sm font-extrabold text-[#051F20] group-hover:text-[#235347] transition-colors leading-snug line-clamp-2">
                            {item.title}
                          </h3>
                          <p className="text-xs text-[#536E67] mt-1.5 line-clamp-2 leading-relaxed">
                            {item.summary}
                          </p>
                        </button>

                        {/* Raw Verbatim Voice snippet */}
                        {item.raw_feedback && (
                          <div className="mt-3 p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60 text-[11px] text-amber-950/90 italic line-clamp-2">
                            "{item.raw_feedback}"
                          </div>
                        )}
                      </div>

                      {/* Card Footer */}
                      <div className="mt-4 pt-3 border-t border-[#E2E8E4] flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs text-[#536E67] font-semibold">
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5 text-[#84A39B]" />
                            {item.accounts_count} accts
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3.5 h-3.5 text-[#84A39B]" />
                            {item.mentions} quotes
                          </span>
                        </div>

                        <button
                          onClick={() => setInspectingId(item.id)}
                          className="px-3 py-1 rounded-full bg-[#051F20] text-[#DAF1DE] text-xs font-bold hover:bg-[#0B2B26] transition-all flex items-center gap-1 cursor-pointer"
                        >
                          Inspect <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* ========================================================================= */
                /* 3. COMPACT STREAM VIEW                                                    */
                /* ========================================================================= */
                <div className="glass-card rounded-3xl divide-y divide-[#E2E8E4] overflow-hidden">
                  {filteredAndSortedItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setInspectingId(item.id)}
                      className="p-3.5 px-5 flex items-center justify-between hover:bg-white cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center gap-4 min-w-0 pr-4">
                        <div
                          className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                            item.priority === "high"
                              ? "bg-rose-500"
                              : item.priority === "medium"
                              ? "bg-amber-500"
                              : "bg-slate-400"
                          }`}
                        />
                        <div className="truncate">
                          <span className="text-xs font-extrabold text-[#051F20] group-hover:text-[#235347] transition-colors">
                            {item.title}
                          </span>
                          <span className="text-[11px] text-[#536E67] ml-2 font-normal hidden sm:inline">
                            • {item.summary}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#E8F2EA] text-[#163832]">
                          {STAGE_LABELS[item.stage] || item.stage}
                        </span>
                        <span className="font-mono text-xs font-bold text-[#235347]">
                          {item.revenue_impact}
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#235347]" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slide-over Quick Inspector Drawer */}
      <QuickInspectorDrawer
        itemId={inspectingId}
        onClose={() => setInspectingId(null)}
        allItemIds={allItemIds}
        onNavigateItem={(newId) => setInspectingId(newId)}
        onItemUpdated={fetchItems}
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
        onSuccess={fetchItems}
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