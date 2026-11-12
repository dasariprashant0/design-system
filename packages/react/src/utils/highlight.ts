/** A tiny dependency-free syntax highlighter for docs snippets: tsx/ts/js, css, html, bash and json. Not a parser. */
export type TokenType = 'keyword' | 'string' | 'number' | 'comment' | 'tag' | 'attr' | 'fn' | 'plain';
export interface Token {type: TokenType; text: string}
export type Language = 'tsx' | 'ts' | 'jsx' | 'js' | 'css' | 'html' | 'bash' | 'json' | 'text';

type Rule = [TokenType, RegExp];

const JS_KEYWORDS = 'import|export|from|default|const|let|var|function|return|if|else|for|while|switch|case|break|continue|new|class|extends|interface|type|as|async|await|typeof|instanceof|in|of|null|undefined|true|false|void|throw|try|catch|finally|this';
const js: Rule[] = [
  ['comment', /\/\/[^\n]*|\/\*[\s\S]*?\*\//y],
  ['string', /'(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*"|`(?:[^`\\]|\\[\s\S])*`/y],
  ['tag', /<\/?[A-Za-z][\w.]*/y],
  ['number', /\b\d[\d_]*(?:\.\d+)?\b/y],
  ['keyword', new RegExp(`\\b(?:${JS_KEYWORDS})\\b`, 'y')],
  ['attr', /[A-Za-z_][\w-]*(?==(?!=))/y],
  ['fn', /[A-Za-z_$][\w$]*(?=\()/y],
];
const css: Rule[] = [
  ['comment', /\/\*[\s\S]*?\*\//y],
  ['string', /'(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*"/y],
  ['keyword', /@[\w-]+/y],
  ['attr', /--[\w-]+|[a-z-]+(?=\s*:)/y],
  ['number', /-?\b\d*\.?\d+(?:px|rem|em|%|vh|vw|ch|s|ms|deg|fr)?\b/y],
  ['fn', /[\w-]+(?=\()/y],
  ['tag', /[.#]?[A-Za-z_][\w-]*(?=[^{;]*\{)/y],
];
const html: Rule[] = [
  ['comment', /<!--[\s\S]*?-->/y],
  ['string', /"[^"]*"|'[^']*'/y],
  ['tag', /<\/?[A-Za-z][\w-]*|\/?>/y],
  ['attr', /[A-Za-z_:@][\w:.-]*(?==)/y],
];
const bash: Rule[] = [
  ['comment', /#[^\n]*/y],
  ['string', /"(?:[^"\\]|\\.)*"|'[^']*'/y],
  ['attr', /(?<=\s)--?[A-Za-z][\w-]*/y],
  ['fn', /(?:^|(?<=[\n|&;]\s?))(?:npx|npm|pnpm|yarn|bun|git|node|cd|echo|curl|mkdir)\b/y],
  ['number', /\b\d+(?:\.\d+)*\b/y],
];
const json: Rule[] = [
  ['attr', /"(?:[^"\\]|\\.)*"(?=\s*:)/y],
  ['string', /"(?:[^"\\]|\\.)*"/y],
  ['number', /-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/y],
  ['keyword', /\b(?:true|false|null)\b/y],
];

const RULES: Record<Exclude<Language, 'text'>, Rule[]> = {tsx: js, ts: js, jsx: js, js, css, html, bash, json};

/** Splits `code` into typed tokens. Unknown languages return one plain token. Joining the tokens gives back `code` exactly. */
export function highlight(code: string, language: Language = 'text'): Token[] {
  const rules = language === 'text' ? null : RULES[language];
  if (!rules) return [{type: 'plain', text: code}];
  const out: Token[] = [];
  const push = (type: TokenType, text: string) => {
    const last = out[out.length - 1];
    if (last && last.type === type) last.text += text; else out.push({type, text});
  };
  let i = 0;
  while (i < code.length) {
    let hit: [TokenType, string] | null = null;
    for (const [type, re] of rules) {
      re.lastIndex = i;
      const m = re.exec(code);
      if (m && m.index === i && m[0].length > 0) { hit = [type, m[0]]; break; }
    }
    if (hit) { push(hit[0], hit[1]); i += hit[1].length; }
    else { push('plain', code[i]!); i += 1; }
  }
  return out;
}

/** Guess a language from a file name like `button.tsx` or a label like `bash`. */
export function languageFromName(name?: string): Language {
  const ext = (name ?? '').toLowerCase().split('.').pop() ?? '';
  const map: Record<string, Language> = {tsx: 'tsx', ts: 'ts', jsx: 'jsx', js: 'js', mjs: 'js', css: 'css', html: 'html', json: 'json', bash: 'bash', sh: 'bash', shell: 'bash'};
  return map[ext] ?? 'text';
}
