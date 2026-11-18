// audit.js
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
  const primaryModel = process.env.GEMINI_MODEL || "gemini-3.5-flash";
  const candidateModels = Array.from(
    new Set([primaryModel, ...DEFAULT_MODELS])
  );

  let lastError = null;

  for (const model of candidateModels) {
    const maxRetries = 2;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🤖 [Audit] Trying model: ${model} (attempt ${attempt + 1}/${maxRetries + 1})...`);
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            temperature: 0.2,
          },
        });

        const rawText = cleanJsonText(response.text);
        const parsed = JSON.parse(rawText);
        console.log(`✅ [Audit] Successfully generated report using ${model}`);
        return parsed;
      } catch (error) {
        lastError = error;
        console.warn(`⚠️ [Audit] ${model} attempt ${attempt + 1} failed: ${error.message}`);

        if (isTransientError(error) && attempt < maxRetries) {
          const delayMs = (attempt + 1) * 1500;
          console.log(`⏳ Waiting ${delayMs}ms before retrying ${model}...`);
          await new Promise((r) => setTimeout(r, delayMs));
        } else {
          // Move to next candidate model
          break;
        }
      }
    }
  }

  throw new Error(`Gemini Audit Error: All models failed. Last error: ${lastError?.message}`);
}
