import * as cheerio from "cheerio";

export async function scrapeUrl(url) {
  let targetUrl = (url || "").trim();
  if (!/^https?:\/\//i.test(targetUrl)) {
    targetUrl = "https://" + targetUrl;
  }

  const res = await fetch(targetUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
    },
    redirect: "follow",
    signal: AbortSignal.timeout(12000),
  });

  if (!res.ok) {
    throw new Error(`Scraper request failed for "${targetUrl}" with HTTP status ${res.status} (${res.statusText || "Error"})`);
  }

  const html = await res.text();
  const $ = cheerio.load(html);

  const meta = {
    title: $("title").first().text().trim() || $('meta[property="og:title"]').attr("content") || "",
    description: $('meta[name="description"]').attr("content") || $('meta[property="og:description"]').attr("content") || "",
    canonical: $('link[rel="canonical"]').attr("href") || targetUrl,
    h1Count: $("h1").length,
    headings: $("h1,h2,h3,h4").map((_, el) => ({
      level: el.tagName.toUpperCase(),
      text: $(el).text().trim(),
    })).get().filter(h => h.text.length > 0),
    jsonLd: $('script[type="application/ld+json"]').map((_, el) => {
      try { return JSON.parse($(el).html()); } catch { return null; }
    }).get().filter(Boolean),
  };

  // sanitize karne ke baad body text nikalo
  $("script,style,nav,footer,header,svg,noscript,iframe").remove();
  const body = $("body").text().replace(/\s+/g, " ").trim().slice(0, 12000);

  return { meta, body, url: targetUrl };
}
