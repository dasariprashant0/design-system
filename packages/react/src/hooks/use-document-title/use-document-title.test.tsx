import {renderHook} from '@testing-library/react';
import {useDocumentTitle} from './use-document-title';

describe('useDocumentTitle', () => {
  it('sets the title and restores it on unmount', () => {
    document.title = 'Home';
    const {unmount} = renderHook(() => useDocumentTitle('Settings'));
    expect(document.title).toBe('Settings');
    unmount();
    expect(document.title).toBe('Home');
  });
  it('updates when the title changes', () => {
    document.title = 'Home';
    const {rerender} = renderHook(({t}) => useDocumentTitle(t), {initialProps: {t: 'A'}});
    rerender({t: 'B'});
    expect(document.title).toBe('B');
  });
});
