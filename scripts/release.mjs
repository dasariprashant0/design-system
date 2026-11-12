#!/usr/bin/env node
// Release tooling for the Monoline packages (every folder under packages/).
//
//   node scripts/release.mjs check [--expect x.y.z] [--list]
//   node scripts/release.mjs version <patch|minor|major|x.y.z> [--tag] [--allow-dirty] [--date YYYY-MM-DD]
//   node scripts/release.mjs publish --dry-run
//   node scripts/release.mjs publish --yes [--provenance]
//   node scripts/release.mjs notes <x.y.z>
//
// check    verifies every package: name, version, MIT, not private, README, LICENSE (copied from the root
//          if missing), exports and bin resolve to files that exist and are in the npm tarball, no test,
//          demo or config files in the tarball, and prints the size and file list from `npm pack --dry-run`.
// version  bumps every package to the same version, updates internal dependency ranges, and prepends a
//          CHANGELOG.md section built from commit subjects since the last v* tag. Creates no tag unless --tag.
//          Writes files only; you commit them.
// publish  runs check, then `npm publish` in dependency order. --dry-run runs `npm publish --dry-run`.
//          --yes publishes for real; it refuses unless `npm whoami` works and git is clean, and it skips
//          packages whose version is already on npm (so a half-finished publish can be re-run).
// notes    prints one CHANGELOG.md section (used for the GitHub release body).
//
// Node 20+ built-ins only. The network is used only by `npm whoami`, `npm view` and `npm publish`.
import {spawnSync} from 'node:child_process';
import {copyFileSync, existsSync, readdirSync, readFileSync, writeFileSync} from 'node:fs';
import {dirname, join, relative, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DEP_KEYS = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'];
const NAME = /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;
const SEMVER = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;

// ---------- pure functions (unit tested in release.test.mjs) ----------

/** "1.2.3" -> [1, 2, 3]. Throws on anything else (no pre-release tags: they are not used here). */
export function parseVersion(version) {
  const m = SEMVER.exec(version);
  if (!m) throw new Error(`not a plain x.y.z version: ${version}`);
  return m.slice(1).map(Number);
}

/** Negative, zero or positive, like a sort comparator. */
export function compareVersions(a, b) {
  const x = parseVersion(a);
  const y = parseVersion(b);
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] - y[i];
  return 0;
}

/** `spec` is patch | minor | major, or an explicit x.y.z that must be newer than `current`. */
export function nextVersion(current, spec) {
  const [major, minor, patch] = parseVersion(current);
  if (spec === 'major') return `${major + 1}.0.0`;
  if (spec === 'minor') return `${major}.${minor + 1}.0`;
  if (spec === 'patch') return `${major}.${minor}.${patch + 1}`;
  parseVersion(spec);
  if (compareVersions(spec, current) <= 0) throw new Error(`${spec} is not newer than ${current}`);
  return spec;
}

/** Returns a copy of `pkg` where every dependency on one of `internalNames` points at `^version`. */
export function bumpInternalRanges(pkg, internalNames, version) {
  const out = {...pkg};
  for (const key of DEP_KEYS) {
    if (!pkg[key]) continue;
    out[key] = Object.fromEntries(
      Object.entries(pkg[key]).map(([name, range]) => (internalNames.includes(name) ? [name, `^${version}`] : [name, range])),
    );
  }
  return out;
}

/** Names in publish order: a package comes after every internal package it depends on. Throws on a cycle. */
export function publishOrder(packages) {
  const names = new Set(packages.map((p) => p.name));
  const deps = new Map(
    packages.map((p) => [
      p.name,
      DEP_KEYS.flatMap((k) => Object.keys(p.json[k] ?? {})).filter((n) => names.has(n) && n !== p.name),
    ]),
  );
  const order = [];
  const state = new Map();
  const visit = (name, path) => {
    if (state.get(name) === 'done') return;
    if (state.get(name) === 'busy') throw new Error(`dependency cycle: ${[...path, name].join(' -> ')}`);
    state.set(name, 'busy');
    for (const dep of deps.get(name)) visit(dep, [...path, name]);
    state.set(name, 'done');
    order.push(name);
  };
  for (const p of [...packages].sort((a, b) => a.name.localeCompare(b.name))) visit(p.name, []);
  return order;
}

/** Every string target under exports / main / module / types / typings / bin that starts with "./". */
export function collectTargets(json) {
  const walk = (value, out) => {
    if (typeof value === 'string') out.push(value);
    else if (value && typeof value === 'object') Object.values(value).forEach((v) => walk(v, out));
    return out;
  };
  // exports targets must start with "./"; main, types and bin may be written either way.
  const relative = (p) => `./${p.replace(/^\.?\//, '')}`;
  const exported = walk(json.exports, []).filter((p) => p.startsWith('./'));
  const other = [...['main', 'module', 'types', 'typings'].map((k) => json[k]), ...walk(json.bin, [])]
    .filter((p) => typeof p === 'string' && p.length > 0 && !/^[a-z]+:/i.test(p))
    .map(relative);
  return [...new Set([...exported, ...other])];
}

/** npm's publish step silently drops a bin path written with a leading "./", so the release must refuse it. */
export function binProblems(json) {
  const bins = typeof json.bin === 'string' ? [json.bin] : Object.values(json.bin ?? {});
  return bins.filter((p) => typeof p === 'string' && p.startsWith('./')).map(
    (p) => `bin path "${p}" starts with "./"; npm publish drops it. Write "${p.slice(2)}" instead`,
  );
}

const TYPE_SECTION = {
  feat: 'Added',
  fix: 'Fixed',
  perf: 'Changed',
  refactor: 'Changed',
  style: 'Changed',
  docs: 'Maintenance',
  test: 'Maintenance',
  tests: 'Maintenance',
  ci: 'Maintenance',
  build: 'Maintenance',
  chore: 'Maintenance',
};
export const SECTIONS = ['Breaking changes', 'Added', 'Fixed', 'Changed', 'Maintenance'];
const CONVENTIONAL = /^([a-z]+)(\(([^)]+)\))?(!)?:\s*(.+)$/i;

/**
 * One commit -> {section, scope, text, breaking}. Accepts conventional commits (`feat(css): ...`, `fix!: ...`)
 * and this repo's plain style (`button: add loading state`, where the prefix is the scope).
 */
export function parseCommit({subject, body = ''}) {
  const line = subject.trim();
  const m = CONVENTIONAL.exec(line);
  const breaking = /BREAKING[ -]CHANGE:/.test(body) || Boolean(m?.[4]);
  if (!m) return {section: 'Changed', scope: null, text: line, breaking};
  const type = m[1].toLowerCase();
  const known = Object.hasOwn(TYPE_SECTION, type);
  return {
    section: known ? TYPE_SECTION[type] : 'Changed',
    scope: m[3] ?? (known ? null : m[1]),
    text: m[5],
    breaking,
  };
}

/** Commits -> {section name: ["**scope:** text", ...]}. Merge and release commits are dropped. */
export function groupCommits(commits) {
  const groups = Object.fromEntries(SECTIONS.map((s) => [s, []]));
  for (const commit of commits) {
    if (/^(Merge\b|chore\(release\)|release\b)/i.test(commit.subject.trim())) continue;
    const p = parseCommit(commit);
    const line = p.scope ? `**${p.scope}:** ${p.text}` : p.text;
    groups[p.breaking ? 'Breaking changes' : p.section].push(line);
  }
  return groups;
}

/** One `## x.y.z - date` section in the house style of CHANGELOG.md. */
export function renderSection(version, date, groups) {
  const lines = [`## ${version} - ${date}`, ''];
  for (const heading of SECTIONS) {
    if (!groups[heading]?.length) continue;
    lines.push(`### ${heading}`, '', ...groups[heading].map((t) => `- ${t}`), '');
  }
  if (lines.length === 2) lines.push('No notable changes.', '');
  return lines.join('\n').trimEnd() + '\n';
}

/** Inserts `section` above the first existing `## ` heading, or at the end when there is none. */
export function prependChangelog(text, section) {
  const i = text.search(/^## /m);
  if (i === -1) return `${text.trimEnd()}\n\n${section}`;
  return `${text.slice(0, i)}${section}\n${text.slice(i)}`;
}

/** The body (without its heading) of the `## version` section, or null. */
export function extractSection(text, version) {
  const lines = text.split('\n');
  const start = lines.findIndex((l) => l === `## ${version}` || l.startsWith(`## ${version} `));
  if (start === -1) return null;
  const next = lines.findIndex((l, i) => i > start && l.startsWith('## '));
  return lines.slice(start + 1, next === -1 ? undefined : next).join('\n').trim() + '\n';
}

const FORBIDDEN_IN_TARBALL = [
  [/\.(test|spec)\.[cm]?[jt]sx?$/, 'test file'],
  [/\.demo\.[cm]?[jt]sx?$/, 'demo file'],
  [/(^|\/)(test|tests|__tests__|demo|demos)\//, 'test or demo folder'],
  [/(^|\/)vitest\.d\.ts$/, 'test typings'],
  [/(^|\/)(scripts|\.github)\//, 'build or CI script'],
  [/(^|\/)(vite|vitest)\.config\.[cm]?[jt]s$/, 'config file'],
  [/(^|\/)tsconfig[^/]*\.json$/, 'tsconfig'],
  [/\.tsbuildinfo$/, 'build cache'],
  [/(^|\/)node_modules\//, 'dependency folder'],
  [/(^|\/)\.[^/]+$/, 'dotfile'],
];

/** Problems with the paths npm would ship: forbidden files, and required files that are missing. */
export function tarballProblems(paths) {
  const problems = [];
  for (const path of paths) {
    const hit = FORBIDDEN_IN_TARBALL.find(([re]) => re.test(path));
    if (hit) problems.push(`${path}: ${hit[1]} must not be published`);
  }
  for (const required of ['package.json', 'README.md']) {
    if (!paths.includes(required)) problems.push(`${required} is missing from the tarball`);
  }
  if (!paths.some((p) => /^LICENSE(\.[a-z]+)?$/i.test(p))) problems.push('LICENSE is missing from the tarball');
  return problems;
}

// ---------- side effects ----------

const fail = (message) => {
  console.error(`release: ${message}`);
  process.exit(1);
};

function run(cmd, args, cwd = ROOT) {
  const r = spawnSync(cmd, args, {cwd, encoding: 'utf8'});
  return {status: r.status, stdout: r.stdout ?? '', stderr: r.stderr ?? ''};
}

const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'));
const writeJson = (file, data) => writeFileSync(file, JSON.stringify(data, null, 2) + '\n');

function loadPackages() {
  const dir = join(ROOT, 'packages');
  return readdirSync(dir, {withFileTypes: true})
    .filter((d) => d.isDirectory() && existsSync(join(dir, d.name, 'package.json')))
    .map((d) => {
      const pkgDir = join(dir, d.name);
      const file = join(pkgDir, 'package.json');
      const json = readJson(file);
      return {name: json.name, dir: pkgDir, file, rel: relative(ROOT, pkgDir), json};
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

function gitClean() {
  return run('git', ['status', '--porcelain']).stdout.trim() === '';
}

function lastTag() {
  const r = run('git', ['describe', '--tags', '--abbrev=0', '--match', 'v*']);
  return r.status === 0 ? r.stdout.trim() : null;
}

function commitsSince(tag) {
  const range = tag ? [`${tag}..HEAD`] : [];
  const out = run('git', ['log', '--format=%s%x1f%b%x1e', ...range]).stdout;
  return out
    .split('\x1e')
    .map((rec) => rec.replace(/^\n/, ''))
    .filter(Boolean)
    .map((rec) => {
      const [subject = '', body = ''] = rec.split('\x1f');
      return {subject: subject.trim(), body};
    });
}

function packInfo(pkg) {
  const r = run('npm', ['pack', '--dry-run', '--json'], pkg.dir);
  if (r.status !== 0) {
    const first = r.stderr.split('\n').find((l) => l.trim() && !/^npm (warn|notice)/.test(l)) ?? 'npm pack --dry-run failed';
    return {error: `npm pack --dry-run failed: ${first.replace(/^npm error\s*/, '').trim()}`};
  }
  try {
    const [info] = JSON.parse(r.stdout);
    return {
      files: info.files.map((f) => ({path: f.path, size: f.size})).sort((a, b) => a.path.localeCompare(b.path)),
      size: info.size,
      unpackedSize: info.unpackedSize,
    };
  } catch {
    return {error: 'could not parse npm pack output'};
  }
}

const kb = (bytes) => `${(bytes / 1024).toFixed(1)} kB`;

/** Runs every check, prints the report and returns true when nothing is wrong. */
function runCheck({expect, list = true} = {}) {
  const pkgs = loadPackages();
  const problems = [];
  if (pkgs.length === 0) problems.push('no packages found under packages/');

  const versions = [...new Set(pkgs.map((p) => p.json.version))];
  if (versions.length > 1) problems.push(`versions differ (${versions.join(', ')}); bump every package together`);
  if (expect && !versions.includes(expect)) problems.push(`packages are at ${versions.join(', ')}, expected ${expect}`);

  for (const p of pkgs) {
    const j = p.json;
    const label = `${j.name ?? p.rel}@${j.version ?? '?'}`;
    const before = problems.length;
    if (!NAME.test(j.name ?? '')) problems.push(`${p.rel}: invalid package name "${j.name}"`);
    try {
      parseVersion(j.version);
    } catch (e) {
      problems.push(`${label}: ${e.message}`);
    }
    if (j.private) problems.push(`${label}: "private": true; remove it to publish`);
    if (j.license !== 'MIT') problems.push(`${label}: license is "${j.license}", expected "MIT"`);
    if (!existsSync(join(p.dir, 'README.md'))) problems.push(`${label}: README.md is missing`);
    if (!existsSync(join(p.dir, 'LICENSE'))) {
      copyFileSync(join(ROOT, 'LICENSE'), join(p.dir, 'LICENSE'));
      console.log(`  copied LICENSE into ${p.rel}`);
    }
    if (!Array.isArray(j.files)) problems.push(`${label}: "files" is missing, so npm would ship the whole folder`);

    problems.push(...binProblems(j).map((m) => `${label}: ${m}`));
    const targets = collectTargets(j);
    for (const t of targets) {
      if (t.includes('*')) {
        if (!existsSync(join(p.dir, t.split('*')[0]))) problems.push(`${label}: ${t} points at a folder that does not exist`);
        continue;
      }
      if (!existsSync(join(p.dir, t))) {
        const hint = t.startsWith('./dist/') && !existsSync(join(p.dir, 'dist')) ? ' (dist/ is missing: run npm run build)' : '';
        problems.push(`${label}: ${t} does not exist${hint}`);
      }
    }

    const pack = packInfo(p);
    if (pack.error) {
      problems.push(`${label}: ${pack.error}`);
      console.log(`FAIL ${label}`);
    } else {
      const paths = pack.files.map((f) => f.path);
      for (const t of targets.filter((t) => !t.includes('*') && existsSync(join(p.dir, t)))) {
        if (!paths.includes(t.slice(2))) problems.push(`${label}: ${t} exists but is not in the tarball (check "files")`);
      }
      problems.push(...tarballProblems(paths).map((m) => `${label}: ${m}`));
      console.log(
        `${problems.length === before ? 'ok  ' : 'FAIL'} ${label}  ${j.license}  ${pack.files.length} files  ` +
          `packed ${kb(pack.size)}  unpacked ${kb(pack.unpackedSize)}`,
      );
      if (list) for (const f of pack.files) console.log(`       ${kb(f.size).padStart(10)}  ${f.path}`);
    }
  }

  if (problems.length) {
    console.error(`\n${problems.length} problem(s):`);
    for (const m of problems) console.error(`  - ${m}`);
    return false;
  }
  console.log(`\nrelease check passed: ${pkgs.length} packages at ${versions.join(', ')}`);
  return true;
}

function bump(spec, {tag, allowDirty, date}) {
  const pkgs = loadPackages();
  const versions = [...new Set(pkgs.map((p) => p.json.version))];
  if (versions.length !== 1) fail(`packages are at different versions (${versions.join(', ')}); fix that first`);
  const next = nextVersion(versions[0], spec);
  if (!allowDirty && !gitClean()) fail('git working tree is not clean; commit first or pass --allow-dirty');

  const changelogPath = join(ROOT, 'CHANGELOG.md');
  const changelog = readFileSync(changelogPath, 'utf8');
  if (extractSection(changelog, next) !== null) fail(`CHANGELOG.md already has a ${next} section`);

  const tag0 = lastTag();
  const section = renderSection(next, date, groupCommits(commitsSince(tag0)));
  const names = pkgs.map((p) => p.name);
  for (const p of pkgs) writeJson(p.file, bumpInternalRanges({...p.json, version: next}, names, next));
  const rootFile = join(ROOT, 'package.json');
  writeJson(rootFile, {...readJson(rootFile), version: next});
  writeFileSync(changelogPath, prependChangelog(changelog, section));
  if (tag) run('git', ['tag', '-a', `v${next}`, '-m', `Monoline v${next}`]);

  console.log(`bumped ${versions[0]} -> ${next} in ${pkgs.length} packages and the root package.json`);
  console.log(`CHANGELOG.md section from ${tag0 ? `${tag0}..HEAD` : 'all commits (no v* tag yet)'}:\n`);
  console.log(section);
  console.log(tag ? `created tag v${next}` : 'no tag created (pass --tag to create one)');
  console.log('Next: review the diff, edit the CHANGELOG wording if needed, then commit.');
}

function publish({dryRun, yes, provenance}) {
  if (dryRun === yes) fail('choose one: --dry-run (rehearsal) or --yes (publish for real)');
  if (!runCheck()) fail('check failed; nothing was published');
  const pkgs = loadPackages();
  const order = publishOrder(pkgs.map((p) => ({name: p.name, json: p.json})));
  const byName = new Map(pkgs.map((p) => [p.name, p]));

  if (yes) {
    if (run('npm', ['whoami']).status !== 0) fail('npm whoami failed; run `npm login` (or set NODE_AUTH_TOKEN) first');
    if (!gitClean()) fail('git working tree is not clean; commit or stash first');
  } else if (!gitClean()) {
    console.log('note: git working tree is not clean (a real publish would refuse)\n');
  }

  console.log(`publish order: ${order.join(' -> ')}`);
  for (const name of order) {
    const p = byName.get(name);
    const {version} = p.json;
    if (yes && run('npm', ['view', `${name}@${version}`, 'version', '--json']).stdout.trim() !== '') {
      console.log(`skip ${name}@${version}: already on npm`);
      continue;
    }
    const args = ['publish', '--access', 'public'];
    if (dryRun) args.push('--dry-run');
    if (provenance) args.push('--provenance');
    console.log(`\n$ cd ${p.rel} && npm ${args.join(' ')}`);
    const r = spawnSync('npm', args, {cwd: p.dir, encoding: 'utf8', stdio: yes ? 'inherit' : 'pipe'});
    if (!yes) process.stdout.write(`${r.stdout}${r.stderr}`);
    if (r.status !== 0) fail(`npm publish failed for ${name}`);
    console.log(dryRun ? `dry run ok: ${name}@${version}` : `published ${name}@${version}`);
  }
  console.log(dryRun ? '\npublish dry run passed (nothing was uploaded)' : '\nall packages published');
}

function notes(version) {
  const body = extractSection(readFileSync(join(ROOT, 'CHANGELOG.md'), 'utf8'), version);
  if (body === null) fail(`CHANGELOG.md has no ${version} section`);
  process.stdout.write(body);
}

function parseArgs(argv) {
  const positional = [];
  const flags = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) {
      positional.push(a);
      continue;
    }
    const [key, inline] = a.slice(2).split('=');
    flags[key] = inline ?? (argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true);
  }
  return {positional, flags};
}

const USAGE = `usage:
  node scripts/release.mjs check [--expect x.y.z] [--list]
  node scripts/release.mjs version <patch|minor|major|x.y.z> [--tag] [--allow-dirty] [--date YYYY-MM-DD]
  node scripts/release.mjs publish --dry-run
  node scripts/release.mjs publish --yes [--provenance]
  node scripts/release.mjs notes <x.y.z>`;

function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  const {positional, flags} = parseArgs(rest);
  switch (cmd) {
    case 'check':
      process.exit(runCheck({expect: flags.expect, list: flags.list !== false}) ? 0 : 1);
      break;
    case 'version':
      if (!positional[0]) fail(`missing bump: patch, minor, major or x.y.z\n${USAGE}`);
      bump(positional[0], {tag: Boolean(flags.tag), allowDirty: Boolean(flags['allow-dirty']), date: flags.date ?? new Date().toISOString().slice(0, 10)});
      break;
    case 'publish':
      publish({dryRun: Boolean(flags['dry-run']), yes: Boolean(flags.yes), provenance: Boolean(flags.provenance)});
      break;
    case 'notes':
      if (!positional[0]) fail(`missing version\n${USAGE}`);
      notes(positional[0]);
      break;
    default:
      console.log(USAGE);
      process.exit(cmd ? 2 : 0);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
