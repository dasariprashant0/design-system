import {renderHook} from '@testing-library/react';
import {renderToString} from 'react-dom/server';
import {createElement} from 'react';
import {useMounted} from './use-mounted';

describe('useMounted', () => {
  it('is true after mounting on the client', () => {
    const {result} = renderHook(() => useMounted());
    expect(result.current).toBe(true);
  });
  it('is false when rendered to a string (server)', () => {
    function Probe() { return createElement('span', null, String(useMounted())); }
    expect(renderToString(createElement(Probe))).toContain('false');
  });
});
