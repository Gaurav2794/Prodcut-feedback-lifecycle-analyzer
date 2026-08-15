import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

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
    throw new Error("No Gemini API Key");
  }

  let lastError: any = null;

  for (const model of CANDIDATE_MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 1024,
          },
        }),
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
      }
    } catch (err: any) {
      lastError = err;
    }
  }

  throw lastError || new Error("Gemini query failed");
}

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();

    if (!query || !query.trim()) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    // Fetch snapshot of active feedback dataset for prompt context
    const requests = db.prepare(`
      SELECT id, title, product_area, stage, priority, revenue_impact, revenue_impact_num, mentions, accounts_count, owner, summary
      FROM feature_requests
      ORDER BY revenue_impact_num DESC
      LIMIT 40
    `).all() as any[];

    const stats = {
      total: requests.length,
      totalArr: requests.reduce((acc, r) => acc + (r.revenue_impact_num || 0), 0),
      byStage: {
        new: requests.filter(r => r.stage === "new").length,
        triaged: requests.filter(r => r.stage === "triaged").length,
        planned: requests.filter(r => r.stage === "planned").length,
        in_development: requests.filter(r => r.stage === "in_development").length,
        testing: requests.filter(r => r.stage === "testing").length,
        shipped: requests.filter(r => r.stage === "shipped").length,
      }
    };

    const datasetSummary = requests.slice(0, 25).map(r => 
      `- [${r.id}] "${r.title}" | Area: ${r.product_area} | Stage: ${r.stage} | Priority: ${r.priority} | ARR: ${r.revenue_impact} | Mentions: ${r.mentions} | Accounts: ${r.accounts_count}`
    ).join("\n");

    const prompt = `
You are the AI Product & Solutions Copilot for FeedbackOS. You help product leaders, solutions engineers, and executives query their customer feedback portfolio, prioritize roadmaps, and understand revenue impact.

Dataset Metrics:
- Total Analyzed: ${stats.total} signals ($${(stats.totalArr / 1000).toFixed(0)}k ARR represented)
- Stages Breakdown: New Intake: ${stats.byStage.new}, Triaged: ${stats.byStage.triaged}, Planned: ${stats.byStage.planned}, In Dev: ${stats.byStage.in_development}, QA: ${stats.byStage.testing}, Shipped: ${stats.byStage.shipped}

Top Feedback Requests in Portfolio:
${datasetSummary}

User Question: "${query}"

Provide a direct, concise, and structured answer (using bullet points and bolding for key metrics). If referencing specific items from the dataset, cite their title and revenue impact. Keep it actionable and executive-ready.
`;

    let answer: string;
    try {
      answer = await callGemini(prompt);
    } catch (aiErr) {
      // Intelligent fallback synthesizer
      const qLower = query.toLowerCase();
      if (qLower.includes("revenue") || qLower.includes("arr") || qLower.includes("top") || qLower.includes("highest")) {
        const top5 = requests.slice(0, 5);
        answer = `**Top Revenue-Impact Feedback Signals:**\n\n` +
          top5.map((r, i) => `${i + 1}. **${r.title}** (${r.product_area}) - **${r.revenue_impact} ARR** across ${r.accounts_count} accounts [Stage: ${r.stage}]`).join("\n") +
          `\n\n*Combined ARR for top 5 items: $${(top5.reduce((a, b) => a + b.revenue_impact_num, 0) / 1000).toFixed(0)}k.*`;
      } else if (qLower.includes("fleet") || qLower.includes("mission") || qLower.includes("stream") || qLower.includes("report")) {
        const area = qLower.includes("fleet") ? "fleet" : qLower.includes("mission") ? "missions" : qLower.includes("stream") ? "streaming" : "reports";
        const matches = requests.filter(r => r.product_area === area);
        answer = `**Analysis for ${area.toUpperCase()} (${matches.length} signals found):**\n\n` +
          matches.slice(0, 4).map(r => `• **${r.title}**: ${r.revenue_impact} ARR (${r.mentions} mentions, Stage: ${r.stage})`).join("\n") +
          `\n\n**Recommendation:** Prioritize items in '${area}' with high ARR to mitigate churn risk.`;
      } else if (qLower.includes("dev") || qLower.includes("sprint") || qLower.includes("progress")) {
        const inDev = requests.filter(r => r.stage === "in_development");
        answer = `**Active Sprint Summary (${inDev.length} features in development):**\n\n` +
          inDev.map(r => `• **${r.title}** [${r.product_area}]: ${r.revenue_impact} ARR | Owner: ${r.owner}`).join("\n") +
          `\n\nTotal sprint ARR value: **$${(inDev.reduce((a, b) => a + b.revenue_impact_num, 0) / 1000).toFixed(0)}k**.`;
      } else {
        answer = `**FeedbackOS Portfolio Telemetry Summary:**\n\n` +
          `• **Total Tracked ARR**: $${(stats.totalArr / 1000).toFixed(0)}k across ${stats.total} signals.\n` +
          `• **Active In-Flight**: ${stats.byStage.in_development} items in dev, ${stats.byStage.testing} in QA verification.\n` +
          `• **New Signals Needing Triage**: ${stats.byStage.new} items in Intake backlog.\n\n` +
          `**Top Recommendation**: Triage the highest ARR signals in Intake and link them to upcoming sprint roadmaps.`;
      }
    }

    return NextResponse.json({ success: true, answer, totalArr: stats.totalArr });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Copilot error" }, { status: 500 });
  }
}
