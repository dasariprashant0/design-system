/** Join class names, skipping falsy values. `cx('btn', loading && 'is-loading', className)` */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}
