'use client';
import {useEffect} from 'react';

/** Sets `document.title` while mounted and restores the previous title on unmount. Does nothing on the server. */
export function useDocumentTitle(title: string): void {
  useEffect(() => {
    const prev = document.title;
    document.title = title;
    return () => { document.title = prev; };
  }, [title]);
}
