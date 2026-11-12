import {renderHook} from '@testing-library/react';
import {usePrevious} from './use-previous';

describe('usePrevious', () => {
  it('is undefined on the first render', () => {
    const {result} = renderHook(() => usePrevious(1));
    expect(result.current).toBeUndefined();
  });

  it('returns the value from the previous render', () => {
    const {result, rerender} = renderHook(({v}: {v: number}) => usePrevious(v), {initialProps: {v: 1}});
    rerender({v: 2});
    expect(result.current).toBe(1);
    rerender({v: 3});
    expect(result.current).toBe(2);
  });

  it('reports the last committed value when re-rendered with the same input', () => {
    const {result, rerender} = renderHook(({v}: {v: number}) => usePrevious(v), {initialProps: {v: 1}});
    rerender({v: 2});
    rerender({v: 2});
    expect(result.current).toBe(2);
  });
});
