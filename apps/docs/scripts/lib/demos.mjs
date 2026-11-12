// Pure extraction of demos from a `*.demo.tsx` source string, with the TypeScript compiler API.
// extractDemos(source) -> [{title, description, code}] where `code` is the demo's own standalone snippet:
// imports for the names it uses, the same-file helpers it references (transitively), then the render body.
import ts from 'typescript';

const ROOT_PKG = '@monoline/react';
const isMonolineModule = (m) => /^(\.\.?\/)/.test(m); // relative imports all resolve to the kit

/** Remove the common leading indent of every line after the first (or of all lines when `all`). */
export function dedent(text, all = false) {
  const lines = text.split('\n');
  const rest = all ? lines : lines.slice(1);
  const indents = rest.filter((l) => l.trim()).map((l) => l.match(/^ */)[0].length);
  const cut = indents.length ? Math.min(...indents) : 0;
  const fixed = lines.map((l, i) => (all || i > 0 ? l.slice(Math.min(cut, l.match(/^ */)[0].length)) : l));
  return fixed.join('\n').trim();
}

const stringValue = (n) => {
  if (!n) return undefined;
  if (ts.isStringLiteralLike(n)) return n.text;
  if (ts.isBinaryExpression(n) && n.operatorToken.kind === ts.SyntaxKind.PlusToken) {
    const a = stringValue(n.left), b = stringValue(n.right);
    return a !== undefined && b !== undefined ? a + b : undefined;
  }
  return undefined;
};

/** Identifier names used as values or tags inside `node` (skips property names and JSX attribute names). */
function usedNames(node, into = new Set()) {
  const visit = (n) => {
    if (ts.isIdentifier(n)) {
      const p = n.parent;
      const skip = p && ((ts.isPropertyAccessExpression(p) && p.name === n) || (ts.isPropertyAssignment(p) && p.name === n) || (ts.isJsxAttribute(p) && p.name === n) || (ts.isPropertySignature(p) && p.name === n));
      if (!skip) into.add(n.text);
    }
    ts.forEachChild(n, visit);
  };
  visit(node);
  return into;
}

export function extractDemos(source, fileName = 'x.demo.tsx') {
  const sf = ts.createSourceFile(fileName, source, ts.ScriptTarget.ES2022, true, ts.ScriptKind.TSX);
  const text = (n) => source.slice(n.getStart(sf), n.getEnd());

  // Top-level declarations by name, and imports by local name.
  const decls = new Map();
  const imports = new Map(); // local name -> {module, imported, isDefault, typeOnly}
  let demosArray;
  for (const st of sf.statements) {
    if (ts.isImportDeclaration(st) && st.importClause && ts.isStringLiteral(st.moduleSpecifier)) {
      const mod = st.moduleSpecifier.text, c = st.importClause;
      if (c.name) imports.set(c.name.text, {module: mod, imported: 'default', def: true, type: c.isTypeOnly});
      if (c.namedBindings && ts.isNamedImports(c.namedBindings)) for (const e of c.namedBindings.elements) imports.set(e.name.text, {module: mod, imported: (e.propertyName ?? e.name).text, type: c.isTypeOnly || e.isTypeOnly});
    } else if (ts.isVariableStatement(st)) {
      for (const d of st.declarationList.declarations) {
        if (!ts.isIdentifier(d.name)) continue;
        if (d.name.text === 'demos' && d.initializer) { demosArray = d.initializer; continue; }
        decls.set(d.name.text, st);
      }
    } else if ((ts.isFunctionDeclaration(st) || ts.isClassDeclaration(st) || ts.isInterfaceDeclaration(st) || ts.isTypeAliasDeclaration(st)) && st.name) decls.set(st.name.text, st);
  }
  if (demosArray && ts.isAsExpression(demosArray)) demosArray = demosArray.expression;
  if (!demosArray || !ts.isArrayLiteralExpression(demosArray)) return [];

  const declOrder = [...decls.entries()].map(([name, node]) => ({name, node})).sort((a, b) => a.node.getStart(sf) - b.node.getStart(sf));
  const declName = new Map(declOrder.map((d) => [d.node, d.name]));

  const out = [];
  for (const el of demosArray.elements) {
    if (!ts.isObjectLiteralExpression(el)) continue;
    let title, description, render;
    for (const p of el.properties) {
      const key = p.name && (ts.isIdentifier(p.name) || ts.isStringLiteral(p.name)) ? p.name.text : '';
      if (key === 'title' && ts.isPropertyAssignment(p)) title = stringValue(p.initializer) ?? text(p.initializer);
      else if (key === 'description' && ts.isPropertyAssignment(p)) description = stringValue(p.initializer) ?? text(p.initializer);
      else if (key === 'render') render = ts.isPropertyAssignment(p) ? p.initializer : ts.isMethodDeclaration(p) ? p : undefined;
    }
    if (!title || !render) continue;
    // `render: renderFoo` -> use that function's declaration.
    if (ts.isIdentifier(render) && decls.has(render.text)) {
      const d = decls.get(render.text);
      const fn = ts.isFunctionDeclaration(d) ? d : d.declarationList.declarations.find((x) => x.name.text === render.text)?.initializer;
      if (fn) render = fn;
    }
    // The part of the render function that becomes the snippet.
    const body = render.body;
    let nodes, snippet;
    if (!body) { nodes = [render]; snippet = dedent(text(render)); }
    else if (!ts.isBlock(body)) {
      let e = body;
      while (ts.isParenthesizedExpression(e)) e = e.expression;
      nodes = [e]; snippet = dedent(text(e));
    } else if (body.statements.length === 1 && ts.isReturnStatement(body.statements[0]) && body.statements[0].expression) {
      let e = body.statements[0].expression;
      while (ts.isParenthesizedExpression(e)) e = e.expression;
      nodes = [e]; snippet = dedent(text(e));
    } else {
      nodes = [...body.statements];
      const first = body.statements[0], last = body.statements[body.statements.length - 1];
      snippet = dedent(source.slice(source.lastIndexOf('\n', first.getStart(sf)) + 1, last.getEnd()), true);
    }

    // Helpers referenced (transitively) from the snippet, in source order; imports for everything used.
    const used = new Set(); nodes.forEach((n) => usedNames(n, used));
    const helperNodes = new Set();
    const queue = [...used];
    while (queue.length) {
      const name = queue.pop();
      const d = decls.get(name);
      if (!d || helperNodes.has(d)) continue;
      helperNodes.add(d);
      const inner = usedNames(d); for (const n of inner) { used.add(n); queue.push(n); }
    }
    const helpers = declOrder.filter((d) => helperNodes.has(d.node)).map((d) => dedent(text(d.node).replace(/^export\s+(default\s+)?/, ''), false));

    const byModule = new Map();
    for (const name of used) {
      const imp = imports.get(name);
      if (!imp || (imp.type && !used.has(name))) continue;
      const mod = isMonolineModule(imp.module) ? ROOT_PKG : imp.module;
      const entry = byModule.get(mod) ?? {names: new Set(), types: new Set(), def: null};
      if (imp.def) entry.def = name;
      else (imp.type ? entry.types : entry.names).add(imp.imported === name ? name : `${imp.imported} as ${name}`);
      byModule.set(mod, entry);
    }
    const importLines = [...byModule.entries()]
      .sort(([a], [b]) => (b === 'react') - (a === 'react') || (a === ROOT_PKG) - (b === ROOT_PKG) || a.localeCompare(b))
      .map(([mod, e]) => {
        const named = [...[...e.names].sort(), ...[...e.types].sort().map((t) => `type ${t}`)];
        const parts = [e.def, named.length ? `{${named.join(', ')}}` : null].filter(Boolean).join(', ');
        return `import ${parts} from '${mod}';`;
      });

    const code = [importLines.join('\n'), ...helpers, snippet].filter(Boolean).join('\n\n');
    out.push({title, ...(description ? {description} : {}), code});
  }
  return out;
}

/** Exported names from an `index.ts`: `export {A, B} from './a'` and `export type {...}`. -> {values, types} */
export function exportedNames(source) {
  const sf = ts.createSourceFile('index.ts', source, ts.ScriptTarget.ES2022, true);
  const values = [], types = [];
  for (const st of sf.statements) {
    if (ts.isExportDeclaration(st) && st.exportClause && ts.isNamedExports(st.exportClause)) {
      for (const e of st.exportClause.elements) (st.isTypeOnly || e.isTypeOnly ? types : values).push(e.name.text);
    }
  }
  return {values, types};
}
