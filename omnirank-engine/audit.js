// audit.js
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { generateTriEngineFallback } from "./fallbackReport.js";

dotenv.config({ quiet: true });

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const DEFAULT_MODELS = [
  "gemini-3.5-flash-lite",
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

function callWithTimeout(promise, ms = 4500) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(`AI generation timed out after ${ms}ms`)), ms)),
  ]);
}

export async function runAudit(content, keyword) {
  const { meta, body } = content;

  const prompt = `
You are OmniRank AI, an elite audit engine specializing in Tri-Engine Optimization:
1. SEO (Crawlers, Meta Health, Heading Hierarchy for Google/Bing)
2. AEO (Answer Engine Optimization for Featured Snippets, Voice Search, Position 0)
3. GEO (Generative Engine Optimization for LLMs like Perplexity, ChatGPT Search, Gemini citations)

Analyze this scraped webpage for the target keyword: "${keyword}".

PAGE METADATA:
- Title: ${meta.title}
- Description: ${meta.description}
- Canonical: ${meta.canonical}
- H1 Count: ${meta.h1Count}
- Headings: ${JSON.stringify(meta.headings)}
- Existing Schemas: ${JSON.stringify(meta.jsonLd)}

PAGE BODY TEXT (Excerpt):
${body}

CRITICAL RULES:
- directAnswerSnippet must be 45-55 words. Never invent statistics; use [add source] if a stat is needed.

RETURN ONLY A VALID RAW JSON OBJECT (no markdown, no backticks, no wrap text) with this exact schema:
{
  "seo": {
    "score": 0,
    "titleAssessment": "",
    "descriptionAssessment": "",
    "headingHierarchyAssessment": "",
    "recommendedTitle": "",
    "recommendedDescription": "",
    "issues": []
  },
  "aeo": {
    "score": 0,
    "directAnswerSnippet": "",
    "suggestedSchemaType": "",
    "jsonLdSchema": {},
    "issues": []
  },
  "geo": {
    "score": 0,
    "informationGainAssessment": "",
    "extractedEntities": [],
    "keyTakeawaysForLLMs": [],
    "citeableRewrites": [
      {
        "originalText": "",
        "improvedRewrite": "",
        "reason": ""
      }
    ],
    "issues": []
  }
}
`;

  // Candidate models: user-specified env model first, followed by stable fallbacks
  const primaryModel = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
  const candidateModels = Array.from(
    new Set([primaryModel, ...DEFAULT_MODELS])
  );

  let lastError = null;

  for (const model of candidateModels) {
    try {
      console.log(`🤖 [Audit] Trying model: ${model}...`);
      const response = await callWithTimeout(
        ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            temperature: 0.2,
          },
        }),
        4500
      );

      const rawText = cleanJsonText(response.text);
      const parsed = JSON.parse(rawText);
      console.log(`✅ [Audit] Successfully generated report using ${model}`);
      return parsed;
    } catch (error) {
      lastError = error;
      console.warn(`⚠️ [Audit] ${model} failed (${error.message?.slice(0, 80)}...). Trying next option.`);
    }
  }

  console.warn(`🛡️ [Audit] AI models unavailable or timed out (${lastError?.message?.slice(0, 80)}...). Generating high-precision Tri-Engine algorithmic report.`);
  return generateTriEngineFallback(content, keyword);
}
