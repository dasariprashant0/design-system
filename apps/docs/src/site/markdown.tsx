// A small Markdown renderer with no dependencies, for CHANGELOG.md and docs/ROADMAP.md (imported with `?raw`,
// so it runs from the files at build time). Handles headings, paragraphs, bullet and numbered lists, tables,
// fenced code, block quotes, rules, links, bold, italic and inline code. Nothing else is promised.
import type {ReactNode} from 'react';
import {CodeBlock, Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@monoline/react';

const LANGS = ['tsx', 'ts', 'jsx', 'js', 'css', 'html', 'bash', 'json', 'text'];
const REPO = 'https://github.com/dasariprashant0/design-system/blob/master/';

/** Relative links in the Markdown point at repo files; send them to GitHub. */
const fixHref = (h: string) => (/^(https?:|mailto:|#|\/)/.test(h) ? h : REPO + h.replace(/^\.\//, ''));

// ---- inline ------------------------------------------------------------------------------------------------------
const INLINE = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*\s][^*]*\*)|(\[[^\]]+\]\([^)\s]+\))/g;

export function inline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0, i = 0;
  for (const m of text.matchAll(INLINE)) {
    if (m.index! > last) out.push(text.slice(last, m.index));
    const t = m[0];
    const key = i++;
    if (m[1]) out.push(<code key={key}>{t.slice(1, -1)}</code>);
    else if (m[2]) out.push(<strong key={key}>{inline(t.slice(2, -2))}</strong>);
    else if (m[3]) out.push(<em key={key}>{inline(t.slice(1, -1))}</em>);
    else { const [, label, url] = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(t)!; out.push(<a key={key} href={fixHref(url!)}>{inline(label!)}</a>); }
    last = m.index! + t.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

// ---- blocks ------------------------------------------------------------------------------------------------------
type Block =
  | {t: 'h'; level: number; text: string}
  | {t: 'p'; text: string}
  | {t: 'ul' | 'ol'; items: string[]}
  | {t: 'code'; lang: string; code: string}
  | {t: 'table'; head: string[]; rows: string[][]}
  | {t: 'quote'; text: string}
  | {t: 'hr'};

const cells = (line: string) => line.trim().replace(/^\||\|$/g, '').split(/(?<!\\)\|/).map((c) => c.trim().replaceAll('\\|', '|'));
const isRule = (l: string) => /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(l);

export function parse(md: string): Block[] {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const out: Block[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i]!;
    if (!line.trim()) { i++; continue; }
    const fence = /^```\s*(\w*)/.exec(line);
    if (fence) {
      const code: string[] = []; i++;
      while (i < lines.length && !/^```/.test(lines[i]!)) code.push(lines[i++]!);
      i++; out.push({t: 'code', lang: fence[1] || 'text', code: code.join('\n')}); continue;
    }
    const h = /^(#{1,4})\s+(.*)$/.exec(line);
    if (h) { out.push({t: 'h', level: h[1]!.length, text: h[2]!.trim()}); i++; continue; }
    if (/^\s*(-{3,}|\*{3,})\s*$/.test(line)) { out.push({t: 'hr'}); i++; continue; }
    if (line.includes('|') && i + 1 < lines.length && isRule(lines[i + 1]!)) {
      const head = cells(line); const rows: string[][] = []; i += 2;
      while (i < lines.length && lines[i]!.includes('|') && lines[i]!.trim()) rows.push(cells(lines[i++]!));
      out.push({t: 'table', head, rows}); continue;
    }
    if (/^>\s?/.test(line)) {
      const q: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i]!)) q.push(lines[i++]!.replace(/^>\s?/, ''));
      out.push({t: 'quote', text: q.join(' ')}); continue;
    }
    const li = /^(\s*)([-*]|\d+\.)\s+(.*)$/.exec(line);
    if (li) {
      const ordered = /\d/.test(li[2]!); const items: string[] = [];
      while (i < lines.length) {
        const m = /^(\s*)([-*]|\d+\.)\s+(.*)$/.exec(lines[i]!);
        if (m) { items.push(m[3]!); i++; }
        else if (/^\s{2,}\S/.test(lines[i]!) && items.length) { items[items.length - 1] += ' ' + lines[i++]!.trim(); }
        else break;
      }
      out.push({t: ordered ? 'ol' : 'ul', items}); continue;
    }
    const para: string[] = [];
    while (i < lines.length && lines[i]!.trim() && !/^(#{1,4}\s|```|>\s?|\s*([-*]|\d+\.)\s)/.test(lines[i]!) && !(lines[i]!.includes('|') && isRule(lines[i + 1] ?? ''))) para.push(lines[i++]!.trim());
    out.push({t: 'p', text: para.join(' ')});
  }
  return out;
}

/** Render Markdown. The first `#` heading is dropped (the page has its own h1); other headings keep their level. */
export function Markdown({source, label}: {source: string; label: string}) {
  const blocks = parse(source);
  let dropped = false;
  return (
    <div className="md">
      {blocks.map((b, n) => {
        switch (b.t) {
          case 'h': {
            if (b.level === 1 && !dropped) { dropped = true; return null; }
            const H = `h${Math.min(4, Math.max(2, b.level))}` as 'h2' | 'h3' | 'h4';
            return <H key={n}>{inline(b.text)}</H>;
          }
          case 'p': return <p key={n}>{inline(b.text)}</p>;
          case 'ul': return <ul key={n} className="md-list">{b.items.map((x, k) => <li key={k}>{inline(x)}</li>)}</ul>;
          case 'ol': return <ol key={n} className="md-list md-ol">{b.items.map((x, k) => <li key={k}>{inline(x)}</li>)}</ol>;
          case 'code': return <CodeBlock key={n} language={LANGS.includes(b.lang) ? (b.lang as never) : 'text'} code={b.code} />;
          case 'quote': return <blockquote key={n} className="md-quote">{inline(b.text)}</blockquote>;
          case 'hr': return <hr key={n} />;
          case 'table': return (
            <Table key={n} wrapperLabel={`${label}: ${b.head.slice(0, 2).join(', ')}`}>
              <TableHeader><TableRow>{b.head.map((c, k) => <TableHead key={k} scope="col">{inline(c)}</TableHead>)}</TableRow></TableHeader>
              <TableBody>{b.rows.map((r, k) => <TableRow key={k}>{b.head.map((_, j) => <TableCell key={j}>{inline(r[j] ?? '')}</TableCell>)}</TableRow>)}</TableBody>
            </Table>
          );
        }
      })}
    </div>
  );
}
