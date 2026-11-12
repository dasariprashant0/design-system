'use client';
import {forwardRef, useCallback, useEffect, useImperativeHandle, useRef, type CanvasHTMLAttributes} from 'react';
import {cx} from '../../utils/cx';
import {prefersReducedMotion} from '../number-ticker/use-reduced-motion';

export interface ConfettiHandle {
  /** Throw a burst. Does nothing under `prefers-reduced-motion`. */
  fire: () => void;
}

export interface ConfettiProps extends Omit<CanvasHTMLAttributes<HTMLCanvasElement>, 'children'> {
  /** Fires a burst each time this number changes (not on mount). Or call `ref.current.fire()`. */
  burst?: number;
  /** Pieces per burst. Default 60. */
  count?: number;
  /** Where the burst starts, as 0 to 1 of the window. Default the centre. */
  origin?: {x: number; y: number};
  /** Fill colours. Default: the accent, foreground and muted tokens. */
  colors?: string[];
}

type Piece = {x: number; y: number; vx: number; vy: number; rot: number; vr: number; w: number; h: number; color: string; life: number};

/**
 * A short burst of square confetti on a canvas that covers the window and ignores the pointer. Trigger it with `burst` or `fire()`.
 * Decorative (`aria-hidden`); announce the event it celebrates some other way. Off for reduced motion.
 */
export const Confetti = forwardRef<ConfettiHandle, ConfettiProps>(function Confetti({burst, count = 60, origin = {x: 0.5, y: 0.5}, colors, className, ...rest}, ref) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  const props = useRef({count, origin, colors});
  props.current = {count, origin, colors};

  const fire = useCallback(() => {
    const el = canvas.current;
    if (!el || prefersReducedMotion() || typeof requestAnimationFrame === 'undefined') return;
    const ctx = el.getContext('2d');
    if (!ctx) return;
    const {count: n, origin: o, colors: given} = props.current;
    el.width = window.innerWidth;
    el.height = window.innerHeight;
    const style = getComputedStyle(el);
    const palette = given ?? ['--accent', '--foreground', '--muted'].map((t) => style.getPropertyValue(t).trim()).filter(Boolean);
    if (!palette.length) palette.push('currentColor');
    const pieces: Piece[] = Array.from({length: n}, (_, i) => {
      const a = Math.random() * Math.PI * 2;
      const s = 4 + Math.random() * 8;
      return {x: o.x * el.width, y: o.y * el.height, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 4, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4, w: 4 + Math.random() * 6, h: 4 + Math.random() * 6, color: palette[i % palette.length]!, life: 70 + Math.random() * 40};
    });
    cancelAnimationFrame(raf.current);
    const step = () => {
      ctx.clearRect(0, 0, el.width, el.height);
      let alive = 0;
      for (const p of pieces) {
        p.life -= 1;
        if (p.life <= 0) continue;
        alive += 1;
        p.vy += 0.25; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.rot += p.vr;
        ctx.save();
        ctx.globalAlpha = Math.min(1, p.life / 30);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      if (alive) raf.current = requestAnimationFrame(step); else ctx.clearRect(0, 0, el.width, el.height);
    };
    raf.current = requestAnimationFrame(step);
  }, []);

  useImperativeHandle(ref, () => ({fire}), [fire]);

  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    fire();
  }, [burst, fire]);
  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  return <canvas ref={canvas} aria-hidden="true" className={cx('confetti', className)} {...rest} />;
});
