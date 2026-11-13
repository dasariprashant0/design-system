// Unit tests for the pure functions in release.mjs. Run: npm run test:release
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {
  binProblems,
  bumpInternalRanges,
  collectTargets,
  compareVersions,
  extractSection,
  groupCommits,
  nextVersion,
  parseCommit,
  parseVersion,
  prependChangelog,
  publishOrder,
  renderSection,
  tarballProblems,
} from './release.mjs';

test('parseVersion accepts x.y.z and rejects everything else', () => {
  assert.deepEqual(parseVersion('1.20.3'), [1, 20, 3]);
  for (const bad of ['1.2', 'v1.2.3', '1.2.3-beta.1', '01.2.3', '']) {
    assert.throws(() => parseVersion(bad), /not a plain x\.y\.z/, bad);
  }
});

test('compareVersions orders numerically, not as text', () => {
  assert.ok(compareVersions('0.10.0', '0.9.0') > 0);
  assert.equal(compareVersions('1.0.0', '1.0.0'), 0);
});

test('nextVersion bumps patch, minor and major', () => {
  assert.equal(nextVersion('0.3.0', 'patch'), '0.3.1');
  assert.equal(nextVersion('0.3.9', 'minor'), '0.4.0');
  assert.equal(nextVersion('0.3.9', 'major'), '1.0.0');
});

test('nextVersion takes an explicit version only when it is newer', () => {
  assert.equal(nextVersion('0.3.0', '1.0.0'), '1.0.0');
  assert.throws(() => nextVersion('0.3.0', '0.3.0'), /not newer/);
  assert.throws(() => nextVersion('0.3.0', '0.2.9'), /not newer/);
  assert.throws(() => nextVersion('0.3.0', 'minor-ish'), /not a plain/);
});

test('bumpInternalRanges points internal dependencies at the new version and leaves others alone', () => {
  const pkg = {
    name: '@monoline/react',
    version: '0.3.0',
    dependencies: {'radix-ui': '^1.4.2'},
    peerDependencies: {react: '>=18'},
    devDependencies: {'@monoline/css': '*', vitest: '^3.2.0'},
  };
  const out = bumpInternalRanges(pkg, ['@monoline/css', '@monoline/react'], '0.4.0');
  assert.deepEqual(out.devDependencies, {'@monoline/css': '^0.4.0', vitest: '^3.2.0'});
  assert.deepEqual(out.dependencies, {'radix-ui': '^1.4.2'});
  assert.deepEqual(out.peerDependencies, {react: '>=18'});
  assert.equal(pkg.devDependencies['@monoline/css'], '*', 'input is not mutated');
});

test('publishOrder puts a package after the internal packages it depends on', () => {
  const css = {name: '@monoline/css', json: {}};
  const react = {name: '@monoline/react', json: {devDependencies: {'@monoline/css': '*'}}};
  const cli = {name: 'monoline', json: {}};
  assert.deepEqual(publishOrder([react, cli, css]), ['@monoline/css', '@monoline/react', 'monoline']);
});

test('publishOrder throws on a dependency cycle', () => {
  const a = {name: 'a', json: {dependencies: {b: '^1.0.0'}}};
  const b = {name: 'b', json: {dependencies: {a: '^1.0.0'}}};
  assert.throws(() => publishOrder([a, b]), /dependency cycle/);
});

test('collectTargets reads exports (nested), main, types and bin, and skips non-relative values', () => {
  const targets = collectTargets({
    main: './dist/cjs/index.cjs',
    types: './dist/index.d.ts',
    exports: {'.': {types: './dist/index.d.ts', import: './dist/index.js'}, './tokens.json': './dist/tokens.json'},
    bin: {monoline: './bin/monoline.mjs'},
    description: './not-a-target',
  });
  assert.deepEqual(targets.sort(), [
    './bin/monoline.mjs',
    './dist/cjs/index.cjs',
    './dist/index.d.ts',
    './dist/index.js',
    './dist/tokens.json',
  ]);
});

test('collectTargets accepts bin and main written without "./" and returns one normalised path each', () => {
  assert.deepEqual(collectTargets({bin: 'bin/monoline.mjs', main: 'dist/index.js'}).sort(), ['./bin/monoline.mjs', './dist/index.js']);
});

test('binProblems flags a leading "./" in bin, which npm publish drops', () => {
  assert.deepEqual(binProblems({bin: {monoline: './bin/monoline.mjs'}}).length, 1);
  assert.deepEqual(binProblems({bin: './bin/x.mjs'}).length, 1);
  assert.deepEqual(binProblems({bin: {monoline: 'bin/monoline.mjs'}}), []);
});

test('parseCommit reads conventional commits, the repo style and breaking markers', () => {
  assert.deepEqual(parseCommit({subject: 'feat(css): add accent teal'}), {
    section: 'Added', scope: 'css', text: 'add accent teal', breaking: false,
  });
  assert.equal(parseCommit({subject: 'fix!: drop the old class names'}).breaking, true);
  assert.equal(parseCommit({subject: 'x', body: 'BREAKING CHANGE: renamed'}).text, 'x');
  assert.equal(parseCommit({subject: 'x', body: 'BREAKING CHANGE: renamed'}).breaking, true);
  assert.deepEqual(parseCommit({subject: 'button: add loading state'}), {
    section: 'Changed', scope: 'button', text: 'add loading state', breaking: false,
  });
  assert.deepEqual(parseCommit({subject: 'Build one file per module'}), {
    section: 'Changed', scope: null, text: 'Build one file per module', breaking: false,
  });
});

test('groupCommits sorts commits into sections and drops merges and release commits', () => {
  const groups = groupCommits([
    {subject: 'feat(react): add Drawer'},
    {subject: 'fix(css): focus ring on dark'},
    {subject: 'docs: explain releases'},
    {subject: 'Merge branch main'},
    {subject: 'chore(release): 0.4.0'},
    {subject: 'fix!: remove legacy class'},
    {subject: 'tests: cover Tabs'},
  ]);
  assert.deepEqual(groups['Added'], ['**react:** add Drawer']);
  assert.deepEqual(groups['Fixed'], ['**css:** focus ring on dark']);
  assert.deepEqual(groups['Maintenance'], ['explain releases', 'cover Tabs']);
  assert.deepEqual(groups['Breaking changes'], ['remove legacy class']);
});

test('renderSection writes the heading, only non-empty sections, and says so when empty', () => {
  const text = renderSection('0.4.0', '2026-11-12', {
    'Breaking changes': [],
    Added: ['**css:** accent teal'],
    Fixed: [],
    Changed: ['rename the tabs root'],
    Maintenance: [],
  });
  assert.equal(
    text,
    '## 0.4.0 - 2026-11-12\n\n### Added\n\n- **css:** accent teal\n\n### Changed\n\n- rename the tabs root\n',
  );
  assert.match(renderSection('0.4.0', '2026-11-12', {}), /No notable changes\./);
});

test('prependChangelog inserts above the first version heading and keeps the older sections', () => {
  const old = '# Changelog\n\nIntro text.\n\n## 0.3.0\n\n- old\n';
  const out = prependChangelog(old, '## 0.4.0 - 2026-11-12\n\n- new\n');
  assert.equal(out, '# Changelog\n\nIntro text.\n\n## 0.4.0 - 2026-11-12\n\n- new\n\n## 0.3.0\n\n- old\n');
  assert.equal(prependChangelog('# Changelog\n', '## 0.1.0\n'), '# Changelog\n\n## 0.1.0\n');
});

test('extractSection returns one version body and never matches a prefix of another version', () => {
  const text = '# Changelog\n\n## 0.3.0\n\n- a\n\n## 0.3.00\n\n- nope\n\n## 0.2.0\n\n- b\n';
  assert.equal(extractSection(text, '0.3.0'), '- a\n');
  assert.equal(extractSection(text, '0.2.0'), '- b\n');
  assert.equal(extractSection(text, '0.3'), null);
});

test('tarballProblems flags tests, demos and configs, and requires README, LICENSE and package.json', () => {
  const clean = ['LICENSE', 'README.md', 'package.json', 'dist/index.js', 'src/button/button.tsx', 'src/demo.ts'];
  assert.deepEqual(tarballProblems(clean), []);

  const dirty = [
    'LICENSE', 'README.md', 'package.json', 'dist/index.js',
    'src/button/button.test.tsx', 'src/button/button.demo.tsx', 'src/test/setup.ts',
    'src/vitest.d.ts', 'scripts/build.mjs', 'vite.config.ts', 'tsconfig.json', '.npmignore',
  ];
  const problems = tarballProblems(dirty).join('\n');
  for (const needle of ['button.test.tsx', 'button.demo.tsx', 'src/test/setup.ts', 'vitest.d.ts', 'scripts/build.mjs', 'vite.config.ts', 'tsconfig.json', '.npmignore']) {
    assert.match(problems, new RegExp(needle.replace(/[.]/g, '\\.')), needle);
  }

  assert.deepEqual(tarballProblems(['dist/index.js']).sort(), [
    'LICENSE is missing from the tarball',
    'README.md is missing from the tarball',
    'package.json is missing from the tarball',
  ]);
});
