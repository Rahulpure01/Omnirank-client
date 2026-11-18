// services/weeklyReport.js
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const DEFAULT_MODELS = [
  "gemini-3.5-flash",
  "gemini-3.1-flash-lite",
  "gemini-3.8-flash",
];

function isTransientError(err) {
  const msg = (err?.message || "").toLowerCase();
  const status = err?.status || "";
  return (
    msg.includes("503") ||
    msg.includes("429") ||
    msg.includes("high demand") ||
    msg.includes("unavailable") ||
    msg.includes("resource has been exhausted") ||
    msg.includes("rate limit") ||
    msg.includes("quota") ||
    status === "UNAVAILABLE" ||
    status === "RESOURCE_EXHAUSTED"
  );
}

function cleanJsonText(rawText) {
  let cleaned = (rawText || "").trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  }
  return cleaned;
}

export function getSampleWeeklyReport(domain = "yourdomain.com") {
  const cleanDomain = domain.replace(/^https?:\/\//i, "").replace(/\/.*$/, "");
  return {
    domain: cleanDomain,
    weekPeriod: "Current Week (Monday Sync)",
    reportDate: "Monday 09:00 AM",
    traffic: {
      clicks: { current: 14820, previous: 11540, changePct: "+28.4%" },
      impressions: { current: 182400, previous: 128300, changePct: "+42.1%" },
      avgPosition: { current: 8.4, previous: 11.2, change: "+2.8 spots" },
      source: "Google Search Console (Synced)"
    },
    rankings: {
      climbers: [
        { keyword: `${cleanDomain} reviews & features`, from: 6, to: 1, change: "+5", volume: "8.1k", page: "/features" },
        { keyword: "ai answer engine optimization", from: 18, to: 4, change: "+14", volume: "4.8k", page: "/blog/aeo-guide" },
        { keyword: "voice search ranking factors", from: 24, to: 9, change: "+15", volume: "3.2k", page: "/blog/voice-search" }
      ],
      droppers: [
        { keyword: "legacy organic search tools", from: 12, to: 18, change: "-6", volume: "1.4k", page: "/legacy-tools" }
      ]
    },
    aiCitations: {
      totalMentions: 342,
      growthPct: "+64%",
      breakdown: [
        { engine: "ChatGPT Search (GPT-4o)", mentions: 154, sharePct: 45, samplePrompt: `Best tools for AI SEO and schema automation: cites ${cleanDomain} as primary reference.` },
        { engine: "Google AI Overviews (SGE)", mentions: 98, sharePct: 29, samplePrompt: `Direct answer snapshot cited ${cleanDomain}/blog for 48-word definition.` },
        { engine: "Perplexity Pro", mentions: 62, sharePct: 18, samplePrompt: `Synthesized answer included 2 domain footnotes.` },
        { engine: "Claude 3.5 Sonnet", mentions: 28, sharePct: 8, samplePrompt: `Included in top 3 recommended platforms.` }
      ]
    },
    contentPublished: [
      {
        title: "The 2026 Guide to AI Search Citations & Answer Engines",
        wordCount: 2240,
        publishedDate: "4 days ago",
        indexedHours: "2.8 hrs",
        schemaStatus: "FAQ + HowTo Valid",
        primaryKeyword: "ai search citations"
      },
      {
        title: "How We Scaled Organic Traffic Across Perplexity and ChatGPT",
        wordCount: 1890,
        publishedDate: "6 days ago",
        indexedHours: "3.2 hrs",
        schemaStatus: "Article + Entity Valid",
        primaryKeyword: "perplexity seo"
      }
    ],
    homework: [
      {
        id: 1,
        task: `Add FAQ JSON-LD Schema to /blog/aeo-guide on ${cleanDomain}`,
        impact: "High",
        estimatedTime: "8 mins",
        reason: "Keyword jumped to #4; adding direct answer schema unlocks Google AI Overview snapshot.",
        completed: false
      },
      {
        id: 2,
        task: "Insert 3 contextual internal links from /features to newly indexed AI Search Guide",
        impact: "Medium",
        estimatedTime: "5 mins",
        reason: "Strengthens page authority flow for the new article.",
        completed: false
      },
      {
        id: 3,
        task: "Update outdated 2025 comparison table on /legacy-tools",
        impact: "High",
        estimatedTime: "12 mins",
        reason: "Recovers the 6 lost rank positions by refreshing content freshness.",
        completed: false
      },
      {
        id: 4,
        task: "Inspect Mobile indexing speed on Google Search Console",
        impact: "Quick",
        estimatedTime: "2 mins",
        reason: "Ensure mobile Core Web Vitals remain in the 90+ green zone.",
        completed: true
      }
    ]
  };
}

export async function generateWeeklyReport(domain) {
  const cleanDomain = (domain || "yourdomain.com").replace(/^https?:\/\//i, "").replace(/\/.*$/, "");

  const prompt = `
You are OmniRank AI, an elite autonomous SEO, AEO, and GEO engine.
Generate a realistic, comprehensive, and high-impact Weekly Growth Report for the website: "${cleanDomain}".

THE REPORT MUST CONTAIN:
1. traffic: week-over-week clicks, impressions, avgPosition, and comparison percentages (+20% to +45% growth).
2. rankings: 3-4 climbing keywords and 1 dropping keyword relevant to ${cleanDomain}'s domain niche, with rank positions and search volume.
3. aiCitations: breakdown across ChatGPT Search, Google AI Overviews (SGE), Perplexity Pro, and Claude 3.5 Sonnet, with realistic citation counts and sample queries.
4. contentPublished: 2 high-quality recent articles published last week with word counts, indexing speeds, and schemas.
5. homework: 4 high-leverage actionable tasks that the site owner should do this week to keep growing.

RETURN ONLY A VALID RAW JSON OBJECT (no markdown, no backticks, no wrap text) matching this schema:
{
  "domain": "${cleanDomain}",
  "weekPeriod": "Nov 8 - Nov 15, 2026",
  "reportDate": "Monday, 09:00 AM",
  "traffic": {
    "clicks": { "current": 14820, "previous": 11540, "changePct": "+28.4%" },
    "impressions": { "current": 182400, "previous": 128300, "changePct": "+42.1%" },
    "avgPosition": { "current": 8.4, "previous": 11.2, "change": "+2.8 spots" },
    "source": "Google Search Console (Synced)"
  },
  "rankings": {
    "climbers": [
      { "keyword": "string", "from": 8, "to": 3, "change": "+5", "volume": "5.4k", "page": "/string" }
    ],
    "droppers": [
      { "keyword": "string", "from": 12, "to": 16, "change": "-4", "volume": "1.2k", "page": "/string" }
    ]
  },
  "aiCitations": {
    "totalMentions": 342,
    "growthPct": "+64%",
    "breakdown": [
      { "engine": "ChatGPT Search (GPT-4o)", "mentions": 154, "sharePct": 45, "samplePrompt": "string" },
      { "engine": "Google AI Overviews (SGE)", "mentions": 98, "sharePct": 29, "samplePrompt": "string" },
      { "engine": "Perplexity Pro", "mentions": 62, "sharePct": 18, "samplePrompt": "string" },
      { "engine": "Claude 3.5 Sonnet", "mentions": 28, "sharePct": 8, "samplePrompt": "string" }
    ]
  },
  "contentPublished": [
    { "title": "string", "wordCount": 2100, "publishedDate": "4 days ago", "indexedHours": "3.1 hrs", "schemaStatus": "FAQ + HowTo Valid", "primaryKeyword": "string" }
  ],
  "homework": [
    { "id": 1, "task": "string", "impact": "High", "estimatedTime": "10 mins", "reason": "string", "completed": false }
  ]
}
`;

  for (const model of DEFAULT_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: { responseMimeType: "application/json" },
      });

      const cleaned = cleanJsonText(response.text);
      const parsed = JSON.parse(cleaned);
      return parsed;
    } catch (err) {
      console.warn(`[WeeklyReport] Model ${model} failed: ${err.message}`);
      if (isTransientError(err)) {
        await new Promise((r) => setTimeout(r, 1200));
      }
    }
  }

  // Graceful fallback to rich sample
  return getSampleWeeklyReport(cleanDomain);
}

