import {configureAxe} from 'vitest-axe';

/** Run axe on rendered markup: `expect(await axe(container)).toHaveNoViolations()`. */
export const axe = configureAxe({rules: {region: {enabled: false}, 'color-contrast': {enabled: false}}});
