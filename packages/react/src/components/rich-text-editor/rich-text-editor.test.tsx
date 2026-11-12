import {fireEvent, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {axe} from '../../test/axe';
import {execFormat} from './exec-command';
import {RichTextEditor, sanitizeHtml} from './rich-text-editor';

describe('sanitizeHtml', () => {
  it('keeps the allowlist', () => {
    const html = '<h2>T</h2><p>a <strong>b</strong> <em>c</em> <u>d</u><br></p><ul><li>x</li></ul><ol><li>y</li></ol><blockquote>q</blockquote>';
    expect(sanitizeHtml(html)).toBe(html);
  });
  it('keeps safe links and adds rel', () => {
    expect(sanitizeHtml('<a href="https://a.com/x?y=1&amp;z=2" target="_blank" onclick="x()">go</a>')).toBe('<a href="https://a.com/x?y=1&amp;z=2" rel="noopener noreferrer">go</a>');
    expect(sanitizeHtml('<a href="mailto:a@b.co">m</a>')).toContain('href="mailto:a@b.co"');
  });
  it.each([
    ['script tag', '<p>hi</p><script>alert(1)</script>', '<p>hi</p>'],
    ['inline handler', '<p onclick="alert(1)" onmouseover="x()">hi</p>', '<p>hi</p>'],
    ['img onerror', '<img src=x onerror=alert(1)>text', 'text'],
    ['javascript url', '<a href="javascript:alert(1)">x</a>', 'x'],
    ['javascript url, mixed case and tab', '<a href="JaVa\tScRiPt:alert(1)">x</a>', 'x'],
    ['entity-encoded javascript url', '<a href="&#106;avascript:alert(1)">x</a>', 'x'],
    ['leading space javascript url', '<a href=" \u0001javascript:alert(1)">x</a>', 'x'],
    ['data url', '<a href="data:text/html,<script>alert(1)</script>">x</a>', 'x'],
    ['vbscript url', '<a href="vbscript:msgbox(1)">x</a>', 'x'],
    ['relative url', '<a href="/admin">x</a>', 'x'],
    ['style attribute', '<p style="background:url(javascript:alert(1))">hi</p>', '<p>hi</p>'],
    ['iframe', '<iframe src="https://evil.test"></iframe>ok', 'ok'],
    ['svg onload', '<svg onload="alert(1)"><circle/></svg>ok', 'ok'],
    ['style tag', '<style>p{color:red}</style><p>hi</p>', '<p>hi</p>'],
    ['comment', '<!-- <script>alert(1)</script> --><p>hi</p>', '<p>hi</p>'],
    ['unclosed script', '<script>alert(1)', ''],
    ['nested broken markup', '<p><scr<script>ipt>alert(1)</scr</script>ipt></p>', '<p>ipt&gt;alert(1)ipt&gt;</p>'],
    ['math/mXSS', '<math><mtext><table><mglyph><style><img src=x onerror=alert(1)>', ''],
    ['form and input', '<form action="/x"><input name="a" value="b"><button>go</button></form>', 'go'],
    ['class and id', '<p class="x" id="y" data-x="1">hi</p>', '<p>hi</p>'],
  ])('%s', (_n, input, out) => { expect(sanitizeHtml(input)).toBe(out); });
  it('renames b, i, div and h1', () => {
    expect(sanitizeHtml('<h1>t</h1><div>a <b>b</b> <i>c</i></div>')).toBe('<h2>t</h2><p>a <strong>b</strong> <em>c</em></p>');
  });
  it('escapes text so it cannot reopen a tag', () => {
    expect(sanitizeHtml('1 &lt; 2 &amp;&amp; &lt;script&gt;')).toBe('1 &lt; 2 &amp;&amp; &lt;script&gt;');
  });
  it('is idempotent', () => {
    const once = sanitizeHtml('<p onclick=x><a href="https://a.com">a</a><script>1</script></p>');
    expect(sanitizeHtml(once)).toBe(once);
  });
  it('handles empty input', () => { expect(sanitizeHtml('')).toBe(''); });
});

describe('execFormat adapter', () => {
  afterEach(() => { delete (document as {execCommand?: unknown}).execCommand; });
  it('returns false where execCommand is missing', () => { expect(execFormat('bold')).toBe(false); });
  it('forwards command and value', () => {
    const spy = vi.fn(() => true);
    document.execCommand = spy;
    expect(execFormat('formatBlock', '<h2>')).toBe(true);
    expect(spy).toHaveBeenCalledWith('formatBlock', false, '<h2>');
  });
  it('returns false when it throws', () => {
    document.execCommand = () => { throw new Error('nope'); };
    expect(execFormat('bold')).toBe(false);
  });
});

describe('RichTextEditor', () => {
  let exec: ReturnType<typeof vi.fn>;
  const stub = () => { exec = vi.fn(() => true); document.execCommand = exec as never; };
  afterEach(() => { delete (document as {execCommand?: unknown}).execCommand; delete (document as {queryCommandState?: unknown}).queryCommandState; });
  const editor = () => screen.getByRole('textbox', {name: 'Notes'});

  it('renders a labelled multiline textbox and a named toolbar', () => {
    render(<RichTextEditor aria-label="Notes" placeholder="Write" />);
    expect(editor()).toHaveAttribute('aria-multiline', 'true');
    expect(editor()).toHaveAttribute('data-placeholder', 'Write');
    expect(editor()).toHaveAttribute('data-empty');
    expect(screen.getByRole('toolbar', {name: 'Text formatting'})).toBeInTheDocument();
  });
  it('shows sanitized defaultValue and never the script', () => {
    render(<RichTextEditor aria-label="Notes" defaultValue={'<p>hi <b>there</b></p><script>alert(1)</script>'} />);
    expect(editor().innerHTML).toBe('<p>hi <strong>there</strong></p>');
    expect(editor()).not.toHaveAttribute('data-empty');
  });
  it('follows a controlled value', () => {
    const {rerender} = render(<RichTextEditor aria-label="Notes" value="<p>one</p>" />);
    rerender(<RichTextEditor aria-label="Notes" value="<p>two</p>" />);
    expect(editor().innerHTML).toBe('<p>two</p>');
  });
  it('reports sanitized html on input', () => {
    const onValueChange = vi.fn();
    render(<RichTextEditor aria-label="Notes" onValueChange={onValueChange} />);
    editor().innerHTML = '<p onclick="x()">typed</p><script>1</script>';
    fireEvent.input(editor());
    expect(onValueChange).toHaveBeenCalledWith('<p>typed</p>');
  });
  it('toolbar buttons run the matching command', async () => {
    stub();
    const user = userEvent.setup();
    render(<RichTextEditor aria-label="Notes" />);
    for (const [name, cmd, arg] of [['Bold', 'bold'], ['Italic', 'italic'], ['Underline', 'underline'], ['Bulleted list', 'insertUnorderedList'], ['Numbered list', 'insertOrderedList'], ['Heading 2', 'formatBlock', '<h2>'], ['Heading 3', 'formatBlock', '<h3>'], ['Quote', 'formatBlock', '<blockquote>'], ['Undo', 'undo'], ['Redo', 'redo']] as const) {
      exec.mockClear();
      await user.click(screen.getByRole('button', {name}));
      expect(exec).toHaveBeenCalledWith(cmd, false, arg);
    }
    exec.mockClear();
    await user.click(screen.getByRole('button', {name: 'Clear formatting'}));
    expect(exec.mock.calls.map((c) => c[0])).toEqual(['removeFormat', 'unlink', 'formatBlock']);
  });
  it('keyboard shortcuts format the selection', async () => {
    stub();
    const user = userEvent.setup();
    render(<RichTextEditor aria-label="Notes" />);
    editor().focus();
    const mod = /mac|iphone|ipad/i.test(navigator.platform || navigator.userAgent) ? 'Meta' : 'Control';
    await user.keyboard(`{${mod}>}b{/${mod}}`);
    expect(exec).toHaveBeenCalledWith('bold', false, undefined);
    await user.keyboard(`{${mod}>}i{/${mod}}`);
    expect(exec).toHaveBeenCalledWith('italic', false, undefined);
    await user.keyboard(`{${mod}>}u{/${mod}}`);
    expect(exec).toHaveBeenCalledWith('underline', false, undefined);
    await user.keyboard(`{${mod}>}k{/${mod}}`);
    expect(await screen.findByRole('dialog', {name: 'Insert link'})).toBeInTheDocument();
  });
  it('aria-pressed follows the selection state', () => {
    document.queryCommandState = ((c: string) => c === 'bold') as never;
    render(<RichTextEditor aria-label="Notes" defaultValue="<p>hi</p>" />);
    const p = editor().querySelector('p')!;
    const range = document.createRange();
    range.selectNodeContents(p);
    const sel = window.getSelection()!;
    sel.removeAllRanges();
    sel.addRange(range);
    fireEvent(document, new Event('selectionchange'));
    expect(screen.getByRole('button', {name: 'Bold'})).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', {name: 'Italic'})).toHaveAttribute('aria-pressed', 'false');
  });
  it('link prompt rejects unsafe addresses and applies safe ones', async () => {
    stub();
    const user = userEvent.setup();
    render(<RichTextEditor aria-label="Notes" />);
    await user.click(screen.getByRole('button', {name: 'Link'}));
    const input = await screen.findByLabelText('Link address');
    await user.clear(input);
    await user.type(input, 'javascript:alert(1)');
    await user.click(screen.getByRole('button', {name: 'Apply'}));
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(exec).not.toHaveBeenCalledWith('createLink', expect.anything(), expect.anything());
    await user.clear(input);
    await user.type(input, 'https://example.com');
    await user.click(screen.getByRole('button', {name: 'Apply'}));
    expect(exec).toHaveBeenCalledWith('createLink', false, 'https://example.com');
  });
  it('Escape in the toolbar returns to the editor', async () => {
    const user = userEvent.setup();
    render(<RichTextEditor aria-label="Notes" />);
    await user.tab();
    expect(screen.getByRole('button', {name: 'Bold'})).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(editor()).toHaveFocus();
  });
  it('toolbar is one tab stop with arrow keys', async () => {
    const user = userEvent.setup();
    render(<RichTextEditor aria-label="Notes" />);
    await user.tab();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('button', {name: 'Italic'})).toHaveFocus();
    await user.tab();
    expect(editor()).toHaveFocus();
  });
  it('paste is sanitized', () => {
    stub();
    const onValueChange = vi.fn();
    render(<RichTextEditor aria-label="Notes" onValueChange={onValueChange} />);
    const data = {getData: (t: string) => (t === 'text/html' ? '<p onclick="x()">a<script>1</script></p>' : 'a')};
    fireEvent.paste(editor(), {clipboardData: data});
    expect(exec).toHaveBeenCalledWith('insertHTML', false, '<p>a</p>');
  });
  it('plain text paste keeps line breaks and escapes markup', () => {
    stub();
    render(<RichTextEditor aria-label="Notes" />);
    fireEvent.paste(editor(), {clipboardData: {getData: (t: string) => (t === 'text/plain' ? 'a <b>\nb' : '')}});
    expect(exec).toHaveBeenCalledWith('insertHTML', false, 'a &lt;b&gt;<br>b');
  });
  it('disabled and readOnly turn editing and the toolbar off', () => {
    const {rerender} = render(<RichTextEditor aria-label="Notes" disabled />);
    expect(editor()).toHaveAttribute('aria-disabled', 'true');
    expect(editor()).toHaveAttribute('contenteditable', 'false');
    expect(screen.getByRole('button', {name: 'Bold'})).toBeDisabled();
    rerender(<RichTextEditor aria-label="Notes" readOnly />);
    expect(editor()).toHaveAttribute('aria-readonly', 'true');
    expect(editor()).toHaveAttribute('contenteditable', 'false');
  });
  it('forwards its ref to the root', () => {
    const ref = {current: null as HTMLDivElement | null};
    render(<RichTextEditor aria-label="Notes" ref={ref} />);
    expect(ref.current).toHaveClass('rte');
  });
  it('has no axe violations', async () => {
    const {container} = render(<RichTextEditor aria-label="Notes" defaultValue="<p>hi</p>" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
