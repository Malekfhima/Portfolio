import { useEffect, useState } from 'react';
import { ArrowUpRight, CheckCircle2, Cpu } from 'lucide-react';
import { ENGINEERING_SYSTEMS } from '../data/orbitData';
import { CodeFile, EngineeringSystem } from '../types';
import { SyntaxCodeBlock } from './SyntaxCodeBlock';

interface SystemsScreenProps {
  initialSystemId?: string;
  onSelectProject: (system: EngineeringSystem) => void;
}

export function SystemsScreen({ initialSystemId, onSelectProject }: SystemsScreenProps) {
  const [selectedId, setSelectedId] = useState<string>(
    initialSystemId ?? ENGINEERING_SYSTEMS[0].id
  );
  const [traceState, setTraceState] = useState<{
    file: CodeFile | null;
    completedSteps: number;
    running: boolean;
  }>({
    file: null,
    completedSteps: 0,
    running: false,
  });

  useEffect(() => {
    if (initialSystemId && ENGINEERING_SYSTEMS.some((s) => s.id === initialSystemId)) {
      setSelectedId(initialSystemId);
      setTraceState({ file: null, completedSteps: 0, running: false });
    }
  }, [initialSystemId]);

  const activeSystem =
    ENGINEERING_SYSTEMS.find((s) => s.id === selectedId) ?? ENGINEERING_SYSTEMS[0];

  useEffect(() => {
    if (!traceState.running || !traceState.file) return;
    if (traceState.completedSteps >= traceState.file.traceSteps.length) {
      setTraceState((prev) => ({ ...prev, running: false }));
      return;
    }

    const timer = setTimeout(() => {
      setTraceState((prev) => ({
        ...prev,
        completedSteps: prev.completedSteps + 1,
      }));
    }, 240);

    return () => clearTimeout(timer);
  }, [traceState]);

  const handleRunTrace = (file: CodeFile) => {
    setTraceState({
      file,
      completedSteps: 0,
      running: true,
    });
  };

  const totalTraceUs = traceState.file
    ? traceState.file.traceSteps
        .slice(0, traceState.completedSteps)
        .reduce((sum, s) => sum + s.durationUs, 0)
    : 0;

  return (
    <div className="space-y-10 py-10 pb-20">
      {/* Screen Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div className="space-y-2 max-w-2xl">
          <p className="font-mono text-xs font-semibold tracking-[0.08em] text-[#00D4FF] uppercase">
            Systems & Firmware Architecture
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-[#F8FAFC] text-balance">
            Code Inspector & Production Blueprints
          </h1>
          <p className="text-sm md:text-base text-[#94A3B8]">
            Select any deployed system to inspect its bare-metal ring buffers, MQTT workers, and
            simulated microsecond execution trace.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onSelectProject(activeSystem)}
          className="btn-ghost-shell inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs cursor-pointer self-start md:self-auto whitespace-nowrap shrink-0"
        >
          <span>Full Case Study</span>
          <ArrowUpRight className="h-4 w-4" />
        </button>
      </div>

      {/* Main Asymmetric Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left System Selector Column */}
        <aside className="lg:col-span-4 space-y-3">
          {ENGINEERING_SYSTEMS.map((sys) => {
            const isSelected = sys.id === activeSystem.id;
            return (
              <button
                key={sys.id}
                type="button"
                onClick={() => {
                  setSelectedId(sys.id);
                  setTraceState({ file: null, completedSteps: 0, running: false });
                }}
                className={`w-full text-left rounded-xl p-4 transition-all duration-150 cursor-pointer border ${
                  isSelected
                    ? 'bg-[#0E162B]/90 border-[#00D4FF]/55 shadow-[0_0_24px_-6px_rgba(0,212,255,0.28)]'
                    : 'bg-[#0E162B]/45 border-white/[0.08] hover:border-[#00D4FF]/30'
                }`}
              >
                <div className="flex items-center justify-between gap-2 font-mono text-[11px] text-[#94A3B8]">
                  <span>{sys.year}</span>
                  <span className="text-[#00D4FF] truncate">{sys.hardwareTarget}</span>
                </div>
                <div className="mt-1.5 font-display text-base font-semibold text-[#F8FAFC]">
                  {sys.title}
                </div>
                <p className="mt-1 text-xs leading-relaxed text-[#94A3B8] line-clamp-2">
                  {sys.architectureNote}
                </p>
              </button>
            );
          })}

          {/* Selected System Specification Matrix */}
          <div className="glass-panel rounded-xl p-4 space-y-3 mt-4">
            <div className="flex items-center gap-2 font-mono text-xs font-semibold text-[#d2bbff]">
              <Cpu className="h-4 w-4" />
              <span>Target Specification</span>
            </div>
            <dl className="space-y-2 text-xs">
              {activeSystem.caseStudy.specs.map((spec) => (
                <div
                  key={spec.key}
                  className="flex items-baseline justify-between gap-3 border-b border-white/[0.06] pb-1.5"
                >
                  <dt className="text-[#94A3B8]">{spec.key}</dt>
                  <dd className="font-mono text-[#dee1f9] tabular-nums text-right">
                    {spec.val}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </aside>

        {/* Right Code & Execution Trace Stage */}
        <div className="lg:col-span-8 space-y-6">
          <SyntaxCodeBlock
            key={activeSystem.id}
            files={activeSystem.codeFiles}
            onRunTrace={handleRunTrace}
          />

          {/* Execution Trace Output Panel */}
          <div className="glass-panel rounded-xl p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
              <div>
                <h2 className="font-display text-base font-semibold text-[#F8FAFC]">
                  Deterministic Execution Trace
                </h2>
                <p className="font-mono text-xs text-[#94A3B8]">
                  {traceState.file
                    ? `Profiling ${traceState.file.filename} · ${traceState.file.baudOrClock}`
                    : 'Click "Trace Execution" in the code bar above to profile ISR and worker stages'}
                </p>
              </div>

              {traceState.file && (
                <div className="font-mono text-xs text-[#6af7ba] tabular-nums">
                  Accumulated Budget: {totalTraceUs.toLocaleString()} µs
                </div>
              )}
            </div>

            {traceState.file ? (
              <div className="space-y-2.5">
                {traceState.file.traceSteps.map((step, index) => {
                  const isDone = index < traceState.completedSteps;
                  return (
                    <div
                      key={step.step}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border px-4 py-2.5 transition-all duration-150 ${
                        isDone
                          ? 'border-[#10B981]/35 bg-[#10B981]/[0.06]'
                          : 'border-white/[0.06] bg-[#060A14]/60 opacity-45'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2
                          className={`h-4 w-4 shrink-0 ${
                            isDone ? 'text-[#10B981]' : 'text-[#475569]'
                          }`}
                        />
                        <div>
                          <div className="font-mono text-xs font-semibold text-[#F8FAFC]">
                            {step.step}
                          </div>
                          <div className="text-xs text-[#94A3B8]">{step.detail}</div>
                        </div>
                      </div>
                      <span className="font-mono text-xs font-semibold text-[#00D4FF] tabular-nums shrink-0">
                        +{step.durationUs} µs
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-white/[0.1] bg-[#060A14]/50 px-4 py-6 text-center font-mono text-xs text-[#94A3B8]">
                Awaiting trace trigger. Select any source file tab and press Trace Execution.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
