// Props extraction, shared by packages/react/scripts/gen-registry.mjs and apps/docs/scripts/gen-props.mjs.
// Reads the exported *Props interfaces and types of a unit's main source file (hooks also: *Options, *Return)
// with the TypeScript compiler API and returns groups:
//   [{name: 'ButtonProps', props: [{name, type, optional, default, description}]}]
// `type` is the checker's type text, `default` the initializer from the component's destructuring (or null),
// `description` the JSDoc. Props inherited from HTML elements are not listed (only symbols declared in the file).
import ts from 'typescript';
import {existsSync} from 'node:fs';
import {join} from 'node:path';

export const COMPONENT_PROPS = /Props$/;
export const HOOK_PROPS = /(Props|Options|Return)$/;

const COMPILER_OPTIONS = {
  jsx: ts.JsxEmit.ReactJSX,
  target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  skipLibCheck: true,
  noEmit: true,
  strict: true,
};

/** The unit's main source: `<dir>/<name>.tsx`, else `<dir>/<name>.ts`, else null. */
export function mainSourceFile(dir, name) {
  for (const ext of ['tsx', 'ts']) {
    const file = join(dir, `${name}.${ext}`);
    if (existsSync(file)) return file;
  }
  return null;
}

/** One type-checked program over all files, so the checker can resolve every unit at once. */
export function createProgram(files) {
  return ts.createProgram(files, COMPILER_OPTIONS);
}

/** name -> default text from destructuring patterns like `{size = 'md', gap = 3}` anywhere in the file. */
export function destructuringDefaults(sf) {
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

/**
 * Exported props groups declared in `file`. `pattern` picks the interface/type names (default: *Props).
 * Returns [] when the file is not part of `program` or declares no matching export with props.
 */
export function propGroups(program, file, {pattern = COMPONENT_PROPS} = {}) {
  const sf = program.getSourceFile(file);
  if (!sf) return [];
  const checker = program.getTypeChecker();
  const defs = destructuringDefaults(sf);
  const groups = [];
  ts.forEachChild(sf, (node) => {
    const exported = (ts.canHaveModifiers(node) ? ts.getModifiers(node) ?? [] : []).some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
    if (!exported || !(ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node)) || !pattern.test(node.name.text)) return;
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
  return groups;
}

/** Convenience for one file: builds its own program. Used by tests and one-off callers. */
export function extractProps(file, options) {
  return propGroups(createProgram([file]), file, options);
}
