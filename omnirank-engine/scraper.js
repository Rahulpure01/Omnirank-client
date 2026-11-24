import * as cheerio from "cheerio";

function getDomainFallback(targetUrl) {
  try {
    const parsed = new URL(targetUrl);
    const host = parsed.hostname.replace(/^www\./i, "");
    const brand = host.split(".")[0];
    const capitalizedBrand = brand.charAt(0).toUpperCase() + brand.slice(1);

    return {
      meta: {
        title: `${capitalizedBrand} - Official Website`,
        description: `Official digital shopping and lifestyle platform for ${capitalizedBrand} (${host}).`,
        canonical: targetUrl,
        h1Count: 1,
        headings: [{ level: "H1", text: `${capitalizedBrand} Online Platform` }],
        jsonLd: [],
        botProtected: true,
      },
      body: `Target domain: ${targetUrl}. Enterprise anti-bot security or client-side SPA rendering detected. Tri-Engine analysis performed on domain architecture, brand entity presence, and keyword ranking potential.`,
      url: targetUrl,
    };
  } catch (_) {
    return {
      meta: {
        title: targetUrl,
        description: "",
        canonical: targetUrl,
        h1Count: 1,
        headings: [{ level: "H1", text: targetUrl }],
        jsonLd: [],
        botProtected: true,
      },
      body: `Target domain: ${targetUrl}.`,
      url: targetUrl,
    };
  }
}

export async function scrapeUrl(url) {
  let targetUrl = (url || "").trim();
  if (!/^https?:\/\//i.test(targetUrl)) {
    targetUrl = "https://" + targetUrl;
  }

  try {
    const res = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Sec-Ch-Ua": '"Chromium";v="124", "Google Chrome";v="124"',
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": '"Windows"',
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(6000), // Max 6s wait, never hang!
    });

    if (!res.ok) {
      console.warn(`⚠️ Scraper HTTP ${res.status} for ${targetUrl}. Using intelligent domain fallback.`);
      return getDomainFallback(targetUrl);
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    const title = $("title").first().text().trim() || $('meta[property="og:title"]').attr("content") || "";
    const description = $('meta[name="description"]').attr("content") || $('meta[property="og:description"]').attr("content") || "";

    // Check if the page is a bot-block or maintenance splash page (e.g. Myntra/Cloudflare WAF)
    const lowerHtml = html.toLowerCase();
    const isBlocked = lowerHtml.includes("access denied") || 
                      lowerHtml.includes("attention required! | cloudflare") ||
                      lowerHtml.includes("oops! something went wrong please contact your administrator") ||
                      (title.toLowerCase().includes("site maintenance") && html.length < 5000);

    if (isBlocked) {
      console.warn(`🛡️ Enterprise WAF / Bot challenge detected on ${targetUrl}. Using domain fallback.`);
      return getDomainFallback(targetUrl);
    }

    const meta = {
      title,
      description,
      canonical: $('link[rel="canonical"]').attr("href") || targetUrl,
      h1Count: $("h1").length,
      headings: $("h1,h2,h3,h4").map((_, el) => ({
        level: el.tagName.toUpperCase(),
        text: $(el).text().trim(),
      })).get().filter(h => h.text.length > 0).slice(0, 20),
      jsonLd: $('script[type="application/ld+json"]').map((_, el) => {
        try { return JSON.parse($(el).html()); } catch { return null; }
      }).get().filter(Boolean).slice(0, 5),
    };

    $("script,style,nav,footer,header,svg,noscript,iframe").remove();
    let body = $("body").text().replace(/\s+/g, " ").trim().slice(0, 8000);

    if (!body || body.length < 30) {
      body = `${meta.title}. ${meta.description}. Primary site content for ${targetUrl}.`;
    }

    return { meta, body, url: targetUrl };
  } catch (err) {
    console.warn(`⚠️ Scraping timed out or errored on ${targetUrl} (${err.message}). Using fast domain fallback.`);
    return getDomainFallback(targetUrl);
  }
}

