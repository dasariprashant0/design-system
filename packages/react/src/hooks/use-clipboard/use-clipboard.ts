'use client';
import {useCallback, useEffect, useRef, useState} from 'react';

export interface UseClipboardOptions {
  /** How long `copied` stays true, in milliseconds. Default 2000. */
  timeout?: number;
}

export interface UseClipboardReturn {
  /** True for `timeout` ms after a successful copy. */
  copied: boolean;
  /** The last failure, cleared by the next copy. */
  error: Error | null;
  /** Copies text. Resolves `true` on success, `false` on failure (never throws). */
  copy: (value: string) => Promise<boolean>;
}

/** Copy text with the Clipboard API, with a `copied` flag that resets after a delay. */
export function useClipboard({timeout = 2000}: UseClipboardOptions = {}): UseClipboardReturn {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = useCallback(
    async (value: string): Promise<boolean> => {
      try {
        // Only touched inside copy(), so rendering on the server is safe.
        if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
          throw new Error('Clipboard API is not available here.');
        }
        await navigator.clipboard.writeText(value);
        setError(null);
        setCopied(true);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setCopied(false), timeout);
        return true;
      } catch (cause) {
        clearTimeout(timer.current);
        setCopied(false);
        setError(cause instanceof Error ? cause : new Error(String(cause)));
        return false;
      }
    },
    [timeout],
  );

  return {copied, error, copy};
}
