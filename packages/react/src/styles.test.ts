import {describe, expect, it} from 'vitest';
import {readdirSync} from 'node:fs';
import {join} from 'node:path';
import {styles} from './index';

describe('styles map', () => {
  it('points core and every component that has CSS at a bundle', () => {
    expect(styles.core).toBe('@monoline/css/core.css');
    expect(styles.button).toBe('@monoline/css/components/button.css');
    expect(styles.dialog).toBe('@monoline/css/components/dialog.css');
  });
  it('has no entry for a component folder that does not exist', () => {
    const folders = new Set(readdirSync(join(process.cwd(), 'src/components')));
    for (const k of Object.keys(styles)) if (k !== 'core') expect(folders.has(k)).toBe(true);
  });
});
