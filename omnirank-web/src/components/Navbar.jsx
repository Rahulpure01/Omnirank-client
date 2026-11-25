import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Logo from './Logo';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'AI SEO', href: '#showcase' },
    { label: 'AEO & Citations', href: '#showcase' },
    { label: "What's included", href: '#included' },
    { label: 'Growth Report', href: '#weekly-report' },
    { label: 'Pricing', href: '#included' },
  ];

  const handleLinkClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="w-full sticky top-0 z-40 backdrop-blur-md bg-white/80 border-b border-neutral-200/60 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between">
        {/* Brand Logo */}
        <div 
          className="cursor-pointer select-none transition-transform active:scale-95" 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <Logo size="md" />
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-7 lg:gap-8 text-sm lg:text-[15px] font-medium text-neutral-600">
          {navLinks.map((link, idx) => (
            <a
              key={idx}
              href={link.href}
              className="hover:text-neutral-950 transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Mobile Hamburger Button */}
        <div className="md:hidden flex items-center">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
            className="w-10 h-10 rounded-xl bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-800 transition cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-neutral-200 bg-white/95 backdrop-blur-lg px-4 pt-3 pb-5 shadow-lg animate-fade-in-up">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link, idx) => (
              <a
                key={idx}
                href={link.href}
                onClick={handleLinkClick}
                className="px-4 py-3 rounded-xl text-sm font-semibold text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950 transition flex items-center justify-between"
              >
                <span>{link.label}</span>
                <span className="text-neutral-400 text-xs">→</span>
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
