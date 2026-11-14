export type ScreenId = 'overview' | 'systems' | 'hardware' | 'telemetry' | 'contact';

export type ProjectCategory = 'all' | 'fullstack' | 'embedded' | 'edge-ai';

export interface CodeFile {
  filename: string;
  language: 'c' | 'typescript' | 'sql';
  pinHeader: string;
  baudOrClock: string;
  lines: string[];
  traceSteps: {
    step: string;
    durationUs: number;
    detail: string;
  }[];
}

export interface EngineeringSystem {
  id: string;
  title: string;
  kicker: string;
  category: Exclude<ProjectCategory, 'all'>;
  year: string;
  hardwareTarget: string;
  summary: string;
  architectureNote: string;
  metrics: {
    label: string;
    value: string;
  }[];
  stack: string[];
  caseStudy: {
    challenge: string;
    architecture: string;
    outcome: string;
    specs: { key: string; val: string }[];
  };
  codeFiles: CodeFile[];
}

export type PinProtocol = 'SPI' | 'I2C' | 'CAN' | 'UART' | 'PWR' | 'GPIO';

export interface McuPin {
  number: number;
  side: 'left' | 'right';
  label: string;
  gpio: string;
  protocol: PinProtocol;
  peripheral: string;
  voltage: string;
  maxClock: string;
  dmaChannel: string;
  pullMode: string;
  description: string;
}

export interface BoardSpec {
  id: 'esp32s3' | 'stm32h7';
  name: string;
  architecture: string;
  clockSpeed: string;
  sram: string;
  flash: string;
  busSummary: string;
  pins: McuPin[];
}

export interface TelemetryNode {
  id: string;
  name: string;
  location: string;
  mcu: string;
  transport: string;
  baseRttMs: number;
  baseTempC: number;
  baseHeapPct: number;
  baseThroughputKbps: number;
}

export interface TelemetrySample {
  timestamp: string;
  rttMs: number;
  tempC: number;
  heapPct: number;
  throughputKbps: number;
}

export type EventSeverity = 'Nominal' | 'Warning' | 'Fault';

export interface TelemetryEvent {
  id: string;
  timestamp: string;
  nodeId: string;
  severity: EventSeverity;
  subsystem: string;
  message: string;
  metric: string;
}
