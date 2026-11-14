import { useEffect } from 'react';
import { ArrowUpRight, X } from 'lucide-react';
import { EngineeringSystem } from '../types';

interface ProjectModalProps {
  system: EngineeringSystem | null;
  onClose: () => void;
  onOpenInspector: (systemId: string) => void;
}

export function ProjectModal({ system, onClose, onOpenInspector }: ProjectModalProps) {
  useEffect(() => {
    if (!system) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [system, onClose]);

  if (!system) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-system-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#050812]/80 p-4 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="glass-panel relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl p-6 md:p-8 shadow-[0_0_48px_-8px_rgba(0,212,255,0.28)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/[0.08] pb-5">
          <div className="space-y-1.5">
            <p className="font-mono text-xs text-[#00D4FF] tracking-wide">
              {system.kicker} · {system.hardwareTarget}
            </p>
            <h2
              id="modal-system-title"
              className="font-display text-2xl md:text-3xl font-semibold text-[#F8FAFC] text-balance"
            >
              {system.title}
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close case study"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-[#94A3B8] hover:border-[#00D4FF]/45 hover:text-[#F8FAFC] transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Metrics row */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-white/[0.08] pb-6">
          {system.metrics.map((metric) => (
            <div key={metric.label} className="space-y-1">
              <div className="font-display text-2xl font-bold text-[#F8FAFC] tabular-nums">
                {metric.value}
              </div>
              <div className="font-mono text-xs text-[#94A3B8]">{metric.label}</div>
            </div>
          ))}
        </div>

        {/* Case study narrative */}
        <div className="mt-6 space-y-5 text-[15px] leading-relaxed text-[#bbc9cf]">
          <div>
            <h3 className="font-display text-base font-semibold text-[#F8FAFC] mb-1.5">
              01. Engineering Bottleneck
            </h3>
            <p>{system.caseStudy.challenge}</p>
          </div>
          <div>
            <h3 className="font-display text-base font-semibold text-[#F8FAFC] mb-1.5">
              02. System Architecture
            </h3>
            <p>{system.caseStudy.architecture}</p>
          </div>
          <div>
            <h3 className="font-display text-base font-semibold text-[#F8FAFC] mb-1.5">
              03. Production Outcome
            </h3>
            <p>{system.caseStudy.outcome}</p>
          </div>
        </div>

        {/* Hardware & Cloud Spec Table */}
        <div className="mt-6 rounded-xl border border-white/[0.08] bg-[#080D1D]/90 p-4">
          <h3 className="font-mono text-xs font-semibold text-[#94A3B8] mb-3">
            System Specification Matrix
          </h3>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 text-sm">
            {system.caseStudy.specs.map((spec) => (
              <div key={spec.key} className="flex items-baseline justify-between gap-3 border-b border-white/[0.05] pb-1.5">
                <dt className="text-[#94A3B8]">{spec.key}</dt>
                <dd className="font-mono text-xs text-[#dee1f9] tabular-nums text-right">
                  {spec.val}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Modal footer */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 pt-2">
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-[#94A3B8]">
            {system.stack.map((tech, idx) => (
              <span key={tech}>
                {tech}
                {idx < system.stack.length - 1 ? ' · ' : ''}
              </span>
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenInspector(system.id);
            }}
            className="btn-cybernetic inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs cursor-pointer whitespace-nowrap shrink-0"
          >
            <span>Inspect Firmware & Code</span>
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
