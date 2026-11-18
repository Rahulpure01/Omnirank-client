import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';
import {
  TrendingUp,
  TrendingDown,
  Bot,
  Calendar,
  BarChart3,
  MousePointerClick,
  Eye,
  CheckCircle2,
  Circle,
  FileCheck,
  Sparkles,
  Zap,
  Mail,
  ExternalLink,
  X,
  Clock,
  Send,
  Check,
  AlertCircle,
} from 'lucide-react';

const INITIAL_REPORT = {
  domain: 'sayasample.com',
  weekPeriod: 'Nov 8 - Nov 15, 2026',
  reportDate: 'Monday 09:00 AM',
  traffic: {
    clicks: { current: 14820, previous: 11540, changePct: '+28.4%' },
    impressions: { current: 182400, previous: 128300, changePct: '+42.1%' },
    avgPosition: { current: 8.4, previous: 11.2, change: '+2.8 spots' },
    source: 'Google Search Console (Synced)',
  },
  rankings: {
    climbers: [
      { keyword: 'sayasample.com reviews & features', from: 6, to: 1, change: '+5', volume: '8.1k', page: '/features' },
      { keyword: 'ai answer engine optimization', from: 18, to: 4, change: '+14', volume: '4.8k', page: '/blog/aeo-guide' },
      { keyword: 'voice search ranking factors', from: 24, to: 9, change: '+15', volume: '3.2k', page: '/blog/voice-search' },
    ],
    droppers: [
      { keyword: 'legacy organic search tools', from: 12, to: 18, change: '-6', volume: '1.4k', page: '/legacy-tools' },
    ],
  },
  aiCitations: {
    totalMentions: 342,
    growthPct: '+64%',
    breakdown: [
      { engine: 'ChatGPT Search (GPT-4o)', mentions: 154, sharePct: 45, samplePrompt: 'Best tools for AI SEO and schema automation: cites sayasample.com as primary reference.' },
      { engine: 'Google AI Overviews (SGE)', mentions: 98, sharePct: 29, samplePrompt: 'Direct answer snapshot cited sayasample.com/blog for 48-word definition.' },
      { engine: 'Perplexity Pro', mentions: 62, sharePct: 18, samplePrompt: 'Synthesized answer included 2 domain footnotes.' },
      { engine: 'Claude 3.5 Sonnet', mentions: 28, sharePct: 8, samplePrompt: 'Included in top 3 recommended platforms.' },
    ],
  },
  contentPublished: [
    {
      title: 'The 2026 Guide to AI Search Citations & Answer Engines',
      wordCount: 2240,
      publishedDate: '4 days ago',
      indexedHours: '2.8 hrs',
      schemaStatus: 'FAQ + HowTo Valid',
      primaryKeyword: 'ai search citations',
    },
    {
      title: 'How We Scaled Organic Traffic Across Perplexity and ChatGPT',
      wordCount: 1890,
      publishedDate: '6 days ago',
      indexedHours: '3.2 hrs',
      schemaStatus: 'Article + Entity Valid',
      primaryKeyword: 'perplexity seo',
    },
  ],
  homework: [
    {
      id: 1,
      task: 'Add FAQ JSON-LD Schema to /blog/aeo-guide',
      impact: 'High',
      estimatedTime: '8 mins',
      reason: 'Keyword jumped to #4; adding direct answer schema unlocks Google AI Overview snapshot.',
      completed: false,
    },
    {
      id: 2,
      task: 'Insert 3 contextual internal links from /features to newly indexed AI Search Guide',
      impact: 'Medium',
      estimatedTime: '5 mins',
      reason: 'Strengthens page authority flow for the new article.',
      completed: false,
    },
    {
      id: 3,
      task: 'Update outdated 2025 comparison table on /legacy-tools',
      impact: 'High',
      estimatedTime: '12 mins',
      reason: 'Recovers the 6 lost rank positions by refreshing content freshness.',
      completed: false,
    },
    {
      id: 4,
      task: 'Inspect Mobile indexing speed on Google Search Console',
      impact: 'Quick',
      estimatedTime: '2 mins',
      reason: 'Ensure mobile Core Web Vitals remain in the 90+ green zone.',
      completed: true,
    },
  ],
};

export default function WeeklyReport() {
  const [reportData, setReportData] = useState(INITIAL_REPORT);
  const [activeCategory, setActiveCategory] = useState('traffic'); // 'traffic' | 'rankings' | 'ai-search' | 'content' | 'homework'
  const [viewMode, setViewMode] = useState('breakdown'); // 'breakdown' | 'calendar'
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [homeworkState, setHomeworkState] = useState(INITIAL_REPORT.homework);

  // Email form state
  const [emailInput, setEmailInput] = useState('');
  const [isSendingMail, setIsSendingMail] = useState(false);
  const [mailStatus, setMailStatus] = useState({ type: '', message: '', previewUrl: null });

  // Load sample report from backend on mount
  useEffect(() => {
    let isMounted = true;
    fetch(`${API_BASE_URL}/api/report/sample`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && isMounted) {
          setReportData(data);
          if (data.homework) setHomeworkState(data.homework);
        }
      })
      .catch(() => {
        // Safe silent fallback to INITIAL_REPORT
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const toggleTask = (id) => {
    setHomeworkState((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const handleSendReportEmail = async (e) => {
    if (e) e.preventDefault();
    if (!emailInput || !emailInput.includes('@')) {
      setMailStatus({ type: 'error', message: 'Valid email address darj karein.' });
      return;
    }

    setIsSendingMail(true);
    setMailStatus({ type: '', message: '', previewUrl: null });

    try {
      const response = await fetch(`${API_BASE_URL}/api/report/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailInput,
          domain: reportData.domain || 'sayasample.com',
        }),
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || 'Email bhejne me issue aaya');
      }

      setMailStatus({
        type: 'success',
        message: `Report sent to ${emailInput}! Subscribed for Monday 09:00 AM delivery.`,
        previewUrl: resData.previewUrl || null,
      });
      setEmailInput('');
    } catch (err) {
      setMailStatus({
        type: 'error',
        message: err.message || 'Server se connect nahi ho saka. Kripya dobara try karein.',
      });
    } finally {
      setIsSendingMail(false);
    }
  };

  const featureTabs = [
    {
      id: 'traffic',
      tag: 'TRAFFIC',
      title: 'Clicks & impressions',
      desc: 'Week-over-week growth, pulled straight from Google Search Console.',
    },
    {
      id: 'rankings',
      tag: 'RANKINGS',
      title: 'Keywords on the move',
      desc: 'Which keywords climbed, which dropped, and which pages drove it.',
    },
    {
      id: 'ai-search',
      tag: 'AI SEARCH',
      title: 'AI citations',
      desc: 'Where your site got cited in ChatGPT, Perplexity and Google AI.',
    },
    {
      id: 'content',
      tag: 'CONTENT',
      title: 'What was published',
      desc: 'Every article that went live last week, with its first results.',
    },
    {
      id: 'homework',
      tag: 'HOMEWORK',
      title: "This week's tasks",
      desc: '3-10 easy tasks that YOU can do to keep growing.',
    },
  ];

  return (
    <section id="weekly-report" className="py-14 sm:py-20 lg:py-24 bg-neutral-50/50 border-b border-neutral-200/60 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-14">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200/80 text-purple-700 text-xs font-semibold uppercase tracking-wider mb-2.5 sm:mb-3">
              <Mail className="w-3.5 h-3.5" />
              <span>Automated Growth Engine</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-neutral-950 tracking-tight">
              Weekly growth report
            </h2>
          </div>

          <button
            onClick={() => setShowEmailModal(true)}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-white hover:bg-neutral-100 text-neutral-800 text-xs font-semibold border border-neutral-200 shadow-2xs transition cursor-pointer"
          >
            <Mail className="w-3.5 h-3.5 text-purple-600" />
            <span>Preview Monday Email</span>
            <ExternalLink className="w-3 h-3 text-neutral-400" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: 5 Clean Cards (Zero Extra Badges) */}
          <div className="lg:col-span-5 space-y-3 sm:space-y-3.5">
            {featureTabs.map((item) => {
              const isActive = activeCategory === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setActiveCategory(item.id);
                    setViewMode('breakdown');
                  }}
                  className={`p-4 sm:p-5 rounded-2xl border transition cursor-pointer text-left relative ${
                    isActive
                      ? 'bg-white border-purple-500 shadow-md ring-2 ring-purple-500/10'
                      : 'bg-white/80 border-neutral-200/80 hover:bg-white hover:border-neutral-300 shadow-2xs'
                  }`}
                >
                  <span className="text-[11px] font-bold text-neutral-400 tracking-wider uppercase block mb-1">
                    {item.tag}
                  </span>

                  <h3 className="text-base sm:text-lg font-bold text-neutral-900 mb-1">
                    {item.title}
                  </h3>
                  
                  <p className="text-xs sm:text-sm text-neutral-600 font-normal leading-relaxed">
                    {item.desc}
                  </p>

                  {isActive && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden sm:block">
                      <div className="w-2 h-2 rounded-full bg-purple-600 animate-ping"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Column: Interactive Report & Email Subscription */}
          <div className="lg:col-span-7 lg:sticky lg:top-28">
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-neutral-200/90 shadow-[0_20px_50px_rgba(0,0,0,0.06)] p-4 sm:p-7 lg:p-9 text-left">
              
              {/* Card Header & Switcher */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-neutral-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                    <span className="text-[11px] sm:text-xs font-bold text-purple-700 uppercase tracking-wider">
                      INCLUDED IN EVERY PLAN
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-neutral-950 tracking-tight">
                    In your inbox every Monday
                  </h3>
                  <p className="text-neutral-500 text-xs sm:text-sm font-normal mt-0.5">
                    One email, one page. What grew last week and what to do this week.
                  </p>
                </div>

                {/* View Switcher Pills */}
                <div className="inline-flex p-1 bg-neutral-100 rounded-xl self-start sm:self-center shrink-0">
                  <button
                    onClick={() => setViewMode('breakdown')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      viewMode === 'breakdown'
                        ? 'bg-white text-neutral-950 shadow-2xs'
                        : 'text-neutral-500 hover:text-neutral-900'
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>Live Metrics</span>
                  </button>
                  <button
                    onClick={() => setViewMode('calendar')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      viewMode === 'calendar'
                        ? 'bg-white text-neutral-950 shadow-2xs'
                        : 'text-neutral-500 hover:text-neutral-900'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Schedule</span>
                  </button>
                </div>
              </div>

              {/* View 1: Live Interactive Breakdown */}
              {viewMode === 'breakdown' && (
                <div className="pt-6 animate-fade-in-up">
                  {/* Category Nav Tabs */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-5 border-b border-neutral-100 scrollbar-none text-xs">
                    {[
                      { id: 'traffic', label: '1. Traffic & Clicks' },
                      { id: 'rankings', label: '2. Rankings' },
                      { id: 'ai-search', label: '3. AI Citations' },
                      { id: 'content', label: '4. Published' },
                      { id: 'homework', label: "5. This Week's Tasks" },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveCategory(tab.id)}
                        className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer whitespace-nowrap ${
                          activeCategory === tab.id
                            ? 'bg-purple-600 text-white'
                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* 1. Traffic Breakdown */}
                  {activeCategory === 'traffic' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100">
                          <div className="flex items-center justify-between text-xs text-emerald-800 font-semibold mb-1">
                            <span className="flex items-center gap-1.5">
                              <MousePointerClick className="w-3.5 h-3.5" /> Total Clicks
                            </span>
                            <span className="flex items-center gap-0.5 text-emerald-700 font-bold text-[11px] sm:text-xs">
                              <TrendingUp className="w-3.5 h-3.5" /> {reportData.traffic.clicks.changePct}
                            </span>
                          </div>
                          <div className="text-2xl sm:text-3xl font-black text-emerald-950">
                            {reportData.traffic.clicks.current.toLocaleString()}
                          </div>
                          <div className="text-[10px] sm:text-[11px] text-emerald-700/80 mt-1">
                            vs {reportData.traffic.clicks.previous.toLocaleString()} pichle hafte
                          </div>
                        </div>

                        <div className="p-3.5 sm:p-4 rounded-2xl bg-blue-50/70 border border-blue-100">
                          <div className="flex items-center justify-between text-xs text-blue-800 font-semibold mb-1">
                            <span className="flex items-center gap-1.5">
                              <Eye className="w-3.5 h-3.5" /> Impressions
                            </span>
                            <span className="flex items-center gap-0.5 text-blue-700 font-bold text-[11px] sm:text-xs">
                              <TrendingUp className="w-3.5 h-3.5" /> {reportData.traffic.impressions.changePct}
                            </span>
                          </div>
                          <div className="text-2xl sm:text-3xl font-black text-blue-950">
                            {reportData.traffic.impressions.current.toLocaleString()}
                          </div>
                          <div className="text-[10px] sm:text-[11px] text-blue-700/80 mt-1">
                            vs {reportData.traffic.impressions.previous.toLocaleString()} pichle hafte
                          </div>
                        </div>
                      </div>

                      {/* Mini weekly bar chart visualization */}
                      <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                        <div className="flex items-center justify-between text-xs text-neutral-500 mb-3">
                          <span className="font-semibold text-neutral-800">Weekly Daily Clicks Velocity</span>
                          <span className="text-[11px] text-purple-700 font-medium">Synced via Google Search Console</span>
                        </div>
                        <div className="grid grid-cols-7 gap-2 items-end h-20 pt-2">
                          {[45, 52, 60, 68, 85, 92, 100].map((h, i) => (
                            <div key={i} className="flex flex-col items-center gap-1 h-full justify-end">
                              <div
                                style={{ height: `${h}%` }}
                                className={`w-full rounded-md transition-all duration-700 ${
                                  i === 6 ? 'bg-purple-600 shadow-xs' : 'bg-neutral-300 hover:bg-neutral-400'
                                }`}
                              ></div>
                              <span className="text-[10px] text-neutral-400 font-medium">
                                {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 2. Rankings Breakdown */}
                  {activeCategory === 'rankings' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
                        <span className="font-bold text-neutral-800">Top Climbers & Movement</span>
                        <span>Source: Google Organic & AEO</span>
                      </div>

                      <div className="space-y-2">
                        {reportData.rankings.climbers.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-3 bg-neutral-50 hover:bg-white rounded-xl border border-neutral-200/70 flex items-center justify-between transition"
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-xs">
                                <TrendingUp className="w-3 h-3" />
                                {item.change}
                              </span>
                              <div>
                                <div className="text-xs sm:text-sm font-bold text-neutral-900">
                                  {item.keyword}
                                </div>
                                <div className="text-[11px] text-neutral-500 font-mono">
                                  {item.page}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs font-black text-neutral-900">
                                Pos #{item.to}
                              </div>
                              <div className="text-[10px] text-neutral-400">
                                was #{item.from} • {item.volume} vol
                              </div>
                            </div>
                          </div>
                        ))}

                        {reportData.rankings.droppers.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-3 bg-rose-50/40 rounded-xl border border-rose-100 flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-bold text-xs">
                                <TrendingDown className="w-3 h-3" />
                                {item.change}
                              </span>
                              <div>
                                <div className="text-xs sm:text-sm font-semibold text-neutral-900">
                                  {item.keyword}
                                </div>
                                <div className="text-[11px] text-rose-600/80 font-mono">
                                  {item.page}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs font-bold text-neutral-900">
                                Pos #{item.to}
                              </div>
                              <div className="text-[10px] text-neutral-400">
                                was #{item.from}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 3. AI Citations Breakdown */}
                  {activeCategory === 'ai-search' && (
                    <div className="space-y-4">
                      <div className="p-3.5 bg-indigo-50/70 rounded-2xl border border-indigo-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Bot className="w-5 h-5 text-indigo-600" />
                          <div>
                            <div className="text-xs font-bold text-indigo-950">Total AI Citations Tracked</div>
                            <div className="text-[11px] text-indigo-700">Across generative answer engines</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-black text-indigo-950">
                            {reportData.aiCitations.totalMentions}
                          </span>
                          <span className="text-xs font-bold text-indigo-700 ml-1.5">
                            {reportData.aiCitations.growthPct}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        {reportData.aiCitations.breakdown.map((item, idx) => (
                          <div key={idx} className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 text-xs">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-neutral-800">{item.engine}</span>
                              <span className="font-semibold text-purple-700">{item.mentions} mentions ({item.sharePct}%)</span>
                            </div>
                            <div className="w-full bg-neutral-200 h-1.5 rounded-full overflow-hidden mb-2">
                              <div
                                style={{ width: `${item.sharePct}%` }}
                                className="bg-purple-600 h-full rounded-full"
                              ></div>
                            </div>
                            <p className="text-[11px] text-neutral-500 italic bg-white p-2 rounded-lg border border-neutral-100">
                              "{item.samplePrompt}"
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 4. Content Published Breakdown */}
                  {activeCategory === 'content' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
                        <span className="font-bold text-neutral-800">Articles Live Last Week</span>
                        <span>Indexed & Schema Status</span>
                      </div>

                      {reportData.contentPublished.map((item, idx) => (
                        <div key={idx} className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100 text-xs space-y-2">
                          <div className="flex items-start justify-between gap-3">
                            <h4 className="font-bold text-neutral-900 text-sm">{item.title}</h4>
                            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold whitespace-nowrap text-[11px]">
                              {item.indexedHours}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-neutral-500 text-[11px]">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {item.publishedDate}
                            </span>
                            <span>•</span>
                            <span>{item.wordCount.toLocaleString()} words</span>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-purple-700 font-semibold">
                              <FileCheck className="w-3.5 h-3.5" /> {item.schemaStatus}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 5. Homework (Actionable Tasks) */}
                  {activeCategory === 'homework' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
                        <span className="font-bold text-neutral-800">This Week's Action Tasks</span>
                        <span className="text-purple-700 font-semibold">Click to mark complete</span>
                      </div>

                      <div className="space-y-2.5">
                        {homeworkState.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => toggleTask(item.id)}
                            className={`p-3.5 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
                              item.completed
                                ? 'bg-neutral-50 border-neutral-200 opacity-60'
                                : 'bg-white border-neutral-200 hover:border-purple-300 shadow-2xs'
                            }`}
                          >
                            <button className="mt-0.5 text-neutral-400 hover:text-purple-600 transition">
                              {item.completed ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <Circle className="w-4 h-4 text-neutral-300" />
                              )}
                            </button>
                            <div className="flex-1 text-xs">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <span
                                  className={`font-bold ${
                                    item.completed ? 'line-through text-neutral-500' : 'text-neutral-900'
                                  }`}
                                >
                                  {item.task}
                                </span>
                                <span
                                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                    item.impact === 'High'
                                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                      : item.impact === 'Medium'
                                      ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                      : 'bg-neutral-100 text-neutral-600'
                                  }`}
                                >
                                  {item.impact} Impact • {item.estimatedTime}
                                </span>
                              </div>
                              <p className="text-[11px] text-neutral-500 leading-relaxed font-normal">
                                {item.reason}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* View 2: Schedule & Calendar Overview */}
              {viewMode === 'calendar' && (
                <div className="pt-6 animate-fade-in-up">
                  {/* Mini Calendar Highlight Widget */}
                  <div className="p-5 bg-neutral-50 rounded-2xl border border-neutral-100 mb-6">
                    <div className="grid grid-cols-7 gap-2 text-center text-xs font-medium text-neutral-400 mb-3">
                      <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
                    </div>
                    <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold">
                      <span className="text-neutral-300"></span>
                      <span className="text-neutral-300"></span>
                      <span className="text-neutral-700 py-1.5">1</span>
                      <span className="text-neutral-700 py-1.5">2</span>
                      <span className="text-neutral-700 py-1.5">3</span>
                      <span className="text-neutral-700 py-1.5">4</span>
                      <span className="py-1.5 rounded-lg bg-purple-600 text-white shadow-xs">5</span>
                      
                      <span className="text-neutral-700 py-1.5">6</span>
                      <span className="text-neutral-700 py-1.5">7</span>
                      <span className="text-neutral-700 py-1.5">8</span>
                      <span className="text-neutral-700 py-1.5">9</span>
                      <span className="text-neutral-700 py-1.5">10</span>
                      <span className="text-neutral-700 py-1.5">11</span>
                      <span className="py-1.5 rounded-lg bg-purple-600 text-white shadow-xs">12</span>

                      <span className="text-neutral-700 py-1.5">13</span>
                      <span className="text-neutral-700 py-1.5">14</span>
                      <span className="text-neutral-700 py-1.5">15</span>
                      <span className="text-neutral-700 py-1.5">16</span>
                      <span className="text-neutral-700 py-1.5">17</span>
                      <span className="text-neutral-700 py-1.5">18</span>
                      <span className="py-1.5 rounded-lg bg-purple-600 text-white shadow-xs">19</span>

                      <span className="text-neutral-700 py-1.5">20</span>
                      <span className="text-neutral-700 py-1.5">21</span>
                      <span className="text-neutral-700 py-1.5">22</span>
                      <span className="text-neutral-700 py-1.5">23</span>
                      <span className="text-neutral-700 py-1.5">24</span>
                      <span className="text-neutral-700 py-1.5">25</span>
                      <span className="py-1.5 rounded-lg bg-purple-600 text-white shadow-xs">26</span>
                    </div>

                    <div className="mt-4 pt-3 border-t border-neutral-200/60 flex items-center justify-between text-xs text-neutral-500">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                        <span>Report delivery day — every Monday 09:00 AM</span>
                      </div>
                      <span className="text-purple-700 font-semibold">100% Automated</span>
                    </div>
                  </div>

                  <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center">
                        <Zap className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-neutral-900">Zero Configuration Setup</div>
                        <div className="text-neutral-500">Google Search Console + AI Crawlers automatically monitored.</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Automated Email Subscription & Delivery Bar */}
              <div className="mt-7 pt-6 border-t border-neutral-100">
                <div className="flex items-center gap-2 mb-2 text-xs font-bold text-neutral-900">
                  <Mail className="w-4 h-4 text-purple-600" />
                  <span>Receive this report in your inbox every Monday</span>
                </div>
                
                <form onSubmit={handleSendReportEmail} className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <input
                      type="email"
                      required
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="Enter your email (e.g. founder@domain.com)"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-purple-500 focus:bg-white transition"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSendingMail}
                    className="px-5 py-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 whitespace-nowrap shadow-xs"
                  >
                    {isSendingMail ? (
                      <span>Sending...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5 text-purple-400" />
                        <span>Email Me Report</span>
                      </>
                    )}
                  </button>
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
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
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
                        className="inline-flex items-center gap-1 font-bold text-purple-700 hover:text-purple-900 underline text-[11px] whitespace-nowrap ml-5 sm:ml-0"
                      >
                        View Sent Email Preview ↗
                      </a>
                    )}
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* Monday Email Simulation Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 bg-neutral-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-neutral-200 shadow-2xl p-6 sm:p-8 animate-fade-in-up text-left">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-neutral-900">
                    Weekly Growth Report — Monday Edition
                  </h3>
                  <p className="text-xs text-neutral-500">
                    From: OmniRank AI Engine &lt;reports@omnirank.ai&gt;
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowEmailModal(false)}
                className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4 text-neutral-600" />
              </button>
            </div>

            <div className="space-y-6 text-sm text-neutral-700">
              <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200/80">
                <div className="text-xs font-bold text-neutral-400 uppercase mb-1">Website Summary</div>
                <div className="text-lg font-bold text-neutral-900">{reportData.domain}</div>
                <div className="text-xs text-neutral-500 mt-0.5">Period: {reportData.weekPeriod}</div>
              </div>

              {/* 1. Traffic */}
              <div>
                <h4 className="font-extrabold text-neutral-900 mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  1. Traffic Growth
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-neutral-50 rounded-xl">
                    <span className="text-neutral-500 block">Total Clicks</span>
                    <span className="text-lg font-bold text-neutral-900">{reportData.traffic.clicks.current.toLocaleString()}</span>
                    <span className="text-emerald-600 font-semibold ml-2">{reportData.traffic.clicks.changePct}</span>
                  </div>
                  <div className="p-3 bg-neutral-50 rounded-xl">
                    <span className="text-neutral-500 block">Impressions</span>
                    <span className="text-lg font-bold text-neutral-900">{reportData.traffic.impressions.current.toLocaleString()}</span>
                    <span className="text-emerald-600 font-semibold ml-2">{reportData.traffic.impressions.changePct}</span>
                  </div>
                </div>
              </div>

              {/* 2. Top Climber */}
              <div>
                <h4 className="font-extrabold text-neutral-900 mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  2. Top Keyword Climber
                </h4>
                <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100 text-xs">
                  <span className="font-bold text-neutral-900">{reportData.rankings.climbers[0]?.keyword}</span>
                  <div className="text-neutral-500 mt-1">
                    Moved from #{reportData.rankings.climbers[0]?.from} to <strong className="text-purple-700">#{reportData.rankings.climbers[0]?.to}</strong> ({reportData.rankings.climbers[0]?.change} spots) on Google!
                  </div>
                </div>
              </div>

              {/* 3. AI Citations */}
              <div>
                <h4 className="font-extrabold text-neutral-900 mb-2 flex items-center gap-2">
                  <Bot className="w-4 h-4 text-indigo-600" />
                  3. AI Search Citations
                </h4>
                <div className="p-3 bg-neutral-50 rounded-xl text-xs space-y-1">
                  <div><strong>{reportData.aiCitations.totalMentions} total mentions</strong> across Perplexity, ChatGPT and Google AI.</div>
                  <div className="text-neutral-500 italic">Top prompt: "{reportData.aiCitations.breakdown[0]?.samplePrompt}"</div>
                </div>
              </div>

              {/* 4. Homework Tasks */}
              <div>
                <h4 className="font-extrabold text-neutral-900 mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  4. Your Tasks for This Week
                </h4>
                <div className="space-y-1.5 text-xs">
                  {homeworkState.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-start gap-2">
                      <span className="text-purple-600 font-bold">•</span>
                      <span>{item.task} ({item.estimatedTime})</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Email Send Inside Modal */}
              <div className="pt-4 border-t border-neutral-100">
                <form onSubmit={handleSendReportEmail} className="flex gap-2">
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="Enter email to receive copy..."
                    className="flex-1 px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-purple-500"
                  />
                  <button
                    type="submit"
                    disabled={isSendingMail}
                    className="px-4 py-2 rounded-xl bg-neutral-950 text-white text-xs font-bold hover:bg-neutral-800 transition cursor-pointer"
                  >
                    Send to Email
                  </button>
                </form>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-neutral-100 text-center">
              <button
                onClick={() => setShowEmailModal(false)}
                className="px-6 py-2.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold transition cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
}
