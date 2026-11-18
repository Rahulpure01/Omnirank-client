import React from 'react';
import { Sparkles, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-white border-t border-neutral-200/80 pt-12 sm:pt-16 pb-10 sm:pb-12 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Wall of Love Banner */}
        <div className="text-center mb-10 sm:mb-16">
          <div className="inline-flex items-center gap-2 text-xl sm:text-2xl font-black text-neutral-900 mb-3 sm:mb-4">
            <span>Wall of love</span>
            <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-rose-500 fill-rose-500" />
          </div>
          <p className="text-neutral-500 text-xs sm:text-sm max-w-md mx-auto px-2">
            Loved by modern SEO agencies, creators, and engineering teams scaling organic & AI search.
          </p>
        </div>

        {/* CTA Box */}
        <div className="bg-gradient-to-tr from-neutral-950 via-neutral-900 to-purple-950 rounded-2xl sm:rounded-3xl p-6 sm:p-12 text-white text-center mb-10 sm:mb-16 relative overflow-hidden shadow-xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-transparent pointer-events-none"></div>
          
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight mb-3 sm:mb-4 text-white">
            Ready to rank across Google, Voice & AI Search?
          </h3>
          <p className="text-neutral-400 text-xs sm:text-base max-w-lg mx-auto font-normal leading-relaxed">
            Run your first Tri-Engine audit in 15 seconds. Instant score breakdown and 45-55 word direct answer snippets.
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 pt-6 sm:pt-8 border-t border-neutral-100 text-xs text-neutral-500 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-purple-600 flex items-center justify-center text-white shrink-0">
              <Sparkles className="w-3 h-3" />
            </div>
            <span className="font-bold text-neutral-800">OmniRank AI</span>
            <span>• Tri-Engine Optimization Platform</span>
          </div>

          <p>© 2026 OmniRank AI. All rights reserved.</p>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <a href="#showcase" className="hover:text-neutral-900 transition">AI SEO</a>
            <a href="#showcase" className="hover:text-neutral-900 transition">AEO</a>
            <a href="#showcase" className="hover:text-neutral-900 transition">GEO</a>
            <a href="#weekly-report" className="hover:text-neutral-900 transition">Reports</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
