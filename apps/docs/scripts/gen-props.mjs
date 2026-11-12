// Reads every packages/react/src/components/<name>/<name>.tsx with the TypeScript compiler API and writes
// src/props.generated.json: for each component, the props declared in its exported *Props interfaces/types
// (name, type text, optional, default from the component's destructuring, JSDoc). Best effort; anything it
// cannot read is skipped. Props inherited from HTML elements are not listed.
import ts from 'typescript';
import {readdirSync, writeFileSync, existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';

const root = fileURLToPath(new URL('../../../packages/react/src/components/', import.meta.url));
const out = fileURLToPath(new URL('../src/props.generated.json', import.meta.url));
const names = readdirSync(root).filter((n) => existsSync(join(root, n, `${n}.tsx`)));
const files = names.map((n) => join(root, n, `${n}.tsx`));

const program = ts.createProgram(files, {jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler, skipLibCheck: true, noEmit: true, strict: true});
const checker = program.getTypeChecker();

/** name -> default text from destructuring patterns like `{size = 'md', gap = 3}` anywhere in the file. */
function defaults(sf) {
  const map = {};
  const visit = (n) => {
    if (ts.isBindingElement(n) && n.initializer && ts.isIdentifier(n.name) && n.parent && ts.isObjectBindingPattern(n.parent)) {
      map[n.propertyName && ts.isIdentifier(n.propertyName) ? n.propertyName.text : n.name.text] = n.initializer.getText(sf);
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);
  return map;
}

const result = {};
for (const [i, file] of files.entries()) {
  try {
    const sf = program.getSourceFile(file);
    if (!sf) continue;
    const defs = defaults(sf);
    const groups = [];
    ts.forEachChild(sf, (node) => {
      const exported = (ts.canHaveModifiers(node) ? ts.getModifiers(node) ?? [] : []).some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
      if (!exported || !(ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node)) || !/Props$/.test(node.name.text)) return;
      const type = checker.getTypeAtLocation(node.name);
      const props = checker.getPropertiesOfType(type)
        .filter((s) => (s.declarations ?? []).some((d) => d.getSourceFile() === sf))
        .map((s) => {
          const decl = s.declarations[0];
          const text = checker.typeToString(checker.getTypeOfSymbolAtLocation(s, decl), decl, ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope);
          return {
            name: s.name,
            type: text.replace(/ \| undefined$/, '').replace(/^\((.*)\) \| undefined$/, '$1'),
            optional: !!(s.flags & ts.SymbolFlags.Optional),
            default: defs[s.name] ?? null,
            description: ts.displayPartsToString(s.getDocumentationComment(checker)).trim(),
          };
        });
      if (props.length) groups.push({name: node.name.text, props});
    });
    if (groups.length) result[names[i]] = groups;
  } catch { /* skip */ }
}
writeFileSync(out, JSON.stringify(result, null, 1) + '\n');
console.log(`props: ${Object.keys(result).length} components with documented props`);
