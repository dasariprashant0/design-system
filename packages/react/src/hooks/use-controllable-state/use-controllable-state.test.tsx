import {act, renderHook} from '@testing-library/react';
import {useControllableState} from './use-controllable-state';

describe('useControllableState', () => {
  it('works uncontrolled: starts at defaultValue and updates itself', () => {
    const onChange = vi.fn();
    const {result} = renderHook(() => useControllableState({defaultValue: 'a', onChange}));
    expect(result.current[0]).toBe('a');
    act(() => result.current[1]('b'));
    expect(result.current[0]).toBe('b');
    expect(onChange).toHaveBeenCalledWith('b');
  });

  it('works controlled: value wins and only onChange reports the request', () => {
    const onChange = vi.fn();
    const {result} = renderHook(() => useControllableState({value: 'a', defaultValue: 'z', onChange}));
    expect(result.current[0]).toBe('a');
    act(() => result.current[1]('b'));
    expect(onChange).toHaveBeenCalledWith('b');
    expect(result.current[0]).toBe('a');
  });

  it('follows the value prop when the parent updates it', () => {
    const {result, rerender} = renderHook(
      ({value}: {value: string}) => useControllableState({value, defaultValue: 'a'}),
      {initialProps: {value: 'x'}},
    );
    expect(result.current[0]).toBe('x');
    rerender({value: 'y'});
    expect(result.current[0]).toBe('y');
  });

  it('does not call onChange when the value is unchanged', () => {
    const onChange = vi.fn();
    const {result} = renderHook(() => useControllableState({defaultValue: 'a', onChange}));
    act(() => result.current[1]('a'));
    expect(onChange).not.toHaveBeenCalled();
  });
});
