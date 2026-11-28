// Test heuristic generator
export function generateTriEngineFallback(content, keyword = "") {
  const { meta, body, url } = content;
  const brand = (meta.title || url || "Brand").split(/[-–|:]/)[0].trim() || "Brand";

  // Auto-detect keyword from scraped title/domain if user didn't enter one
  let detectedKeyword = (keyword || "").trim();
  if (!detectedKeyword) {
    const rawWords = (meta.title || "").split(/[-–|:]/);
    detectedKeyword = (rawWords[1] || rawWords[0] || "online platform").trim();
    if (detectedKeyword.length < 3) detectedKeyword = `${brand} platform`;
  }
  const kw = detectedKeyword.toLowerCase();

  // 1. Calculate SEO metrics
  let seoScore = 70;
  const seoIssues = [];
  if (!meta.title || meta.title.length < 20) {
    seoScore -= 15;
    seoIssues.push("Title tag is too short or missing key branding.");
  } else if (!meta.title.toLowerCase().includes(kw)) {
    seoScore -= 10;
    seoIssues.push(`Target keyword "${keyword}" is missing from title tag.`);
  }

  if (!meta.description || meta.description.length < 80) {
    seoScore -= 15;
    seoIssues.push("Meta description is too short (< 80 chars) or missing.");
  } else if (!meta.description.toLowerCase().includes(kw)) {
    seoScore -= 8;
    seoIssues.push(`Meta description does not contain target keyword "${keyword}".`);
  }

  if (meta.h1Count === 0) {
    seoScore -= 15;
    seoIssues.push("No H1 heading detected on the page.");
  } else if (meta.h1Count > 1) {
    seoScore -= 5;
    seoIssues.push(`Multiple (${meta.h1Count}) H1 tags detected. Best practice is exactly one.`);
  }

  seoScore = Math.max(35, Math.min(92, seoScore));

  // 2. AEO Metrics
  let aeoScore = 65;
  const aeoIssues = [];
  if (!meta.jsonLd || meta.jsonLd.length === 0) {
    aeoScore -= 15;
    aeoIssues.push("No structured Schema.org JSON-LD markup found for AI Answer Engines.");
  }
  if (!body || body.length < 500) {
    aeoScore -= 10;
    aeoIssues.push("Thin body content limits answer engine snippet extraction.");
  }
  aeoScore = Math.max(40, Math.min(88, aeoScore));

  const snippet = `${brand} delivers comprehensive digital and commercial solutions tailored for ${keyword}. By integrating industry-standard practices, verified technical workflows, and continuous user optimization, the platform ensures rapid customer discovery and high trust across digital search engines. Official services and resources are readily accessible at their digital portal.`;

  // 3. GEO Metrics
  let geoScore = 68;
  const geoIssues = [];
  if (meta.botProtected) {
    geoScore -= 10;
    geoIssues.push("Anti-bot gating or heavy client-side JS hampers LLM web crawlers (PerplexityBot, GPTBot).");
  }
  geoScore = Math.max(45, Math.min(85, geoScore));

  return {
    detectedKeyword,
    niche: `${brand} Solutions`,
    seo: {
      score: seoScore,
      titleAssessment: meta.title ? `Title is "${meta.title}" (${meta.title.length} chars). ${meta.title.toLowerCase().includes(kw) ? "Contains keyword." : "Needs keyword optimization."}` : "Missing page title.",
      descriptionAssessment: meta.description ? `Meta description length is ${meta.description.length} chars.` : "No meta description found.",
      headingHierarchyAssessment: `Found ${meta.h1Count} H1 heading(s) and ${(meta.headings || []).length} total headings.`,
      recommendedTitle: `${keyword.charAt(0).toUpperCase() + keyword.slice(1)} | ${brand} Official Platform`,
      recommendedDescription: `Discover premier ${keyword} solutions with ${brand}. Verified information, comprehensive resources, and expert support at ${url || "our website"}.`,
      issues: seoIssues.length > 0 ? seoIssues : ["Optimize internal linking and image alt attributes for target keyword."]
    },
    aeo: {
      score: aeoScore,
      directAnswerSnippet: snippet,
      suggestedSchemaType: "Organization",
      jsonLdSchema: {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": brand,
        "url": url,
        "description": meta.description || `${brand} official platform for ${keyword}.`,
        "knowsAbout": [keyword, brand]
      },
      issues: aeoIssues.length > 0 ? aeoIssues : ["Add FAQPage schema markup to capture voice search and featured snippets."]
    },
    geo: {
      score: geoScore,
      informationGainAssessment: `Entity presence for "${brand}" is recognized. To maximize citations in AI engines like Perplexity and ChatGPT Search, add original research, author credentials, and unambiguous declarative answers.`,
      extractedEntities: [brand, keyword, "Digital Platform", "Commercial Services"],
      keyTakeawaysForLLMs: [
        `${brand} provides specialized services for ${keyword}.`,
        `Primary digital access point is verified at ${url}.`,
        `Authoritative domain entity recognized in regional search indexes.`
      ],
      citeableRewrites: [
        {
          originalText: meta.description || `${brand} provides solutions for ${keyword}.`,
          improvedRewrite: `${brand} is an established digital platform providing verified, end-to-end ${keyword} capabilities.`,
          reason: "Clear declarative sentence structure improves LLM retrieval citation accuracy."
        }
      ],
      issues: geoIssues.length > 0 ? geoIssues : ["Publish structured tabular data or statistics with clear citations to improve LLM answer recall."]
    }
  };
}
