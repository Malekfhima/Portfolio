import { Fragment, useState } from 'react';
import { Check, Copy, Play } from 'lucide-react';
import { CodeFile } from '../types';

interface SyntaxCodeBlockProps {
  files: CodeFile[];
  onRunTrace?: (file: CodeFile) => void;
}

const KEYWORDS = new Set([
  'import',
  'from',
  'export',
  'async',
  'function',
  'const',
  'let',
  'return',
  'if',
  'for',
  'of',
  'await',
  'throw',
  'new',
  'typedef',
  'struct',
  'volatile',
  'bool',
  'true',
  'false',
  'float',
  'int',
  'uint32_t',
  'extends',
  'number',
  'string',
  'null',
]);

function highlightLine(line: string) {
  const commentIndex = line.indexOf('//');
  const hashInclude = line.trimStart().startsWith('#include');
  const codePart = commentIndex >= 0 ? line.slice(0, commentIndex) : line;
  const commentPart = commentIndex >= 0 ? line.slice(commentIndex) : '';

  if (hashInclude) {
    return (
      <>
        <span className="text-[#A78BFA]">#include</span>
        <span className="text-[#34D399]">{line.slice(line.indexOf('#include') + 8)}</span>
      </>
    );
  }

  const tokens = codePart.split(/(\s+|[(){}[\].,:;*=<>&!+\-/]+|"[^"]*"|`[^`]*`)/g);

  return (
    <>
      {tokens.map((tok, idx) => {
        if (!tok) return null;
        if (tok.startsWith('"') || tok.startsWith('`')) {
          return (
            <span key={idx} className="text-[#34D399]">
              {tok}
            </span>
          );
        }
        if (KEYWORDS.has(tok)) {
          return (
            <span key={idx} className="text-[#A78BFA]">
              {tok}
            </span>
          );
        }
        if (/^[0-9]+(\.[0-9]+)?[UfFn]*$/.test(tok) || /^[A-Z0-9_]{3,}$/.test(tok)) {
          return (
            <span key={idx} className="text-[#00D4FF]">
              {tok}
            </span>
          );
        }
        if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tok) && tokens[idx + 1]?.startsWith('(')) {
          return (
            <span key={idx} className="text-[#a8e8ff]">
              {tok}
            </span>
          );
        }
        return (
          <span key={idx} className="text-[#dee1f9]">
            {tok}
          </span>
        );
      })}
      {commentPart && <span className="text-[#64748B] italic">{commentPart}</span>}
    </>
  );
}

export function SyntaxCodeBlock({ files, onRunTrace }: SyntaxCodeBlockProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const safeIndex = selectedIndex < files.length ? selectedIndex : 0;
  const activeFile = files[safeIndex];

  if (!activeFile) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activeFile.lines.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="code-surface overflow-hidden rounded-xl">
      {/* Top chrome bar with hardware pin manifest and filename tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] bg-[#0B1020] px-4 py-2.5">
        <div className="flex items-center gap-2 overflow-x-auto">
          <div className="flex items-center gap-1.5 mr-2 shrink-0" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-[#334155]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#334155]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#00D4FF]/60" />
          </div>
          {files.map((file, idx) => {
            const isTabActive = idx === safeIndex;
            return (
              <button
                key={file.filename}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                className={`rounded-md px-3 py-1 font-mono text-xs whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                  isTabActive
                    ? 'bg-[#00D4FF]/15 text-[#00D4FF] border border-[#00D4FF]/35'
                    : 'text-[#94A3B8] hover:text-[#dee1f9] border border-transparent'
                }`}
              >
                {file.filename}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onRunTrace && (
            <button
              type="button"
              onClick={() => onRunTrace(activeFile)}
              className="inline-flex items-center gap-1.5 rounded-md border border-[#7C3AED]/45 bg-[#7C3AED]/15 px-3 py-1 font-mono text-xs text-[#d2bbff] hover:bg-[#7C3AED]/25 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Play className="h-3 w-3" />
              Trace Execution
            </button>
          )}
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-xs text-[#94A3B8] hover:text-[#dee1f9] hover:border-white/20 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {copied ? (
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

      {/* Hardware pinout / bus metadata bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] bg-[#080C17] px-4 py-2 font-mono text-[11px] text-[#94A3B8]">
        <span>{activeFile.pinHeader}</span>
        <span className="text-[#00D4FF]">{activeFile.baudOrClock}</span>
      </div>

      {/* Code viewport */}
      <div className="overflow-x-auto p-4 font-mono text-[13px] leading-[22px] tabular-nums">
        <table className="w-full border-collapse">
          <tbody>
            {activeFile.lines.map((line, i) => (
              <tr key={i} className="hover:bg-white/[0.02]">
                <td className="select-none pr-4 text-right text-xs text-[#475569] w-8 align-top">
                  {i + 1}
                </td>
                <td className="whitespace-pre">
                  {line.length === 0 ? <Fragment>&nbsp;</Fragment> : highlightLine(line)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
