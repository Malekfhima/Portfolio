import { useEffect, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { HARDWARE_BOARDS } from '../data/orbitData';
import { McuPin, PinProtocol } from '../types';

const PROTOCOL_FILTERS: Array<'ALL' | PinProtocol> = [
  'ALL',
  'SPI',
  'I2C',
  'CAN',
  'UART',
  'GPIO',
  'PWR',
];

const PROTOCOL_COLOR: Record<PinProtocol, string> = {
  SPI: '#00D4FF',
  I2C: '#d2bbff',
  CAN: '#6af7ba',
  UART: '#fbbf24',
  GPIO: '#a8e8ff',
  PWR: '#f87171',
};

function generateSquareWavePath(
  phaseOffset: number,
  cycles: number,
  width: number,
  yHigh: number,
  yLow: number,
  seed: number
): string {
  const stepWidth = width / (cycles * 2);
  let d = `M 0 ${yLow}`;
  for (let i = 0; i < cycles * 2; i++) {
    const x1 = i * stepWidth;
    const x2 = (i + 1) * stepWidth;
    const bitHigh =
      seed === 0
        ? (i + Math.floor(phaseOffset)) % 2 === 0
        : ((i * 3 + seed + Math.floor(phaseOffset)) % 5) < 2;
    const y = bitHigh ? yHigh : yLow;
    d += ` L ${x1.toFixed(1)} ${y} L ${x2.toFixed(1)} ${y}`;
  }
  return d;
}

export function HardwareLabScreen() {
  const [boardId, setBoardId] = useState<'esp32s3' | 'stm32h7'>('esp32s3');
  const [protocolFilter, setProtocolFilter] = useState<'ALL' | PinProtocol>('ALL');
  const [selectedPinNumber, setSelectedPinNumber] = useState<number>(3);
  const [timebaseUs, setTimebaseUs] = useState<number>(25);
  const [oscRunning, setOscRunning] = useState<boolean>(true);
  const [phase, setPhase] = useState<number>(0);

  const board = HARDWARE_BOARDS.find((b) => b.id === boardId) ?? HARDWARE_BOARDS[0];
  const selectedPin: McuPin =
    board.pins.find((p) => p.number === selectedPinNumber) ?? board.pins[0];

  const leftPins = board.pins.filter((p) => p.side === 'left');
  const rightPins = board.pins.filter((p) => p.side === 'right');

  useEffect(() => {
    if (!oscRunning) return;
    const interval = setInterval(() => {
      setPhase((prev) => (prev + 1) % 64);
    }, 180);
    return () => clearInterval(interval);
  }, [oscRunning]);

  const pinMatchesFilter = (pin: McuPin) =>
    protocolFilter === 'ALL' || pin.protocol === protocolFilter;

  const waveCycles = Math.max(4, Math.min(18, Math.round(250 / timebaseUs)));

  return (
    <div className="space-y-8 py-10 pb-20">
      {/* Header & Board Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-white/[0.08] pb-6">
        <div className="space-y-2 max-w-2xl">
          <p className="font-mono text-xs font-semibold tracking-[0.08em] text-[#00D4FF] uppercase">
            Hardware & Pinout Lab
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-[#F8FAFC] text-balance">
            Interactive MCU Pinout & Bus Timing Analyzer
          </h1>
          <p className="text-sm md:text-base text-[#94A3B8]">
            Click any physical header pin on the schematic to inspect DMA routing, pull-up
            topology, and live bus logic timing.
          </p>
        </div>

        {/* Board Selector */}
        <div
          role="group"
          aria-label="Select microcontroller target"
          className="inline-flex items-center gap-1 rounded-xl border border-white/[0.08] bg-[#0E162B]/80 p-1 self-start"
        >
          {HARDWARE_BOARDS.map((b) => {
            const active = b.id === board.id;
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => {
                  setBoardId(b.id);
                  setSelectedPinNumber(2);
                }}
                className={`rounded-lg px-4 py-2 font-mono text-xs whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                  active
                    ? 'bg-[#00D4FF] text-[#0A0F1F] font-bold'
                    : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                }`}
              >
                {b.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bus Filter Row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div
          role="group"
          aria-label="Filter pins by bus protocol"
          className="inline-flex flex-wrap items-center gap-1.5"
        >
          {PROTOCOL_FILTERS.map((proto) => {
            const active = protocolFilter === proto;
            return (
              <button
                key={proto}
                type="button"
                onClick={() => setProtocolFilter(proto)}
                className={`rounded-md px-3 py-1.5 font-mono text-xs cursor-pointer transition-colors border whitespace-nowrap shrink-0 ${
                  active
                    ? 'border-[#00D4FF]/60 bg-[#00D4FF]/15 text-[#00D4FF]'
                    : 'border-white/[0.08] bg-[#0E162B]/50 text-[#94A3B8] hover:text-[#F8FAFC]'
                }`}
              >
                {proto === 'ALL' ? 'All Buses' : proto}
              </button>
            );
          })}
        </div>

        <div className="font-mono text-xs text-[#94A3B8]">
          {board.architecture} · {board.sram}
        </div>
      </div>

      {/* Main Hardware Schematic + Pin Inspector Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Interactive PCB Schematic Card */}
        <div className="lg:col-span-7 glass-panel schematic-grid rounded-2xl p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 pb-4 border-b border-white/[0.08]">
            <span className="font-mono text-xs text-[#00D4FF]">{board.name} · 4-Layer PCB</span>
            <span className="font-mono text-xs text-[#94A3B8] tabular-nums">
              {board.clockSpeed} · {board.flash}
            </span>
          </div>

          {/* Interactive Dual-Header MCU Layout */}
          <div className="my-6 grid grid-cols-12 gap-2 items-center">
            {/* Left Pin Column */}
            <div className="col-span-4 space-y-2">
              {leftPins.map((pin) => {
                const isSelected = pin.number === selectedPin.number;
                const dimmed = !pinMatchesFilter(pin);
                const accent = PROTOCOL_COLOR[pin.protocol];
                return (
                  <button
                    key={pin.number}
                    type="button"
                    onClick={() => setSelectedPinNumber(pin.number)}
                    className={`flex w-full items-center justify-between gap-2 rounded-md border px-2.5 py-1.5 font-mono text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#00D4FF] bg-[#00D4FF]/15 text-[#F8FAFC] shadow-[0_0_16px_-4px_rgba(0,212,255,0.45)]'
                        : 'border-white/[0.08] bg-[#080D1D]/85 text-[#bbc9cf] hover:border-white/25'
                    } ${dimmed ? 'opacity-30' : 'opacity-100'}`}
                  >
                    <span className="truncate">{pin.label}</span>
                    <span
                      className="text-[10px] shrink-0 tabular-nums"
                      style={{ color: accent }}
                    >
                      {pin.gpio}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Center Silicon Die & PCB Traces */}
            <div className="col-span-4 flex flex-col items-center justify-center px-2">
              <div className="relative flex w-full flex-col items-center justify-center rounded-xl border border-[#00D4FF]/30 bg-[#060A14] p-5 text-center shadow-[0_0_32px_-8px_rgba(0,212,255,0.2)]">
                <div className="font-mono text-[10px] tracking-[0.12em] text-[#94A3B8] uppercase">
                  Active Target
                </div>
                <div className="mt-1 font-display text-sm font-bold text-[#F8FAFC]">
                  {board.id === 'esp32s3' ? 'ESP32-S3' : 'STM32H743'}
                </div>
                <div className="mt-3 h-px w-full bg-white/[0.08]" />
                <div className="mt-3 font-mono text-[11px] text-[#00D4FF] tabular-nums">
                  Pin #{selectedPin.number}
                </div>
                <div className="mt-0.5 font-mono text-xs font-semibold text-[#6af7ba]">
                  {selectedPin.label}
                </div>
                <div className="mt-1 font-mono text-[10px] text-[#94A3B8]">
                  {selectedPin.protocol} Bus
                </div>
              </div>
            </div>

            {/* Right Pin Column */}
            <div className="col-span-4 space-y-2">
              {rightPins.map((pin) => {
                const isSelected = pin.number === selectedPin.number;
                const dimmed = !pinMatchesFilter(pin);
                const accent = PROTOCOL_COLOR[pin.protocol];
                return (
                  <button
                    key={pin.number}
                    type="button"
                    onClick={() => setSelectedPinNumber(pin.number)}
                    className={`flex w-full items-center justify-between gap-2 rounded-md border px-2.5 py-1.5 font-mono text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#00D4FF] bg-[#00D4FF]/15 text-[#F8FAFC] shadow-[0_0_16px_-4px_rgba(0,212,255,0.45)]'
                        : 'border-white/[0.08] bg-[#080D1D]/85 text-[#bbc9cf] hover:border-white/25'
                    } ${dimmed ? 'opacity-30' : 'opacity-100'}`}
                  >
                    <span
                      className="text-[10px] shrink-0 tabular-nums"
                      style={{ color: accent }}
                    >
                      {pin.gpio}
                    </span>
                    <span className="truncate text-right">{pin.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="font-mono text-xs text-[#94A3B8] border-t border-white/[0.08] pt-3">
            {board.busSummary}
          </div>
        </div>

        {/* Right Pin Manifest & Electrical Characteristics */}
        <div className="lg:col-span-5 glass-panel rounded-2xl p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3 border-b border-white/[0.08] pb-4">
              <div>
                <p className="font-mono text-xs text-[#00D4FF]">
                  Pin #{selectedPin.number} · {selectedPin.gpio}
                </p>
                <h2 className="mt-1 font-display text-2xl font-semibold text-[#F8FAFC]">
                  {selectedPin.label}
                </h2>
                <p className="text-sm text-[#94A3B8] mt-0.5">{selectedPin.peripheral}</p>
              </div>
              <span
                className="rounded-md border px-2.5 py-1 font-mono text-xs font-semibold shrink-0"
                style={{
                  color: PROTOCOL_COLOR[selectedPin.protocol],
                  borderColor: `${PROTOCOL_COLOR[selectedPin.protocol]}55`,
                  backgroundColor: `${PROTOCOL_COLOR[selectedPin.protocol]}14`,
                }}
              >
                {selectedPin.protocol}
              </span>
            </div>

            <p className="text-sm leading-relaxed text-[#bbc9cf]">
              {selectedPin.description}
            </p>

            <dl className="grid grid-cols-2 gap-3 pt-2">
              <div className="rounded-xl border border-white/[0.07] bg-[#080D1D]/80 p-3">
                <dt className="font-mono text-[11px] text-[#94A3B8]">Logic Voltage</dt>
                <dd className="mt-1 font-mono text-sm font-semibold text-[#F8FAFC] tabular-nums">
                  {selectedPin.voltage}
                </dd>
              </div>
              <div className="rounded-xl border border-white/[0.07] bg-[#080D1D]/80 p-3">
                <dt className="font-mono text-[11px] text-[#94A3B8]">Max Clock / Rate</dt>
                <dd className="mt-1 font-mono text-sm font-semibold text-[#00D4FF] tabular-nums">
                  {selectedPin.maxClock}
                </dd>
              </div>
              <div className="rounded-xl border border-white/[0.07] bg-[#080D1D]/80 p-3">
                <dt className="font-mono text-[11px] text-[#94A3B8]">DMA Allocation</dt>
                <dd className="mt-1 font-mono text-sm font-semibold text-[#d2bbff]">
                  {selectedPin.dmaChannel}
                </dd>
              </div>
              <div className="rounded-xl border border-white/[0.07] bg-[#080D1D]/80 p-3">
                <dt className="font-mono text-[11px] text-[#94A3B8]">Termination / Pull</dt>
                <dd className="mt-1 font-mono text-sm font-semibold text-[#6af7ba]">
                  {selectedPin.pullMode}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-[#060A14] p-4 font-mono text-xs text-[#94A3B8]">
            Tip: Adjust the Logic Analyzer timebase below to inspect clock edges for{' '}
            <span className="text-[#F8FAFC]">{selectedPin.label}</span>.
          </div>
        </div>
      </div>

      {/* Interactive Bus Logic Timing Analyzer */}
      <section className="glass-panel rounded-2xl p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
          <div>
            <h2 className="font-display text-lg font-semibold text-[#F8FAFC]">
              Bus Logic Timing Waveform ({selectedPin.protocol})
            </h2>
            <p className="font-mono text-xs text-[#94A3B8] tabular-nums">
              Channel A: CLK / Sync · Channel B: {selectedPin.label} Data · Timebase:{' '}
              {timebaseUs} µs/div
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 font-mono text-xs text-[#94A3B8]">
              <span>Timebase</span>
              <select
                value={timebaseUs}
                onChange={(e) => setTimebaseUs(Number(e.target.value))}
                className="terminal-cavity rounded-md px-2.5 py-1.5 font-mono text-xs text-[#dee1f9] cursor-pointer"
              >
                <option value={10}>10 µs/div</option>
                <option value={25}>25 µs/div</option>
                <option value={50}>50 µs/div</option>
                <option value={100}>100 µs/div</option>
              </select>
            </label>

            <button
              type="button"
              onClick={() => setOscRunning((prev) => !prev)}
              className="btn-ghost-shell inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs cursor-pointer whitespace-nowrap shrink-0"
            >
              {oscRunning ? (
                <>
                  <Pause className="h-3.5 w-3.5" />
                  <span>Freeze Trace</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5" />
                  <span>Resume Trace</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* SVG Oscilloscope Canvas */}
        <div className="overflow-x-auto rounded-xl border border-white/[0.08] bg-[#060A14] p-4">
          <svg
            viewBox="0 0 800 180"
            className="w-full min-w-[560px] h-44"
            role="img"
            aria-label={`Logic timing diagram for ${selectedPin.label}`}
          >
            {/* Grid Lines */}
            {[40, 80, 120, 160].map((y) => (
              <line
                key={y}
                x1="0"
                y1={y}
                x2="800"
                y2={y}
                stroke="rgba(255,255,255,0.06)"
                strokeDasharray="4 4"
              />
            ))}
            {[100, 200, 300, 400, 500, 600, 700].map((x) => (
              <line
                key={x}
                x1={x}
                y1="0"
                x2={x}
                y2="180"
                stroke="rgba(255,255,255,0.05)"
                strokeDasharray="4 4"
              />
            ))}

            {/* Channel A: Reference Clock */}
            <text x="10" y="20" fill="#94A3B8" fontSize="11" fontFamily="JetBrains Mono">
              CH1 · SCLK / REF
            </text>
            <path
              d={generateSquareWavePath(phase, waveCycles, 800, 28, 62, 0)}
              fill="none"
              stroke="#00D4FF"
              strokeWidth="2"
            />

            {/* Channel B: Selected Pin Data Line */}
            <text x="10" y="92" fill="#94A3B8" fontSize="11" fontFamily="JetBrains Mono">
              CH2 · {selectedPin.label} ({selectedPin.gpio})
            </text>
            <path
              d={generateSquareWavePath(phase, waveCycles, 800, 100, 134, selectedPin.number)}
              fill="none"
              stroke="#d2bbff"
              strokeWidth="2"
            />

            {/* Channel C: Frame / CS Gate */}
            <text x="10" y="156" fill="#6af7ba" fontSize="11" fontFamily="JetBrains Mono">
              CH3 · DMA_ACTIVE
            </text>
            <path
              d={generateSquareWavePath(Math.floor(phase / 2), Math.max(2, Math.floor(waveCycles / 3)), 800, 146, 170, 2)}
              fill="none"
              stroke="#10B981"
              strokeWidth="1.75"
            />
          </svg>
        </div>
      </section>
    </div>
  );
}
