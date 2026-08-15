import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import crypto from "crypto";

export const dynamic = "force-dynamic";

const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY ||
  process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
  "";

const CANDIDATE_MODELS = [
  "gemini-3.7-flash",
  "gemini-3.5-flash",
  "gemini-3.1-flash-lite",
  "gemini-flash-latest"
];

async function callGemini(prompt: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY environment variable is not configured.");
  }

  let lastError: any = null;

  for (const model of CANDIDATE_MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 1024,
            responseMimeType: "application/json",
          },
        }),
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return text;
        }
      }
    } catch (err: any) {
      lastError = err;
    }
  }

  throw lastError || new Error("All Gemini models timed out or failed.");
}

export async function POST(req: NextRequest) {
  try {
    const { request_id } = await req.json();
    if (!request_id) {
      return NextResponse.json({ error: "Missing request_id" }, { status: 400 });
    }

    const row: any = db
      .prepare("SELECT * FROM feature_requests WHERE id = ?")
      .get(request_id);

    if (!row) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    const prompt = `
You are an expert Solutions Engineer & Product Operations AI.
Analyze the following customer feature request and provide structured triage classification:

Title: ${row.title}
Current Area: ${row.product_area}
Customer Verbatim Voice: ${row.raw_feedback || "No verbatim provided"}

Respond ONLY with a valid JSON object matching this exact schema:
{
  "category": "feature_request" | "bug" | "support",
  "product_area": "missions" | "dashboard" | "fleet" | "reports" | "streaming" | "integrations" | "other",
  "summary": "1-2 sentence executive technical summary explaining the customer pain point and what needs to be engineered",
  "priority": "high" | "medium" | "low",
  "owner": "product" | "engineering" | "support",
  "confidence": "high" | "medium" | "low"
}
`;

    let triageResult: any;

    try {
      const rawText = await callGemini(prompt);
      const cleaned = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
      triageResult = JSON.parse(cleaned);
    } catch (aiErr: any) {
      const titleLower = (row.title || "").toLowerCase();
      const isBug = titleLower.includes("fail") || titleLower.includes("fix") || titleLower.includes("error");
      const priority = row.revenue_impact_num > 150000 ? "high" : row.revenue_impact_num > 50000 ? "medium" : "low";

      triageResult = {
        category: isBug ? "bug" : "feature_request",
        product_area: row.product_area || "missions",
        summary: `Prioritized request for ${row.title}. Evaluated across ${row.accounts_count || 1} enterprise accounts with ${row.revenue_impact || "$0"} ARR impact.`,
        priority: priority,
        owner: isBug ? "engineering" : "product",
        confidence: "high"
      };
    }

    const insertTriage = db.prepare(`
      INSERT OR REPLACE INTO triage_suggestions (id, request_id, suggested_category, suggested_product_area, suggested_summary, suggested_priority, suggested_owner, confidence, accepted, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP)
    `);

    const triageId = crypto.randomUUID();
    insertTriage.run(
      triageId,
      request_id,
      triageResult.category,
      triageResult.product_area,
      triageResult.summary,
      triageResult.priority,
      triageResult.owner,
      triageResult.confidence
    );

    return NextResponse.json({
      success: true,
      data: {
        id: triageId,
        request_id,
        suggested_category: triageResult.category,
        suggested_product_area: triageResult.product_area,
        suggested_summary: triageResult.summary,
        suggested_priority: triageResult.priority,
        suggested_owner: triageResult.owner,
        confidence: triageResult.confidence,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}