// services/multiPageCrawler.js
import * as cheerio from "cheerio";

/**
 * Extracts distinct internal page paths from the homepage DOM.
 */
function discoverInternalPages(targetUrl, $) {
  let origin = "";
  let host = "";
  try {
    const parsed = new URL(targetUrl);
    origin = parsed.origin;
    host = parsed.hostname;
  } catch {
    return [];
  }

  const candidateUrls = new Set();
  const priorityPatterns = ["about", "pricing", "product", "service", "contact", "blog", "faq", "features", "shop", "terms"];

  $("a[href]").each((_, el) => {
    const rawHref = ($(el).attr("href") || "").trim();
    if (
      !rawHref ||
      rawHref.startsWith("#") ||
      rawHref.startsWith("javascript:") ||
      rawHref.startsWith("mailto:") ||
      rawHref.startsWith("tel:")
    ) {
      return;
    }

    try {
      const resolved = new URL(rawHref, origin);
      // Only keep same-host internal HTML pages (ignore images, zips, pdfs)
      if (resolved.hostname === host && resolved.pathname !== "/" && resolved.pathname !== "") {
        if (!/\.(jpg|jpeg|png|webp|gif|svg|pdf|zip|mp4)$/i.test(resolved.pathname)) {
          candidateUrls.add(resolved.href);
        }
      }
    } catch {
      // ignore invalid
    }
  });

  const all = Array.from(candidateUrls);

  // Prioritize meaningful pages (About, Pricing, Features, etc.)
  all.sort((a, b) => {
    const aLower = a.toLowerCase();
    const bLower = b.toLowerCase();
    const aPriority = priorityPatterns.some((p) => aLower.includes(p)) ? 1 : 0;
    const bPriority = priorityPatterns.some((p) => bLower.includes(p)) ? 1 : 0;
    return bPriority - aPriority;
  });

  return all.slice(0, 4); // sample top 4 internal pages for fast sub-3s response
}

/**
 * Rapidly crawls and audits a single page's basic SEO tags.
 */
async function auditSinglePage(pageUrl) {
  try {
    const res = await fetch(pageUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "text/html",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(3000),
    });

    const status = res.status;
    if (!res.ok) {
      return {
        url: pageUrl,
        status,
        score: 30,
        title: "",
        hasTitle: false,
        hasDescription: false,
        h1Count: 0,
        missingAltCount: 0,
        issues: [`HTTP ${status} error response`],
      };
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    const title = $("title").first().text().trim() || $('meta[property="og:title"]').attr("content") || "";
    const description = $('meta[name="description"]').attr("content") || $('meta[property="og:description"]').attr("content") || "";
    const h1Count = $("h1").length;

    let missingAltCount = 0;
    $("img").each((_, el) => {
      const alt = $(el).attr("alt");
      if (alt === undefined || alt === null || alt.trim() === "") missingAltCount++;
    });

    const issues = [];
    let score = 95;

    if (!title || title.length < 15) {
      score -= 20;
      issues.push("Title tag missing or too short");
    }
    if (!description || description.length < 50) {
      score -= 20;
      issues.push("Meta description missing or thin");
    }
    if (h1Count === 0) {
      score -= 20;
      issues.push("No H1 heading found");
    } else if (h1Count > 1) {
      score -= 8;
      issues.push(`Multiple (${h1Count}) H1 tags`);
    }
    if (missingAltCount > 0) {
      score -= Math.min(15, missingAltCount * 3);
      issues.push(`${missingAltCount} images missing alt text`);
    }

    score = Math.max(25, Math.min(100, score));

    return {
      url: pageUrl,
      status: 200,
      score,
      title: title.slice(0, 60),
      hasTitle: title.length >= 15,
      hasDescription: description.length >= 50,
      h1Count,
      missingAltCount,
      issues,
    };
  } catch (err) {
    return {
      url: pageUrl,
      status: "TIMEOUT",
      score: 35,
      title: "",
      hasTitle: false,
      hasDescription: false,
      h1Count: 0,
      missingAltCount: 0,
      issues: ["Page request timed out or was blocked"],
    };
  }
}

/**
 * Runs multi-page internal audit and produces site-wide defect aggregation.
 */
export async function runMultiPageCrawl(targetUrl, $) {
  const discoveredPages = discoverInternalPages(targetUrl, $);

  if (discoveredPages.length === 0) {
    return {
      totalPagesSampled: 1,
      averageSiteScore: 82,
      pagesList: [],
      weakestPages: [],
      commonDefects: [],
    };
  }

  // Crawl discovered internal pages in parallel
  const settled = await Promise.allSettled(
    discoveredPages.map((pageUrl) => auditSinglePage(pageUrl))
  );

  const pagesList = settled
    .filter((s) => s.status === "fulfilled")
    .map((s) => s.value);

  if (pagesList.length === 0) {
    return {
      totalPagesSampled: 1,
      averageSiteScore: 80,
      pagesList: [],
      weakestPages: [],
      commonDefects: [],
    };
  }

  // Compute weakest pages (sorted by score ascending)
  const sortedPages = [...pagesList].sort((a, b) => a.score - b.score);
  const weakestPages = sortedPages.slice(0, 3);

  // Compute site-wide common defect distribution
  const total = pagesList.length;
  let missingMetaCount = 0;
  let missingTitleCount = 0;
  let missingH1Count = 0;
  let missingAltPagesCount = 0;

  let totalScoreSum = 0;
  for (const page of pagesList) {
    totalScoreSum += page.score;
    if (!page.hasDescription) missingMetaCount++;
    if (!page.hasTitle) missingTitleCount++;
    if (page.h1Count === 0) missingH1Count++;
    if (page.missingAltCount > 0) missingAltPagesCount++;
  }

  const commonDefects = [
    {
      defect: "Missing Meta Description",
      affectedPages: missingMetaCount,
      totalSampled: total,
      percentage: Math.round((missingMetaCount / total) * 100),
      impact: "High (Loss of CTR in Google SERPs)",
    },
    {
      defect: "Missing Image Alt Attributes",
      affectedPages: missingAltPagesCount,
      totalSampled: total,
      percentage: Math.round((missingAltPagesCount / total) * 100),
      impact: "Medium (Accessibility & Google Image Search)",
    },
    {
      defect: "Missing H1 Primary Heading",
      affectedPages: missingH1Count,
      totalSampled: total,
      percentage: Math.round((missingH1Count / total) * 100),
      impact: "High (Page Relevance & Semantic Hierarchy)",
    },
    {
      defect: "Missing / Suboptimal Title Tag",
      affectedPages: missingTitleCount,
      totalSampled: total,
      percentage: Math.round((missingTitleCount / total) * 100),
      impact: "Critical (Top Ranking Factor for Search)",
    },
  ].filter((d) => d.affectedPages > 0);

  const averageSiteScore = Math.round(totalScoreSum / total);

  return {
    totalPagesSampled: total,
    averageSiteScore,
    pagesList,
    weakestPages,
    commonDefects,
  };
}
