import { NextResponse } from "next/server";
import db from "@/lib/db";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ids, action, value, note } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "No request IDs provided" }, { status: 400 });
    }

    if (!action) {
      return NextResponse.json({ error: "Action is required" }, { status: 400 });
    }

    if (action === "stage") {
      const updateStmt = db.prepare(`UPDATE feature_requests SET stage = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`);
      const eventStmt = db.prepare(`INSERT INTO stage_events (id, request_id, stage, note) VALUES (?, ?, ?, ?)`);
      const validationStmt = db.prepare(`INSERT OR IGNORE INTO customer_validations (id, request_id, status) VALUES (?, ?, 'pending')`);

      const batch = db.transaction((itemIds: string[], newStage: string, customNote?: string) => {
        for (const id of itemIds) {
          updateStmt.run(newStage, id);
          eventStmt.run(crypto.randomUUID(), id, newStage, customNote || `Bulk updated stage to ${newStage}`);
          if (newStage === "shipped") {
            validationStmt.run(crypto.randomUUID(), id);
          }
        }
      });

      batch(ids, value, note);
      return NextResponse.json({ success: true, count: ids.length, message: `Updated ${ids.length} items to ${value}` });
    }

    if (action === "priority") {
      const updateStmt = db.prepare(`UPDATE feature_requests SET priority = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`);
      const batch = db.transaction((itemIds: string[], newPriority: string) => {
        for (const id of itemIds) {
          updateStmt.run(newPriority, id);
        }
      });
      batch(ids, value);
      return NextResponse.json({ success: true, count: ids.length, message: `Updated priority for ${ids.length} items` });
    }

    if (action === "owner") {
      const updateStmt = db.prepare(`UPDATE feature_requests SET owner = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`);
      const batch = db.transaction((itemIds: string[], newOwner: string) => {
        for (const id of itemIds) {
          updateStmt.run(newOwner, id);
        }
      });
      batch(ids, value);
      return NextResponse.json({ success: true, count: ids.length, message: `Assigned ${ids.length} items to ${value}` });
    }

    if (action === "delete") {
      const delReq = db.prepare(`DELETE FROM feature_requests WHERE id = ?`);
      const delRA = db.prepare(`DELETE FROM request_accounts WHERE request_id = ?`);
      const delSE = db.prepare(`DELETE FROM stage_events WHERE request_id = ?`);
      const delCV = db.prepare(`DELETE FROM customer_validations WHERE request_id = ?`);
      const delTS = db.prepare(`DELETE FROM triage_suggestions WHERE request_id = ?`);
      const delRel = db.prepare(`DELETE FROM related_feedback WHERE request_id = ? OR related_request_id = ?`);

      const batch = db.transaction((itemIds: string[]) => {
        for (const id of itemIds) {
          delReq.run(id);
          delRA.run(id);
          delSE.run(id);
          delCV.run(id);
          delTS.run(id);
          delRel.run(id, id);
        }
      });
      batch(ids);
      return NextResponse.json({ success: true, count: ids.length, message: `Deleted ${ids.length} items` });
    }

    return NextResponse.json({ error: "Invalid action specified" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Bulk operation failed" }, { status: 500 });
  }
}
