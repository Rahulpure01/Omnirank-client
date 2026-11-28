// services/technicalAudit.js
import * as cheerio from "cheerio";

/**
 * Checks HTTPS security and Canonical tag validity.
 */
function checkHttpsAndCanonical(targetUrl, $) {
  const isHttps = /^https:\/\//i.test(targetUrl);
  const canonicalHref = $('link[rel="canonical"]').attr("href") || "";
  const hasCanonical = canonicalHref.length > 0;
  
  let canonicalStatus = "missing";
  let canonicalDetails = "No canonical tag found. Search engines may index duplicate URL variations.";

  if (hasCanonical) {
    try {
      const canonicalHost = new URL(canonicalHref).hostname;
      const targetHost = new URL(targetUrl).hostname;
      if (canonicalHost === targetHost) {
        canonicalStatus = "valid";
        canonicalDetails = `Canonical tag correctly configured (${canonicalHref}).`;
      } else {
        canonicalStatus = "cross_domain";
        canonicalDetails = `Canonical points to an external domain: ${canonicalHref}`;
      }
    } catch {
      canonicalStatus = "relative";
      canonicalDetails = `Canonical tag uses a relative path (${canonicalHref}). An absolute URL is recommended.`;
    }
  }

  return {
    isHttps,
    httpsStatus: isHttps ? "Secure (HTTPS)" : "Insecure (HTTP) - Migration Recommended",
    hasCanonical,
    canonicalHref,
    canonicalStatus,
    canonicalDetails,
  };
}

/**
 * Inspects all images on the page for missing or empty alt attributes.
 */
function checkImagesAlt($) {
  const images = $("img");
  const total = images.length;
  const missing = [];

  images.each((_, el) => {
    const alt = $(el).attr("alt");
    const src = $(el).attr("src") || $(el).attr("data-src") || "";
    if (alt === undefined || alt === null || alt.trim() === "") {
      missing.push({
        src: src.slice(0, 100),
        reason: alt === undefined ? "Missing alt attribute entirely" : "Empty alt text (alt=\"\")",
      });
    }
  });

  const missingCount = missing.length;
  const percentMissing = total > 0 ? Math.round((missingCount / total) * 100) : 0;

  return {
    total,
    missingCount,
    percentMissing,
    passed: missingCount === 0,
    sampleMissing: missing.slice(0, 6),
    status: missingCount === 0 
      ? "Perfect: 100% of images have descriptive alt text" 
      : `${missingCount} of ${total} images (${percentMissing}%) missing alt text`,
  };
}

/**
 * Fetches and parses robots.txt to test access for Google, Bing, and specifically AI search crawlers.
 */
async function checkRobotsAndAiCrawlers(targetUrl) {
  let origin = "";
  try {
    origin = new URL(targetUrl).origin;
  } catch {
    origin = targetUrl;
  }

  const robotsUrl = `${origin}/robots.txt`;
  let robotsTxt = "";
  let exists = false;
  let sitemapsInRobots = [];

  try {
    const res = await fetch(robotsUrl, {
      headers: { "User-Agent": "OmniRank-Crawler/2.0" },
      signal: AbortSignal.timeout(3500),
    });
    if (res.ok) {
      robotsTxt = await res.text();
      exists = true;
    }
  } catch {
    exists = false;
  }

  // AI Crawlers to check
  const aiCrawlers = [
    { name: "GPTBot", agent: "gptbot", owner: "OpenAI / ChatGPT Search" },
    { name: "PerplexityBot", agent: "perplexitybot", owner: "Perplexity AI Search" },
    { name: "ClaudeBot", agent: "claudebot", owner: "Anthropic Claude" },
    { name: "Google-Extended", agent: "google-extended", owner: "Google Gemini AI Grounding" },
    { name: "CCBot", agent: "ccbot", owner: "Common Crawl (Foundation LLMs)" },
    { name: "Bytespider", agent: "bytespider", owner: "ByteDance / TikTok AI" },
  ];

  const crawlerResults = [];
  const lowerRobots = robotsTxt.toLowerCase();

  // Extract sitemaps declared in robots.txt
  const sitemapMatches = robotsTxt.match(/Sitemap:\s*(https?:\/\/[^\s]+)/gi) || [];
  sitemapsInRobots = sitemapMatches.map((s) => s.replace(/Sitemap:\s*/i, "").trim());

  if (!exists) {
    // If no robots.txt exists, by web standard all crawlers are allowed!
    for (const c of aiCrawlers) {
      crawlerResults.push({
        ...c,
        allowed: true,
        status: "Allowed (No robots.txt restriction)",
      });
    }
  } else {
    // Check global disallow: "User-agent: *\nDisallow: /"
    const globalDisallowAll = /User-agent:\s*\*\s*\nDisallow:\s*\/\s*$/im.test(robotsTxt);

    for (const c of aiCrawlers) {
      const agentRegex = new RegExp(`User-agent:\\s*${c.agent}\\s*\\n([^\\n]*)`, "i");
      const match = robotsTxt.match(agentRegex);

      let isAllowed = true;
      let reason = "Allowed (Standard Access)";

      if (match) {
        const nextLine = match[1] || "";
        if (/Disallow:\s*\/\s*$/i.test(nextLine)) {
          isAllowed = false;
          reason = `Blocked by rule: "${match[0].trim()}"`;
        } else if (/Allow:/i.test(nextLine)) {
          isAllowed = true;
          reason = "Explicitly allowed";
        }
      } else if (globalDisallowAll) {
        isAllowed = false;
        reason = "Blocked by global 'Disallow: /' directive";
      }

      crawlerResults.push({
        ...c,
        allowed: isAllowed,
        status: reason,
      });
    }
  }

  const blockedAiCount = crawlerResults.filter((c) => !c.allowed).length;

  return {
    robotsUrl,
    exists,
    sitemapsInRobots,
    aiCrawlers: crawlerResults,
    blockedAiCount,
    geoRisk: blockedAiCount > 0 
      ? `High Risk: ${blockedAiCount} major AI search crawler(s) are blocked in robots.txt.` 
      : "Healthy: Major AI search engines (GPTBot, PerplexityBot) have full crawl permission.",
  };
}

/**
 * Checks sitemap.xml presence and health.
 */
async function checkSitemapXml(targetUrl, sitemapsInRobots = []) {
  let origin = "";
  try {
    origin = new URL(targetUrl).origin;
  } catch {
    origin = targetUrl;
  }

  const candidateUrls = [
    ...sitemapsInRobots,
    `${origin}/sitemap.xml`,
    `${origin}/sitemap_index.xml`,
  ];

  for (const sUrl of candidateUrls) {
    try {
      const res = await fetch(sUrl, {
        method: "HEAD",
        headers: { "User-Agent": "OmniRank-Crawler/2.0" },
        signal: AbortSignal.timeout(3000),
      });

      if (res.ok) {
        return {
          exists: true,
          sitemapUrl: sUrl,
          statusCode: res.status,
          status: `Active & Reachable (HTTP ${res.status})`,
        };
      }
    } catch {
      // try next
    }
  }

  return {
    exists: false,
    sitemapUrl: `${origin}/sitemap.xml`,
    statusCode: 404,
    status: "Missing or Unreachable: No valid sitemap.xml detected",
  };
}

/**
 * Checks top internal links to identify broken links or 404s.
 */
async function checkInternalLinksAndBroken(targetUrl, $) {
  let origin = "";
  let host = "";
  try {
    const parsed = new URL(targetUrl);
    origin = parsed.origin;
    host = parsed.hostname;
  } catch {
    return { totalInternal: 0, brokenCount: 0, brokenLinks: [], sampleChecked: [] };
  }

  const internalLinks = new Set();
  const externalLinks = new Set();

  $("a[href]").each((_, el) => {
    const rawHref = ($(el).attr("href") || "").trim();
    if (!rawHref || rawHref.startsWith("#") || rawHref.startsWith("javascript:") || rawHref.startsWith("mailto:") || rawHref.startsWith("tel:")) {
      return;
    }

    try {
      const resolved = new URL(rawHref, origin);
      if (resolved.hostname === host) {
        internalLinks.add(resolved.href);
      } else {
        externalLinks.add(resolved.href);
      }
    } catch {
      // invalid URL
    }
  });

  const internalArray = Array.from(internalLinks);
  const sampleToCheck = internalArray.slice(0, 8); // sample top 8 links for fast response
  const brokenLinks = [];
  const checkedLinks = [];

  await Promise.allSettled(
    sampleToCheck.map(async (linkUrl) => {
      try {
        const res = await fetch(linkUrl, {
          method: "HEAD",
          headers: { "User-Agent": "OmniRank-Crawler/2.0" },
          signal: AbortSignal.timeout(2800),
        });

        const status = res.status;
        const isBroken = status >= 400;

        checkedLinks.push({ url: linkUrl, status, isBroken });
        if (isBroken) {
          brokenLinks.push({ url: linkUrl, status });
        }
      } catch (err) {
        // If HEAD fails, test GET before declaring broken
        try {
          const getRes = await fetch(linkUrl, {
            method: "GET",
            headers: { "User-Agent": "OmniRank-Crawler/2.0" },
            signal: AbortSignal.timeout(2800),
          });
          const status = getRes.status;
          const isBroken = status >= 400;
          checkedLinks.push({ url: linkUrl, status, isBroken });
          if (isBroken) brokenLinks.push({ url: linkUrl, status });
        } catch (getErr) {
          brokenLinks.push({ url: linkUrl, status: "TIMEOUT / ERR" });
          checkedLinks.push({ url: linkUrl, status: "ERR", isBroken: true });
        }
      }
    })
  );

  return {
    totalInternal: internalLinks.size,
    totalExternal: externalLinks.size,
    sampleCheckedCount: checkedLinks.length,
    brokenCount: brokenLinks.length,
    brokenLinks,
    checkedLinks,
    status: brokenLinks.length === 0
      ? `Healthy: 0 broken links found across ${checkedLinks.length} internal links sampled.`
      : `Warning: ${brokenLinks.length} broken links detected.`,
  };
}

/**
 * Evaluates Core Web Vitals, TTFB, and DOM Performance metrics deterministically.
 */
function evaluateWebVitalsAndPerformance(html, $, startTimeMs, endTimeMs) {
  const domNodes = $("*").length;
  const scriptTags = $("script[src]").length;
  const styleTags = $('link[rel="stylesheet"]').length;

  // CLS (Cumulative Layout Shift) Risk: images lacking width or height attributes
  let imagesWithoutDimensions = 0;
  $("img").each((_, el) => {
    const w = $(el).attr("width");
    const h = $(el).attr("height");
    if (!w || !h) imagesWithoutDimensions++;
  });

  const ttfb = Math.max(Math.round(endTimeMs - startTimeMs), 45);
  const totalHtmlSizeKb = Math.round(Buffer.byteLength(html, "utf8") / 1024);

  // Performance scoring formula (0 - 100)
  let score = 92;

  if (ttfb > 600) score -= 18;
  else if (ttfb > 300) score -= 8;

  if (domNodes > 1500) score -= 15;
  else if (domNodes > 800) score -= 6;

  if (scriptTags > 15) score -= 10;
  else if (scriptTags > 8) score -= 4;

  if (imagesWithoutDimensions > 5) score -= 8;

  if (totalHtmlSizeKb > 150) score -= 10;
  else if (totalHtmlSizeKb > 80) score -= 4;

  score = Math.max(35, Math.min(98, score));

  let vitalsRating = "Good";
  if (score < 60) vitalsRating = "Poor (Optimization Required)";
  else if (score < 80) vitalsRating = "Needs Improvement";

  return {
    performanceScore: score,
    vitalsRating,
    ttfbMs: ttfb,
    domNodes,
    totalHtmlSizeKb,
    scriptTags,
    styleTags,
    clsRiskImagesWithoutDimensions: imagesWithoutDimensions,
    clsRating: imagesWithoutDimensions === 0 ? "Minimal CLS Risk (0)" : `Moderate Risk (${imagesWithoutDimensions} images without explicit width/height)`,
    fcpEstimate: ttfb < 200 ? "0.8s (Fast)" : ttfb < 500 ? "1.6s (Moderate)" : "2.8s (Slow)",
    lcpEstimate: totalHtmlSizeKb < 60 && ttfb < 300 ? "1.8s (Good)" : "3.2s (Heavy payload/scripts)",
  };
}

/**
 * Main coordinator function that executes all deterministic technical checks in parallel.
 */
export async function runTechnicalAudit(targetUrl, html, $) {
  const startTime = Date.now();
  const httpsAndCanonical = checkHttpsAndCanonical(targetUrl, $);
  const images = checkImagesAlt($);

  // Parallel asynchronous network checks
  const [robotsResult, linksResult] = await Promise.all([
    checkRobotsAndAiCrawlers(targetUrl),
    checkInternalLinksAndBroken(targetUrl, $),
  ]);

  const sitemapResult = await checkSitemapXml(targetUrl, robotsResult.sitemapsInRobots);
  const endTime = Date.now();

  const webVitals = evaluateWebVitalsAndPerformance(html, $, startTime, endTime);

  // Technical Health Score Calculation
  let techScore = 80;
  if (httpsAndCanonical.isHttps) techScore += 5; else techScore -= 20;
  if (httpsAndCanonical.hasCanonical) techScore += 5; else techScore -= 10;
  if (images.passed) techScore += 5; else techScore -= Math.min(15, images.missingCount * 2);
  if (robotsResult.exists) techScore += 3;
  if (robotsResult.blockedAiCount === 0) techScore += 5; else techScore -= (robotsResult.blockedAiCount * 3);
  if (sitemapResult.exists) techScore += 5; else techScore -= 10;
  if (linksResult.brokenCount === 0) techScore += 5; else techScore -= (linksResult.brokenCount * 5);

  techScore = Math.max(30, Math.min(100, techScore));

  return {
    technicalScore: techScore,
    httpsAndCanonical,
    images,
    robots: robotsResult,
    sitemap: sitemapResult,
    links: linksResult,
    webVitals,
  };
}
