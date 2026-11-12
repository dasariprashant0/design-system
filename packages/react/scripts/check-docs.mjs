// Doc-comment gate (run by `npm run check`). Fails if, in src/components/** and src/hooks/**:
//  - a prop declared in an exported *Props interface/type has no JSDoc comment, or
//  - an exported component (Capitalised const/function) or hook (useX) has no JSDoc comment.
// Uses the TypeScript compiler API like apps/docs/scripts/gen-props.mjs. Tests and demos are skipped.
import ts from 'typescript';
import {readdirSync, readFileSync, statSync} from 'node:fs';
import {join, relative} from 'node:path';
import {pkgRoot, repoRoot} from './lib.mjs';

function walk(dir, out = []) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.tsx?$/.test(e) && !/\.(test|demo)\.tsx?$/.test(e) && e !== 'index.ts') out.push(p);
  }
  return out;
}

const hasDoc = (node) => (ts.getJSDocCommentsAndTags(node) ?? []).some((d) => ts.isJSDoc(d) && (typeof d.comment === 'string' ? d.comment.trim() : d.comment?.length));
const isExported = (n) => (ts.canHaveModifiers(n) ? ts.getModifiers(n) ?? [] : []).some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
const isUnit = (name) => /^[A-Z]/.test(name) || /^use[A-Z]/.test(name);

const problems = [];
for (const kind of ['components', 'hooks']) {
  for (const file of walk(join(pkgRoot, 'src', kind))) {
    const sf = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.ES2022, true, file.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
    const rel = relative(repoRoot, file);
    const at = (n) => `${rel}:${sf.getLineAndCharacterOfPosition(n.getStart()).line + 1}`;
    const checkMembers = (members, owner) => {
      for (const m of members) {
        if ((ts.isPropertySignature(m) || ts.isMethodSignature(m)) && !hasDoc(m)) problems.push(`${at(m)}  prop "${m.name.getText(sf)}" of ${owner} has no doc comment. Add \`/** One sentence: what it does and when to use it. */\` above it.`);
      }
    };
    const checkType = (t, owner) => {
      if (ts.isTypeLiteralNode(t)) checkMembers(t.members, owner);
      else if (ts.isIntersectionTypeNode(t) || ts.isUnionTypeNode(t)) t.types.forEach((x) => checkType(x, owner));
      else if (ts.isParenthesizedTypeNode(t)) checkType(t.type, owner);
    };
    for (const node of sf.statements) {
      if (!isExported(node)) continue;
      if (ts.isInterfaceDeclaration(node) && /Props$/.test(node.name.text)) checkMembers(node.members, node.name.text);
      else if (ts.isTypeAliasDeclaration(node) && /Props$/.test(node.name.text)) checkType(node.type, node.name.text);
      else if (ts.isFunctionDeclaration(node) && node.name && isUnit(node.name.text) && !hasDoc(node)) problems.push(`${at(node)}  exported ${node.name.text} has no doc comment. Add \`/** What it renders or returns, in one or two sentences. @example <Thing prop="x" /> */\` above it.`);
      else if (ts.isVariableStatement(node)) {
        for (const d of node.declarationList.declarations) {
          if (ts.isIdentifier(d.name) && isUnit(d.name.text) && !hasDoc(node)) problems.push(`${at(node)}  exported ${d.name.text} has no doc comment. Add \`/** What it renders or returns, in one or two sentences. @example <Thing prop="x" /> */\` above it.`);
        }
      }
    }
  }
}

if (problems.length) {
  console.error(`check-docs: ${problems.length} missing doc comment(s). Every exported component, hook and prop needs a JSDoc comment (see AGENTS.md, "Doc comments are required").\n`);
  console.error(problems.map((p) => `  ${p}`).join('\n'));
  process.exit(1);
}
console.log('check-docs: all exported components, hooks and props are documented');
