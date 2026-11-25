import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, Sparkles, CheckCircle2, Globe, FileText, Bot 
} from 'lucide-react';

const SLIDES = [
  { 
    id: 'writer', 
    title: 'AI TRI-ENGINE WRITER', 
    shortTitle: 'AI WRITER',
    tag: 'AI SEO & Content Draft',
  },
  { 
    id: 'search', 
    title: 'AI SEARCH & CITATIONS', 
    shortTitle: 'AI CITATIONS',
    tag: 'Generative Engine (GEO)',
  },
  { 
    id: 'keywords', 
    title: 'KEYWORD CONTENT GAP', 
    shortTitle: 'KEYWORDS GAP',
    tag: 'Competitor Intelligence',
  },
  { 
    id: 'backlinks', 
    title: 'BACKLINKS NETWORK', 
    shortTitle: 'BACKLINKS',
    tag: 'High-DR Authority',
  },
];

export default function Hero({ onRunAudit }) {
  const [url, setUrl] = useState('');
  const [keyword, setKeyword] = useState('');
  const [activeSlide, setActiveSlide] = useState(0);

  // Typewriter effect state
  const [typedTitle, setTypedTitle] = useState('');
  const fullTitle = 'The Complete Guide to WhatsApp Marketing & AI Search';

  // Live Typewriter Effect whenever Writer card (slide 0) comes to front
  useEffect(() => {
    if (activeSlide !== 0) return;
    let index = 0;
    const interval = setInterval(() => {
      index++;
      if (index <= fullTitle.length) {
        setTypedTitle(fullTitle.slice(0, index));
      } else {
        clearInterval(interval);
      }
    }, 35);
    return () => {
      clearInterval(interval);
      setTypedTitle('');
    };
  }, [activeSlide]);

  // Card rotation: gentle on desktop, user-controlled / relaxed on mobile
  useEffect(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const intervalTime = isMobile ? 6500 : 4200; // Relaxed interval on mobile so user can read peacefully!

    const timer = setInterval(() => {
      setActiveSlide((curr) => (curr + 1) % SLIDES.length);
    }, intervalTime);

    return () => clearInterval(timer);
  }, []);

  const handleSelectSlide = (index) => {
    setActiveSlide(index);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    onRunAudit(url.trim(), keyword.trim() || 'best guide');
  };

  return (
    <section className="relative overflow-hidden pt-6 pb-16 sm:pt-10 sm:pb-20 lg:pt-14 lg:pb-28">
      {/* Sunset Scenic Ambient Background Gradient with Pulsing Glow */}
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] sm:w-[1200px] h-[400px] sm:h-[600px] bg-gradient-to-b from-amber-200/50 via-rose-200/40 to-transparent blur-3xl opacity-70 animate-pulse-glow"></div>
        <div className="absolute top-20 right-10 w-[300px] sm:w-[500px] h-[250px] sm:h-[400px] bg-gradient-to-tr from-purple-200/40 to-amber-200/40 blur-3xl rounded-full animate-float-slow"></div>
        <div className="absolute top-40 left-10 w-[280px] sm:w-[450px] h-[220px] sm:h-[350px] bg-gradient-to-br from-orange-200/40 via-pink-100/30 to-transparent blur-3xl rounded-full animate-float-reverse"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Left Column: Headline & Action Bar */}
          <div className="lg:col-span-6 flex flex-col items-start text-left">
            <h1 className="text-3xl sm:text-5xl lg:text-[54px] font-extrabold text-neutral-950 tracking-tight leading-[1.12] sm:leading-[1.08] mb-3 sm:mb-4">
              AI runs your <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-neutral-950 via-purple-900 to-indigo-900 bg-clip-text text-transparent">
                SEO, blog and AI strategy
              </span>
            </h1>

            <p className="text-lg sm:text-2xl text-neutral-600 font-medium mb-6 sm:mb-8">
              Let's grow your traffic!
            </p>

            {/* Input Container (Mobile & Desktop Responsive) */}
            <form 
              onSubmit={handleSubmit}
              className="w-full max-w-xl bg-white p-2 rounded-2xl sm:rounded-full border border-neutral-200/90 shadow-[0_12px_36px_rgba(0,0,0,0.07)] focus-within:border-neutral-950 focus-within:shadow-[0_16px_48px_rgba(0,0,0,0.12)] transition-all duration-300 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-3"
            >
              <div className="flex-1 w-full flex items-center px-3 gap-2">
                <Globe className="w-4 h-4 text-neutral-400 shrink-0" />
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="yourdomain.com"
                  className="w-full bg-transparent text-sm sm:text-base text-neutral-900 placeholder-neutral-400 focus:outline-none py-2"
                  required
                />
              </div>

              <div className="hidden sm:block w-px h-6 bg-neutral-200"></div>
              <div className="block sm:hidden w-full h-px bg-neutral-100"></div>

              <div className="flex-1 w-full flex items-center px-3 gap-2">
                <FileText className="w-4 h-4 text-neutral-400 shrink-0" />
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Target keyword"
                  className="w-full bg-transparent text-sm sm:text-base text-neutral-900 placeholder-neutral-400 focus:outline-none py-2"
                />
              </div>

              <button
                type="submit"
                aria-label="Submit"
                className="w-full sm:w-10 h-10 sm:h-10 rounded-xl sm:rounded-full bg-neutral-950 hover:bg-neutral-800 text-white flex items-center justify-center gap-2 font-bold text-xs sm:text-sm transition-transform duration-200 hover:scale-105 active:scale-95 shrink-0 cursor-pointer shadow-sm py-2 sm:py-0"
              >
                <span className="sm:hidden font-semibold">Analyze Website</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Demo Domain Chips (Instant 1-Click Interactive Audits) */}
            <div className="flex items-center gap-1.5 mb-5 flex-wrap text-xs">
              <span className="text-neutral-400 text-[11px] font-medium">Quick Demo:</span>
              {[
                { domain: 'myntra.com', kw: 'fashion' },
                { domain: 'vadanyascientific.com', kw: 'medtech' },
                { domain: 'apple.com', kw: 'smartphones' },
              ].map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setUrl(item.domain);
                    setKeyword(item.kw);
                    onRunAudit(item.domain, item.kw);
                  }}
                  className="px-2.5 py-1 rounded-full bg-neutral-100 hover:bg-purple-100 hover:text-purple-700 text-neutral-600 text-[11px] font-medium transition cursor-pointer active:scale-95 border border-transparent hover:border-purple-200"
                >
                  ⚡ {item.domain}
                </button>
              ))}
            </div>

            <p className="text-xs text-neutral-500 mb-6 font-medium">
              Cancel anytime. Instant live audit with Gemini 3.5 Flash AI.
            </p>

            {/* Platform Badges */}
            <div className="flex items-center gap-2 sm:gap-3 text-xs text-neutral-500 flex-wrap">
              <span className="font-semibold text-neutral-700">Publishes to & audits:</span>
              {['WordPress', 'NextJS', 'Lovable', 'Webhooks'].map((p, i) => (
                <span key={i} className="px-2.5 py-1 rounded-md bg-white border border-neutral-200 text-neutral-700 font-medium shadow-xs transition hover:border-neutral-400 cursor-default text-[11px] sm:text-xs">
                  {p}
                </span>
              ))}
            </div>
          </div>

          {/* Right Column: Physical 3D Stack Shuffling Deck */}
          <div className="lg:col-span-6 relative flex flex-col justify-center mt-8 sm:mt-12 lg:mt-0">
            {/* Mobile Touch Navigation Pills (Calm, non-distracting card switching on phones) */}
            <div className="flex lg:hidden items-center justify-between gap-1 mb-3 bg-neutral-100 p-1 rounded-xl">
              {SLIDES.map((slide, idx) => (
                <button
                  key={slide.id}
                  onClick={() => handleSelectSlide(idx)}
                  className={`flex-1 py-1.5 px-1 rounded-lg text-[10px] font-bold uppercase transition text-center truncate ${
                    activeSlide === idx
                      ? 'bg-white text-purple-700 shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  {slide.shortTitle}
                </button>
              ))}
            </div>

            {/* Perspective Viewport for the 3D Cards Deck */}
            <div className="relative w-full h-[470px] sm:h-[468px]">
              
              {SLIDES.map((slide, idx) => {
                // Calculate relative 3D position in the stack (0 = Front, 1 = Middle Behind, 2 = Furthest Behind, 3 = Hidden/Cycling)
                const pos = (idx - activeSlide + SLIDES.length) % SLIDES.length;
                const isFront = pos === 0;
                const isPeek1 = pos === 1;
                const isPeek2 = pos === 2;

                // Physical 3D coordinates: Back cards sit higher (-translateY) and smaller (scale), then physically glide down & forward to front!
                const transformStyle = isFront
                  ? 'translateY(0px) scale(1)'
                  : isPeek1
                  ? 'translateY(-22px) scale(0.94)'
                  : isPeek2
                  ? 'translateY(-42px) scale(0.88)'
                  : 'translateY(32px) scale(0.92)';

                const zIndexStyle = isFront ? 30 : isPeek1 ? 20 : isPeek2 ? 10 : 0;
                const opacityStyle = isFront ? 1 : isPeek1 ? 0.95 : isPeek2 ? 0.8 : 0;

                return (
                  <div
                    key={slide.id}
                    onClick={() => {
                      if (!isFront) handleSelectSlide(idx);
                    }}
                    style={{
                      transform: transformStyle,
                      transformOrigin: 'top center',
                      zIndex: zIndexStyle,
                      opacity: opacityStyle,
                      pointerEvents: isFront || isPeek1 || isPeek2 ? 'auto' : 'none',
                      transition: 'transform 0.75s cubic-bezier(0.2, 1, 0.3, 1), opacity 0.5s ease, box-shadow 0.6s ease',
                    }}
                    className={`absolute inset-x-0 bottom-0 h-[440px] sm:h-[415px] bg-white rounded-2xl sm:rounded-3xl border border-neutral-200/90 shadow-[0_24px_60px_rgba(0,0,0,0.12)] p-4 sm:p-6 flex flex-col justify-between overflow-hidden select-none ${
                      !isFront ? 'cursor-pointer hover:border-neutral-400' : ''
                    }`}
                  >
                    
                    {/* Peeking Header Badge for Background Layers (Visibly sticks out at the top of the stack) */}
                    {!isFront && (
                      <div 
                        className={`absolute top-0 left-0 right-0 h-11 backdrop-blur-md rounded-t-2xl sm:rounded-t-3xl border-t border-x border-white/15 text-white flex items-center justify-between px-4 sm:px-6 text-[10px] sm:text-xs font-bold tracking-wider uppercase z-40 transition-colors shadow-sm ${
                          isPeek1 ? 'bg-neutral-800/95 hover:bg-neutral-800' : 'bg-neutral-900/95 hover:bg-neutral-900'
                        }`}
                      >
                        <span className="flex items-center gap-1.5 truncate">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse shrink-0"></span>
                          <span className="truncate">{slide.title}</span>
                        </span>
                        <span className="text-[10px] text-white/60 font-normal shrink-0 ml-2">
                          Click to view ↗
                        </span>
                      </div>
                    )}

                    {/* Card Content Area */}
                    <div className="flex flex-col justify-between h-full">
                      
                      <div>
                        {/* Header: Slide Title (Clean Minimal Roki AI Style - No step count or loading animation) */}
                        <div className="pb-3 border-b border-neutral-100 mb-3 sm:mb-4 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-pulse"></div>
                            <span className="text-[11px] sm:text-xs font-extrabold text-neutral-900 uppercase tracking-wider">
                              {slide.title}
                            </span>
                          </div>
                          <span className="text-[10px] sm:text-xs font-semibold text-neutral-400 tracking-wide">
                            {slide.tag}
                          </span>
                        </div>

                        {/* ================= PAGE 1: AI TRI-ENGINE WRITER ================= */}
                        {slide.id === 'writer' && (
                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
                            {/* Left Mini Sidebar */}
                            <div className="hidden sm:flex sm:col-span-1 flex-col items-center gap-3 py-1 border-r border-neutral-100 text-neutral-400">
                              <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xs shadow-xs">AI</div>
                              <FileText className="w-4 h-4 text-purple-600" />
                              <Sparkles className="w-4 h-4 text-neutral-400" />
                              <Bot className="w-4 h-4 text-neutral-400" />
                            </div>

                            {/* Center Content Mockup with Typewriter */}
                            <div className="sm:col-span-7 flex flex-col text-left">
                              <span className="text-[11px] font-medium text-neutral-400 mb-0.5">saysimple.com/blog • Draft</span>
                              <h3 className="font-bold text-neutral-900 text-sm sm:text-base leading-snug mb-2 min-h-[38px]">
                                {typedTitle}
                                <span className="inline-block w-1.5 h-3.5 ml-0.5 bg-purple-600 align-middle animate-blink"></span>
                              </h3>
                              <div className="space-y-1.5 mb-2.5">
                                <div className="h-2 bg-neutral-100 rounded-full w-full"></div>
                                <div className="h-2 bg-neutral-100 rounded-full w-[90%]"></div>
                                <div className="h-2 bg-neutral-100 rounded-full w-[75%]"></div>
                              </div>
                              <div className="p-2 sm:p-2.5 bg-neutral-50 rounded-xl border border-neutral-100 text-[11px] text-neutral-600 font-serif italic mb-2">
                                "WhatsApp marketing drives up to 98% open rates when structured with Answer Engine schemas [add source]."
                              </div>
                              <div className="flex items-center gap-2 text-[10px] text-neutral-400">
                                <span>2,140 words</span>
                                <span>•</span>
                                <span>9 min read</span>
                              </div>
                            </div>

                            {/* Right Metrics Panel */}
                            <div className="sm:col-span-4 flex flex-col gap-2 p-2.5 bg-neutral-50/80 rounded-xl border border-neutral-100">
                              <div className="text-center py-1.5 bg-white rounded-xl shadow-xs border border-neutral-100">
                                <div className="text-xl sm:text-2xl font-black text-emerald-600">92</div>
                                <div className="text-[9px] uppercase font-bold text-neutral-400 tracking-wider">SEO / AEO Score</div>
                              </div>

                              <div className="space-y-1 text-left">
                                {[
                                  'Target keyword in title',
                                  '6 internal links matched',
                                  'Direct answer snippet',
                                  'FAQ Schema generated',
                                ].map((txt, i) => (
                                  <div key={i} className="flex items-center gap-1.5 text-[10.5px] text-neutral-700">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                    <span className="truncate">{txt}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* ================= PAGE 2: AI SEARCH & CITATIONS ================= */}
                        {slide.id === 'search' && (
                          <div className="space-y-3 text-left">
                            <div className="p-3 bg-purple-50/70 rounded-2xl border border-purple-100 flex items-center justify-between">
                              <div>
                                <span className="text-[10px] font-bold text-purple-900 uppercase block">
                                  Perplexity & ChatGPT Citation Rate
                                </span>
                                <div className="text-xl sm:text-2xl font-black text-purple-950">96.4% Highly Citeable</div>
                              </div>
                              <span className="px-2.5 py-1 rounded-full bg-purple-600 text-white font-bold text-[11px] shadow-xs">
                                Tier 1 Sourced
                              </span>
                            </div>

                            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/70 text-xs">
                              <div className="flex items-center gap-2 mb-1">
                                <Bot className="w-4 h-4 text-indigo-600" />
                                <span className="font-bold text-neutral-800">ChatGPT Search Live Snapshot</span>
                              </div>
                              <p className="text-[11px] text-neutral-600 italic bg-white p-2.5 rounded-lg border border-neutral-100 leading-relaxed">
                                "According to analysis by <strong>saysimple.com</strong>, businesses implementing omnichannel WhatsApp messaging achieve a 98% open rate with verified Answer Engine schema."
                              </p>
                            </div>

                            <div className="grid grid-cols-4 gap-2 text-center text-xs">
                              {[
                                { engine: 'ChatGPT', pct: '45%', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
                                { engine: 'Google SGE', pct: '29%', color: 'bg-blue-50 text-blue-800 border-blue-200' },
                                { engine: 'Perplexity', pct: '18%', color: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
                                { engine: 'Claude', pct: '8%', color: 'bg-amber-50 text-amber-800 border-amber-200' },
                              ].map((item, bIdx) => (
                                <div key={bIdx} className={`p-1.5 sm:p-2 rounded-xl border ${item.color}`}>
                                  <div className="text-xs font-black">{item.pct}</div>
                                  <div className="text-[9px] font-semibold truncate">{item.engine}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* ================= PAGE 3: KEYWORD CONTENT GAP ================= */}
                        {slide.id === 'keywords' && (
                          <div className="space-y-2.5 text-left">
                            <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
                              <span className="font-bold text-neutral-800">Top 10,000 Sorted Keywords</span>
                              <span className="text-purple-700 font-semibold">AI Ease of Rank</span>
                            </div>

                            <div className="space-y-1.5">
                              {[
                                { kw: 'whatsapp customer service', vol: '8.1k', diff: '34', color: 'bg-emerald-100 text-emerald-800', badge: 'Competitor' },
                                { kw: 'shared inbox for teams', vol: '5.4k', diff: '41', color: 'bg-amber-100 text-amber-800', badge: 'Competitor' },
                                { kw: 'ai search optimization tools', vol: '4.8k', diff: '22', color: 'bg-emerald-100 text-emerald-800', badge: 'Reddit Gap' },
                                { kw: 'direct answer snippet schema', vol: '3.2k', diff: '18', color: 'bg-emerald-100 text-emerald-800', badge: 'Voice P0' },
                              ].map((item, kIdx) => (
                                <div key={kIdx} className="p-2 bg-neutral-50 hover:bg-neutral-100/80 rounded-xl border border-neutral-100 flex items-center justify-between text-xs transition">
                                  <div className="flex items-center gap-2 truncate">
                                    <span className={`px-1.5 py-0.5 rounded font-bold text-[9px] shrink-0 ${item.color}`}>
                                      Diff {item.diff}
                                    </span>
                                    <span className="font-bold text-neutral-900 truncate text-[11px] sm:text-xs">{item.kw}</span>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <span className="font-black text-neutral-800 mr-2 text-xs">{item.vol}</span>
                                    <span className="text-[9px] text-neutral-400 bg-white px-1.5 py-0.5 rounded border border-neutral-200">{item.badge}</span>
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div className="p-1.5 bg-purple-50/60 rounded-xl text-center text-[10.5px] font-semibold text-purple-700 border border-purple-100">
                              + 9,870 more high-intent keywords sorted by OmniRank AI
                            </div>
                          </div>
                        )}

                        {/* ================= PAGE 4: BACKLINKS NETWORK ================= */}
                        {slide.id === 'backlinks' && (
                          <div className="space-y-3 text-left">
                            <div className="grid grid-cols-3 gap-2 text-center">
                              <div className="p-2.5 bg-cyan-50/80 rounded-xl sm:rounded-2xl border border-cyan-200">
                                <div className="text-lg sm:text-xl font-black text-cyan-900">DR 54</div>
                                <div className="text-[9px] text-cyan-700 uppercase font-bold tracking-wider">Domain Rating</div>
                              </div>
                              <div className="p-2.5 bg-neutral-50 rounded-xl sm:rounded-2xl border border-neutral-200">
                                <div className="text-lg sm:text-xl font-black text-neutral-800">32</div>
                                <div className="text-[9px] text-neutral-500 uppercase font-bold tracking-wider">Live Backlinks</div>
                              </div>
                              <div className="p-2.5 bg-emerald-50/80 rounded-xl sm:rounded-2xl border border-emerald-200">
                                <div className="text-lg sm:text-xl font-black text-emerald-800">100%</div>
                                <div className="text-[9px] text-emerald-700 uppercase font-bold tracking-wider">DoFollow</div>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-200/80 text-xs">
                                <div className="flex items-center justify-between mb-0.5">
                                  <span className="font-bold text-neutral-900 text-[11px] sm:text-xs">TechCrunch Enterprise AI Feature</span>
                                  <span className="text-emerald-700 font-semibold text-[9px] bg-emerald-50 px-1.5 py-0.5 rounded">Active Live</span>
                                </div>
                                <code className="text-[10px] text-neutral-500 block truncate">
                                  techcrunch.com/features/enterprise-ai-growth-tools#saysimple
                                </code>
                              </div>

                              <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-200/80 text-xs">
                                <div className="flex items-center justify-between mb-0.5">
                                  <span className="font-bold text-neutral-900 text-[11px] sm:text-xs">Forbes Innovation Round-Up</span>
                                  <span className="text-cyan-700 font-semibold text-[9px] bg-cyan-50 px-1.5 py-0.5 rounded">Indexed</span>
                                </div>
                                <code className="text-[10px] text-neutral-500 block truncate">
                                  forbes.com/innovation/modern-ai-search-citation-leaders
                                </code>
                              </div>
                            </div>
                          </div>
                        )}

                      </div>

                      {/* Bottom Interactive Navigation Dots & Brand Pill */}
                      <div className="pt-2.5 border-t border-neutral-100 flex items-center justify-between gap-2 text-xs text-neutral-600 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin" style={{ animationDuration: '8s' }} />
                          <span className="font-semibold text-neutral-800 text-[10px] sm:text-xs truncate">
                            Connect Claude & Gemini with OmniRank AI
                          </span>
                        </div>

                        {/* 4 Interactive Dot Switchers */}
                        <div className="flex items-center gap-1.5">
                          {SLIDES.map((s, dotIdx) => (
                            <button
                              key={s.id}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectSlide(dotIdx);
                              }}
                              className={`h-2 rounded-full transition-all cursor-pointer ${
                                dotIdx === activeSlide ? 'w-5 bg-purple-600' : 'w-2 bg-neutral-200 hover:bg-neutral-400'
                              }`}
                              aria-label={`Go to ${s.title}`}
                            />
                          ))}
                        </div>
                      </div>

                    </div>

                  </div>
                );
              })}

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
