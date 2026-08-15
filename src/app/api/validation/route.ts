import { NextResponse } from "next/server";
import db from "@/lib/db";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const { request_id, status, customer_tried, satisfied, feedback_text, follow_up_needed } = await request.json();
    if (!request_id) return NextResponse.json({ error: "Missing request_id" }, { status: 400 });

    db.prepare(`
      INSERT INTO customer_validations (id, request_id, status, customer_tried, satisfied, feedback_text, follow_up_needed)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(request_id) DO UPDATE SET
        status=excluded.status,
        customer_tried=excluded.customer_tried,
        satisfied=excluded.satisfied,
        feedback_text=excluded.feedback_text,
        follow_up_needed=excluded.follow_up_needed,
        updated_at=CURRENT_TIMESTAMP
    `).run(crypto.randomUUID(), request_id, status || "pending", customer_tried ? 1 : 0, satisfied ? 1 : 0, feedback_text || "", follow_up_needed ? 1 : 0);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}