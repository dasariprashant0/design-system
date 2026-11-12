// The tests read CSS source with node:fs; the package has no @types/node, so declare the one function used.
declare module 'node:fs' {
  export function readFileSync(path: URL, encoding: 'utf8'): string;
}
