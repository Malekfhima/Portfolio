import { FormEvent, useState } from 'react';
import { Check, Copy, Download, RotateCcw, Send } from 'lucide-react';

interface BriefSubmission {
  id: string;
  name: string;
  email: string;
  scope: string;
  targetLatency: string;
  details: string;
  createdAt: string;
}

const SCOPES = [
  'Full-Stack & IoT Platform',
  'Embedded Firmware & PCB',
  'Real-Time Telemetry Dashboard',
  'Architecture & Latency Audit',
];

export function ContactScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [scope, setScope] = useState(SCOPES[0]);
  const [targetLatency, setTargetLatency] = useState('< 25 ms Edge-to-Cloud');
  const [details, setDetails] = useState('');
  const [commandFocused, setCommandFocused] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);
  const [submitted, setSubmitted] = useState<BriefSubmission | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText('malekfhima1@gmail.com');
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 1800);
    } catch {
      setEmailCopied(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !details.trim()) {
      setValidationError('Please enter your name, email address, and project parameters.');
      return;
    }
    setValidationError(null);
    setSubmitted({
      id: `ORB-${Math.floor(1000 + Math.random() * 9000)}`,
      name: name.trim(),
      email: email.trim(),
      scope,
      targetLatency,
      details: details.trim(),
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC',
    });
  };

  const handleDownloadBrief = () => {
    if (!submitted) return;
    const content = [
      `# Architecture Brief (${submitted.id})`,
      `Date: ${submitted.createdAt}`,
      `Contact: ${submitted.name} <${submitted.email}>`,
      `Primary Scope: ${submitted.scope}`,
      `Latency / Scale Target: ${submitted.targetLatency}`,
      '',
      '## System Requirements',
      submitted.details,
    ].join('\n');

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${submitted.id.toLowerCase()}_architecture_brief.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-10 py-10 pb-20">
      <div className="space-y-2 max-w-2xl border-b border-white/[0.08] pb-6">
        <p className="font-mono text-xs font-semibold tracking-[0.08em] text-[#00D4FF] uppercase">
          Engineering Inquiry & Scoping
        </p>
        <h1 className="font-display text-3xl md:text-4xl font-semibold text-[#F8FAFC] text-balance">
          Start a Technical Collaboration
        </h1>
        <p className="text-sm md:text-base text-[#94A3B8]">
          Share your target hardware, cloud throughput constraints, or telemetry goals to generate
          a structured project brief.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Direct Channel & Engagement Models */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <h2 className="font-display text-lg font-semibold text-[#F8FAFC]">
              Direct Engineering Channel
            </h2>
            <p className="text-sm text-[#94A3B8] leading-relaxed">
              Available for full-stack architecture consulting, bare-metal STM32/ESP32 firmware
              bring-up, and high-frequency web telemetry interfaces.
            </p>

            <div className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-[#060A14] px-4 py-3">
              <span className="font-mono text-xs text-[#a8e8ff] truncate">
                malekfhima1@gmail.com
              </span>
              <button
                type="button"
                onClick={handleCopyEmail}
                className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-xs text-[#dee1f9] hover:border-[#00D4FF]/45 cursor-pointer shrink-0"
              >
                {emailCopied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-[#10B981]" />
                    <span className="text-[#10B981]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="space-y-4 px-1">
            <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
              Engagement Tracks
            </h3>
            <div className="space-y-4 border-t border-white/[0.08] pt-4 text-sm">
              <div>
                <div className="font-display font-semibold text-[#F8FAFC]">
                  01. Embedded Firmware & PCB Bring-Up
                </div>
                <p className="mt-1 text-xs leading-relaxed text-[#94A3B8]">
                  FreeRTOS task design, DMA sensor pipelines, SPI/I2C/CAN-FD drivers, and OTA
                  bootloader verification.
                </p>
              </div>
              <div>
                <div className="font-display font-semibold text-[#F8FAFC]">
                  02. Distributed Ingest & Time-Series Cloud
                </div>
                <p className="mt-1 text-xs leading-relaxed text-[#94A3B8]">
                  TypeScript MQTT/WebSocket brokers, Protobuf schema evolution, and TimescaleDB
                  hypertable tuning.
                </p>
              </div>
              <div>
                <div className="font-display font-semibold text-[#F8FAFC]">
                  03. Mission-Control Operator Consoles
                </div>
                <p className="mt-1 text-xs leading-relaxed text-[#94A3B8]">
                  60 fps React telemetry dashboards, live hardware diagnostic tools, and
                  high-contrast design systems.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Terminal Cavity Form */}
        <div className="lg:col-span-7">
          {submitted ? (
            <div className="glass-panel rounded-2xl p-6 md:p-8 space-y-6">
              <div className="flex items-start justify-between gap-4 border-b border-white/[0.08] pb-4">
                <div>
                  <p className="font-mono text-xs font-semibold text-[#6af7ba]">
                    Brief Logged · {submitted.id}
                  </p>
                  <h2 className="mt-1 font-display text-2xl font-semibold text-[#F8FAFC]">
                    Architecture Brief Ready
                  </h2>
                  <p className="font-mono text-xs text-[#94A3B8] mt-1 tabular-nums">
                    {submitted.createdAt}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSubmitted(null)}
                  className="btn-ghost-shell inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>New Brief</span>
                </button>
              </div>

              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="rounded-xl border border-white/[0.07] bg-[#060A14] p-3.5">
                  <dt className="font-mono text-[11px] text-[#94A3B8]">Engineering Lead</dt>
                  <dd className="mt-1 font-medium text-[#F8FAFC]">{submitted.name}</dd>
                </div>
                <div className="rounded-xl border border-white/[0.07] bg-[#060A14] p-3.5">
                  <dt className="font-mono text-[11px] text-[#94A3B8]">Return Address</dt>
                  <dd className="mt-1 font-mono text-xs text-[#00D4FF]">{submitted.email}</dd>
                </div>
                <div className="rounded-xl border border-white/[0.07] bg-[#060A14] p-3.5">
                  <dt className="font-mono text-[11px] text-[#94A3B8]">Selected Track</dt>
                  <dd className="mt-1 text-[#d2bbff]">{submitted.scope}</dd>
                </div>
                <div className="rounded-xl border border-white/[0.07] bg-[#060A14] p-3.5">
                  <dt className="font-mono text-[11px] text-[#94A3B8]">Latency Target</dt>
                  <dd className="mt-1 font-mono text-xs text-[#6af7ba]">
                    {submitted.targetLatency}
                  </dd>
                </div>
              </dl>

              <div className="rounded-xl border border-white/[0.07] bg-[#060A14] p-4">
                <div className="font-mono text-[11px] text-[#94A3B8] mb-2">
                  Technical Specification Summary
                </div>
                <p className="text-sm leading-relaxed text-[#dee1f9] whitespace-pre-wrap">
                  {submitted.details}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <span className="font-mono text-xs text-[#94A3B8]">
                  Download this Markdown brief or email malekfhima1@gmail.com directly.
                </span>
                <button
                  type="button"
                  onClick={handleDownloadBrief}
                  className="btn-cybernetic inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download Brief (.md)</span>
                </button>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="glass-panel rounded-2xl p-6 md:p-8 space-y-5"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block space-y-1.5">
                  <span className="font-mono text-xs text-[#94A3B8]">Your Name</span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Mercer"
                    className="terminal-cavity w-full rounded-lg px-3.5 py-2.5 font-mono text-sm text-[#dee1f9] placeholder:text-[#475569]"
                  />
                </label>

                <label className="block space-y-1.5">
                  <span className="font-mono text-xs text-[#94A3B8]">Work Email</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@company.io"
                    className="terminal-cavity w-full rounded-lg px-3.5 py-2.5 font-mono text-sm text-[#dee1f9] placeholder:text-[#475569]"
                  />
                </label>
              </div>

              <div className="space-y-2">
                <span className="block font-mono text-xs text-[#94A3B8]">
                  Primary Architecture Scope
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SCOPES.map((item) => {
                    const active = scope === item;
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setScope(item)}
                        className={`rounded-lg border px-3.5 py-2.5 text-left font-mono text-xs transition-colors cursor-pointer ${
                          active
                            ? 'border-[#00D4FF] bg-[#00D4FF]/15 text-[#F8FAFC]'
                            : 'border-white/[0.08] bg-[#050812]/80 text-[#94A3B8] hover:text-[#dee1f9]'
                        }`}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>

              <label className="block space-y-1.5">
                <span className="font-mono text-xs text-[#94A3B8]">
                  Throughput / Latency Target
                </span>
                <select
                  value={targetLatency}
                  onChange={(e) => setTargetLatency(e.target.value)}
                  className="terminal-cavity w-full rounded-lg px-3.5 py-2.5 font-mono text-sm text-[#dee1f9] cursor-pointer"
                >
                  <option value="< 25 ms Edge-to-Cloud">&lt; 25 ms Edge-to-Cloud</option>
                  <option value="< 5 ms Local Hardware Loop">&lt; 5 ms Local Hardware Loop</option>
                  <option value="10k+ Concurrent Telemetry Streams">
                    10k+ Concurrent Telemetry Streams
                  </option>
                  <option value="Ultra-Low-Power Battery Fleet">
                    Ultra-Low-Power Battery Fleet
                  </option>
                </select>
              </label>

              <label className="block space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-[#94A3B8]">
                    System Brief & Constraints
                  </span>
                  {commandFocused && (
                    <span className="font-mono text-[11px] text-[#00D4FF]">
                      Console Input Active _
                    </span>
                  )}
                </div>
                <textarea
                  rows={4}
                  value={details}
                  onFocus={() => setCommandFocused(true)}
                  onBlur={() => setCommandFocused(false)}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder={
                    commandFocused
                      ? '_'
                      : 'Describe target MCUs, bus protocols, cloud stack, or timeline...'
                  }
                  className="terminal-cavity w-full rounded-lg px-3.5 py-2.5 font-mono text-sm text-[#dee1f9] placeholder:text-[#475569] resize-y"
                />
              </label>

              {validationError && (
                <p role="alert" className="font-mono text-xs text-[#ffb4ab]">
                  {validationError}
                </p>
              )}

              <div className="flex items-center justify-end pt-2">
                <button
                  type="submit"
                  className="btn-cybernetic inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-xs tracking-wide cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Generate Architecture Brief</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
