import { NextResponse } from "next/server";
import db from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const total = (db.prepare("SELECT COUNT(*) as c FROM feature_requests").get() as { c: number }).c;
  const features = (db.prepare("SELECT COUNT(*) as c FROM feature_requests WHERE category = 'feature_request'").get() as { c: number }).c;
  const bugs = (db.prepare("SELECT COUNT(*) as c FROM feature_requests WHERE category = 'bug'").get() as { c: number }).c;
  const support = (db.prepare("SELECT COUNT(*) as c FROM feature_requests WHERE category = 'support'").get() as { c: number }).c;
  const open = (db.prepare("SELECT COUNT(*) as c FROM feature_requests WHERE stage NOT IN ('shipped','declined')").get() as { c: number }).c;
  const shipped = (db.prepare("SELECT COUNT(*) as c FROM feature_requests WHERE stage = 'shipped'").get() as { c: number }).c;

  const topByMentions = db.prepare(`
    SELECT id, title, product_area, mentions, accounts_count, revenue_impact, revenue_impact_num, stage, priority
    FROM feature_requests ORDER BY mentions DESC, accounts_count DESC LIMIT 10
  `).all();

  const topByRevenue = db.prepare(`
    SELECT id, title, product_area, mentions, accounts_count, revenue_impact, revenue_impact_num, stage, priority
    FROM feature_requests ORDER BY revenue_impact_num DESC LIMIT 10
  `).all();

  const byStage = db.prepare(`
    SELECT stage, COUNT(*) as count FROM feature_requests GROUP BY stage
  `).all();

  const byArea = db.prepare(`
    SELECT product_area, COUNT(*) as count FROM feature_requests GROUP BY product_area ORDER BY count DESC
  `).all();

  return NextResponse.json({ total, features, bugs, support, open, shipped, topByMentions, topByRevenue, byStage, byArea });
}