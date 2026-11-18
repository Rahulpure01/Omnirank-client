import React from 'react';
import { 
  Search, ScanEye, BarChart3, Sparkles, MessageSquare, Calendar,
  FileText, Mic, Globe2, Link2, Code, Image as ImageIcon,
  Share2, ShieldCheck, Award, Layers, AlertCircle, FolderGit2,
  TrendingUp, MousePointerClick, Bot, Zap, Magnet, Mail
} from 'lucide-react';

export default function WhatsIncluded() {
  const columns = [
    {
      category: 'Research',
      iconColor: 'text-blue-600 bg-blue-50',
      items: [
        { name: 'Competitor analysis', icon: Search },
        { name: 'Content gap finder', icon: ScanEye },
        { name: 'Keyword volume & difficulty', icon: BarChart3 },
        { name: 'AI sorting for relevancy', icon: Sparkles },
        { name: 'Reddit & forum questions', icon: MessageSquare },
        { name: '30-day content plan', icon: Calendar },
      ],
    },
    {
      category: 'Content',
      iconColor: 'text-purple-600 bg-purple-50',
      items: [
        { name: '30 articles per month', icon: FileText },
        { name: 'Your brand voice', icon: Mic },
        { name: '100+ languages', icon: Globe2 },
        { name: 'Internal links', icon: Link2 },
        { name: 'Lists high authority sources', icon: Code },
        { name: 'AI-generated images', icon: ImageIcon },
      ],
    },
    {
      category: 'Backlinks & AEO',
      iconColor: 'text-cyan-600 bg-cyan-50',
      items: [
        { name: 'Up to 30+ backlinks / mo', icon: Share2 },
        { name: 'DR 30+ backlinks', icon: ShieldCheck },
        { name: 'Schema JSON-LD generator', icon: Award },
        { name: 'Topic related citations', icon: Layers },
        { name: 'Broken link detection', icon: AlertCircle },
        { name: '250+ directory submissions', icon: FolderGit2 },
      ],
    },
    {
      category: 'Growth',
      iconColor: 'text-emerald-600 bg-emerald-50',
      items: [
        { name: 'Search Console tracking', icon: TrendingUp },
        { name: 'Clicks & impressions', icon: MousePointerClick },
        { name: 'Cited in ChatGPT & Gemini', icon: Bot },
        { name: 'Perplexity AI optimization', icon: Zap },
        { name: 'Lead magnets', icon: Magnet },
        { name: 'Weekly SEO & GEO report', icon: Mail },
      ],
    },
  ];

  return (
    <section id="included" className="py-14 sm:py-20 lg:py-24 bg-white border-b border-neutral-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-neutral-950 tracking-tight mb-8 sm:mb-14">
          What's included.
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10">
          {columns.map((col, idx) => (
            <div key={idx} className="flex flex-col">
              <h3 className="text-lg sm:text-xl font-bold text-neutral-900 mb-4 sm:mb-6 pb-2.5 sm:pb-3 border-b border-neutral-100">
                {col.category}
              </h3>
              <ul className="space-y-3 sm:space-y-4">
                {col.items.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <li key={i} className="flex items-center gap-3 group cursor-default">
                      <div className={`w-7 h-7 rounded-lg ${col.iconColor} flex items-center justify-center shrink-0`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-sm font-medium text-neutral-700 group-hover:text-neutral-950 transition-colors">
                        {item.name}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

