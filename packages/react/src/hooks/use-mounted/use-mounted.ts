'use client';
import {useEffect, useState} from 'react';

/** False on the server and during the first render, true afterwards. */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
