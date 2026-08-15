"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Sparkles,
  Plus,
  Building2,
  DollarSign,
  Layers,
  MessageSquare,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { useToast } from "./Toast";

interface NewFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function NewFeedbackModal({
  isOpen,
  onClose,
  onSuccess,
}: NewFeedbackModalProps) {
  const { success, error } = useToast();

  const [title, setTitle] = useState("");
  const [productArea, setProductArea] = useState("missions");
  const [category, setCategory] = useState("feature_request");
  const [priority, setPriority] = useState("medium");
  const [owner, setOwner] = useState("product");
  const [rawFeedback, setRawFeedback] = useState("");
  const [summary, setSummary] = useState("");
  const [revenueImpactNum, setRevenueImpactNum] = useState<number>(50000);
  const [accountsInput, setAccountsInput] = useState("");

  const [aiLoading, setAiLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleAiAutoFill = async () => {
    if (!rawFeedback && !title) {
      error("Missing Input", "Please enter some customer feedback notes or a title first.");
      return;
    }
    setAiLoading(true);
    try {
      // Use fallback heuristics or call backend
      const qLower = (rawFeedback + " " + title).toLowerCase();
      let detectedArea = "missions";
      if (qLower.includes("fleet") || qLower.includes("device") || qLower.includes("battery")) detectedArea = "fleet";
      else if (qLower.includes("stream") || qLower.includes("video") || qLower.includes("camera") || qLower.includes("latency")) detectedArea = "streaming";
      else if (qLower.includes("report") || qLower.includes("export") || qLower.includes("csv") || qLower.includes("pdf")) detectedArea = "reports";
      else if (qLower.includes("integration") || qLower.includes("api") || qLower.includes("webhook")) detectedArea = "integrations";
      else if (qLower.includes("dashboard") || qLower.includes("widget") || qLower.includes("alert")) detectedArea = "dashboard";

      let detectedCategory = "feature_request";
      if (qLower.includes("bug") || qLower.includes("fail") || qLower.includes("error") || qLower.includes("crash")) detectedCategory = "bug";

      let suggestedTitle = title;
      if (!suggestedTitle && rawFeedback) {
        suggestedTitle = rawFeedback.slice(0, 60).replace(/["\n\r]/g, "") + "...";
      }

      setProductArea(detectedArea);
      setCategory(detectedCategory);
      if (!title) setTitle(suggestedTitle);
      if (!summary) setSummary(`Customer requested: ${suggestedTitle} for ${detectedArea}.`);
      success("AI Auto-Complete Applied", "Categorized and generated summary.");
    } catch (e: any) {
      error("Auto-complete failed", e.message);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      error("Title Required", "Please specify a feedback title.");
      return;
    }

    setSubmitting(true);
    try {
      const accountsList = accountsInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        title: title.trim(),
        product_area: productArea,
        category,
        priority,
        owner,
        raw_feedback: rawFeedback,
        summary: summary || title,
        revenue_impact_num: Number(revenueImpactNum) || 0,
        revenue_impact: `$${(Number(revenueImpactNum) || 0).toLocaleString()}`,
        accounts: accountsList.length > 0 ? accountsList : ["Direct Customer Ingest"],
      };

      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to create feedback signal");
      }

      success("Feedback Ingested", `"${title}" has entered Stage 1: New Intake.`);
      onSuccess();
      onClose();

      // Reset
      setTitle("");
      setRawFeedback("");
      setSummary("");
      setAccountsInput("");
      setRevenueImpactNum(50000);
    } catch (err: any) {
      error("Submission Error", err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#051F20]/50 backdrop-blur-xs"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-[#CBD8CE] overflow-hidden z-10"
          >
            {/* Header */}
            <div className="p-5 px-6 border-b border-[#E2E8E4] flex items-center justify-between bg-[#F8FAF9]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#051F20] text-[#DAF1DE] flex items-center justify-center font-bold">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#051F20]">
                    Ingest Customer Feedback Signal
                  </h3>
                  <p className="text-xs text-[#536E67]">
                    Add verbatim quotes, account requests, and ARR into the lifecycle pipeline.
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Verbatim Customer Quote */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-[#051F20] flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-[#235347]" />
                    Raw Customer Voice / Meeting Notes
                  </label>
                  <button
                    type="button"
                    onClick={handleAiAutoFill}
                    disabled={aiLoading}
                    className="text-[11px] font-bold text-[#235347] bg-[#DAF1DE] hover:bg-[#cbf0d1] px-2.5 py-0.5 rounded-full border border-[#C4E5CA] flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {aiLoading ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Sparkles className="w-3 h-3" />
                    )}
                    AI Auto-Fill
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={rawFeedback}
                  onChange={(e) => setRawFeedback(e.target.value)}
                  placeholder="Paste customer transcript, CRM note, or verbatim quote e.g., 'We need bulk export of flight logs to SIEM for compliance audit...'"
                  className="w-full p-3 bg-[#F8FAF9] border border-[#CBD8CE] rounded-2xl text-xs text-[#051F20] placeholder-[#84A39B] focus:outline-none focus:border-[#235347] focus:ring-2 focus:ring-[#235347]/10"
                />
              </div>

              {/* Title */}
              <div>
                <label className="text-xs font-bold text-[#051F20] block mb-1">
                  Feature / Feedback Title *
                </label>
                <input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Automated firmware rollback on connection failure"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#CBD8CE] rounded-xl text-xs font-semibold text-[#051F20] focus:outline-none focus:border-[#235347] focus:ring-2 focus:ring-[#235347]/10"
                />
              </div>

              {/* Grid 2 Columns: Product Area & Category */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#536E67] block mb-1">
                    Product Area
                  </label>
                  <select
                    value={productArea}
                    onChange={(e) => setProductArea(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#CBD8CE] rounded-xl text-xs font-semibold text-[#051F20] focus:outline-none focus:border-[#235347]"
                  >
                    <option value="missions">Missions</option>
                    <option value="fleet">Fleet Management</option>
                    <option value="streaming">Live Streaming</option>
                    <option value="reports">Reports & Analytics</option>
                    <option value="dashboard">Dashboard</option>
                    <option value="integrations">Integrations & API</option>
                    <option value="other">Other / Platform</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#536E67] block mb-1">
                    Priority Level
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#CBD8CE] rounded-xl text-xs font-semibold text-[#051F20] focus:outline-none focus:border-[#235347]"
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>
              </div>

              {/* Grid 2 Columns: Accounts & ARR */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#536E67] block mb-1">
                    Enterprise Accounts (comma-separated)
                  </label>
                  <input
                    value={accountsInput}
                    onChange={(e) => setAccountsInput(e.target.value)}
                    placeholder="e.g. Meridian AgriTech, Palisade Telecom"
                    className="w-full px-3 py-2 bg-white border border-[#CBD8CE] rounded-xl text-xs text-[#051F20] focus:outline-none focus:border-[#235347]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#536E67] block mb-1">
                    Estimated ARR ($ USD)
                  </label>
                  <input
                    type="number"
                    step="5000"
                    value={revenueImpactNum}
                    onChange={(e) => setRevenueImpactNum(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-[#CBD8CE] rounded-xl text-xs font-mono font-bold text-[#235347] focus:outline-none focus:border-[#235347]"
                  />
                </div>
              </div>

              {/* Executive Summary */}
              <div>
                <label className="text-xs font-bold text-[#536E67] block mb-1">
                  Executive / Technical Summary
                </label>
                <textarea
                  rows={2}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Concise 1-2 sentence specification of the customer requirement..."
                  className="w-full p-2.5 bg-[#F8FAF9] border border-[#CBD8CE] rounded-xl text-xs text-[#051F20] focus:outline-none focus:border-[#235347]"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-[#E2E8E4] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-full border border-[#CBD8CE] text-xs font-bold text-[#536E67] hover:bg-[#F5F8F6] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-full bg-[#051F20] hover:bg-[#0B2B26] text-[#DAF1DE] text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Ingesting...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Ingest to Pipeline
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
