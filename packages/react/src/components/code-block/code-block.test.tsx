import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {axe} from '../../test/axe';
import {highlight} from '../../utils/highlight';
import {CodeBlock} from './code-block';

describe('CodeBlock', () => {
  it('shows the code in a group named by the title', () => {
    render(<CodeBlock title="install.sh" code={'npm i monoline'} />);
    expect(screen.getByRole('group', {name: 'install.sh'})).toBeInTheDocument();
    expect(screen.getByRole('group').querySelector('code')!.textContent).toBe('npm i monoline\n');
  });
  it('keeps the copy button inside the panel: in the header with a title, floating without one', () => {
    const {container, rerender} = render(<CodeBlock title="a.tsx" code="x" />);
    expect(container.querySelector('.code-head .code-copy')).toBeInTheDocument();
    expect(container.querySelector('.code-block')).not.toHaveAttribute('data-headless');
    rerender(<CodeBlock code="x" />);
    expect(container.querySelector('.code-head')).toBeNull();
    expect(container.querySelector('.code-block > .code-copy')).toBeInTheDocument();
    expect(container.querySelector('.code-block')).toHaveAttribute('data-headless');
  });
  it('copies the exact text, confirms, and the label changes', async () => {
    const user = userEvent.setup();
    render(<CodeBlock code={'line one\nline two'} />);
    await user.click(screen.getByRole('button', {name: 'Copy code'}));
    expect(await screen.findByRole('status')).toHaveTextContent('Copied to clipboard');
    expect(await navigator.clipboard.readText()).toBe('line one\nline two');
    expect(screen.getByRole('button', {name: 'Copied'})).toBeInTheDocument();
  });
  it('can hide the copy button', () => {
    render(<CodeBlock code="x" hideCopy />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
  it('colours tokens by language, guessed from the file name', () => {
    const {container} = render(<CodeBlock title="a.tsx" code={'import {Button} from "x";\nconst a = 1; // note'} />);
    expect(container.querySelector('.tok-keyword')!.textContent).toBe('import');
    expect(container.querySelector('.tok-string')!.textContent).toBe('"x"');
    expect(container.querySelector('.tok-comment')!.textContent).toBe('// note');
  });
  it('numbers lines when asked and renders one line element per line', () => {
    const {container} = render(<CodeBlock code={'a\nb\nc'} lineNumbers />);
    expect(container.querySelector('pre')).toHaveAttribute('data-lines');
    expect(container.querySelectorAll('.code-line')).toHaveLength(3);
  });
  it('never renders code as HTML', () => {
    const {container} = render(<CodeBlock code={'<img src=x onerror="alert(1)">'} language="html" />);
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('code')!.textContent).toContain('<img src=x onerror="alert(1)">');
  });
  it('has no axe violations', async () => {
    const {container} = render(<CodeBlock title="install.sh" code="npm i monoline" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('highlight', () => {
  it('always gives back the original text when joined', () => {
    const samples: Array<[string, Parameters<typeof highlight>[1]]> = [
      ['const a = <Button variant="x">hi</Button>; // c\n`t${1}`', 'tsx'],
      ['.a { color: var(--x); margin: 0 4px; } /* c */\n@media (min-width: 40rem) {}', 'css'],
      ['<div class="a" hidden>text</div> <!-- c -->', 'html'],
      ['npx monoline add button --dry-run # go', 'bash'],
      ['{"a": [1, 2.5, true, null], "b": "c"}', 'json'],
      ['anything at all <> ""', 'text'],
      ['unterminated "string', 'tsx'],
    ];
    for (const [code, lang] of samples) expect(highlight(code, lang).map((t) => t.text).join('')).toBe(code);
  });
  it('types css properties, variables and numbers', () => {
    const t = highlight('a { margin: 4px; color: var(--x); }', 'css');
    expect(t.some((x) => x.type === 'attr' && x.text === 'margin')).toBe(true);
    expect(t.some((x) => x.type === 'number' && x.text === '4px')).toBe(true);
    expect(t.some((x) => x.type === 'attr' && x.text === '--x')).toBe(true);
  });
  it('types bash commands and flags', () => {
    const t = highlight('npx monoline add button --dry-run', 'bash');
    expect(t[0]).toEqual({type: 'fn', text: 'npx'});
    expect(t.some((x) => x.type === 'attr' && x.text === '--dry-run')).toBe(true);
  });
  it('types json keys differently from string values', () => {
    const t = highlight('{"name": "monoline"}', 'json');
    expect(t.find((x) => x.text === '"name"')!.type).toBe('attr');
    expect(t.find((x) => x.text === '"monoline"')!.type).toBe('string');
  });
});
