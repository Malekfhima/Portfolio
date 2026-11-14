import { useEffect, useMemo, useState } from 'react';
import { Download, Pause, Play, Zap } from 'lucide-react';
import { TELEMETRY_NODES } from '../data/orbitData';
import { EventSeverity, TelemetryEvent, TelemetryNode, TelemetrySample } from '../types';

function formatClock(date: Date): string {
  return date.toTimeString().slice(0, 8);
}

function buildInitialSamples(node: TelemetryNode): TelemetrySample[] {
  const now = Date.now();
  return Array.from({ length: 28 }, (_, idx) => {
    const t = new Date(now - (27 - idx) * 500);
    const wave = Math.sin(idx * 0.45);
    const wave2 = Math.cos(idx * 0.3);
    return {
      timestamp: formatClock(t),
      rttMs: Number((node.baseRttMs + wave * 1.4).toFixed(1)),
      tempC: Number((node.baseTempC + wave2 * 0.6).toFixed(1)),
      heapPct: Number((node.baseHeapPct + wave * 1.8).toFixed(1)),
      throughputKbps: Math.round(node.baseThroughputKbps + wave2 * 95),
    };
  });
}

function buildPolyline(values: number[], width: number, height: number, min: number, max: number) {
  if (values.length < 2) return '';
  const span = Math.max(0.1, max - min);
  return values
    .map((val, idx) => {
      const x = (idx / (values.length - 1)) * width;
      const norm = Math.max(0, Math.min(1, (val - min) / span));
      const y = height - norm * (height - 20) - 10;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}

const SEVERITY_STYLE: Record<EventSeverity, { glyph: string; colorClass: string }> = {
  Nominal: { glyph: '● Nominal', colorClass: 'text-[#6af7ba]' },
  Warning: { glyph: '▲ Warning', colorClass: 'text-[#fbbf24]' },
  Fault: { glyph: '✖ Fault', colorClass: 'text-[#ffb4ab]' },
};

export function TelemetryScreen() {
  const [selectedNodeId, setSelectedNodeId] = useState<string>(TELEMETRY_NODES[0].id);
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [intervalMs, setIntervalMs] = useState<number>(500);
  const [spikeRemaining, setSpikeRemaining] = useState<number>(0);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [severityFilter, setSeverityFilter] = useState<'ALL' | EventSeverity>('ALL');

  const activeNode =
    TELEMETRY_NODES.find((n) => n.id === selectedNodeId) ?? TELEMETRY_NODES[0];

  const [samples, setSamples] = useState<TelemetrySample[]>(() =>
    buildInitialSamples(TELEMETRY_NODES[0])
  );

  const [events, setEvents] = useState<TelemetryEvent[]>(() => [
    {
      id: 'evt-1',
      timestamp: formatClock(new Date(Date.now() - 14000)),
      nodeId: 'node-01',
      severity: 'Nominal',
      subsystem: 'MQTT_UPLINK',
      message: 'Session resumed cleanly with zero buffered frame drops',
      metric: '11.1 ms RTT',
    },
    {
      id: 'evt-2',
      timestamp: formatClock(new Date(Date.now() - 9000)),
      nodeId: 'node-01',
      severity: 'Nominal',
      subsystem: 'DMA_RING',
      message: 'ADC burst watermark calibrated at 38% SRAM ring capacity',
      metric: '1,420 kbps',
    },
    {
      id: 'evt-3',
      timestamp: formatClock(new Date(Date.now() - 4000)),
      nodeId: 'node-02',
      severity: 'Warning',
      subsystem: 'LTE_HANDOFF',
      message: 'Cell tower handover increased uplink RTT briefly above 25 ms',
      metric: '26.4 ms RTT',
    },
  ]);

  // Reset series cleanly when node changes
  useEffect(() => {
    setSamples(buildInitialSamples(activeNode));
    setSpikeRemaining(0);
    setHoverIndex(null);
  }, [activeNode]);

  // Live telemetry ticker
  useEffect(() => {
    if (!isStreaming) return;
    const timer = setInterval(() => {
      const now = new Date();
      const ts = formatClock(now);
      const isSpike = spikeRemaining > 0;

      setSamples((prev) => {
        const last = prev[prev.length - 1];
        const jitter = (Math.random() - 0.5) * 1.6;
        const rttDelta = isSpike ? 24 + Math.random() * 14 : jitter;
        const nextSample: TelemetrySample = {
          timestamp: ts,
          rttMs: Number(Math.max(2.1, activeNode.baseRttMs + rttDelta).toFixed(1)),
          tempC: Number(
            (activeNode.baseTempC + Math.sin(Date.now() / 4000) * 0.8 + (isSpike ? 3.4 : 0)).toFixed(1)
          ),
          heapPct: Number(
            Math.min(
              92,
              Math.max(15, last.heapPct + (Math.random() - 0.48) * 1.4 + (isSpike ? 4.2 : 0))
            ).toFixed(1)
          ),
          throughputKbps: Math.max(
            120,
            Math.round(
              activeNode.baseThroughputKbps +
                (Math.random() - 0.5) * 180 -
                (isSpike ? 480 : 0)
            )
          ),
        };
        return [...prev.slice(1), nextSample];
      });

      if (isSpike) {
        setSpikeRemaining((rem) => Math.max(0, rem - 1));
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isStreaming, intervalMs, activeNode, spikeRemaining]);

  const latestSample = samples[samples.length - 1];
  const inspectedSample =
    hoverIndex !== null && samples[hoverIndex] ? samples[hoverIndex] : latestSample;

  const handleInjectSpike = () => {
    setSpikeRemaining(5);
    const ts = formatClock(new Date());
    setEvents((prev) => [
      {
        id: `evt-${Date.now()}`,
        timestamp: ts,
        nodeId: activeNode.id,
        severity: 'Fault',
        subsystem: 'RF_BACKHAUL',
        message: 'Injected synthetic packet-burst contention spike for diagnostic check',
        metric: `${(activeNode.baseRttMs + 28.4).toFixed(1)} ms RTT`,
      },
      ...prev.slice(0, 14),
    ]);
  };

  const handleExportCsv = () => {
    const header = 'timestamp,node_id,rtt_ms,temp_c,heap_pct,throughput_kbps\n';
    const rows = samples
      .map(
        (s) =>
          `${s.timestamp},${activeNode.id},${s.rttMs},${s.tempC},${s.heapPct},${s.throughputKbps}`
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeNode.id}_telemetry_snapshot.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const rttPoints = useMemo(
    () =>
      buildPolyline(
        samples.map((s) => s.rttMs),
        760,
        150,
        0,
        Math.max(45, ...samples.map((s) => s.rttMs + 5))
      ),
    [samples]
  );

  const throughputPoints = useMemo(
    () =>
      buildPolyline(
        samples.map((s) => s.throughputKbps),
        760,
        150,
        0,
        Math.max(2000, ...samples.map((s) => s.throughputKbps + 200))
      ),
    [samples]
  );

  const filteredEvents =
    severityFilter === 'ALL'
      ? events
      : events.filter((ev) => ev.severity === severityFilter);

  return (
    <div className="space-y-8 py-10 pb-20">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-white/[0.08] pb-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.08em]">
            <span className="text-[#00D4FF] font-semibold">Live Telemetry Console</span>
            <span aria-hidden="true" className="text-[#475569]">
              ·
            </span>
            {isStreaming ? (
              <span className="inline-flex items-center gap-1.5 text-[#10B981]">
                <span className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
                Live Stream ({intervalMs} ms)
              </span>
            ) : (
              <span className="text-[#94A3B8]">Stream Paused</span>
            )}
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-[#F8FAFC] text-balance">
            Edge Fleet & Cloud Ingest Diagnostics
          </h1>
          <p className="text-sm md:text-base text-[#94A3B8]">
            Inspect live RTT, MCU thermals, SRAM heap utilization, and throughput across field
            gateways. Hover over the chart to probe individual sample timestamps.
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <select
            aria-label="Sampling interval"
            value={intervalMs}
            onChange={(e) => setIntervalMs(Number(e.target.value))}
            className="terminal-cavity rounded-lg px-3 py-2 font-mono text-xs text-[#dee1f9] cursor-pointer"
          >
            <option value={250}>250 ms Rate</option>
            <option value={500}>500 ms Rate</option>
            <option value={1000}>1000 ms Rate</option>
          </select>

          <button
            type="button"
            onClick={() => setIsStreaming((prev) => !prev)}
            className="btn-ghost-shell inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs cursor-pointer whitespace-nowrap shrink-0"
          >
            {isStreaming ? (
              <>
                <Pause className="h-3.5 w-3.5" />
                <span>Pause Stream</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5" />
                <span>Resume Stream</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleInjectSpike}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#7C3AED]/50 bg-[#7C3AED]/15 px-3.5 py-2 font-mono text-xs text-[#d2bbff] hover:bg-[#7C3AED]/25 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Zap className="h-3.5 w-3.5" />
            <span>Test Spike</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="btn-cybernetic inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs cursor-pointer whitespace-nowrap shrink-0"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Node Selector Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {TELEMETRY_NODES.map((node) => {
          const isSelected = node.id === activeNode.id;
          return (
            <button
              key={node.id}
              type="button"
              onClick={() => setSelectedNodeId(node.id)}
              className={`text-left rounded-xl p-4 transition-all duration-150 cursor-pointer border ${
                isSelected
                  ? 'bg-[#0E162B]/90 border-[#00D4FF]/60 shadow-[0_0_24px_-6px_rgba(0,212,255,0.3)]'
                  : 'bg-[#0E162B]/45 border-white/[0.08] hover:border-[#00D4FF]/30'
              }`}
            >
              <div className="font-mono text-[11px] text-[#00D4FF]">{node.mcu}</div>
              <div className="mt-1 font-display text-sm font-semibold text-[#F8FAFC] truncate">
                {node.name}
              </div>
              <div className="mt-1 font-mono text-xs text-[#94A3B8] truncate">
                {node.location} · {node.transport}
              </div>
            </button>
          );
        })}
      </div>

      {/* Live Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel rounded-xl p-4">
          <div className="font-mono text-[11px] uppercase tracking-wider text-[#94A3B8]">
            Packet Round-Trip
          </div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="font-mono text-3xl font-bold text-[#00D4FF] tabular-nums">
              {inspectedSample.rttMs.toFixed(1)}
            </span>
            <span className="font-mono text-xs text-[#94A3B8]">ms</span>
          </div>
          <div className="mt-1 font-mono text-[11px] text-[#94A3B8] tabular-nums">
            Sampled @ {inspectedSample.timestamp}
          </div>
        </div>

        <div className="glass-panel rounded-xl p-4">
          <div className="font-mono text-[11px] uppercase tracking-wider text-[#94A3B8]">
            Bus Throughput
          </div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="font-mono text-3xl font-bold text-[#d2bbff] tabular-nums">
              {inspectedSample.throughputKbps.toLocaleString()}
            </span>
            <span className="font-mono text-xs text-[#94A3B8]">kbps</span>
          </div>
          <div className="mt-1 font-mono text-[11px] text-[#94A3B8]">
            {activeNode.transport}
          </div>
        </div>

        <div className="glass-panel rounded-xl p-4">
          <div className="font-mono text-[11px] uppercase tracking-wider text-[#94A3B8]">
            Silicon Core Temp
          </div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="font-mono text-3xl font-bold text-[#6af7ba] tabular-nums">
              {inspectedSample.tempC.toFixed(1)}
            </span>
            <span className="font-mono text-xs text-[#94A3B8]">°C</span>
          </div>
          <div className="mt-1 font-mono text-[11px] text-[#94A3B8]">
            Thermal Envelope Nominal
          </div>
        </div>

        <div className="glass-panel rounded-xl p-4">
          <div className="font-mono text-[11px] uppercase tracking-wider text-[#94A3B8]">
            SRAM Heap Allocation
          </div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="font-mono text-3xl font-bold text-[#F8FAFC] tabular-nums">
              {inspectedSample.heapPct.toFixed(1)}
            </span>
            <span className="font-mono text-xs text-[#94A3B8]">%</span>
          </div>
          <div className="mt-1 font-mono text-[11px] text-[#94A3B8]">
            Zero-Fragmentation Pool
          </div>
        </div>
      </div>

      {/* Multi-Channel Time-Series SVG Stage */}
      <section className="glass-panel rounded-2xl p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
          <div>
            <h2 className="font-display text-lg font-semibold text-[#F8FAFC]">
              Synchronized Latency & Throughput Stream
            </h2>
            <p className="font-mono text-xs text-[#94A3B8] tabular-nums">
              Cyan: Packet RTT (ms) · Violet: Bus Throughput (kbps) · Hover across trace to probe
            </p>
          </div>
          <div className="font-mono text-xs text-[#00D4FF] tabular-nums">
            Probe: {inspectedSample.timestamp} · {inspectedSample.rttMs} ms ·{' '}
            {inspectedSample.throughputKbps} kbps
          </div>
        </div>

        <div
          className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-[#060A14] p-4"
          onMouseLeave={() => setHoverIndex(null)}
        >
          <svg
            viewBox="0 0 760 160"
            className="w-full h-44 cursor-crosshair"
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
              const idx = Math.round(ratio * (samples.length - 1));
              setHoverIndex(idx);
            }}
          >
            {[35, 75, 115].map((y) => (
              <line
                key={y}
                x1="0"
                y1={y}
                x2="760"
                y2={y}
                stroke="rgba(255,255,255,0.06)"
                strokeDasharray="4 4"
              />
            ))}

            {/* Throughput Trace */}
            <polyline
              fill="none"
              stroke="#7C3AED"
              strokeWidth="2"
              strokeOpacity="0.85"
              points={throughputPoints}
            />

            {/* RTT Trace */}
            <polyline
              fill="none"
              stroke="#00D4FF"
              strokeWidth="2.5"
              points={rttPoints}
            />

            {/* Interactive Crosshair */}
            {hoverIndex !== null && (
              <line
                x1={(hoverIndex / (samples.length - 1)) * 760}
                y1="0"
                x2={(hoverIndex / (samples.length - 1)) * 760}
                y2="160"
                stroke="#6af7ba"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
            )}
          </svg>
        </div>
      </section>

      {/* Diagnostic Event Stream Table */}
      <section className="glass-panel rounded-2xl p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
          <h2 className="font-display text-lg font-semibold text-[#F8FAFC]">
            Subsystem Event Log
          </h2>
          <div
            role="group"
            aria-label="Filter telemetry events by severity"
            className="inline-flex items-center gap-1 rounded-lg border border-white/[0.08] bg-[#060A14] p-1"
          >
            {(['ALL', 'Nominal', 'Warning', 'Fault'] as const).map((sev) => (
              <button
                key={sev}
                type="button"
                onClick={() => setSeverityFilter(sev)}
                className={`rounded-md px-3 py-1 font-mono text-xs cursor-pointer transition-colors whitespace-nowrap shrink-0 ${
                  severityFilter === sev
                    ? 'bg-[#00D4FF] text-[#0A0F1F] font-bold'
                    : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                }`}
              >
                {sev === 'ALL' ? 'All Events' : sev}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/[0.08] font-mono text-xs text-[#94A3B8]">
                <th className="py-2.5 pr-4 font-medium">Timestamp</th>
                <th className="py-2.5 pr-4 font-medium">State</th>
                <th className="py-2.5 pr-4 font-medium">Node</th>
                <th className="py-2.5 pr-4 font-medium">Subsystem</th>
                <th className="py-2.5 pr-4 font-medium">Diagnostic Detail</th>
                <th className="py-2.5 text-right font-medium">Reading</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {filteredEvents.map((ev) => {
                const style = SEVERITY_STYLE[ev.severity];
                return (
                  <tr key={ev.id} className="hover:bg-white/[0.02]">
                    <td className="py-3 pr-4 font-mono text-xs text-[#94A3B8] tabular-nums whitespace-nowrap">
                      {ev.timestamp}
                    </td>
                    <td
                      className={`py-3 pr-4 font-mono text-xs font-semibold whitespace-nowrap ${style.colorClass}`}
                    >
                      {style.glyph}
                    </td>
                    <td className="py-3 pr-4 font-mono text-xs text-[#dee1f9] whitespace-nowrap">
                      {ev.nodeId}
                    </td>
                    <td className="py-3 pr-4 font-mono text-xs text-[#d2bbff] whitespace-nowrap">
                      {ev.subsystem}
                    </td>
                    <td className="py-3 pr-4 text-xs text-[#bbc9cf] min-w-[240px]">
                      {ev.message}
                    </td>
                    <td className="py-3 text-right font-mono text-xs text-[#00D4FF] tabular-nums whitespace-nowrap">
                      {ev.metric}
                    </td>
                  </tr>
                );
              })}
              {filteredEvents.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center font-mono text-xs text-[#94A3B8]">
                    No events match the selected severity filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
