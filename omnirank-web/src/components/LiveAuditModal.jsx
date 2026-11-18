import React, { useState, useEffect } from 'react';
import { 
  X, Sparkles, Check, Copy, Download, RefreshCw, AlertCircle, Mail, Send, CheckCircle2 
} from 'lucide-react';
import { API_BASE_URL } from '../config/api';

export default function LiveAuditModal({ isOpen, onClose, initialUrl = '', initialKeyword = '' }) {
  const [url, setUrl] = useState(initialUrl || '');
  const [keyword, setKeyword] = useState(initialKeyword || '');
  const [emailInput, setEmailInput] = useState('');
  const [subscribeWeekly, setSubscribeWeekly] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [auditData, setAuditData] = useState(null);
  const [activeTab, setActiveTab] = useState('aeo');
  const [copied, setCopied] = useState(false);
  const [recentAudits, setRecentAudits] = useState([]);

  // Email sending state
  const [isSendingMail, setIsSendingMail] = useState(false);
  const [mailStatus, setMailStatus] = useState({ type: '', message: '', previewUrl: null });

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
    setMailStatus({ type: '', message: '', previewUrl: null });

    try {
      const res = await fetch(`${API_BASE_URL}/api/audit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url.trim(),
          keyword: keyword.trim() || 'best guide'
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

      // If user provided email upfront, auto-dispatch email report
      if (emailInput && emailInput.includes('@')) {
        sendAuditEmailDirect(emailInput, data, subscribeWeekly);
      }
    } catch (err) {
      setError(err.message || `Could not connect to backend server on ${API_BASE_URL}`);
    } finally {
      setLoading(false);
    }
  };

  const sendAuditEmailDirect = async (targetEmail, currentAudit, shouldSubscribeWeekly) => {
    if (!targetEmail || !targetEmail.includes('@')) return;
    setIsSendingMail(true);
    setMailStatus({ type: '', message: '', previewUrl: null });

    try {
      const payload = {
        email: targetEmail.trim(),
        auditData: {
          ...currentAudit,
          url: url.trim() || currentAudit.url,
          targetKeyword: keyword.trim() || currentAudit.targetKeyword || 'best guide',
        },
        subscribeWeekly: shouldSubscribeWeekly,
      };

      const mailRes = await fetch(`${API_BASE_URL}/api/audit/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const mailJson = await mailRes.json();
      if (!mailRes.ok) {
        throw new Error(mailJson.error || 'Failed to dispatch email.');
      }

      setMailStatus({
        type: 'success',
        message: mailJson.message || `Audit report successfully emailed to ${targetEmail}!`,
        previewUrl: mailJson.previewUrl || null,
      });
    } catch (mailErr) {
      setMailStatus({
        type: 'error',
        message: mailErr.message || 'Email delivery failed. Please try again.',
        previewUrl: null,
      });
    } finally {
      setIsSendingMail(false);
    }
  };

  const handleManualSendEmail = (e) => {
    if (e) e.preventDefault();
    if (!emailInput || !emailInput.includes('@')) {
      setMailStatus({ type: 'error', message: 'Kripya valid email address darj karein.' });
      return;
    }
    sendAuditEmailDirect(emailInput, auditData, subscribeWeekly);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-neutral-950/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl border border-neutral-200 shadow-2xl overflow-hidden my-auto text-left max-h-[92vh] flex flex-col animate-fade-in-up">
        
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-neutral-900 text-base">OmniRank Live Audit Engine</h3>
              <p className="text-xs text-neutral-500">Tri-Engine Analysis: SEO • AEO • GEO</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-200/60 hover:bg-neutral-200 flex items-center justify-center text-neutral-600 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Audit Inputs Bar */}
          <form onSubmit={handleRunAudit} className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200/80 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-6">
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Target Website URL</label>
                <input 
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-neutral-200 text-sm focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600/20"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Focus Keyword</label>
                <input 
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="example domain"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-neutral-200 text-sm focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600/20"
                />
              </div>

              <div className="sm:col-span-3 flex items-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl bg-neutral-950 hover:bg-neutral-800 disabled:opacity-50 text-white font-bold text-sm flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-purple-400" />}
                  <span>{loading ? 'Auditing...' : 'Run Audit'}</span>
                </button>
              </div>
            </div>

            {/* Optional Email & Weekly Report Toggle at Input Stage */}
            <div className="pt-2 border-t border-neutral-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex-1 max-w-sm flex items-center gap-2">
                <Mail className="w-4 h-4 text-purple-600 shrink-0" />
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Your email (to receive report & weekly updates)"
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-neutral-200 text-xs focus:outline-none focus:border-purple-600"
                />
              </div>

              <label className="flex items-center gap-2 text-neutral-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={subscribeWeekly}
                  onChange={(e) => setSubscribeWeekly(e.target.checked)}
                  className="w-4 h-4 rounded border-neutral-300 text-purple-600 focus:ring-purple-500 accent-purple-600"
                />
                <span>Also send <strong>Weekly Growth Reports</strong> every Monday</span>
              </label>
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
                <p className="text-xs text-neutral-500 mt-1">Make sure the backend is running at <code>{API_BASE_URL}</code></p>
              </div>
            </div>
          )}

          {/* Audit Results Container */}
          {auditData && !loading && (
            <div className="space-y-6">
              
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

              {/* Email Delivery & Weekly Reports Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50/90 via-white to-purple-50/40 border border-purple-200/80 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center">
                      <Mail className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                        Email This Audit Report & Weekly Reports
                      </h4>
                      <p className="text-[11px] text-neutral-500">
                        Receive complete HTML breakdown in your inbox + automated Monday updates.
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleManualSendEmail} className="space-y-2.5">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="email"
                      required
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="Enter email (e.g. founder@domain.com)"
                      className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-neutral-200 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-purple-600"
                    />
                    <button
                      type="submit"
                      disabled={isSendingMail}
                      className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs whitespace-nowrap"
                    >
                      {isSendingMail ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      <span>{isSendingMail ? 'Sending...' : 'Send Audit Report'}</span>
                    </button>
                  </div>

                  <label className="flex items-center gap-2 text-xs text-neutral-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={subscribeWeekly}
                      onChange={(e) => setSubscribeWeekly(e.target.checked)}
                      className="w-4 h-4 rounded border-neutral-300 text-purple-600 focus:ring-purple-500 accent-purple-600"
                    />
                    <span>Also subscribe to <strong>Weekly Growth Reports</strong> every Monday at 09:00 AM</span>
                  </label>
                </form>

                {mailStatus.message && (
                  <div
                    className={`mt-3 p-3 rounded-xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                      mailStatus.type === 'success'
                        ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                        : 'bg-rose-50 text-rose-900 border border-rose-200'
                    }`}
                  >
                    <span className="flex items-center gap-1.5 font-medium">
                      {mailStatus.type === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                      {mailStatus.message}
                    </span>
                    {mailStatus.previewUrl && (
                      <a
                        href={mailStatus.previewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-purple-700 hover:text-purple-900 underline text-[11px] whitespace-nowrap ml-5 sm:ml-0"
                      >
                        View Sent Email Preview ↗
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Result Details Tabs */}
              <div className="border-b border-neutral-200 flex gap-2 sm:gap-4 overflow-x-auto pb-1 scrollbar-none text-xs sm:text-sm font-semibold">
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

              {/* Export Button Row */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-neutral-500">
                  Audit ID: <code className="bg-neutral-100 px-1.5 py-0.5 rounded text-[11px] font-mono">{auditData.id || 'live'}</code>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`${API_BASE_URL}/api/audit/${auditData.id}/markdown`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Markdown</span>
                  </a>
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
                      setKeyword(item.targetKeyword);
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
