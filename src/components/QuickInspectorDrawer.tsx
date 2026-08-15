"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  CheckCircle2,
  Users,
  MessageSquare,
  TrendingUp,
  DollarSign,
  Layers,
  Building2,
  Clock,
  ExternalLink,
  ShieldCheck,
  RotateCcw,
  Check,
  Loader2,
  HelpCircle,
} from "lucide-react";
import { useToast } from "./Toast";

interface AccountItem {
  account_name: string;
}

interface StageEvent {
  id: string;
  stage: string;
  note: string;
  entered_at: string;
}

interface RelatedItem {
  id: string;
  title: string;
  stage: string;
  product_area: string;
  accounts_count: number;
  mentions: number;
  priority: string;
}

interface Validation {
  status: string;
  customer_tried: number;
  satisfied: number;
  feedback_text: string;
  follow_up_needed: number;
}

interface Triage {
  suggested_category: string;
  suggested_product_area: string;
  suggested_summary: string;
  suggested_priority: string;
  suggested_owner: string;
  confidence: string;
  accepted: number;
}

interface DetailData {
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
  accounts: AccountItem[];
  events: StageEvent[];
  related: RelatedItem[];
  validation: Validation | null;
  triage: Triage | null;
}

const STAGES = [
  { id: "new", label: "1. Intake" },
  { id: "triaged", label: "2. Triaged" },
  { id: "planned", label: "3. Planned" },
  { id: "in_development", label: "4. In Dev" },
  { id: "testing", label: "5. QA / Test" },
  { id: "shipped", label: "6. Shipped" },
];

const STAGE_COLORS: Record<string, string> = {
  new: "bg-slate-100 text-slate-800 border-slate-300",
  triaged: "bg-amber-50 text-amber-900 border-amber-300",
  planned: "bg-purple-50 text-purple-900 border-purple-300",
  in_development: "bg-blue-50 text-blue-900 border-blue-300",
  testing: "bg-orange-50 text-orange-900 border-orange-300",
  shipped: "bg-emerald-50 text-emerald-900 border-emerald-300",
  declined: "bg-rose-50 text-rose-900 border-rose-300",
};

interface QuickInspectorDrawerProps {
  itemId: string | null;
  onClose: () => void;
  allItemIds?: string[];
  onNavigateItem?: (newId: string) => void;
  onItemUpdated?: () => void;
}

export default function QuickInspectorDrawer({
  itemId,
  onClose,
  allItemIds = [],
  onNavigateItem,
  onItemUpdated,
}: QuickInspectorDrawerProps) {
  const { success, error } = useToast();
  const [data, setData] = useState<DetailData | null>(null);
  const [loading, setLoading] = useState(false);
  const [triageLoading, setTriageLoading] = useState(false);
  const [stageUpdating, setStageUpdating] = useState(false);
  const [savingVal, setSavingVal] = useState(false);
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  // Form states
  const [editCategory, setEditCategory] = useState("");
  const [editPriority, setEditPriority] = useState("");
  const [editOwner, setEditOwner] = useState("");
  const [editArea, setEditArea] = useState("");

  // Validation states
  const [valStatus, setValStatus] = useState("pending");
  const [valTried, setValTried] = useState(false);
  const [valSatisfied, setValSatisfied] = useState(false);
  const [valFeedback, setValFeedback] = useState("");

  const currentIndex = allItemIds.findIndex((id) => id === itemId);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < allItemIds.length - 1;

  const loadData = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/requests/${id}`);
      if (!res.ok) throw new Error("Failed to load details");
      const d: DetailData = await res.json();
      setData(d);
      setEditCategory(d.category || "feature_request");
      setEditPriority(d.priority || "medium");
      setEditOwner(d.owner || "product");
      setEditArea(d.product_area || "missions");

      if (d.validation) {
        setValStatus(d.validation.status || "pending");
        setValTried(d.validation.customer_tried === 1);
        setValSatisfied(d.validation.satisfied === 1);
        setValFeedback(d.validation.feedback_text || "");
      } else {
        setValStatus("pending");
        setValTried(false);
        setValSatisfied(false);
        setValFeedback("");
      }
    } catch (e: any) {
      error("Error loading feedback item", e.message);
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    if (itemId) {
      loadData(itemId);
    } else {
      setData(null);
    }
  }, [itemId, loadData]);

  // Keyboard navigation for Prev/Next
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!itemId) return;
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [itemId, onClose]);

  const handleStageChange = async (newStage: string) => {
    if (!itemId || !data || data.stage === newStage) return;
    setStageUpdating(true);
    try {
      const res = await fetch(`/api/requests/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stage: newStage,
          note: `Stage progressed to ${newStage} via Quick Inspector`,
        }),
      });
      if (!res.ok) throw new Error("Failed to update stage");
      success(`Moved to ${newStage.toUpperCase()}`, data.title);
      await loadData(itemId);
      if (onItemUpdated) onItemUpdated();
    } catch (e: any) {
      error("Stage update failed", e.message);
    } finally {
      setStageUpdating(false);
    }
  };

  const handleMetaSave = async (field: string, val: string) => {
    if (!itemId) return;
    try {
      const res = await fetch(`/api/requests/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: val }),
      });
      if (!res.ok) throw new Error("Update failed");
      success(`Updated ${field}`, `Set to ${val}`);
      if (onItemUpdated) onItemUpdated();
    } catch (e: any) {
      error("Failed to save changes", e.message);
    }
  };

  const runAiTriage = async () => {
    if (!itemId) return;
    setTriageLoading(true);
    try {
      const res = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ request_id: itemId }),
      });
      if (!res.ok) throw new Error("Triage failed");
      success("AI Triage Analysis Complete", "Gemini evaluated customer signals");
      await loadData(itemId);
    } catch (e: any) {
      error("AI Triage Error", e.message);
    } finally {
      setTriageLoading(false);
    }
  };

  const acceptAiTriage = async () => {
    if (!itemId || !data?.triage) return;
    const t = data.triage;
    try {
      await fetch(`/api/requests/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: t.suggested_category,
          product_area: t.suggested_product_area,
          priority: t.suggested_priority,
          owner: t.suggested_owner,
          summary: t.suggested_summary,
        }),
      });
      setAppliedSuccess(true);
      success("AI Recommendations Applied", "Categorization, owner, and priority updated.");
      setTimeout(() => setAppliedSuccess(false), 3000);
      await loadData(itemId);
      if (onItemUpdated) onItemUpdated();
    } catch (e: any) {
      error("Failed to apply recommendation", e.message);
    }
  };

  const saveValidationRecord = async () => {
    if (!itemId) return;
    setSavingVal(true);
    try {
      const res = await fetch("/api/validation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          request_id: itemId,
          status: valStatus,
          customer_tried: valTried,
          satisfied: valSatisfied,
          feedback_text: valFeedback,
        }),
      });
      if (!res.ok) throw new Error("Validation update failed");
      success("Validation Record Saved", "Customer trial status updated");
      await loadData(itemId);
      if (onItemUpdated) onItemUpdated();
    } catch (e: any) {
      error("Failed to save validation", e.message);
    } finally {
      setSavingVal(false);
    }
  };

  if (!itemId) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-[#051F20]/50 backdrop-blur-xs"
      />

      {/* Slide-over Drawer (Full width on mobile, max-w-2xl on desktop) */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 280 }}
        className="relative w-full max-w-full sm:max-w-xl md:max-w-2xl bg-white h-full shadow-2xl border-l border-[#CBD8CE] flex flex-col z-10 overflow-hidden"
      >
        {/* Top Sticky Header */}
        <div className="p-3.5 sm:p-4 px-4 sm:px-6 border-b border-[#E2E8E4] flex items-center justify-between bg-[#F8FAF9] flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-[#235347] bg-[#DAF1DE] px-2.5 py-1 rounded-full border border-[#C4E5CA]">
              Quick Inspector
            </span>
            {allItemIds.length > 0 && (
              <span className="text-[11px] sm:text-xs font-semibold text-[#536E67]">
                {currentIndex + 1} of {allItemIds.length}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Prev/Next buttons */}
            {allItemIds.length > 1 && (
              <div className="flex items-center gap-0.5 sm:gap-1 bg-white border border-[#E2E8E4] rounded-full p-0.5">
                <button
                  disabled={!hasPrev}
                  onClick={() => onNavigateItem && onNavigateItem(allItemIds[currentIndex - 1])}
                  className="p-1 sm:p-1.5 rounded-full hover:bg-[#F5F8F6] disabled:opacity-30 disabled:cursor-not-allowed text-[#051F20]"
                  title="Previous item"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  disabled={!hasNext}
                  onClick={() => onNavigateItem && onNavigateItem(allItemIds[currentIndex + 1])}
                  className="p-1 sm:p-1.5 rounded-full hover:bg-[#F5F8F6] disabled:opacity-30 disabled:cursor-not-allowed text-[#051F20]"
                  title="Next item"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Deep link */}
            <Link
              href={`/feedback/${itemId}`}
              className="p-1.5 rounded-full text-[#536E67] hover:text-[#051F20] hover:bg-white border border-transparent hover:border-[#CBD8CE] transition-all"
              title="Open full page"
            >
              <ExternalLink className="w-4 h-4" />
            </Link>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-white border border-transparent hover:border-[#CBD8CE] transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body with Mobile Safe Bottom Padding */}
        {loading || !data ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 sm:p-12 text-[#536E67]">
            <Loader2 className="w-8 h-8 animate-spin text-[#235347] mb-3" />
            <span className="text-sm font-medium">Loading feedback signal...</span>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-28 md:pb-8 space-y-5 sm:space-y-6">
            {/* Title & Stats Card */}
            <div className="glass-card p-4 sm:p-6 bg-gradient-to-br from-white to-[#F8FAF9] border border-[#E2E8E4]">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-2 flex-wrap">
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#163832] bg-[#E8F2EA] px-2.5 py-0.5 rounded-full capitalize">
                  {data.product_area}
                </span>
                <span
                  className={`text-[11px] sm:text-xs font-bold uppercase px-2.5 py-0.5 rounded-full ${
                    data.priority === "high"
                      ? "bg-rose-100 text-rose-800"
                      : data.priority === "medium"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {data.priority} Priority
                </span>
                <span className="text-[11px] sm:text-xs font-bold text-[#235347] bg-[#DAF1DE] px-2.5 py-0.5 rounded-full font-mono">
                  {data.revenue_impact} ARR
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-extrabold text-[#051F20] leading-snug">
                {data.title}
              </h2>

              <p className="text-xs text-[#536E67] font-medium mt-2 leading-relaxed">
                {data.summary}
              </p>

              <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-4 pt-4 border-t border-[#E2E8E4]/80">
                <div className="text-center bg-white p-2 sm:p-2.5 rounded-xl border border-[#E2E8E4]">
                  <div className="text-[9px] sm:text-[10px] uppercase font-bold text-[#84A39B]">Accounts</div>
                  <div className="text-sm sm:text-base font-extrabold text-[#051F20]">{data.accounts_count}</div>
                </div>
                <div className="text-center bg-white p-2 sm:p-2.5 rounded-xl border border-[#E2E8E4]">
                  <div className="text-[9px] sm:text-[10px] uppercase font-bold text-[#84A39B]">Mentions</div>
                  <div className="text-sm sm:text-base font-extrabold text-[#051F20]">{data.mentions}</div>
                </div>
                <div className="text-center bg-white p-2 sm:p-2.5 rounded-xl border border-[#E2E8E4]">
                  <div className="text-[9px] sm:text-[10px] uppercase font-bold text-[#84A39B]">Squad Owner</div>
                  <div className="text-sm sm:text-base font-extrabold text-[#235347] capitalize truncate">{data.owner}</div>
                </div>
              </div>
            </div>

            {/* 1-Click Interactive Lifecycle Progression Stepper (Responsive Grid) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-extrabold uppercase tracking-wider text-[#051F20]">
                  Traceable Lifecycle Stage
                </label>
                {stageUpdating && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#235347]" />}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5 bg-[#F5F8F6] p-1.5 rounded-2xl border border-[#E2E8E4]">
                {STAGES.map((s) => {
                  const isCurrent = data.stage === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => handleStageChange(s.id)}
                      className={`px-2 py-2.5 rounded-xl text-[11px] font-bold text-center transition-all cursor-pointer ${
                        isCurrent
                          ? "bg-[#051F20] text-[#DAF1DE] shadow-sm scale-102"
                          : "text-[#536E67] hover:bg-white hover:text-[#051F20]"
                      }`}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Customer Verbatim Quote Card */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900 mb-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
                Raw Customer Verbatim Voice
              </div>
              <p className="text-xs text-amber-950/90 italic leading-relaxed">
                "{data.raw_feedback || "No verbatim transcript logged."}"
              </p>
              {data.accounts && data.accounts.length > 0 && (
                <div className="mt-3 pt-2 border-t border-amber-200/60 flex flex-wrap gap-1.5">
                  <span className="text-[10px] font-bold text-amber-800 self-center mr-1">
                    Requesting Accounts:
                  </span>
                  {data.accounts.map((a) => (
                    <span
                      key={a.account_name}
                      className="text-[10px] font-semibold bg-white/90 text-amber-900 px-2 py-0.5 rounded-md border border-amber-200 shadow-2xs"
                    >
                      {a.account_name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Sub-2-Second Gemini AI Triage Terminal */}
            <div className="glass-card p-4 sm:p-5 bg-gradient-to-br from-[#051F20] to-[#0B2B26] text-white border border-[#235347]/50 rounded-2xl shadow-lg">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#8EB69B]" />
                  <span className="text-xs font-bold tracking-tight text-[#DAF1DE]">
                    Gemini 3.7 Flash AI Triage Copilot
                  </span>
                </div>
                <button
                  onClick={runAiTriage}
                  disabled={triageLoading}
                  className="px-3.5 py-1.5 rounded-full bg-[#235347] hover:bg-[#2e6d5e] text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {triageLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-[#DAF1DE]" />
                      Run AI Triage
                    </>
                  )}
                </button>
              </div>

              {data.triage ? (
                <div className="space-y-3 mt-3 pt-3 border-t border-[#163832]">
                  <p className="text-xs text-[#DAF1DE]/90 leading-relaxed">
                    {data.triage.suggested_summary}
                  </p>

                  <div className="flex flex-wrap gap-2 text-[11px]">
                    <span className="bg-[#163832] px-2.5 py-1 rounded-lg border border-[#235347] text-[#8EB69B]">
                      Category: <b className="text-white capitalize">{data.triage.suggested_category}</b>
                    </span>
                    <span className="bg-[#163832] px-2.5 py-1 rounded-lg border border-[#235347] text-[#8EB69B]">
                      Squad: <b className="text-white capitalize">{data.triage.suggested_owner}</b>
                    </span>
                    <span className="bg-[#163832] px-2.5 py-1 rounded-lg border border-[#235347] text-[#8EB69B]">
                      Priority: <b className="text-white uppercase">{data.triage.suggested_priority}</b>
                    </span>
                  </div>

                  <button
                    onClick={acceptAiTriage}
                    className="w-full mt-2 py-2.5 rounded-xl bg-[#DAF1DE] hover:bg-white text-[#051F20] text-xs font-extrabold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {appliedSuccess ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        Recommendations Applied!
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 text-[#235347]" />
                        1-Click Apply AI Recommendations
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <p className="text-xs text-[#8EB69B] mt-1">
                  Click 'Run AI Triage' to evaluate quotes, auto-classify squad ownership, and estimate priority.
                </p>
              )}
            </div>

            {/* Quick Metadata Inline Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#536E67] block mb-1">
                  Priority
                </label>
                <select
                  value={editPriority}
                  onChange={(e) => {
                    setEditPriority(e.target.value);
                    handleMetaSave("priority", e.target.value);
                  }}
                  className="w-full px-3 py-2 bg-white border border-[#CBD8CE] rounded-xl text-xs font-bold text-[#051F20] focus:outline-none focus:border-[#235347]"
                >
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#536E67] block mb-1">
                  Assigned Squad
                </label>
                <select
                  value={editOwner}
                  onChange={(e) => {
                    setEditOwner(e.target.value);
                    handleMetaSave("owner", e.target.value);
                  }}
                  className="w-full px-3 py-2 bg-white border border-[#CBD8CE] rounded-xl text-xs font-bold text-[#051F20] focus:outline-none focus:border-[#235347]"
                >
                  <option value="product">Product Team</option>
                  <option value="engineering">Engineering Squad</option>
                  <option value="support">Customer Support</option>
                </select>
              </div>
            </div>

            {/* Closed-Loop Customer Validation */}
            <div className="p-4 rounded-2xl bg-white border border-[#CBD8CE]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                  <span className="text-xs font-bold text-[#051F20]">
                    Closed-Loop Customer Validation
                  </span>
                </div>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    valStatus === "verified"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {valStatus}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
                  <label className="flex items-center gap-2 text-xs font-semibold text-[#1E332E] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={valTried}
                      onChange={(e) => setValTried(e.target.checked)}
                      className="rounded text-[#235347] focus:ring-[#235347]"
                    />
                    Customer Tested Feature
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-[#1E332E] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={valSatisfied}
                      onChange={(e) => setValSatisfied(e.target.checked)}
                      className="rounded text-[#235347] focus:ring-[#235347]"
                    />
                    Customer Satisfied
                  </label>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#536E67] block mb-1">
                    Post-Delivery Customer Feedback Notes
                  </label>
                  <textarea
                    rows={2}
                    value={valFeedback}
                    onChange={(e) => setValFeedback(e.target.value)}
                    placeholder="Enter customer verification quote, adoption notes..."
                    className="w-full p-2.5 bg-[#F8FAF9] border border-[#CBD8CE] rounded-xl text-xs text-[#051F20] focus:outline-none focus:border-[#235347]"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={saveValidationRecord}
                    disabled={savingVal}
                    className="px-4 py-1.5 rounded-full bg-[#051F20] hover:bg-[#0B2B26] text-[#DAF1DE] text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    {savingVal ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    Save Validation
                  </button>
                </div>
              </div>
            </div>

            {/* Stage Audit Trail Events */}
            {data.events && data.events.length > 0 && (
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#536E67] mb-2 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Immutable Audit Trail
                </h4>
                <div className="space-y-2 bg-[#F8FAF9] p-3 rounded-2xl border border-[#E2E8E4]">
                  {data.events.map((ev, i) => (
                    <div key={ev.id || i} className="flex items-start gap-2.5 text-xs">
                      <div className="w-2 h-2 rounded-full bg-[#235347] mt-1.5 flex-shrink-0" />
                      <div className="flex-1">
                        <span className="font-bold text-[#051F20] capitalize">{ev.stage}</span>:{" "}
                        <span className="text-[#536E67]">{ev.note}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
