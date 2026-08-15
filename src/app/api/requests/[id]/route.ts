import { NextResponse } from "next/server";
import db from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const req = db.prepare("SELECT * FROM feature_requests WHERE id = ?").get(id) as Record<string,unknown> | undefined;
  if (!req) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const accounts = db.prepare("SELECT account_name FROM request_accounts WHERE request_id = ?").all(id) as { account_name: string }[];
  const events = db.prepare("SELECT * FROM stage_events WHERE request_id = ? ORDER BY entered_at ASC").all(id);
  const related = db.prepare(`
    SELECT fr.id, fr.title, fr.stage, fr.product_area, fr.accounts_count, fr.mentions, fr.priority
    FROM related_feedback rf
    JOIN feature_requests fr ON fr.id = rf.related_request_id
    WHERE rf.request_id = ? LIMIT 5
  `).all(id);
  const validation = db.prepare("SELECT * FROM customer_validations WHERE request_id = ?").get(id);
  const triage = db.prepare("SELECT * FROM triage_suggestions WHERE request_id = ?").get(id);

  return NextResponse.json({ ...req, accounts, events, related, validation, triage });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const allowed = ["stage", "priority", "owner", "category", "product_area", "title", "summary"];
  const updates = Object.keys(body).filter(k => allowed.includes(k));
  if (!updates.length) return NextResponse.json({ error: "No valid fields" }, { status: 400 });

  const set = updates.map(k => `${k} = ?`).join(", ");
  const vals = updates.map(k => body[k]);
  db.prepare(`UPDATE feature_requests SET ${set}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(...vals, id);

  if (body.stage) {
    const crypto = await import("crypto");
    db.prepare("INSERT INTO stage_events (id, request_id, stage, note) VALUES (?, ?, ?, ?)").run(
      crypto.randomUUID(), id, body.stage, body.note || `Moved to ${body.stage}`
    );
    if (body.stage === "shipped") {
      db.prepare("INSERT OR IGNORE INTO customer_validations (id, request_id, status) VALUES (?, ?, 'pending')").run(
        crypto.randomUUID(), id
      );
    }
  }

  return NextResponse.json({ success: true });
}