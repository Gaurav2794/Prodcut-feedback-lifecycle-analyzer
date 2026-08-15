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
