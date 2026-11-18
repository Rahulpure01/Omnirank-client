import React, { useState } from 'react';
import { 
  Search, Calendar, FileText, Upload, TrendingUp, 
  Check, RefreshCw 
} from 'lucide-react';

export default function InteractiveShowcase() {
  const [activeTab, setActiveTab] = useState('01');

  const tabs = [
    { id: '01', label: '01 Research' },
    { id: '02', label: '02 Plan' },
    { id: '03', label: '03 Write' },
    { id: '04', label: '04 Publish' },
    { id: '05', label: '05 Growth' },
  ];

  return (
    <section id="showcase" className="py-14 sm:py-20 bg-neutral-100/60 border-b border-neutral-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Tab Pills Bar (Centered with horizontal touch scroll on mobile) */}
        <div className="flex justify-center mb-6 sm:mb-10 overflow-x-auto pb-2 scrollbar-none">
          <div className="inline-flex items-center p-1 sm:p-1.5 rounded-2xl sm:rounded-full bg-white border border-neutral-200/80 shadow-xs flex-nowrap sm:flex-wrap justify-start sm:justify-center gap-1 shrink-0">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-xl sm:rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-neutral-950 text-white shadow-sm'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Tab Content Card Container */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-neutral-200/80 shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-5 sm:p-8 lg:p-12 transition-all">
          
          {/* TAB 01: RESEARCH */}
          {activeTab === '01' && (
            <div key="tab-01" className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center animate-fade-in-up">
              <div className="lg:col-span-5 text-left">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-800 mb-4 sm:mb-6">
                  <Search className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-700" />
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-neutral-900 tracking-tight leading-tight mb-3 sm:mb-4">
                  Keywords you should rank for!
                </h2>
                <p className="text-neutral-600 text-sm sm:text-base leading-relaxed mb-5 sm:mb-6 font-normal">
                  OmniRank's AI agent finds around 10,000 keywords your competitors are ranking for. Then sorts those keywords using AI based on your target groups, and how easy it is to rank for them.
                </p>
                <ul className="space-y-2.5 sm:space-y-3 mb-4">
                  {[
                    'Competitor content-gap analysis',
                    'AI Sorting for relevancy & citation rate',
                    'Volume and difficulty for every keyword'
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-neutral-800">
                      <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right Side: Keyword Table (Screenshot 2) */}
              <div className="lg:col-span-7">
                <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-sm overflow-hidden text-left">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-neutral-50/70 border-b border-neutral-100 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                        <tr>
                          <th className="py-3 px-4">Keyword</th>
                          <th className="py-3 px-4">Volume</th>
                          <th className="py-3 px-4">Difficulty</th>
                          <th className="py-3 px-4">Source</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100 text-neutral-700 font-medium">
                        {[
                          { kw: 'whatsapp customer service', vol: '8.1k', diff: '34', color: 'bg-emerald-100 text-emerald-700', src: 'Competitor' },
                          { kw: 'shared inbox for teams', vol: '5.4k', diff: '41', color: 'bg-amber-100 text-amber-700', src: 'Competitor' },
                          { kw: 'best helpdesk for small busi...', vol: '3.9k', diff: '58', color: 'bg-orange-100 text-orange-700', src: 'Reddit' },
                          { kw: 'whatsapp business api pricing', vol: '2.7k', diff: '22', color: 'bg-emerald-100 text-emerald-700', src: 'Competitor' },
                          { kw: 'how to reply to customers fa...', vol: '1.9k', diff: '18', color: 'bg-emerald-100 text-emerald-700', src: 'Reddit' },
                          { kw: 'omnichannel inbox', vol: '1.6k', diff: '47', color: 'bg-amber-100 text-amber-700', src: 'Competitor' },
                        ].map((row, idx) => (
                          <tr key={idx} className="hover:bg-neutral-50/50 transition">
                            <td className="py-3.5 px-4 font-semibold text-neutral-900">{row.kw}</td>
                            <td className="py-3.5 px-4 text-neutral-500">{row.vol}</td>
                            <td className="py-3.5 px-4">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${row.color}`}>
                                {row.diff}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-neutral-500 text-xs">{row.src}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="py-3 px-4 bg-neutral-50/50 border-t border-neutral-100 text-xs font-semibold text-neutral-500">
                    + 9,870 more high-intent keywords
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 02: PLAN (Screenshot 5) */}
          {activeTab === '02' && (
            <div key="tab-02" className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center animate-fade-in-up">
              <div className="lg:col-span-5 text-left">
                <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-800 mb-6">
                  <Calendar className="w-5 h-5 text-neutral-700" />
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight leading-tight mb-4">
                  A 30-day plan
                </h2>
                <p className="text-neutral-600 text-base leading-relaxed mb-6 font-normal">
                  Every gap becomes a scheduled article. Reorder, swap or approve the whole month in one click.
                </p>
                <ul className="space-y-3 mb-4">
                  {[
                    'One article per day',
                    'Topic clusters and internal links planned',
                    'Updated every day'
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2.5 text-sm font-medium text-neutral-800">
                      <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right Side: 30-Day Plan Calendar Widget (Screenshot 5) */}
              <div className="lg:col-span-7">
                <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-sm p-6 text-left">
                  <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-4">
                    <span className="font-bold text-neutral-900 text-sm">October Content Calendar</span>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200/60">
                      Approved
                    </span>
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-2 text-center text-xs">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                      <span key={i} className="text-neutral-400 font-semibold py-1">{day}</span>
                    ))}
                    {Array.from({ length: 28 }).map((_, i) => {
                      const dayNum = i + 1;
                      const isToday = dayNum === 19;
                      return (
                        <div
                          key={i}
                          className={`aspect-square rounded-xl flex flex-col items-center justify-center border transition relative ${
                            isToday
                              ? 'bg-neutral-950 text-white font-bold border-neutral-950 shadow-sm'
                              : 'bg-neutral-50/60 border-neutral-100 text-neutral-700 hover:border-neutral-300'
                          }`}
                        >
                          <span>{dayNum}</span>
                          <span className={`w-1 h-1 rounded-full mt-1 ${isToday ? 'bg-amber-400' : 'bg-neutral-400'}`}></span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-5 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                    <div className="flex flex-wrap items-center gap-2.5 sm:gap-4">
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-neutral-400"></span> Published</span>
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-neutral-950"></span> Today</span>
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-purple-500"></span> Scheduled</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 03: WRITE (Screenshot 6) */}
          {activeTab === '03' && (
            <div key="tab-03" className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center animate-fade-in-up">
              <div className="lg:col-span-5 text-left">
                <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-800 mb-6">
                  <FileText className="w-5 h-5 text-neutral-700" />
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight leading-tight mb-4">
                  Articles that sound like your team
                </h2>
                <p className="text-neutral-600 text-base leading-relaxed mb-6 font-normal">
                  OmniRank learns your tone from your existing content and writes long-form, image-rich posts optimized for Google and AI search.
                </p>
                <ul className="space-y-3 mb-4">
                  {[
                    'Brand voice matching',
                    'AI-generated images & diagrams',
                    'Unlimited rewrites & citation optimization'
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2.5 text-sm font-medium text-neutral-800">
                      <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right Side: Article Draft Card (Screenshot 6) */}
              <div className="lg:col-span-7">
                <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-sm p-6 text-left">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200/60 text-xs font-semibold">
                      Brand voice matched
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 text-xs font-semibold">
                      Draft • v2
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-neutral-900 mb-3">
                    The complete guide to WhatsApp customer service
                  </h3>

                  {/* AI Cover Image Mockup */}
                  <div className="w-full h-36 bg-gradient-to-r from-neutral-100 via-purple-50 to-neutral-100 rounded-xl border border-neutral-200/70 flex items-center justify-center text-xs text-neutral-400 font-medium mb-4">
                    <span className="px-3 py-1 bg-white/80 rounded-lg shadow-xs">AI-generated cover image</span>
                  </div>

                  <div className="space-y-2 mb-5">
                    <div className="h-2 bg-neutral-100 rounded-full w-full"></div>
                    <div className="h-2 bg-neutral-100 rounded-full w-[85%]"></div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-neutral-500 pt-2 border-t border-neutral-100">
                    <span>2,120 words • 14 internal links</span>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold transition cursor-pointer">
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Rewrite</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 04: PUBLISH (Screenshot 7) */}
          {activeTab === '04' && (
            <div key="tab-04" className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center animate-fade-in-up">
              <div className="lg:col-span-5 text-left">
                <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-800 mb-6">
                  <Upload className="w-5 h-5 text-neutral-700" />
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight leading-tight mb-4">
                  Live on your site every morning
                </h2>
                <p className="text-neutral-600 text-base leading-relaxed mb-6 font-normal">
                  Keep everything in review, or let OmniRank publish automatically. Your call, per site.
                </p>
                <ul className="space-y-3 mb-4">
                  {[
                    'WordPress, Lovable, NextJS, Webhooks',
                    'Update directly from OmniRank or your AI tool (Claude, ChatGPT)',
                    'Webhook for anything else'
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2.5 text-sm font-medium text-neutral-800">
                      <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right Side: Integrations List (Screenshot 7) */}
              <div className="lg:col-span-7">
                <div className="space-y-3 text-left">
                  {[
                    { name: 'WordPress', desc: 'yoursite.com/blog • daily 06:00', badge: 'Live', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                    { name: 'Lovable', desc: 'Make a blog for your lovable site in no time', badge: 'Live', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                    { name: 'NextJS', desc: 'Seamless integration with a NextJS app', badge: 'Live', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                    { name: 'Webhook', desc: 'Any custom stack or CMS', badge: 'Live', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                  ].map((item, idx) => (
                    <div key={idx} className="p-4 bg-white rounded-2xl border border-neutral-200/90 shadow-xs flex items-center justify-between hover:border-neutral-300 transition">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center font-bold text-neutral-800 text-xs">
                          {item.name[0]}
                        </div>
                        <div>
                          <h4 className="font-bold text-neutral-900 text-sm">{item.name}</h4>
                          <p className="text-xs text-neutral-500">{item.desc}</p>
                        </div>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${item.color}`}>
                        {item.badge}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 05: GROWTH (Screenshot 8) */}
          {activeTab === '05' && (
            <div key="tab-05" className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center animate-fade-in-up">
              <div className="lg:col-span-5 text-left">
                <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-800 mb-6">
                  <TrendingUp className="w-5 h-5 text-neutral-700" />
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight leading-tight mb-4">
                  Watch your organic traffic climb
                </h2>
                <p className="text-neutral-600 text-base leading-relaxed mb-6 font-normal">
                  Connect Google Search Console and track every click, impression and ranking OmniRank articles earn on Google. The same content gets your site cited in AI search, so ChatGPT and Perplexity recommend you too.
                </p>
                <ul className="space-y-3 mb-4">
                  {[
                    'Google Search Console built in',
                    'Clicks, impressions and positions per article',
                    'Cited by ChatGPT and Perplexity'
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2.5 text-sm font-medium text-neutral-800">
                      <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right Side: Growth Chart Widget (Screenshot 8) */}
              <div className="lg:col-span-7">
                <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-sm p-6 text-left">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
                    <span className="font-bold text-neutral-900 text-sm">Google Search Console</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
                      +59% clicks
                    </span>
                  </div>

                  {/* Metrics bar (2x2 on mobile, 4 columns on desktop) */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 mb-4">
                    <div className="p-2.5 bg-neutral-900 text-white rounded-xl">
                      <div className="text-[10px] text-neutral-400">Total clicks</div>
                      <div className="text-base sm:text-lg font-bold">22,8 k</div>
                    </div>
                    <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-100">
                      <div className="text-[10px] text-neutral-500">Impressions</div>
                      <div className="text-base sm:text-lg font-bold text-neutral-900">329,9 k</div>
                    </div>
                    <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-100">
                      <div className="text-[10px] text-neutral-500">Avg CTR</div>
                      <div className="text-base sm:text-lg font-bold text-neutral-900">6,92 %</div>
                    </div>
                    <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-100">
                      <div className="text-[10px] text-neutral-500">Avg Position</div>
                      <div className="text-base sm:text-lg font-bold text-neutral-900">4.3</div>
                    </div>
                  </div>

                  {/* SVG Chart Wave */}
                  <div className="w-full h-32 relative mb-4">
                    <svg viewBox="0 0 400 120" className="w-full h-full overflow-visible">
                      <defs>
                        <linearGradient id="purpleGlow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M0,90 Q50,75 100,80 T200,60 T300,30 T400,10 L400,120 L0,120 Z"
                        fill="url(#purpleGlow)"
                      />
                      <path
                        d="M0,90 Q50,75 100,80 T200,60 T300,30 T400,10"
                        fill="none"
                        stroke="#8b5cf6"
                        strokeWidth="2.5"
                        className="animate-draw-chart"
                      />
                      <path
                        d="M0,105 Q50,95 100,90 T200,75 T300,50 T400,25"
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="2"
                        strokeDasharray="4 4"
                      />
                    </svg>
                  </div>

                  {/* Cited in AI Answers Bar */}
                  <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-600">
                    <span className="font-semibold text-neutral-800">Cited in AI answers:</span>
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 rounded-md bg-neutral-100 font-bold text-neutral-800">ChatGPT</span>
                      <span className="px-2.5 py-1 rounded-md bg-neutral-100 font-bold text-neutral-800">Perplexity</span>
                      <span className="px-2.5 py-1 rounded-md bg-neutral-100 font-bold text-neutral-800">Gemini</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </section>
  );
}

