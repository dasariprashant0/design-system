// "Copy Markdown" and "Open" on every docs page. A component page has a Markdown file to fetch; any other page is
// turned into Markdown from what is on screen at click time. URLs for the AI tools are built on click, so the
// prerendered HTML holds no origin.
import {useCallback, useEffect, useState} from 'react';
import {Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from '@monoline/react';
import {CheckIcon, CopyIcon} from '../shell/Logo';

/** Page content as Markdown: headings, paragraphs, lists, code blocks and table rows. */
export function domToMarkdown(root: Element): string {
  const out: string[] = [];
  const walk = (el: Element) => {
    for (const n of el.children) {
      const tag = n.tagName;
      if (n.matches('.h-anchor, button, nav.pager, [aria-hidden="true"]:not(svg), script, style')) continue;
      const text = (n.textContent ?? '').replace(/#$/, '').replace(/\s+/g, ' ').trim();
      if (/^H[1-4]$/.test(tag)) out.push(`${'#'.repeat(Number(tag[1]))} ${text}`);
      else if (tag === 'PRE') out.push('```\n' + (n.textContent ?? '').trimEnd() + '\n```');
      else if (n.matches('.code-block')) out.push('```\n' + (n.querySelector('pre')?.textContent ?? '').trimEnd() + '\n```');
      else if (tag === 'P') { if (text) out.push(text); }
      else if (tag === 'LI') out.push(`- ${text}`);
      else if (tag === 'TR') out.push(`| ${[...n.children].map((c) => (c.textContent ?? '').replace(/\s+/g, ' ').trim()).join(' | ')} |`);
      else walk(n);
    }
  };
  walk(root);
  return out.join('\n\n').replace(/\n\n(- |\| )/g, '\n$1') + '\n';
}

/** `source`: a Markdown URL to fetch, or a function that returns the Markdown. */
export function CopyMarkdown({source}: {source: string | (() => string)}) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
  useEffect(() => { if (state === 'idle') return; const t = setTimeout(() => setState('idle'), 2000); return () => clearTimeout(t); }, [state]);
  const copy = useCallback(async () => {
    try {
      let text: string;
      if (typeof source === 'function') text = source();
      else { const res = await fetch(source); if (!res.ok) throw new Error(String(res.status)); text = await res.text(); }
      await navigator.clipboard.writeText(text);
      setState('copied');
    } catch { setState('failed'); }
  }, [source]);
  return (
    <>
      <Button size="sm" variant="line" onClick={copy}>{state === 'copied' ? <CheckIcon /> : <CopyIcon />} Copy Markdown</Button>
      <span className="cdoc-status" role="status">{state === 'copied' ? 'Copied' : state === 'failed' ? 'Copy failed' : ''}</span>
    </>
  );
}

/** Open this page in GitHub, ChatGPT, Claude or Cursor (with a prompt that points at the page), or as Markdown. */
export function OpenMenu({title, pageUrl, source, markdown}: {title: string; pageUrl: string | (() => string); source: string; markdown?: string}) {
  const go = (url: string) => () => { window.open(url, '_blank', 'noopener,noreferrer'); };
  const ask = (base: string) => () => {
    const url = typeof pageUrl === 'function' ? pageUrl() : pageUrl;
    window.open(`${base}${encodeURIComponent(`Read ${url} so I can ask questions about the Monoline ${title} docs page.`)}`, '_blank', 'noopener,noreferrer');
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild><Button size="sm" variant="line">Open <span aria-hidden="true">▾</span></Button></DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onSelect={go(source)}>Open in GitHub <span aria-hidden="true">↗</span></DropdownMenuItem>
        <DropdownMenuItem onSelect={ask('https://chatgpt.com/?q=')}>Open in ChatGPT <span aria-hidden="true">↗</span></DropdownMenuItem>
        <DropdownMenuItem onSelect={ask('https://claude.ai/new?q=')}>Open in Claude <span aria-hidden="true">↗</span></DropdownMenuItem>
        <DropdownMenuItem onSelect={ask('https://cursor.com/link/prompt?text=')}>Open in Cursor <span aria-hidden="true">↗</span></DropdownMenuItem>
        {markdown && <DropdownMenuItem onSelect={go(markdown)}>Open as Markdown <span aria-hidden="true">↗</span></DropdownMenuItem>}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
