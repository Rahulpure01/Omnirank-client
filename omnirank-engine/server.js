// server.js
import dotenv from "dotenv";
dotenv.config({ quiet: true });
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./config/db.js";
import Audit from "./models/Audit.js";
import WeeklySubscriber from "./models/WeeklySubscriber.js";
import { scrapeUrl } from "./scraper.js";
import { runAudit } from "./audit.js";
import { exportToMarkdown, generateMetaSnippet, generateSchemaScript } from "./services/optimizer.js";
import { getSampleWeeklyReport, generateWeeklyReport } from "./services/weeklyReport.js";
import { sendWeeklyReportEmail, sendAuditReportEmail } from "./services/mailer.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// 1. Health check
app.get("/health", (_, res) => res.json({ ok: true, engine: "OmniRank AI" }));

// 2. Scraper debug endpoint
app.get("/test-scrape", async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({ error: "URL query parameter zaroori hai. Example: /test-scrape?url=https://example.com" });
    }
    const data = await scrapeUrl(url);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 3. Main Tri-Engine Audit Pipeline (Scrape -> Gemini -> MongoDB Save)
app.post("/api/audit", async (req, res) => {
  try {
    const { url, keyword } = req.body;
    if (!url || !keyword) {
      return res.status(400).json({ error: "url aur keyword dono zaroori hain" });
    }

    console.log(`🔍 [1/3] Scraping: ${url}`);
    const content = await scrapeUrl(url);

    console.log(`🤖 [2/3] Analyzing with Gemini AI for keyword: "${keyword}"...`);
    const report = await runAudit(content, keyword);

    let docId = Date.now().toString();
    try {
      console.log(`💾 [3/3] Saving report to MongoDB...`);
      const doc = await Audit.create({
        url: content.url || url,
        targetKeyword: keyword,
        seoScore: report.seo?.score ?? 0,
        aeoScore: report.aeo?.score ?? 0,
        geoScore: report.geo?.score ?? 0,
        report,
      });
      docId = doc._id;
    } catch (saveErr) {
      console.warn("⚠️ Could not persist audit to DB (proceeding with live results):", saveErr.message);
    }

    res.json({
      id: docId,
      scores: { 
        seo: report.seo?.score ?? 0, 
        aeo: report.aeo?.score ?? 0, 
        geo: report.geo?.score ?? 0 
      },
      report,
    });
  } catch (e) {
    console.error("Audit Route Error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

// 4. History endpoint (Cursor pagination)
app.get("/api/audits/history", async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const filter = req.query.cursor ? { _id: { $lt: req.query.cursor } } : {};
    const items = await Audit.find(filter)
      .select("url targetKeyword seoScore aeoScore geoScore createdAt")
      .sort({ _id: -1 })
      .limit(limit);

    res.json({
      items: items || [],
      nextCursor: (items && items.length === limit) ? items[items.length - 1]._id : null,
    });
  } catch (e) {
    res.json({ items: [], nextCursor: null });
  }
});

// 5. Recent audits list (For frontend & UI)
app.get("/api/audits", async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const list = await Audit.find()
      .select("url targetKeyword seoScore aeoScore geoScore report createdAt")
      .sort({ createdAt: -1 })
      .limit(limit);
    res.json(list || []);
  } catch (e) {
    res.json([]);
  }
});

// 6. Export audit report as Markdown file
app.get(["/api/audit/:id/markdown", "/api/audits/:id/markdown"], async (req, res) => {
  try {
    const doc = await Audit.findById(req.params.id);
    if (!doc) return res.status(404).send("Audit not found");
    const markdown = exportToMarkdown(doc);
    const filename = `omnirank-${(doc.targetKeyword || "audit").replace(/[^a-z0-9]/gi, "_")}.md`;
    res.setHeader("Content-Type", "text/markdown");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(markdown);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 7. Single audit by ID (Supports both /api/audit/:id and /api/audits/:id)
app.get(["/api/audit/:id", "/api/audits/:id"], async (req, res) => {
  try {
    const doc = await Audit.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: "Audit not found" });
    res.json(doc);
  } catch (e) {
    res.status(400).json({ error: "Invalid id" });
  }
});

// 8. Weekly Growth Report Sample (For instant fast UI preview)
app.get("/api/report/sample", (req, res) => {
  const domain = req.query.domain || "sayasample.com";
  res.json(getSampleWeeklyReport(domain));
});

// 9. Generate AI Weekly Growth Report for Domain
app.post("/api/report/weekly", async (req, res) => {
  try {
    const { domain } = req.body;
    const report = await generateWeeklyReport(domain || "yourdomain.com");
    res.json(report);
  } catch (e) {
    console.error("Weekly Report Error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

// 10. Subscribe user for Monday Weekly Growth Reports & send immediate first report
app.post("/api/report/subscribe", async (req, res) => {
  try {
    const { email, domain = "sayasample.com" } = req.body;
    if (!email || !email.includes("@")) {
      return res.status(400).json({ error: "Valid email address zaroori hai" });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanDomain = domain.replace(/^https?:\/\//i, "").replace(/\/.*$/, "").trim();

    // 1. Upsert subscriber in MongoDB
    const subscriber = await WeeklySubscriber.findOneAndUpdate(
      { email: cleanEmail },
      { domain: cleanDomain, active: true, lastSentAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // 2. Fetch/generate report data
    const reportData = getSampleWeeklyReport(cleanDomain);

    // 3. Send email to user
    const emailResult = await sendWeeklyReportEmail(cleanEmail, cleanDomain, reportData);

    res.json({
      ok: true,
      message: `Weekly Growth Report subscribed! Monday report sent to ${cleanEmail}.`,
      subscriber,
      previewUrl: emailResult.previewUrl,
    });
  } catch (e) {
    console.error("Subscription & Mail Error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

// 11. Send one-off Weekly Growth Report directly to email
app.post("/api/report/send-email", async (req, res) => {
  try {
    const { email, domain = "sayasample.com" } = req.body;
    if (!email || !email.includes("@")) {
      return res.status(400).json({ error: "Valid email address zaroori hai" });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanDomain = domain.replace(/^https?:\/\//i, "").replace(/\/.*$/, "").trim();
    const reportData = getSampleWeeklyReport(cleanDomain);

    const emailResult = await sendWeeklyReportEmail(cleanEmail, cleanDomain, reportData);

    res.json({
      ok: true,
      message: `Weekly Growth Report email successfully sent to ${cleanEmail}!`,
      previewUrl: emailResult.previewUrl,
    });
  } catch (e) {
    console.error("Send Email Error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

// 12. List all active Monday subscribers
app.get("/api/report/subscribers", async (_, res) => {
  try {
    const list = await WeeklySubscriber.find({ active: true }).sort({ createdAt: -1 });
    res.json(list);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 13. Send Tri-Engine Audit Report to user's email (+ optional weekly report subscription)
app.post("/api/audit/send-email", async (req, res) => {
  try {
    const { email, auditData, subscribeWeekly = false } = req.body;
    if (!email || !email.includes("@")) {
      return res.status(400).json({ error: "Valid email address zaroori hai" });
    }
    if (!auditData) {
      return res.status(400).json({ error: "Audit report data zaroori hai" });
    }

    const cleanEmail = email.trim().toLowerCase();
    const emailResult = await sendAuditReportEmail(cleanEmail, auditData);

    let weeklySubscribed = false;
    if (subscribeWeekly) {
      const cleanDomain = (auditData.url || "sayasample.com")
        .replace(/^https?:\/\//i, "")
        .replace(/\/.*$/, "")
        .trim();

      await WeeklySubscriber.findOneAndUpdate(
        { email: cleanEmail },
        { domain: cleanDomain, active: true, lastSentAt: new Date() },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      weeklySubscribed = true;
    }

    res.json({
      ok: true,
      message: `Audit report sent to ${cleanEmail}!${weeklySubscribed ? " (Also subscribed for Monday Weekly Reports)" : ""}`,
      previewUrl: emailResult.previewUrl,
      weeklySubscribed,
    });
  } catch (e) {
    console.error("Audit Email Error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 OmniRank Engine listening on http://localhost:${PORT}`);
});

connectDB().catch((err) => {
  console.warn("Initial DB connection warning:", err.message);
});
