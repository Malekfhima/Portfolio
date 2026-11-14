import { useState } from 'react';
import { ArrowRight, ArrowUpRight, Cpu, Layers, Radio } from 'lucide-react';
import { ENGINEERING_SYSTEMS, HERO_KPIS, ORBIT_NODES } from '../data/orbitData';
import { EngineeringSystem, ProjectCategory, ScreenId } from '../types';

interface OverviewScreenProps {
  onNavigate: (screen: ScreenId, systemId?: string) => void;
  onSelectProject: (system: EngineeringSystem) => void;
}

const FILTER_OPTIONS: { id: ProjectCategory; label: string }[] = [
  { id: 'all', label: 'All Systems' },
  { id: 'embedded', label: 'Embedded & IoT' },
  { id: 'fullstack', label: 'Full-Stack Cloud' },
  { id: 'edge-ai', label: 'Edge AI' },
];

export function OverviewScreen({ onNavigate, onSelectProject }: OverviewScreenProps) {
  const [activeOrbitId, setActiveOrbitId] = useState<string>(ORBIT_NODES[0].id);
  const [filter, setFilter] = useState<ProjectCategory>('all');

  const activeOrbitNode =
    ORBIT_NODES.find((node) => node.id === activeOrbitId) ?? ORBIT_NODES[0];

  const filteredSystems =
    filter === 'all'
      ? ENGINEERING_SYSTEMS
      : ENGINEERING_SYSTEMS.filter((sys) => sys.category === filter);

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Split */}
      <section className="pt-10 md:pt-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Typography Column */}
          <div className="lg:col-span-6 flex flex-col justify-between py-2">
            <div className="space-y-6">
              <p className="font-mono text-xs font-semibold tracking-[0.08em] text-[#00D4FF] uppercase">
                Full-Stack Architecture · Embedded & IoT Systems
              </p>

              <h1 className="font-display text-[clamp(2.25rem,4vw,3.5rem)] font-bold leading-[1.1] tracking-[-0.03em] text-[#F8FAFC] text-balance">
                Engineering low-latency cloud platforms and deterministic hardware.
              </h1>

              <p className="max-w-xl text-base md:text-lg leading-relaxed text-[#94A3B8]">
                I design end-to-end telemetry systems uniting bare-metal C/FreeRTOS firmware,
                custom 4-layer PCBs, and high-throughput TypeScript control planes built for
                sub-15 ms field visibility.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => onNavigate('systems')}
                className="btn-cybernetic inline-flex items-center gap-2 rounded-lg px-5 py-3 text-xs tracking-wide cursor-pointer whitespace-nowrap shrink-0"
              >
                <span>Explore Systems</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('telemetry')}
                className="btn-ghost-shell inline-flex items-center gap-2 rounded-lg px-5 py-3 text-xs tracking-wide cursor-pointer whitespace-nowrap shrink-0"
              >
                <span>Open Telemetry Console</span>
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Right Column: Interactive Edge-to-Cloud Orbit Visualizer */}
          <div className="lg:col-span-6 flex">
            <div className="glass-panel schematic-grid relative flex w-full flex-col justify-between rounded-2xl p-6 overflow-hidden">
              <div className="flex items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
                <div>
                  <h2 className="font-display text-base font-semibold text-[#F8FAFC]">
                    Edge-to-Cloud Signal Topology
                  </h2>
                  <p className="font-mono text-xs text-[#94A3B8] mt-0.5">
                    Select a stage to inspect wire budget and buffer specs
                  </p>
                </div>
                <span className="font-mono text-xs text-[#00D4FF] tabular-nums whitespace-nowrap shrink-0">
                  11.4 ms Total RTT
                </span>
              </div>

              {/* Interactive Orbital Diagram */}
              <div className="relative my-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ORBIT_NODES.map((node, index) => {
                  const isSelected = node.id === activeOrbitNode.id;
                  return (
                    <button
                      key={node.id}
                      type="button"
                      onClick={() => setActiveOrbitId(node.id)}
                      className={`group relative text-left rounded-xl p-4 transition-all duration-150 cursor-pointer border ${
                        isSelected
                          ? 'bg-[#00D4FF]/10 border-[#00D4FF]/55 shadow-[0_0_24px_-6px_rgba(0,212,255,0.35)]'
                          : 'bg-[#080D1D]/75 border-white/[0.08] hover:border-[#00D4FF]/35'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[11px] font-semibold text-[#94A3B8] tabular-nums">
                          0{index + 1} · {node.protocol}
                        </span>
                        <span
                          className={`font-mono text-[11px] tabular-nums ${
                            isSelected ? 'text-[#00D4FF]' : 'text-[#6af7ba]'
                          }`}
                        >
                          {node.latency}
                        </span>
                      </div>
                      <div className="mt-2 font-display text-sm font-semibold text-[#F8FAFC]">
                        {node.title}
                      </div>
                      <div className="mt-0.5 font-mono text-xs text-[#94A3B8]">
                        {node.subtitle}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Active Stage Detail Readout */}
              <div className="rounded-xl border border-white/[0.08] bg-[#060A14]/90 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-xs font-semibold text-[#00D4FF]">
                    {activeOrbitNode.title}
                  </span>
                  <span className="font-mono text-xs text-[#d2bbff] tabular-nums">
                    {activeOrbitNode.throughput} · {activeOrbitNode.latency}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-[#bbc9cf]">
                  {activeOrbitNode.description}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Full-Width 4-Column KPI Strip below Hero Split */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 border-y border-white/[0.08] py-6">
          {HERO_KPIS.map((kpi) => (
            <div key={kpi.label} className="space-y-1 px-2">
              <div className="font-display text-2xl md:text-3xl font-bold text-[#F8FAFC] tabular-nums">
                {kpi.value}
              </div>
              <div className="font-mono text-xs font-semibold text-[#00D4FF] uppercase tracking-wider">
                {kpi.label}
              </div>
              <div className="text-xs text-[#94A3B8]">{kpi.detail}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Engineering Systems */}
      <section className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-[#F8FAFC] text-balance">
              Selected Systems & Production Deployments
            </h2>
            <p className="text-sm md:text-base text-[#94A3B8]">
              Filter by architecture layer or open any system to review its hardware targets,
              throughput benchmarks, and production code.
            </p>
          </div>

          {/* Interactive Filter Controls */}
          <div
            role="group"
            aria-label="Filter systems by category"
            className="inline-flex flex-wrap items-center gap-1 rounded-xl border border-white/[0.08] bg-[#0E162B]/70 p-1 self-start"
          >
            {FILTER_OPTIONS.map((opt) => {
              const active = filter === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setFilter(opt.id)}
                  className={`rounded-lg px-3.5 py-1.5 font-mono text-xs whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                    active
                      ? 'bg-[#00D4FF] text-[#0A0F1F] font-bold'
                      : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Systems Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredSystems.map((system) => (
            <article
              key={system.id}
              className="glass-card flex flex-col justify-between rounded-2xl p-6"
            >
              <div>
                {/* Quiet unboxed metadata kicker */}
                <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs text-[#94A3B8]">
                  <span>{system.kicker}</span>
                  <span className="text-[#00D4FF]">{system.hardwareTarget}</span>
                </div>

                <h3 className="mt-3 font-display text-xl font-semibold text-[#F8FAFC]">
                  {system.title}
                </h3>

                <p className="mt-2.5 text-sm leading-relaxed text-[#bbc9cf]">
                  {system.summary}
                </p>

                {/* Inline Metrics Row */}
                <div className="mt-5 grid grid-cols-3 gap-4 border-y border-white/[0.07] py-3.5">
                  {system.metrics.map((m) => (
                    <div key={m.label}>
                      <div className="font-display text-lg font-bold text-[#F8FAFC] tabular-nums">
                        {m.value}
                      </div>
                      <div className="font-mono text-[11px] text-[#94A3B8]">{m.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                <div className="font-mono text-xs text-[#94A3B8]">
                  {system.stack.slice(0, 4).join(' · ')}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => onNavigate('systems', system.id)}
                    className="font-mono text-xs text-[#d2bbff] hover:text-[#eaddff] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    Code Inspector
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectProject(system)}
                    className="btn-ghost-shell inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <span>Case Study</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Core Engineering Disciplines & Quick Screen Entry */}
      <section className="border-t border-white/[0.08] pt-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <Cpu className="h-5 w-5 text-[#00D4FF]" aria-hidden="true" />
            <h3 className="font-display text-lg font-semibold text-[#F8FAFC]">
              01. Bare-Metal & RTOS Firmware
            </h3>
            <p className="text-sm leading-relaxed text-[#94A3B8]">
              Lock-free DMA ring buffers, deterministic interrupt latency, and hardware-timed bus
              arbitration across STM32H7 and ESP32-S3 targets.
            </p>
            <button
              type="button"
              onClick={() => onNavigate('hardware')}
              className="inline-flex items-center gap-1.5 font-mono text-xs text-[#00D4FF] hover:underline cursor-pointer"
            >
              <span>Inspect Pinout Lab</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            <Layers className="h-5 w-5 text-[#d2bbff]" aria-hidden="true" />
            <h3 className="font-display text-lg font-semibold text-[#F8FAFC]">
              02. High-Throughput Cloud Planes
            </h3>
            <p className="text-sm leading-relaxed text-[#94A3B8]">
              TypeScript stream workers, MQTT v5 brokers, and partitioned TimescaleDB schemas built
              to ingest tens of thousands of frames per second.
            </p>
            <button
              type="button"
              onClick={() => onNavigate('systems')}
              className="inline-flex items-center gap-1.5 font-mono text-xs text-[#d2bbff] hover:underline cursor-pointer"
            >
              <span>Review Code Architecture</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            <Radio className="h-5 w-5 text-[#6af7ba]" aria-hidden="true" />
            <h3 className="font-display text-lg font-semibold text-[#F8FAFC]">
              03. Real-Time Fleet Telemetry
            </h3>
            <p className="text-sm leading-relaxed text-[#94A3B8]">
              Sub-second operator consoles featuring live oscilloscope signal traces, rolling RTT
              probes, and automated CSV snapshot diagnostics.
            </p>
            <button
              type="button"
              onClick={() => onNavigate('telemetry')}
              className="inline-flex items-center gap-1.5 font-mono text-xs text-[#6af7ba] hover:underline cursor-pointer"
            >
              <span>Launch Live Console</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
