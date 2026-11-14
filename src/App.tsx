import { useState } from 'react';
import { ContactScreen } from './components/ContactScreen';
import { HardwareLabScreen } from './components/HardwareLabScreen';
import { Navbar } from './components/Navbar';
import { OverviewScreen } from './components/OverviewScreen';
import { ProjectModal } from './components/ProjectModal';
import { SystemsScreen } from './components/SystemsScreen';
import { TelemetryScreen } from './components/TelemetryScreen';
import { EngineeringSystem, ScreenId } from './types';

export function App() {
  const [activeScreen, setActiveScreen] = useState<ScreenId>('overview');
  const [focusedSystemId, setFocusedSystemId] = useState<string | undefined>(undefined);
  const [modalSystem, setModalSystem] = useState<EngineeringSystem | null>(null);

  const handleNavigate = (screen: ScreenId, systemId?: string) => {
    if (systemId) {
      setFocusedSystemId(systemId);
    }
    setActiveScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col text-[#dee1f9]">
      <Navbar activeScreen={activeScreen} onNavigate={(s) => handleNavigate(s)} />

      <main className="flex-1 mx-auto w-full max-w-[1360px] px-5 md:px-12">
        {activeScreen === 'overview' && (
          <OverviewScreen
            onNavigate={handleNavigate}
            onSelectProject={(sys) => setModalSystem(sys)}
          />
        )}

        {activeScreen === 'systems' && (
          <SystemsScreen
            initialSystemId={focusedSystemId}
            onSelectProject={(sys) => setModalSystem(sys)}
          />
        )}

        {activeScreen === 'hardware' && <HardwareLabScreen />}

        {activeScreen === 'telemetry' && <TelemetryScreen />}

        {activeScreen === 'contact' && <ContactScreen />}
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-white/[0.08] bg-[#080D1D]/70">
        <div className="mx-auto flex max-w-[1360px] flex-col sm:flex-row items-center justify-between gap-4 px-5 py-6 md:px-12 text-xs text-[#94A3B8]">
          <div className="font-mono">
            © 2026 Malek Fhima · Full-Stack & Embedded Systems Engineering
          </div>

          <div className="flex flex-wrap items-center gap-6 font-mono">
            <button
              type="button"
              onClick={() => handleNavigate('overview')}
              className="hover:text-[#00D4FF] transition-colors cursor-pointer"
            >
              Overview
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('systems')}
              className="hover:text-[#00D4FF] transition-colors cursor-pointer"
            >
              Systems
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('hardware')}
              className="hover:text-[#00D4FF] transition-colors cursor-pointer"
            >
              Hardware Lab
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('telemetry')}
              className="hover:text-[#00D4FF] transition-colors cursor-pointer"
            >
              Telemetry
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('contact')}
              className="hover:text-[#00D4FF] transition-colors cursor-pointer"
            >
              Contact
            </button>
          </div>
        </div>
      </footer>

      <ProjectModal
        system={modalSystem}
        onClose={() => setModalSystem(null)}
        onOpenInspector={(systemId) => handleNavigate('systems', systemId)}
      />
    </div>
  );
}

export default App;
