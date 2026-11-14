import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { ScreenId } from '../types';

interface NavbarProps {
  activeScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
}

const NAV_ITEMS: { id: ScreenId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'systems', label: 'Systems' },
  { id: 'hardware', label: 'Hardware Lab' },
  { id: 'telemetry', label: 'Telemetry' },
];

export function Navbar({ activeScreen, onNavigate }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSelect = (screen: ScreenId) => {
    onNavigate(screen);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#0A0F1F]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1360px] items-center justify-between gap-8 px-5 py-3.5 md:px-12">
        {/* Zone 1: Single text element wordmark */}
        <button
          type="button"
          onClick={() => handleSelect('overview')}
          className="font-display text-lg font-bold tracking-tight text-[#F8FAFC] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D4FF] rounded-sm"
        >
          Malek Fhima
        </button>

        {/* Zone 2: 4 concise single-line text navigation links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeScreen === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                className={`relative py-1 whitespace-nowrap shrink-0 cursor-pointer transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D4FF] rounded-sm ${
                  isActive
                    ? 'text-[#00D4FF]'
                    : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                }`}
              >
                {item.label}
                <span
                  aria-hidden="true"
                  className={`absolute inset-x-0 -bottom-0.5 h-[1.5px] bg-[#00D4FF] transition-transform duration-150 origin-left ${
                    isActive ? 'scale-x-100' : 'scale-x-0'
                  }`}
                />
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => handleSelect('contact')}
            className={`hidden md:inline-flex items-center justify-center rounded-lg px-4 py-2 text-xs tracking-wide whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a8e8ff] ${
              activeScreen === 'contact'
                ? 'bg-[#3cd7ff] text-[#0A0F1F] font-mono font-bold shadow-[0_0_20px_rgba(0,212,255,0.4)]'
                : 'btn-cybernetic'
            }`}
          >
            Get in Touch
          </button>

          <button
            type="button"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="inline-flex md:hidden items-center justify-center h-10 w-10 rounded-lg border border-white/10 bg-[#0E162B]/70 text-[#dee1f9] hover:border-[#00D4FF]/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D4FF]"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/[0.08] bg-[#0A0F1F]/95 px-5 py-4 space-y-2">
          {NAV_ITEMS.map((item) => {
            const isActive = activeScreen === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                className={`flex w-full items-center justify-between rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#00D4FF]/10 text-[#00D4FF]'
                    : 'text-[#94A3B8] hover:bg-white/[0.04] hover:text-[#F8FAFC]'
                }`}
              >
                <span>{item.label}</span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => handleSelect('contact')}
            className="btn-cybernetic mt-2 w-full rounded-lg px-4 py-2.5 text-xs tracking-wide"
          >
            Get in Touch
          </button>
        </div>
      )}
    </header>
  );
}
