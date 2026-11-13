import {forwardRef, type ComponentPropsWithoutRef, type ElementRef} from 'react';
import {Avatar as RadixAvatar} from 'radix-ui';
import {cx} from '../../utils/cx';

export interface AvatarProps extends Omit<ComponentPropsWithoutRef<typeof RadixAvatar.Root>, 'children'> {
  /** Image URL. If it fails or is missing, the initials show. */
  src?: string;
  /** The person's name. Used as the image alt text and to make initials; required so it always has a name. */
  name: string;
  /** `md` (default), `sm` for dense rows or `lg`. */
  size?: 'sm' | 'md' | 'lg';
  /** `solid` (default) fills the circle; `line` draws only an outline. */
  variant?: 'solid' | 'line';
}

const initials = (name: string) => name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('');

/** A person or thing, as an image with an initials fallback. */
export const Avatar = forwardRef<ElementRef<typeof RadixAvatar.Root>, AvatarProps>(function Avatar({src, name, size = 'md', variant = 'solid', className, ...rest}, ref) {
  return (
    <RadixAvatar.Root ref={ref} className={cx('avatar', size !== 'md' && `avatar-${size}`, variant === 'line' && 'avatar-line', className)} {...rest}>
      {src && <RadixAvatar.Image src={src} alt={name} />}
      <RadixAvatar.Fallback role="img" aria-label={name}>{initials(name)}</RadixAvatar.Fallback>
    </RadixAvatar.Root>
  );
});
