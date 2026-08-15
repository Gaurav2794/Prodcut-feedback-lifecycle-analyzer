"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Layers,
  Kanban,
  BarChart3,
  Search,
  Plus,
  Sparkles,
  LayoutDashboard,
  Menu,
  X,
} from "lucide-react";

interface GlobalHeaderProps {
  onOpenSearch: () => void;
  onOpenNewFeedback: () => void;
  onOpenCopilot: () => void;
  onOpenShortcuts?: () => void;
  onToggleHero?: () => void;
}

export default function GlobalHeader({
  onOpenSearch,
  onOpenNewFeedback,
  onOpenCopilot,
  onOpenShortcuts,
  onToggleHero,
}: GlobalHeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="glass-header px-3.5 sm:px-8 py-3 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-[#051F20] flex items-center justify-center text-white shadow-md shadow-[#051F20]/10 group-hover:scale-105 transition-transform flex-shrink-0">
              <Layers className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#8EB69B]" />
            </div>
            <div>
              <span className="font-extrabold text-sm sm:text-base text-[#051F20] tracking-tight block flex items-center gap-1.5 leading-none">
                FeedbackOS
                <span className="text-[8px] sm:text-[9px] font-bold bg-[#DAF1DE] text-[#051F20] px-1.5 py-0.2 rounded-full border border-[#C4E5CA]">
                  v2.4
                </span>
              </span>
              <span className="text-[9px] sm:text-[10px] text-[#536E67] font-medium block mt-0.5">
                Lifecycle Intelligence
              </span>
            </div>
          </Link>
        </div>

        {/* Center Desktop Navigation Switcher */}
        <nav className="hidden md:flex items-center gap-1 p-1 bg-white/70 backdrop-blur-md rounded-full border border-[#E2E8E4] shadow-xs">
          <Link
            href="/"
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              pathname === "/"
                ? "bg-[#051F20] text-[#DAF1DE] shadow-xs"
                : "text-[#536E67] hover:text-[#051F20] hover:bg-white/80"
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Dashboard
          </Link>
          <Link
            href="/board"
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              pathname === "/board"
                ? "bg-[#051F20] text-[#DAF1DE] shadow-xs"
                : "text-[#536E67] hover:text-[#051F20] hover:bg-white/80"
            }`}
          >
            <Kanban className="w-3.5 h-3.5" />
            Kanban Board
          </Link>
          <Link
            href="/insights"
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              pathname === "/insights"
                ? "bg-[#051F20] text-[#DAF1DE] shadow-xs"
                : "text-[#536E67] hover:text-[#051F20] hover:bg-white/80"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Telemetry &amp; Insights
          </Link>
        </nav>

        {/* Right Action Tools */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quick Search button */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-white/80 hover:bg-white border border-[#CBD8CE] text-xs font-medium text-[#536E67] hover:text-[#051F20] shadow-2xs transition-all cursor-pointer"
            title="Search (⌘K)"
          >
            <Search className="w-3.5 h-3.5 text-[#84A39B]" />
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden lg:inline-block px-1.5 py-0.2 bg-[#F5F8F6] border border-[#CBD8CE] rounded text-[9px] font-mono text-[#536E67]">
              ⌘K
            </kbd>
          </button>

          {/* AI Copilot Trigger */}
          <button
            onClick={onOpenCopilot}
            className="px-2.5 sm:px-3 py-1.5 rounded-full bg-[#DAF1DE] hover:bg-[#cbf0d1] border border-[#C4E5CA] text-xs font-extrabold text-[#051F20] shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
            title="AI Copilot"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#235347]" />
            <span className="hidden sm:inline">AI Copilot</span>
          </button>

          {/* Ingest Signal Modal Trigger */}
          <button
            onClick={onOpenNewFeedback}
            className="px-2.5 sm:px-3.5 py-1.5 rounded-full bg-[#051F20] hover:bg-[#0B2B26] text-[#DAF1DE] text-xs font-bold shadow-sm hover:shadow-md transition-all flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#8EB69B]" />
            <span className="hidden xs:inline sm:inline">+ Ingest</span>
          </button>

          {/* Optional Intro Screen Toggle */}
          {onToggleHero && (
            <button
              onClick={onToggleHero}
              className="text-[11px] sm:text-xs font-bold text-[#051F20] bg-white/80 hover:bg-white px-2.5 sm:px-3 py-1.5 rounded-full border border-[#CBD8CE] transition-all cursor-pointer shadow-2xs flex items-center gap-1 ml-0.5"
              title="Return to Hero Screen"
            >
              <X className="w-3 h-3" /> <span className="hidden sm:inline">Intro</span>
            </button>
          )}
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (Fixed for phones) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-[#E2E8E4] px-4 py-2 flex items-center justify-around shadow-lg">
        <Link
          href="/"
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
            pathname === "/" ? "text-[#235347] font-bold" : "text-[#536E67] font-medium"
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span className="text-[10px]">Dashboard</span>
        </Link>
        <Link
          href="/board"
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
            pathname === "/board" ? "text-[#235347] font-bold" : "text-[#536E67] font-medium"
          }`}
        >
          <Kanban className="w-4 h-4" />
          <span className="text-[10px]">Kanban</span>
        </Link>
        <Link
          href="/insights"
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
            pathname === "/insights" ? "text-[#235347] font-bold" : "text-[#536E67] font-medium"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span className="text-[10px]">Telemetry</span>
        </Link>
        <button
          onClick={onOpenCopilot}
          className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl text-[#051F20] font-medium"
        >
          <Sparkles className="w-4 h-4 text-[#235347]" />
          <span className="text-[10px]">Copilot</span>
        </button>
      </div>
    </>
  );
}
