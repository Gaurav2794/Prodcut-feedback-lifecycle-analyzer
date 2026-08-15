"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Inbox, 
  Kanban, 
  BarChart3, 
  Sparkles, 
  CheckCircle2,
  Layers,
  ArrowUpRight,
  Command
} from "lucide-react";

const navItems = [
  { href: "/", label: "Feedback Inbox", icon: Inbox, count: 55 },
  { href: "/board", label: "Lifecycle Board", icon: Kanban, count: 34 },
  { href: "/insights", label: "Telemetry & Insights", icon: BarChart3 },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col bg-white border-r border-[#E2E8F0] h-full select-none z-20">
      {/* Brand Header */}
      <div className="p-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-[#064E3B] flex items-center justify-center text-white shadow-md shadow-emerald-900/10 group-hover:scale-105 transition-transform">
            <Layers className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <span className="font-extrabold text-base text-[#0F172A] tracking-tight block flex items-center gap-1.5">
              FeedbackOS
              <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full">
                v2.4
              </span>
            </span>
            <span className="text-[11px] text-[#64748B] font-medium block">
              Lifecycle Intelligence
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Group */}
      <div className="px-4 py-2 flex-1 flex flex-col">
        <div className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] px-3 mb-2">
          Workspaces
        </div>
        <nav className="space-y-1">
          {navItems.map(({ href, label, icon: Icon, count }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center justify-between px-3.5 py-3 rounded-2xl text-[13px] font-semibold transition-all ${
                  active
                    ? "bg-[#064E3B] text-white shadow-sm shadow-emerald-900/20"
                    : "text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${active ? "text-emerald-400" : "text-[#94A3B8]"}`} />
                  <span>{label}</span>
                </div>
                {count !== undefined && (
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    active ? "bg-emerald-800 text-emerald-200" : "bg-[#F1F5F9] text-[#64748B]"
                  }`}>
                    {count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Dataset Status Banner */}
        <div className="mt-auto mb-4 p-4 rounded-2xl bg-gradient-to-br from-[#064E3B] to-[#047857] text-white shadow-md relative overflow-hidden">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold tracking-wide uppercase text-emerald-200">
              SE Ingest Pipeline
            </span>
          </div>
          <div className="text-[13px] font-bold leading-tight mb-1">
            55 Feature Signals
          </div>
          <div className="text-[11px] text-emerald-100 mb-3 font-medium">
            51 Verified Accounts • $6.8M ARR
          </div>
          <div className="w-full bg-emerald-900/60 rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-300 h-full w-[100%]" />
          </div>
        </div>
      </div>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-[#E2E8F0] flex items-center justify-between bg-[#FAFAFA]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center border border-emerald-200">
            SE
          </div>
          <div>
            <div className="text-xs font-bold text-[#0F172A]">Solutions Squad</div>
            <div className="text-[10px] text-[#64748B]">solutions@flytbase.com</div>
          </div>
        </div>
        <div className="w-2 h-2 rounded-full bg-emerald-500" />
      </div>
    </aside>
  );
}