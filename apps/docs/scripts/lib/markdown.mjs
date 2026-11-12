// Pure: builds the Markdown page for one component or hook. Plain text for AI tools and for "Copy page as Markdown".
import {keyboardRows} from './a11y.mjs';

const cell = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\n+/g, ' ').trim();
const table = (head, rows) => [`| ${head.join(' | ')} |`, `| ${head.map(() => '---').join(' | ')} |`, ...rows.map((r) => `| ${r.map(cell).join(' | ')} |`)].join('\n');
const fence = (lang, code) => '```' + lang + '\n' + code.trimEnd() + '\n```';

/** @param {{meta, extra?: {importName, parts, demos}, props?: {name, props}[], styling?: {file, classes, attributes}[], hook: boolean}} d */
export function componentMarkdown({meta, extra, props = [], styling = [], hook}) {
  const importName = extra?.importName ?? meta.title;
  const demos = extra?.demos ?? [];
  const parts = extra?.parts ?? [];
  const out = [`# ${meta.title}`, '', meta.description, ''];
  out.push(`Package: \`@monoline/react\`. Status: ${meta.status}.${meta.primitive ? ` Built on \`${meta.primitive}\`.` : ''}`, '');
  out.push('## Installation', '', 'CLI (copies the source and styles into your project):', '', fence('bash', `npx monoline add ${meta.name}`), '',
    'Or from npm:', '', fence('bash', 'npm install @monoline/react @monoline/css'), '',
    fence('tsx', `import '@monoline/css';\nimport {${importName}} from '@monoline/react';`), '');
  out.push('## Usage', '', fence('tsx', demos[0]?.code ?? `import {${importName}} from '@monoline/react';`), '');
  if (demos.length) {
    out.push('## Examples', '');
    for (const d of demos) { out.push(`### ${d.title}`, ''); if (d.description) out.push(d.description, ''); out.push(fence('tsx', d.code), ''); }
  }
  if (!hook && parts.length > 1) out.push('## Anatomy', '', 'Exported parts:', '', ...parts.map((p) => `- \`${p}\``), '');
  if (props.length) {
    out.push('## API Reference', '');
    for (const g of props) {
      out.push(`### ${g.name}`, '', table(['Prop', 'Type', 'Default', 'Description'], g.props.map((p) => [`\`${p.name}\`${p.optional ? '' : ' (required)'}`, `\`${p.type}\``, p.default ? `\`${p.default}\`` : '', p.description])), '');
    }
  }
  out.push(hook ? '## Behaviour' : '## Accessibility', '', ...meta.a11y.map((a) => `- ${a}`), '');
  const keys = keyboardRows(meta.a11y);
  if (keys.length) out.push('### Keyboard', '', table(['Keys', 'Action'], keys.map((k) => [k.keys, k.action])), '');
  if (styling.length) {
    out.push('## Styling', '', 'CSS classes and attribute selectors in the stylesheets this component uses.', '');
    out.push(table(['Selector', 'File'], styling.flatMap((s) => [...s.classes.map((c) => [`.${c}`, s.file]), ...s.attributes.map((a) => [a, s.file])])), '');
  }
  out.push('## Details', '', `- Stylesheets: ${meta.css.length ? meta.css.join(', ') : 'none'}`, `- Status: ${meta.status}`, `- Source: https://github.com/dasariprashant0/design-system/tree/master/packages/react/src/${hook ? 'hooks' : 'components'}/${meta.name}`);
  if (meta.keywords?.length) out.push(`- Also called: ${meta.keywords.join(', ')}`);
  return out.join('\n') + '\n';
}
