import {forwardRef} from 'react';
import {Breadcrumb, type BreadcrumbProps} from '../breadcrumb';

export interface BreadcrumbsAutoProps extends Omit<BreadcrumbProps, 'items'> {
  /** The current URL path, from your router: `/settings/billing`. Query and hash are ignored. */
  pathname: string;
  /** Text for a path segment, keyed by the segment: `{billing: 'Billing and plans'}`. Others are the segment with dashes as spaces, capitalised. */
  labels?: Record<string, string>;
  /** Text of the first crumb, which links to `/`. Default "Home". */
  homeLabel?: string;
}

const title = (s: string) => { const t = decodeURIComponent(s).replace(/-/g, ' '); return t.charAt(0).toUpperCase() + t.slice(1); };

/**
 * A `Breadcrumb` built from the URL path: `/settings/billing` becomes Home / Settings / Billing. The last segment is the current page.
 * @example <BreadcrumbsAuto pathname={location.pathname} labels={{api: 'API'}} />
 */
export const BreadcrumbsAuto = forwardRef<HTMLElement, BreadcrumbsAutoProps>(function BreadcrumbsAuto({pathname, labels = {}, homeLabel = 'Home', ...rest}, ref) {
  const parts = (pathname.split(/[?#]/)[0] ?? '').split('/').filter(Boolean);
  const items = [{label: homeLabel, href: '/'}, ...parts.map((p, i) => ({label: labels[p] ?? title(p), href: '/' + parts.slice(0, i + 1).join('/')}))];
  return <Breadcrumb ref={ref} items={items} {...rest} />;
});
