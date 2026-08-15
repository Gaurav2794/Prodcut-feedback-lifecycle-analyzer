import { NextResponse } from "next/server";
import db from "@/lib/db";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const { request_id, new_stage } = await request.json();
    if (!request_id || !new_stage) return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    db.prepare("UPDATE feature_requests SET stage = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(new_stage, request_id);
    db.prepare("INSERT INTO stage_events (id, request_id, stage, note) VALUES (?, ?, ?, ?)").run(
      crypto.randomUUID(), request_id, new_stage, `Manually moved to ${new_stage}`
    );
    if (new_stage === "shipped") {
      db.prepare("INSERT OR IGNORE INTO customer_validations (id, request_id, status) VALUES (?, ?, 'pending')").run(
        crypto.randomUUID(), request_id
      );
    }
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}