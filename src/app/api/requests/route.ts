import { NextResponse } from "next/server";
import db from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const stage = searchParams.get("stage") || "";
  const priority = searchParams.get("priority") || "";
  const area = searchParams.get("area") || "";

  let query = `
    SELECT fr.*, 
      GROUP_CONCAT(ra.account_name, ', ') as account_names
    FROM feature_requests fr
    LEFT JOIN request_accounts ra ON ra.request_id = fr.id
    WHERE 1=1
  `;
  const params: (string | number)[] = [];

  if (search) {
    query += ` AND (fr.title LIKE ? OR fr.summary LIKE ? OR fr.product_area LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  if (stage) { query += ` AND fr.stage = ?`; params.push(stage); }
  if (priority) { query += ` AND fr.priority = ?`; params.push(priority); }
  if (area) { query += ` AND fr.product_area = ?`; params.push(area); }

  query += ` GROUP BY fr.id ORDER BY fr.revenue_impact_num DESC, fr.mentions DESC`;

  const rows = db.prepare(query).all(...params);
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  try {
    const crypto = await import("crypto");
    const body = await req.json();
    const {
      title,
      product_area = "missions",
      category = "feature_request",
      priority = "medium",
      owner = "product",
      raw_feedback = "",
      summary = "",
      revenue_impact = "$0",
      revenue_impact_num = 0,
      accounts = [],
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const id = crypto.randomUUID();
    const mentions = Math.max(1, accounts.length || 1);
    const accounts_count = accounts.length || 1;

    const formattedRevenue = typeof revenue_impact_num === "number" && revenue_impact_num > 0
      ? `$${revenue_impact_num.toLocaleString()}`
      : revenue_impact || "$0";
    const revNum = typeof revenue_impact_num === "number" ? revenue_impact_num : parseInt(String(revenue_impact).replace(/[$,]/g, ""), 10) || 0;

    const insertReq = db.prepare(`
      INSERT INTO feature_requests (
        id, title, product_area, stage, mentions, accounts_count,
        revenue_impact, revenue_impact_num, category, priority, owner,
        raw_feedback, summary, created_at, updated_at
      ) VALUES (?, ?, ?, 'new', ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);

    insertReq.run(
      id,
      title.trim(),
      product_area,
      mentions,
      accounts_count,
      formattedRevenue,
      revNum,
      category,
      priority,
      owner,
      raw_feedback,
      summary || title
    );

    // Insert accounts
    if (accounts.length > 0) {
      const insertRA = db.prepare("INSERT INTO request_accounts (id, request_id, account_name) VALUES (?, ?, ?)");
      for (const acct of accounts) {
        if (acct && acct.trim()) {
          insertRA.run(crypto.randomUUID(), id, acct.trim());
        }
      }
    }

    // Insert stage event for Intake
    const insertSE = db.prepare("INSERT INTO stage_events (id, request_id, stage, note) VALUES (?, ?, ?, ?)");
    insertSE.run(crypto.randomUUID(), id, "new", "Ingested from feedback terminal.");

    return NextResponse.json({ success: true, id, message: "Feedback signal successfully created" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create feedback request" }, { status: 500 });
  }
}
