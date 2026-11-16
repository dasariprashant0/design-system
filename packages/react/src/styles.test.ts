import {describe, expect, it} from 'vitest';
import {styles} from './index';

describe('styles map', () => {
  it('points core and each component that has CSS at its bundle', () => {
    expect(styles.core).toBe('@monoline/css/core.css');
    expect(styles.button).toBe('@monoline/css/components/button.css');
    expect(styles['date-picker']).toBe('@monoline/css/components/date-picker.css');
  });
});
