"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Sparkles, Check, Users, MessageSquare, TrendingUp,
  ChevronRight, CheckCircle2, Clock, ExternalLink, RotateCcw, 
  Loader2, ArrowRight, Info, Layers, Kanban, BarChart3
} from "lucide-react";

interface StageEvent { id: string; stage: string; note: string; entered_at: string; }
interface RelatedItem { id: string; title: string; stage: string; product_area: string; accounts_count: number; mentions: number; priority: string; }
interface AccountItem { account_name: string; }
interface Validation { status: string; customer_tried: number; satisfied: number; feedback_text: string; follow_up_needed: number; }
interface Triage { suggested_category: string; suggested_product_area: string; suggested_summary: string; suggested_priority: string; suggested_owner: string; confidence: string; accepted: number; }

interface Detail {
  id: string; title: string; product_area: string; stage: string; priority: string;
  category: string; owner: string; mentions: number; accounts_count: number;
  revenue_impact: string; revenue_impact_num: number; summary: string; raw_feedback: string;
  needs_review: number; created_at: string;
  accounts: AccountItem[]; events: StageEvent[]; related: RelatedItem[];
  validation: Validation | null; triage: Triage | null;
}

const LIFECYCLE = ["new","triaged","planned","in_development","testing","shipped"];
const LIFECYCLE_LABELS: Record<string,string> = { 
  new:"1. New Intake", 
  triaged:"2. Triaged", 
  planned:"3. Planned", 
  in_development:"4. In Dev", 
  testing:"5. Testing / QA", 
  shipped:"6. Shipped & Validated" 
};

export default function FeedbackDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(true);
  const [triageLoading, setTriageLoading] = useState(false);
  const [stageSaving, setStageSaving] = useState(false);
  const [valSaving, setValSaving] = useState(false);
  const [appliedSuccess, setAppliedSuccess] = useState(false);
  
  const [editStage, setEditStage] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editPriority, setEditPriority] = useState("");
  const [editOwner, setEditOwner] = useState("");

  const [valStatus, setValStatus] = useState("pending");
  const [valTried, setValTried] = useState(false);
  const [valSatisfied, setValSatisfied] = useState(false);
  const [valFeedback, setValFeedback] = useState("");
  const [valFollowUp, setValFollowUp] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/requests/${id}`);
    if (!res.ok) { router.push("/"); return; }
    const d: Detail = await res.json();
    setData(d);
    setEditStage(d.stage);
    setEditCategory(d.category);
    setEditPriority(d.priority);
    setEditOwner(d.owner);
    if (d.validation) {
      setValStatus(d.validation.status);
      setValTried(d.validation.customer_tried === 1);
      setValSatisfied(d.validation.satisfied === 1);
      setValFeedback(d.validation.feedback_text || "");
      setValFollowUp(d.validation.follow_up_needed === 1);
    }
    setLoading(false);
  }, [id, router]);

  useEffect(() => { load(); }, [load]);

  const runTriage = async () => {
    setTriageLoading(true);
    setAppliedSuccess(false);
    await fetch("/api/triage", { 
      method: "POST", 
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify({ request_id: id }) 
    });
    await load();
    setTriageLoading(false);
  };

  const acceptTriage = async () => {
    if (!data?.triage) return;
    const t = data.triage;
    await fetch(`/api/requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        category: t.suggested_category, 
        product_area: t.suggested_product_area, 
        priority: t.suggested_priority, 
        owner: t.suggested_owner, 
        summary: t.suggested_summary 
      })
    });
    setAppliedSuccess(true);
    setTimeout(() => setAppliedSuccess(false), 3000);
    await load();
  };

  const saveChanges = async () => {
    setStageSaving(true);
    await fetch(`/api/requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage: editStage, category: editCategory, priority: editPriority, owner: editOwner })
    });
    await load();
    setStageSaving(false);
  };

  const saveValidation = async () => {
    setValSaving(true);
    await fetch("/api/validation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        request_id: id, 
        status: valStatus, 
        customer_tried: valTried, 
        satisfied: valSatisfied, 
        feedback_text: valFeedback, 
        follow_up_needed: valFollowUp 
      })
    });
    await load();
    setValSaving(false);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-full text-[#536E67]">
      <div className="w-8 h-8 border-3 border-[#235347] border-t-transparent rounded-full animate-spin mb-3" />
      <span className="text-sm font-medium">Loading feedback details...</span>
    </div>
  );
  if (!data) return null;

  const impactScore = Math.min(100, Math.round((data.revenue_impact_num / 300000) * 50 + (data.mentions / 12) * 25 + (data.accounts_count / 11) * 25));
  const hasChanges = editStage !== data.stage || editCategory !== data.category || editPriority !== data.priority || editOwner !== data.owner;

  return (
    <div className="min-h-screen pb-16">
      {/* Top Glass Header */}
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
              Lifecycle Inspector
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
            className="px-4 py-1.5 rounded-full text-xs font-semibold text-[#536E67] hover:text-[#051F20] hover:bg-white/80 transition-all flex items-center gap-1.5"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Telemetry &amp; Analytics
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-xs font-bold text-[#051F20] bg-white/80 hover:bg-white px-4 py-2 rounded-full border border-[#E2E8E4] shadow-xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <div className="px-8 max-w-[1500px] mx-auto space-y-6">
        
        {/* Main Hero Card */}
        <div className="glass-card p-8">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div className="flex-1 min-w-[300px]">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-[#E8F2EA] text-[#163832] border border-[#CBD8CE] capitalize">
                  Area: {data.product_area}
                </span>
                <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-[#DAF1DE] text-[#051F20] border border-[#C4E5CA] capitalize">
                  Type: {data.category.replace(/_/g, " ")}
                </span>
                <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-white text-[#051F20] border border-[#E2E8E4] uppercase">
                  Priority: {data.priority}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#051F20] tracking-tight leading-snug mb-5">
                {data.title}
              </h1>

              {/* Stepper */}
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#84A39B] mb-2">
                  Lifecycle Progression Flow
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {LIFECYCLE.map((s, idx) => {
                    const currentIdx = LIFECYCLE.indexOf(data.stage);
                    const isCurrent = s === data.stage;
                    const isPast = idx < currentIdx;

                    return (
                      <div key={s} className="flex items-center gap-2">
                        <span className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
                          isCurrent
                            ? "bg-[#051F20] text-[#DAF1DE] shadow-xs"
                            : isPast
                            ? "bg-[#DAF1DE] text-[#051F20] border border-[#C4E5CA]"
                            : "bg-white/80 text-slate-400 border border-[#E2E8E4]"
                        }`}>
                          {isPast && <Check className="w-3.5 h-3.5" />}
                          {LIFECYCLE_LABELS[s]}
                        </span>
                        {idx < LIFECYCLE.length - 1 && <ChevronRight className="w-3.5 h-3.5 text-slate-300" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Impact Box */}
            <div className="bg-white/80 border border-[#E2E8E4] p-6 rounded-2xl min-w-[260px] flex flex-col justify-between shadow-xs">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#536E67] mb-3">
                <span>Business Impact</span>
                <span className="text-[10px] text-[#235347] font-semibold bg-[#DAF1DE] px-2 py-0.5 rounded-full">
                  Real Dataset
                </span>
              </div>

              <div className="space-y-2.5 text-xs font-semibold">
                <div className="flex justify-between items-center">
                  <span className="text-[#536E67] flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-[#235347]" /> Requesting Accounts:
                  </span>
                  <span className="text-sm font-bold text-[#051F20]">{data.accounts_count}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#536E67] flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-blue-600" /> Total Mentions:
                  </span>
                  <span className="text-sm font-bold text-[#051F20]">{data.mentions}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#536E67] flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-amber-600" /> Revenue at Stake:
                  </span>
                  <span className="text-sm font-bold text-[#235347] font-mono">{data.revenue_impact}</span>
                </div>

                <div className="pt-2 border-t border-[#E2E8E4] flex justify-between items-center">
                  <span className="text-xs font-bold text-[#051F20]">Impact Score</span>
                  <span className="text-xl font-extrabold text-[#235347]">
                    {impactScore} <span className="text-xs text-[#84A39B] font-normal">/ 100</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Customer Voice Verbatim */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#536E67] flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-[#235347]" />
                  Original Customer Voice
                </h2>
                <span className="text-[11px] text-[#84A39B]">Verbatim quotes from meetings &amp; tickets</span>
              </div>
              <div className="p-5 bg-white/90 border-l-4 border-[#235347] rounded-r-2xl text-sm leading-relaxed text-[#1E332E] italic shadow-2xs">
                {data.raw_feedback}
              </div>
            </div>

            {/* AI Triage Card (Gemini 3.7 Flash) */}
            <div className="glass-card-dark p-7">
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-[rgba(142,182,155,0.2)]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-[#051F20] border border-[#235347] flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-[#DAF1DE]" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white flex items-center gap-2">
                      AI Feedback Triage Copilot
                      <span className="text-[10px] font-semibold bg-[#235347] text-[#DAF1DE] px-2 py-0.5 rounded-full">
                        Gemini 3.7 Flash
                      </span>
                    </h2>
                    <p className="text-[11px] text-[#8EB69B] font-medium">
                      Categorizes, routes to squad leads, and drafts technical specifications.
                    </p>
                  </div>
                </div>

                <button
                  onClick={runTriage}
                  disabled={triageLoading}
                  className="px-4 py-2 rounded-full bg-[#DAF1DE] hover:bg-white text-[#051F20] text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all flex-shrink-0 cursor-pointer"
                >
                  {triageLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                  {data.triage ? "Re-evaluate" : "Analyze with AI"}
                </button>
              </div>

              {!data.triage ? (
                <div className="p-6 text-center text-[#8EB69B] text-xs border border-dashed border-[#235347] rounded-2xl bg-[#051F20]/40">
                  Click &quot;Analyze with AI&quot; to have Gemini evaluate the customer voice and generate automated classification and recommendations.
                </div>
              ) : (
                <div className="space-y-4 pt-1">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-[#051F20]/70 rounded-2xl border border-[rgba(142,182,155,0.2)] text-center">
                      <span className="text-[10px] text-[#8EB69B] uppercase block font-bold mb-0.5">Category</span>
                      <span className="text-xs font-bold text-white uppercase">{data.triage.suggested_category.replace(/_/g, " ")}</span>
                    </div>
                    <div className="p-3 bg-[#051F20]/70 rounded-2xl border border-[rgba(142,182,155,0.2)] text-center">
                      <span className="text-[10px] text-[#8EB69B] uppercase block font-bold mb-0.5">Product Area</span>
                      <span className="text-xs font-bold text-white uppercase">{data.triage.suggested_product_area}</span>
                    </div>
                    <div className="p-3 bg-[#051F20]/70 rounded-2xl border border-[rgba(142,182,155,0.2)] text-center">
                      <span className="text-[10px] text-[#8EB69B] uppercase block font-bold mb-0.5">Priority</span>
                      <span className="text-xs font-bold text-white uppercase">{data.triage.suggested_priority}</span>
                    </div>
                    <div className="p-3 bg-[#051F20]/70 rounded-2xl border border-[rgba(142,182,155,0.2)] text-center">
                      <span className="text-[10px] text-[#8EB69B] uppercase block font-bold mb-0.5">Squad Owner</span>
                      <span className="text-xs font-bold text-white uppercase">{data.triage.suggested_owner}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-[#051F20]/70 rounded-2xl border border-[rgba(142,182,155,0.2)]">
                    <span className="text-[10px] text-[#8EB69B] uppercase block font-bold mb-1">
                      AI Technical Summary &amp; Justification
                    </span>
                    <p className="text-xs text-white leading-relaxed font-medium">{data.triage.suggested_summary}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-[#DAF1DE] flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#8EB69B]" />
                      Confidence Level: <strong className="text-white uppercase">{data.triage.confidence}</strong>
                    </span>
                    
                    <div className="flex items-center gap-2">
                      {appliedSuccess && (
                        <span className="text-xs font-bold text-[#DAF1DE] flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Applied!
                        </span>
                      )}
                      <button
                        onClick={acceptTriage}
                        className="px-5 py-2.5 rounded-full bg-[#DAF1DE] hover:bg-white text-[#051F20] font-bold text-xs shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Check className="w-4 h-4" /> Apply AI Recommendations
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Requesting Accounts */}
            <div className="glass-card p-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#536E67] mb-3">
                Requesting Enterprise Accounts ({data.accounts.length})
              </h2>
              <div className="flex flex-wrap gap-2">
                {data.accounts.map(a => (
                  <span
                    key={a.account_name}
                    className="px-3.5 py-1.5 bg-white border border-[#E2E8E4] text-[#051F20] font-semibold text-xs rounded-full hover:border-[#235347] transition-colors shadow-2xs"
                  >
                    {a.account_name}
                  </span>
                ))}
              </div>
            </div>

            {/* Related Feedback */}
            {data.related.length > 0 && (
              <div className="glass-card p-6">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#536E67] mb-3">
                  Related Feature Signals in {data.product_area.toUpperCase()} ({data.related.length})
                </h2>
                <div className="space-y-2.5">
                  {data.related.map(r => (
                    <Link
                      key={r.id}
                      href={`/feedback/${r.id}`}
                      className="flex items-center justify-between p-3.5 bg-white/80 hover:bg-white border border-[#E2E8E4] hover:border-[#235347] rounded-2xl group transition-all shadow-2xs"
                    >
                      <div>
                        <div className="text-xs font-bold text-[#051F20] group-hover:text-[#235347] transition-colors">
                          {r.title}
                        </div>
                        <div className="text-[11px] text-[#536E67] mt-0.5 flex items-center gap-2">
                          <span className="capitalize">{r.stage.replace(/_/g, " ")}</span>
                          <span>â€¢</span>
                          <span>{r.accounts_count} Accounts</span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#84A39B] group-hover:text-[#235347]" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Routing & History */}
          <div className="space-y-6">
            
            {/* Quick Route Card */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#536E67]">
                  Lifecycle Stage Controller
                </h2>
                <span className="text-[10px] text-[#051F20] bg-[#DAF1DE] px-2.5 py-0.5 rounded-full font-bold">
                  Manual Override
                </span>
              </div>
              <p className="text-xs text-[#536E67] mb-4">
                Advance delivery stage, re-assign squad ownership, or update priority level.
              </p>

              <div className="space-y-3.5 text-xs font-semibold">
                <div>
                  <label className="text-[11px] text-[#536E67] block mb-1">Lifecycle Stage</label>
                  <select
                    value={editStage}
                    onChange={e => setEditStage(e.target.value)}
                    className="w-full py-2.5 px-3 bg-white border border-[#E2E8E4] rounded-xl text-[#051F20] focus:outline-none focus:border-[#235347] font-semibold"
                  >
                    {["new","triaged","planned","in_development","testing","shipped","declined"].map(s => (
                      <option key={s} value={s}>{s.replace(/_/g," ").replace(/\b\w/g, c => c.toUpperCase())}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-[#536E67] block mb-1">Category</label>
                  <select
                    value={editCategory}
                    onChange={e => setEditCategory(e.target.value)}
                    className="w-full py-2.5 px-3 bg-white border border-[#E2E8E4] rounded-xl text-[#051F20] focus:outline-none focus:border-[#235347] font-semibold"
                  >
                    <option value="feature_request">Feature Request</option>
                    <option value="bug">Bug</option>
                    <option value="support">Support</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-[#536E67] block mb-1">Priority</label>
                  <select
                    value={editPriority}
                    onChange={e => setEditPriority(e.target.value)}
                    className="w-full py-2.5 px-3 bg-white border border-[#E2E8E4] rounded-xl text-[#051F20] focus:outline-none focus:border-[#235347] font-semibold"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-[#536E67] block mb-1">Owner</label>
                  <select
                    value={editOwner}
                    onChange={e => setEditOwner(e.target.value)}
                    className="w-full py-2.5 px-3 bg-white border border-[#E2E8E4] rounded-xl text-[#051F20] focus:outline-none focus:border-[#235347] font-semibold"
                  >
                    <option value="product">Product</option>
                    <option value="engineering">Engineering</option>
                    <option value="support">Support</option>
                  </select>
                </div>

                {hasChanges && (
                  <button
                    onClick={saveChanges}
                    disabled={stageSaving}
                    className="w-full mt-3 py-3 rounded-full bg-[#051F20] text-[#DAF1DE] font-bold text-xs hover:bg-[#0B2B26] shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    {stageSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    Save Lifecycle Changes
                  </button>
                )}
              </div>
            </div>

            {/* Audit History */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#536E67] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#235347]" />
                  Audit Trail &amp; History
                </h2>
                <span className="text-[11px] text-[#84A39B]">Immutable log</span>
              </div>

              <div className="space-y-4 relative pt-2">
                <div className="absolute left-[7px] top-4 bottom-2 w-0.5 bg-[#E2E8E4]" />
                {data.events.map((ev, i) => (
                  <div key={ev.id} className="flex gap-3 relative">
                    <div className={`w-3.5 h-3.5 rounded-full flex-shrink-0 mt-0.5 z-10 border-2 ${
                      i === data.events.length - 1 ? "bg-[#235347] border-[#DAF1DE] ring-2 ring-[#DAF1DE]" : "bg-white border-slate-300"
                    }`} />
                    <div>
                      <div className="text-xs font-bold text-[#051F20] capitalize">
                        {ev.stage.replace(/_/g, " ")}
                      </div>
                      <div className="text-[11px] text-[#536E67] mt-0.5">{ev.note}</div>
                      <div className="text-[10px] text-[#84A39B] mt-0.5">
                        {new Date(ev.entered_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Validation Loop (Active when Shipped) */}
            {data.stage === "shipped" && (
              <div className="glass-card p-6 bg-[#DAF1DE]/60 border border-[#C4E5CA]">
                <div className="flex items-center gap-2 text-[#051F20] font-bold text-xs mb-2 pb-2 border-b border-[#C4E5CA]">
                  <CheckCircle2 className="w-4 h-4 text-[#235347]" />
                  Closed-Loop Customer Validation
                </div>
                <p className="text-xs text-[#536E67] mb-4">
                  Feature is shipped. Confirm adoption with requesting enterprise accounts.
                </p>

                <div className="space-y-3.5 text-xs font-semibold">
                  <div>
                    <label className="text-[11px] text-[#536E67] block mb-1">Validation Status</label>
                    <select
                      value={valStatus}
                      onChange={e => setValStatus(e.target.value)}
                      className="w-full py-2.5 px-3 bg-white border border-[#C4E5CA] rounded-xl text-[#051F20]"
                    >
                      <option value="pending">Pending Customer Trial</option>
                      <option value="validated">Validated (Customer Satisfied)</option>
                      <option value="not_validated">Not Validated (Needs Follow-up)</option>
                    </select>
                  </div>

                  <label className="flex items-center gap-2.5 cursor-pointer bg-white p-3 border border-[#C4E5CA] rounded-xl">
                    <input
                      type="checkbox"
                      checked={valTried}
                      onChange={e => setValTried(e.target.checked)}
                      className="w-4 h-4 accent-[#235347] rounded"
                    />
                    <span className="text-xs font-medium text-[#051F20]">Customer has tried feature in prod</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer bg-white p-3 border border-[#C4E5CA] rounded-xl">
                    <input
                      type="checkbox"
                      checked={valSatisfied}
                      onChange={e => setValSatisfied(e.target.checked)}
                      className="w-4 h-4 accent-[#235347] rounded"
                    />
                    <span className="text-xs font-medium text-[#051F20]">Customer confirms satisfaction</span>
                  </label>

                  <textarea
                    value={valFeedback}
                    onChange={e => setValFeedback(e.target.value)}
                    placeholder="Verbatim feedback from customer trial..."
                    rows={3}
                    className="w-full bg-white border border-[#C4E5CA] text-[#051F20] p-3 rounded-xl text-xs resize-none focus:outline-none focus:border-[#235347]"
                  />

                  <button
                    onClick={saveValidation}
                    disabled={valSaving}
                    className="w-full py-3 rounded-full bg-[#051F20] text-[#DAF1DE] font-bold text-xs hover:bg-[#0B2B26] shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    {valSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    Save Validation Results
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}