import { NextResponse } from "next/server";
import db from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = db.prepare("SELECT * FROM feature_requests ORDER BY revenue_impact_num DESC LIMIT 20").all();
  return NextResponse.json(rows);
}