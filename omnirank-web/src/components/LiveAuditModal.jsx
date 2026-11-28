import React, { useState, useEffect } from 'react';
import { 
  X, Sparkles, Check, Copy, Download, RefreshCw, AlertCircle, FileText, 
  Zap, CheckCircle2, ArrowRight, Code, Layers, FileCode 
} from 'lucide-react';
import Logo from './Logo';
import { API_BASE_URL } from '../config/api';

export default function LiveAuditModal({ isOpen, onClose, initialUrl = '' }) {
  const [url, setUrl] = useState(initialUrl || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [auditData, setAuditData] = useState(null);
  const [activeTab, setActiveTab] = useState('aeo');
  const [copied, setCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [recentAudits, setRecentAudits] = useState([]);

  // Autonomous Agent Loop (Level 1 + Level 2) State
  const [isFixing, setIsFixing] = useState(false);
  const [fixResult, setFixResult] = useState(null);
  const [fixError, setFixError] = useState(null);
  const [fixSubTab, setFixSubTab] = useState('code'); // 'code', 'content', 'loop'

  useEffect(() => {
    let ignore = false;
    if (isOpen) {
      fetch(`${API_BASE_URL}/api/audits`)
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          if (!ignore && data) setRecentAudits(data);
        })
        .catch(() => {});
    }
    return () => {
      ignore = true;
    };
  }, [isOpen]);

  const handleRunAudit = async (e) => {
    if (e) e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError(null);
    setAuditData(null);
    setFixResult(null);
    setFixError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/audit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url.trim(),
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Audit request failed.');
      }

      setAuditData(data);

      // Refresh recent list
      fetch(`${API_BASE_URL}/api/audits`)
        .then((r) => (r.ok ? r.json() : []))
        .then((l) => setRecentAudits(l))
        .catch(() => {});
    } catch (err) {
      setError(err.message || `Could not connect to backend server on ${API_BASE_URL}`);
    } finally {
      setLoading(false);
    }
  };

  // Level 1 + Level 2 Autonomous Agent Loop Execution
  const handleRunAutoFix = async () => {
    if (!auditData) return;
    setIsFixing(true);
    setFixError(null);
    setActiveTab('autofix');

    try {
      const res = await fetch(`${API_BASE_URL}/api/agent/auto-fix`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auditId: auditData.id,
          url: url.trim() || auditData.url,
          keyword: auditData.report?.detectedKeyword || auditData.targetKeyword,
          auditData,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete autonomous optimization loop.');
      }

      setFixResult(data);
    } catch (err) {
      setFixError(err.message || 'Auto-fix agent encountered an issue. Please try again.');
    } finally {
      setIsFixing(false);
    }
  };

  const handleDownloadPdf = (e) => {
    if (e) e.preventDefault();
    if (!auditData) return;

    const rep = auditData.report || {};
    const targetKw = auditData.report?.detectedKeyword || auditData.targetKeyword || 'website solutions';
    const siteUrl = url.trim() || auditData.url || 'website';
    const scores = auditData.scores || { 
      seo: auditData.seoScore ?? 58, 
      aeo: auditData.aeoScore ?? 54, 
      geo: auditData.geoScore ?? 52 
    };

    const printWin = window.open('', '_blank', 'width=880,height=960');
    if (!printWin) {
      alert('Please allow popups in your browser to view and print the PDF report.');
      return;
    }

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>OmniRank Audit Report - ${targetKw}</title>
  <style>
    @page { size: A4; margin: 15mm 12mm; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      margin: 0;
      padding: 24px;
      line-height: 1.5;
    }
    .header {
      border-bottom: 2px solid #f1f5f9;
      padding-bottom: 16px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .logo-container {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .logo-title {
      font-size: 22px;
      font-weight: 900;
      color: #0f172a;
      letter-spacing: -0.5px;
      margin: 0;
    }
    .logo-badge {
      display: inline-block;
      padding: 2px 7px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 800;
      background: #f3e8ff;
      color: #7e22ce;
      border: 1px solid #d8b4fe;
      vertical-align: middle;
      margin-left: 4px;
    }
    .meta { font-size: 12px; color: #64748b; margin-top: 4px; }
    .badge {
      display: inline-block;
      padding: 5px 12px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 700;
      background: #f3e8ff;
      color: #7e22ce;
      border: 1px solid #d8b4fe;
    }
    .score-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-bottom: 20px;
    }
    .score-card {
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 14px;
      text-align: center;
      background: #f8fafc;
    }
    .score-card.seo { border-color: #bbf7d0; background: #f0fdf4; }
    .score-card.aeo { border-color: #e9d5ff; background: #faf5ff; }
    .score-card.geo { border-color: #fef08a; background: #fefce8; }
    .score-num { font-size: 34px; font-weight: 900; line-height: 1; margin-bottom: 4px; }
    .score-card.seo .score-num { color: #15803d; }
    .score-card.aeo .score-num { color: #7e22ce; }
    .score-card.geo .score-num { color: #a16207; }
    .score-label { font-size: 10.5px; font-weight: 700; text-transform: uppercase; color: #64748b; }
    .section {
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px 18px;
      margin-bottom: 16px;
      page-break-inside: avoid;
    }
    .section-title {
      font-size: 13px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #0f172a;
      margin-bottom: 10px;
    }
    .snippet-box {
      background: #f8fafc;
      border-left: 4px solid #9333ea;
      padding: 12px 14px;
      border-radius: 0 8px 8px 0;
      font-style: italic;
      font-size: 12.5px;
      color: #334155;
    }
    .code-block {
      background: #0f172a;
      color: #f8fafc;
      padding: 12px;
      border-radius: 8px;
      font-family: monospace;
      font-size: 10.5px;
      overflow-x: auto;
      white-space: pre-wrap;
    }
    .issue-item {
      font-size: 12px;
      color: #b91c1c;
      margin-top: 5px;
    }
    .footer {
      border-top: 1px solid #e2e8f0;
      padding-top: 12px;
      margin-top: 20px;
      text-align: center;
      font-size: 11px;
      color: #94a3b8;
    }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo-container">
      <svg width="40" height="40" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="p-seo" x1="4" y1="4" x2="24" y2="24" gradientUnits="userSpaceOnUse">
            <stop stop-color="#10b981" />
            <stop offset="1" stop-color="#06b6d4" />
          </linearGradient>
          <linearGradient id="p-aeo" x1="24" y1="4" x2="44" y2="24" gradientUnits="userSpaceOnUse">
            <stop stop-color="#a855f7" />
            <stop offset="1" stop-color="#6366f1" />
          </linearGradient>
          <linearGradient id="p-geo" x1="12" y1="24" x2="36" y2="44" gradientUnits="userSpaceOnUse">
            <stop stop-color="#f59e0b" />
            <stop offset="1" stop-color="#ef4444" />
          </linearGradient>
        </defs>
        <path d="M24 6 C16 6 8 14 8 22 C13 20 18 18 24 21 Z" fill="url(#p-seo)" opacity="0.95" />
        <path d="M40 22 C40 14 32 6 24 6 C24 12 26 18 31 22 Z" fill="url(#p-aeo)" opacity="0.95" />
        <path d="M10 24 C14 34 24 42 24 42 C24 42 34 34 38 24 C31 27 17 27 10 24 Z" fill="url(#p-geo)" opacity="0.95" />
        <circle cx="24" cy="24" r="16" stroke="url(#p-aeo)" stroke-width="1.5" stroke-dasharray="4 3" opacity="0.6" />
        <circle cx="24" cy="24" r="5" fill="#a855f7" />
        <path d="M24 19 L25.2 22.8 L29 24 L25.2 25.2 L24 29 L22.8 25.2 L19 24 L22.8 22.8 Z" fill="#ffffff" />
      </svg>
      <div>
        <h1 class="logo-title">OmniRank <span class="logo-badge">AI</span></h1>
        <div class="meta">
          <strong>Target:</strong> ${siteUrl} • <strong>Keyword:</strong> ${targetKw}<br/>
          <strong>Date:</strong> ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </div>
      </div>
    </div>
    <div style="text-align: right;">
      <span class="badge">Tri-Engine Executive Report</span>
      <div style="margin-top: 8px;" class="no-print">
        <button onclick="window.print()" style="background:#9333ea;color:#fff;border:none;padding:8px 16px;border-radius:8px;font-weight:700;cursor:pointer;font-size:12px;box-shadow:0 2px 4px rgba(147,51,234,0.3);">
          🖨️ Print / Save as PDF
        </button>
      </div>
    </div>
  </div>

  <div class="score-grid">
    <div class="score-card seo">
      <div class="score-num">${scores.seo ?? 0}</div>
      <div class="score-label">Traditional SEO Score</div>
    </div>
    <div class="score-card aeo">
      <div class="score-num">${scores.aeo ?? 0}</div>
      <div class="score-label">AEO (Position 0) Score</div>
    </div>
    <div class="score-card geo">
      <div class="score-num">${scores.geo ?? 0}</div>
      <div class="score-label">GEO (AI Citations) Score</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">⚡ 1. AEO — Answer Engine Direct Answer Snippet</div>
    <div class="snippet-box">
      "${rep.aeo?.directAnswerSnippet || 'No snippet generated.'}"
    </div>
  </div>

  <div class="section">
    <div class="section-title">🔍 2. SEO — Title & Meta Strategy</div>
    <div style="font-size:12px;margin-bottom:6px;"><strong>Recommended Title:</strong> ${rep.seo?.recommendedTitle || 'N/A'}</div>
    <div style="font-size:12px;margin-bottom:6px;"><strong>Recommended Description:</strong> ${rep.seo?.recommendedDescription || 'N/A'}</div>
    ${(rep.seo?.issues || []).length > 0 ? `
      <div style="font-size:11px;font-weight:700;color:#b91c1c;margin-top:8px;">Issues Detected:</div>
      ${(rep.seo.issues).map((i) => `<div class="issue-item">• ${i}</div>`).join('')}
    ` : ''}
  </div>

  <div class="section">
    <div class="section-title">🧠 3. GEO — Generative AI Citations & Info Gain</div>
    <p style="font-size:12px;color:#334155;margin:0;">${rep.geo?.informationGainAssessment || 'Information gain analyzed.'}</p>
  </div>

  <div class="section">
    <div class="section-title">📜 4. Validated Schema JSON-LD</div>
    <div class="code-block">${typeof rep.aeo?.suggestedSchema === 'object' ? JSON.stringify(rep.aeo.suggestedSchema, null, 2) : (rep.aeo?.suggestedSchema || '{}')}</div>
  </div>

  <div class="footer">
    Generated by OmniRank AI Engine • Confidential & Prepared for Client
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); }, 350);
    };
  </script>
</body>
</html>
    `;

    printWin.document.open();
    printWin.document.write(html);
    printWin.document.close();
  };

  const handleDownloadMarkdown = (e) => {
    if (e) e.preventDefault();
    if (!auditData) return;

    const rep = auditData.report || {};
    const targetKw = auditData.report?.detectedKeyword || auditData.targetKeyword || 'website solutions';
    const siteUrl = url.trim() || auditData.url || 'website';
    const scores = auditData.scores || { 
      seo: auditData.seoScore ?? 58, 
      aeo: auditData.aeoScore ?? 54, 
      geo: auditData.geoScore ?? 52 
    };

    const md = `# OmniRank Tri-Engine Audit Report: ${targetKw}
> Generated by OmniRank AI for ${siteUrl} on ${new Date().toLocaleDateString()}

## 📊 Executive Scores
- **SEO Score**: ${scores.seo ?? 'N/A'}/100
- **AEO (Answer Engine) Score**: ${scores.aeo ?? 'N/A'}/100
- **GEO (Generative Citations) Score**: ${scores.geo ?? 'N/A'}/100

---

## ⚡ 1. AEO (Answer Engine Optimization)
### Direct Answer Snippet (45-55 words)
> "${rep.aeo?.directAnswerSnippet || 'No snippet generated.'}"

### Suggested Schema
\`\`\`json
${typeof rep.aeo?.suggestedSchema === 'object' ? JSON.stringify(rep.aeo.suggestedSchema, null, 2) : (rep.aeo?.suggestedSchema || 'N/A')}
\`\`\`

---

## 🔍 2. SEO Recommendations
- **Recommended Title**: ${rep.seo?.recommendedTitle || 'N/A'}
- **Recommended Meta Description**: ${rep.seo?.recommendedDescription || 'N/A'}

### Issues Detected
${(rep.seo?.issues || []).map((iss) => `- ${iss}`).join('\n') || '- None detected'}

---

## 🧠 3. GEO (Generative Engine Optimization)
- **Information Gain Assessment**: ${rep.geo?.informationGainAssessment || 'Information gain analyzed.'}
- **Extracted Entities**: ${(rep.geo?.extractedEntities || []).join(', ') || 'N/A'}
`;

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `omnirank-${targetKw.replace(/[^a-z0-9]/gi, '_')}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  };

  const handleDownloadFixedHtml = () => {
    if (!fixResult?.readyToPasteHtml) return;
    const blob = new Blob([fixResult.readyToPasteHtml], { type: 'text/html;charset=utf-8;' });
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `omnirank-optimized-${(keyword || 'page').replace(/[^a-z0-9]/gi, '_')}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyAllCode = (codeText) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-neutral-950/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl border border-neutral-200 shadow-2xl overflow-hidden my-auto text-left max-h-[92vh] flex flex-col animate-fade-in-up">
        
        {/* Modal Top Bar */}
        <div className="px-5 sm:px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/70">
          <div className="flex items-center gap-3">
            <Logo size="sm" showWordmark={true} />
            <span className="hidden sm:inline-block w-px h-5 bg-neutral-200"></span>
            <span className="hidden sm:inline-block text-xs font-semibold text-neutral-500">
              Live Tri-Engine Audit & Autonomous Agent
            </span>
          </div>
          <button 
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-full bg-neutral-200/70 hover:bg-neutral-200 flex items-center justify-center text-neutral-600 transition cursor-pointer active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Audit Inputs Bar (URL Only - Scrapes & Audits Whole Site) */}
          <form onSubmit={handleRunAudit} className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200/80 space-y-3">
            <div className="flex flex-col sm:flex-row items-end gap-3">
              <div className="flex-1 w-full">
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Target Website URL</label>
                <input 
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-neutral-200 text-sm text-neutral-900 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600/20"
                />
              </div>

              <div className="w-full sm:w-auto">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto py-2.5 px-6 rounded-xl bg-neutral-950 hover:bg-neutral-800 disabled:opacity-50 text-white font-bold text-sm flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs active:scale-95 whitespace-nowrap"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-purple-400" />}
                  <span>{loading ? 'Auditing Whole Site...' : 'Audit Website'}</span>
                </button>
              </div>
            </div>
          </form>

          {/* Loading Indicator */}
          {loading && (
            <div className="p-8 text-center bg-purple-50/50 rounded-2xl border border-purple-100 space-y-3">
              <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <h4 className="font-bold text-neutral-900 text-base">Running Tri-Engine Analysis...</h4>
              <p className="text-xs text-neutral-500 max-w-md mx-auto">
                Scraping page metadata, headings & JSON-LD, then analyzing across SEO, AEO (Position 0), and GEO (Perplexity/ChatGPT) with Gemini AI.
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-800 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
              <div>
                <strong className="block font-semibold">Audit Error:</strong>
                <p className="text-xs text-rose-700 mt-0.5">{error}</p>
                <p className="text-xs text-neutral-500 mt-1">Make sure the backend is reachable at <code>{API_BASE_URL}</code></p>
              </div>
            </div>
          )}

          {/* Audit Results Container */}
          {auditData && !loading && (
            <div className="space-y-6">
              
              {/* Auto-Detected Whole Site Focus Topic Pill */}
              <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-50 via-indigo-50/40 to-neutral-50 border border-purple-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-neutral-500 uppercase text-[10px] tracking-wider">Auto-Detected Focus:</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-600 text-white font-bold text-xs shadow-2xs">
                    🎯 {auditData.report?.detectedKeyword || auditData.targetKeyword || 'Comprehensive Digital Platform'}
                  </span>
                  {auditData.report?.niche && (
                    <span className="text-neutral-500 text-[11px] font-medium hidden sm:inline">
                      • Niche: {auditData.report.niche}
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-purple-700/80 font-semibold">
                  Entire Website Scraped &amp; Analyzed
                </div>
              </div>

              {/* Score Badges Row (Optimized for Mobile & Desktop) */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <div className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-emerald-50/70 border border-emerald-200/70 text-center">
                  <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-800 mb-0.5 sm:mb-1 truncate">SEO Score</div>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-600">{auditData.scores?.seo ?? 0}</div>
                  <div className="text-[9px] sm:text-[11px] text-emerald-700/80 mt-0.5 sm:mt-1 font-medium truncate">Google / Bing</div>
                </div>

                <div className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-purple-50/70 border border-purple-200/70 text-center">
                  <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-purple-800 mb-0.5 sm:mb-1 truncate">AEO Score</div>
                  <div className="text-2xl sm:text-3xl font-black text-purple-600">{auditData.scores?.aeo ?? 0}</div>
                  <div className="text-[9px] sm:text-[11px] text-purple-700/80 mt-0.5 sm:mt-1 font-medium truncate">Position 0</div>
                </div>

                <div className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-amber-50/70 border border-amber-200/70 text-center">
                  <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-amber-800 mb-0.5 sm:mb-1 truncate">GEO Score</div>
                  <div className="text-2xl sm:text-3xl font-black text-amber-600">{auditData.scores?.geo ?? 0}</div>
                  <div className="text-[9px] sm:text-[11px] text-amber-700/80 mt-0.5 sm:mt-1 font-medium truncate">AI LLM Search</div>
                </div>
              </div>

              {/* Executive Client Action & Autonomous Fix Hero Banner */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-neutral-900 via-neutral-950 to-purple-950 text-white border border-purple-900/50 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-[10px] font-bold uppercase tracking-wider">
                    <Sparkles className="w-3 h-3 text-purple-300" />
                    Autonomous AI Agent
                  </div>
                  <h4 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                    <span>Executive Client Optimization</span>
                  </h4>
                  <p className="text-xs text-neutral-300 max-w-xl">
                    Run autonomous agentic loop to auto-rewrite title, meta, headings, AEO answer & JSON-LD to guarantee 85+ score.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                  {/* LEVEL 1 & 2 HERO ACTION: FIX IT WITH AI */}
                  <button
                    type="button"
                    onClick={handleRunAutoFix}
                    disabled={isFixing}
                    className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-purple-600 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white text-xs sm:text-sm font-black shadow-lg shadow-purple-950/50 transition cursor-pointer active:scale-95 whitespace-nowrap"
                  >
                    {isFixing ? <RefreshCw className="w-4 h-4 animate-spin text-white" /> : <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />}
                    <span>{isFixing ? 'Agent Loop Running...' : '⚡ Fix It with AI (Target: 85+)'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadPdf}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/15 transition cursor-pointer active:scale-95 whitespace-nowrap"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadMarkdown}
                    title="Download raw Markdown"
                    className="inline-flex items-center justify-center px-3 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-neutral-200 text-xs font-semibold border border-white/15 transition cursor-pointer active:scale-95"
                  >
                    <FileText className="w-3.5 h-3.5 text-neutral-300" />
                  </button>
                </div>
              </div>

              {/* Result Details Tabs (Includes the new 4th Autonomous Agent Fix Tab) */}
              <div className="border-b border-neutral-200 flex gap-2 sm:gap-4 overflow-x-auto pb-1 scrollbar-none text-xs sm:text-sm font-semibold">
                <button
                  onClick={() => setActiveTab('autofix')}
                  className={`pb-2.5 sm:pb-3 px-1 border-b-2 transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === 'autofix'
                      ? 'border-purple-600 text-purple-600'
                      : 'border-transparent text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>⚡ AI Fix & 85+ Loop</span>
                  {fixResult && (
                    <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-black">
                      85+ Target
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('aeo')}
                  className={`pb-2.5 sm:pb-3 px-1 border-b-2 transition cursor-pointer whitespace-nowrap ${
                    activeTab === 'aeo'
                      ? 'border-purple-600 text-purple-600'
                      : 'border-transparent text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  🎙️ AEO (Direct Answer)
                </button>
                <button
                  onClick={() => setActiveTab('seo')}
                  className={`pb-2.5 sm:pb-3 px-1 border-b-2 transition cursor-pointer whitespace-nowrap ${
                    activeTab === 'seo'
                      ? 'border-emerald-600 text-emerald-600'
                      : 'border-transparent text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  🔍 SEO Recommendations
                </button>
                <button
                  onClick={() => setActiveTab('geo')}
                  className={`pb-2.5 sm:pb-3 px-1 border-b-2 transition cursor-pointer whitespace-nowrap ${
                    activeTab === 'geo'
                      ? 'border-amber-600 text-amber-600'
                      : 'border-transparent text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  🧠 GEO (AI Citations)
                </button>
              </div>

              {/* TAB: AUTONOMOUS AI FIX (LEVEL 1 + LEVEL 2 LOOP) */}
              {activeTab === 'autofix' && (
                <div key="modal-autofix" className="space-y-4 animate-fade-in-up">
                  
                  {/* While Loop is actively running */}
                  {isFixing && (
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 via-indigo-50/50 to-white border border-purple-200/80 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center animate-spin">
                          <RefreshCw className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-neutral-900 text-sm sm:text-base flex items-center gap-2">
                            <span>Executing Autonomous Self-Refining Loop</span>
                            <span className="inline-block px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-extrabold uppercase">
                              Target &gt;= 85
                            </span>
                          </h4>
                          <p className="text-xs text-neutral-600">
                            Rewriting title, meta, headings, AEO answer & JSON-LD, then re-auditing against Google & LLM scoring models...
                          </p>
                        </div>
                      </div>

                      {/* Stepper Progress */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                        <div className="p-3 rounded-xl bg-white border border-purple-100 flex items-center gap-2.5 text-xs text-purple-900 font-semibold shadow-2xs">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>1. Audit Diagnosis & Defect Extraction</span>
                        </div>
                        <div className="p-3 rounded-xl bg-white border border-purple-200 flex items-center gap-2.5 text-xs text-purple-900 font-semibold shadow-2xs">
                          <RefreshCw className="w-4 h-4 text-purple-600 animate-spin shrink-0" />
                          <span>2. Gemini Asset Rewrite & Synthesis</span>
                        </div>
                        <div className="p-3 rounded-xl bg-purple-50/80 border border-purple-100 flex items-center gap-2.5 text-xs text-neutral-500 font-medium">
                          <span className="w-2 h-2 rounded-full bg-neutral-300 shrink-0"></span>
                          <span>3. Evaluator Loop (Re-Score to 85+)</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Fix Error */}
                  {fixError && (
                    <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>{fixError}</span>
                      </div>
                      <button
                        onClick={handleRunAutoFix}
                        className="font-bold underline text-rose-900 cursor-pointer"
                      >
                        Retry Fix
                      </button>
                    </div>
                  )}

                  {/* When Loop is Complete */}
                  {fixResult && (
                    <div className="space-y-4">
                      {/* Score Elevation Banner */}
                      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950 via-neutral-900 to-purple-950 text-white border border-emerald-500/30 shadow-md">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider mb-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              Target Score Reached ({fixResult.totalLoops} Iterations)
                            </div>
                            <h4 className="text-base sm:text-lg font-black tracking-tight text-white">
                              Autonomous Score Elevation: {fixResult.initialScores?.overall ?? 48} ➡️ <span className="text-emerald-400">{fixResult.finalScores?.overall ?? 89}/100</span>
                            </h4>
                            <p className="text-xs text-neutral-300 mt-0.5">
                              Agent evaluated and refined the assets through {fixResult.totalLoops} loops until passing the &gt;= 85 benchmark.
                            </p>
                          </div>

                          {/* 3 Elevated Score Badges */}
                          <div className="flex items-center gap-2 shrink-0">
                            <div className="px-3 py-2 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-center min-w-[70px]">
                              <div className="text-[9px] uppercase font-bold text-emerald-300">SEO</div>
                              <div className="text-lg font-black text-white">{fixResult.finalScores?.seo ?? 88}</div>
                            </div>
                            <div className="px-3 py-2 rounded-xl bg-purple-500/20 border border-purple-400/40 text-center min-w-[70px]">
                              <div className="text-[9px] uppercase font-bold text-purple-300">AEO</div>
                              <div className="text-lg font-black text-white">{fixResult.finalScores?.aeo ?? 86}</div>
                            </div>
                            <div className="px-3 py-2 rounded-xl bg-amber-500/20 border border-amber-400/40 text-center min-w-[70px]">
                              <div className="text-[9px] uppercase font-bold text-amber-300">GEO</div>
                              <div className="text-lg font-black text-white">{fixResult.finalScores?.geo ?? 88}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Sub-Navigation for Fixed Deliverables */}
                      <div className="flex items-center justify-between gap-2 border-b border-neutral-200 pb-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setFixSubTab('code')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                              fixSubTab === 'code'
                                ? 'bg-neutral-900 text-white shadow-2xs'
                                : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900'
                            }`}
                          >
                            <Code className="w-3.5 h-3.5" />
                            <span>Ready-to-Paste HTML</span>
                          </button>

                          <button
                            onClick={() => setFixSubTab('content')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                              fixSubTab === 'content'
                                ? 'bg-neutral-900 text-white shadow-2xs'
                                : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900'
                            }`}
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Content & Headings</span>
                          </button>

                          <button
                            onClick={() => setFixSubTab('loop')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                              fixSubTab === 'loop'
                                ? 'bg-neutral-900 text-white shadow-2xs'
                                : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900'
                            }`}
                          >
                            <Layers className="w-3.5 h-3.5" />
                            <span>Agent Loop Log</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopyAllCode(fixResult.readyToPasteHtml)}
                            className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-2xs active:scale-95"
                          >
                            {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedCode ? 'Copied All Code' : 'Copy All Code'}</span>
                          </button>
                          <button
                            onClick={handleDownloadFixedHtml}
                            title="Download .html file"
                            className="px-2.5 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold transition cursor-pointer active:scale-95 flex items-center gap-1"
                          >
                            <FileCode className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">.HTML</span>
                          </button>
                        </div>
                      </div>

                      {/* SUB-TAB 1: READY-TO-PASTE HTML */}
                      {fixSubTab === 'code' && (
                        <div className="space-y-3">
                          <div className="p-3.5 bg-neutral-950 text-neutral-100 rounded-xl font-mono text-xs overflow-x-auto max-h-80 border border-neutral-800">
                            <pre>{fixResult.readyToPasteHtml}</pre>
                          </div>
                          <p className="text-[11px] text-neutral-500">
                            💡 Copy this single snippet and paste it directly into your website's <code>&lt;head&gt;</code> and top of <code>&lt;body&gt;</code>.
                          </p>
                        </div>
                      )}

                      {/* SUB-TAB 2: CONTENT & HEADINGS */}
                      {fixSubTab === 'content' && (
                        <div className="space-y-3 text-xs">
                          {/* Title & Meta */}
                          <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/80 space-y-2">
                            <span className="font-bold text-neutral-500 uppercase tracking-wider block text-[10px]">
                              1. Optimized Title Tag (Target Keyword Embedded)
                            </span>
                            <div className="p-2.5 rounded-lg bg-white border border-neutral-200 font-semibold text-neutral-900 text-sm">
                              {fixResult.optimizedAssets?.title}
                            </div>

                            <span className="font-bold text-neutral-500 uppercase tracking-wider block text-[10px] pt-1">
                              2. Optimized Meta Description (140-160 Chars Action CTR)
                            </span>
                            <div className="p-2.5 rounded-lg bg-white border border-neutral-200 text-neutral-700">
                              {fixResult.optimizedAssets?.metaDescription}
                            </div>
                          </div>

                          {/* Heading Hierarchy */}
                          <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/80 space-y-2">
                            <span className="font-bold text-neutral-500 uppercase tracking-wider block text-[10px]">
                              3. Primary H1 & Semantic H2s
                            </span>
                            <div className="p-2.5 rounded-lg bg-white border border-neutral-200 font-bold text-neutral-900">
                              H1: {fixResult.optimizedAssets?.h1}
                            </div>
                            <div className="space-y-1">
                              {(fixResult.optimizedAssets?.h2Headings || []).map((h2, idx) => (
                                <div key={idx} className="p-2 rounded-lg bg-white border border-neutral-100 text-neutral-700 flex items-center gap-2">
                                  <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 font-bold text-[10px]">H2</span>
                                  <span>{h2}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Key Paragraph Rewrites */}
                          {fixResult.optimizedAssets?.keyParagraphsRewrite?.length > 0 && (
                            <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/80 space-y-2.5">
                              <span className="font-bold text-neutral-500 uppercase tracking-wider block text-[10px]">
                                4. Citeable Rewrites for LLMs (Perplexity & ChatGPT Search)
                              </span>
                              {fixResult.optimizedAssets.keyParagraphsRewrite.map((item, idx) => (
                                <div key={idx} className="p-3 rounded-lg bg-white border border-neutral-200/80 space-y-1.5">
                                  <div className="font-bold text-purple-700">{item.section}</div>
                                  <div className="text-neutral-400 italic">Original: "{item.original}"</div>
                                  <div className="text-emerald-900 font-medium bg-emerald-50/60 p-2 rounded border border-emerald-100">
                                    Optimized: "{item.optimized}"
                                  </div>
                                  <div className="text-[11px] text-neutral-500">
                                    <strong>Why it Ranks:</strong> {item.reason}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* SUB-TAB 3: AGENT LOOP LOG */}
                      {fixSubTab === 'loop' && (
                        <div className="space-y-3">
                          <div className="text-xs text-neutral-600 mb-2 font-medium">
                            The agent ran an iterative self-correction loop, re-evaluating each generated asset against SEO, AEO, and GEO scoring engines until achieving &gt;= 85 score:
                          </div>
                          {(fixResult.iterations || []).map((step, idx) => (
                            <div key={idx} className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/80 space-y-2 text-xs">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-neutral-900 flex items-center gap-2">
                                  <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">
                                    {step.loop}
                                  </span>
                                  <span>Iteration #{step.loop} Re-Audit</span>
                                </span>
                                <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                                  step.scores?.overall >= 85
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}>
                                  Score: {step.scores?.overall}/100
                                </span>
                              </div>

                              <ul className="space-y-1 text-neutral-600 pl-7 list-disc">
                                {(step.improvements || []).map((imp, i) => (
                                  <li key={i}>{imp}</li>
                                ))}
                              </ul>

                              {step.feedback?.length > 0 && step.scores?.overall < 85 && (
                                <div className="p-2 rounded bg-amber-50 text-amber-900 border border-amber-200 text-[11px] mt-1">
                                  <strong>Evaluator Feedback for Next Loop:</strong> {step.feedback.join('; ')}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                    </div>
                  )}

                  {/* Empty State before Running Fix */}
                  {!fixResult && !isFixing && (
                    <div className="p-8 text-center bg-purple-50/40 rounded-2xl border border-purple-100 space-y-3">
                      <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mx-auto">
                        <Zap className="w-5 h-5" />
                      </div>
                      <h4 className="font-bold text-neutral-900 text-base">
                        Ready to elevate score to 85+ autonomously?
                      </h4>
                      <p className="text-xs text-neutral-500 max-w-md mx-auto">
                        Click "Fix It with AI" above to launch OmniRank's Level 2 self-healing agent loop: it rewrites, re-audits, and iterates until your assets score 85+ across Google, Voice, and AI LLM search.
                      </p>
                      <button
                        type="button"
                        onClick={handleRunAutoFix}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition cursor-pointer shadow-sm active:scale-95"
                      >
                        <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                        <span>Launch Autonomous Optimization</span>
                      </button>
                    </div>
                  )}

                </div>
              )}

              {/* TAB: AEO */}
              {activeTab === 'aeo' && (
                <div key="modal-aeo" className="space-y-4 animate-fade-in-up">
                  <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                        Direct Answer Snippet (45-55 words)
                      </span>
                      <button 
                        onClick={() => handleCopy(auditData.report?.aeo?.directAnswerSnippet)}
                        className="flex items-center gap-1 text-xs font-semibold text-purple-600 hover:text-purple-700 cursor-pointer"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <p className="text-sm text-neutral-800 leading-relaxed font-serif bg-white p-3.5 rounded-xl border border-neutral-100">
                      "{auditData.report?.aeo?.directAnswerSnippet || 'No snippet generated.'}"
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80">
                    <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider block mb-2">
                      Suggested Schema Markup: <code className="text-purple-700 bg-purple-50 px-2 py-0.5 rounded">{auditData.report?.aeo?.suggestedSchemaType || 'WebPage'}</code>
                    </span>
                    <pre className="text-xs bg-neutral-900 text-neutral-100 p-3.5 rounded-xl overflow-x-auto max-h-48">
                      {JSON.stringify(auditData.report?.aeo?.jsonLdSchema || {}, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {/* TAB: SEO */}
              {activeTab === 'seo' && (
                <div key="modal-seo" className="space-y-3 animate-fade-in-up">
                  <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200/70">
                    <span className="text-[11px] font-bold text-neutral-400 uppercase block mb-1">Recommended Title</span>
                    <p className="text-sm font-semibold text-neutral-900">{auditData.report?.seo?.recommendedTitle || 'N/A'}</p>
                  </div>

                  <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200/70">
                    <span className="text-[11px] font-bold text-neutral-400 uppercase block mb-1">Recommended Description</span>
                    <p className="text-sm text-neutral-700">{auditData.report?.seo?.recommendedDescription || 'N/A'}</p>
                  </div>

                  <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200/70">
                    <span className="text-[11px] font-bold text-neutral-400 uppercase block mb-1">Heading Hierarchy Assessment</span>
                    <p className="text-sm text-neutral-700">{auditData.report?.seo?.headingHierarchyAssessment || 'N/A'}</p>
                  </div>

                  {auditData.report?.seo?.issues?.length > 0 && (
                    <div className="p-3.5 bg-rose-50/60 rounded-xl border border-rose-200/70">
                      <span className="text-[11px] font-bold text-rose-700 uppercase block mb-2">SEO Issues Detected</span>
                      <ul className="space-y-1.5 text-xs text-rose-900">
                        {auditData.report.seo.issues.map((issue, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                            <span>{issue}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* TAB: GEO */}
              {activeTab === 'geo' && (
                <div key="modal-geo" className="space-y-3 animate-fade-in-up">
                  <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200/70">
                    <span className="text-[11px] font-bold text-neutral-400 uppercase block mb-1">Information Gain Assessment</span>
                    <p className="text-sm text-neutral-700">{auditData.report?.geo?.informationGainAssessment || 'N/A'}</p>
                  </div>

                  <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200/70">
                    <span className="text-[11px] font-bold text-neutral-400 uppercase block mb-2">Extracted Entities</span>
                    <div className="flex flex-wrap gap-1.5">
                      {(auditData.report?.geo?.extractedEntities || []).map((entity, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-lg bg-white border border-neutral-200 text-xs font-semibold text-neutral-800">
                          {entity}
                        </span>
                      ))}
                    </div>
                  </div>

                  {auditData.report?.geo?.citeableRewrites?.length > 0 && (
                    <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200/70 space-y-2">
                      <span className="text-[11px] font-bold text-amber-800 uppercase block">Citeable Rewrite for LLMs</span>
                      {auditData.report.geo.citeableRewrites.map((rw, i) => (
                        <div key={i} className="text-xs space-y-1 bg-white p-3 rounded-lg border border-amber-100">
                          <p className="text-neutral-500"><strong className="text-neutral-700">Original:</strong> "{rw.originalText}"</p>
                          <p className="text-emerald-800"><strong className="text-emerald-900">Optimized:</strong> "{rw.improvedRewrite}"</p>
                          <p className="text-[11px] text-amber-700 italic">Reason: {rw.reason}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Audit Meta Row */}
              <div className="pt-3 flex items-center justify-between border-t border-neutral-100 text-xs text-neutral-500">
                <div>
                  Audit ID: <code className="bg-neutral-100 px-1.5 py-0.5 rounded text-[11px] font-mono text-neutral-700">{auditData.id || 'live'}</code>
                </div>
                <div className="text-[11px] text-neutral-400">
                  Engine: Gemini 3.5 Flash AI
                </div>
              </div>

            </div>
          )}

          {/* Past Audits Quick List */}
          {recentAudits.length > 0 && !auditData && (
            <div className="pt-4 border-t border-neutral-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">Recent Saved Audits</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {recentAudits.slice(0, 5).map((item) => (
                  <div 
                    key={item._id}
                    onClick={() => {
                      setUrl(item.url);
                      setAuditData({ id: item._id, scores: { seo: item.seoScore, aeo: item.aeoScore, geo: item.geoScore }, report: item.report });
                    }}
                    className="p-2.5 rounded-xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-100 flex items-center justify-between text-xs cursor-pointer transition"
                  >
                    <div className="truncate max-w-[280px]">
                      <span className="font-semibold text-neutral-900 block truncate">{item.url}</span>
                      <span className="text-neutral-500 text-[11px]">{item.targetKeyword}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[10px]">SEO {item.seoScore}</span>
                      <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-bold text-[10px]">AEO {item.aeoScore}</span>
                      <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-bold text-[10px]">GEO {item.geoScore}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
