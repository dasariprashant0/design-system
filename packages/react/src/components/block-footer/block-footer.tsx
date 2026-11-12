import {forwardRef, type HTMLAttributes, type ReactNode} from 'react';
import {cx} from '../../utils/cx';
import {Container} from '../container';
import {Link} from '../link';

export interface FooterLink {
  label: ReactNode;
  href: string;
}
export interface FooterColumn {
  /** Also names the column's `nav` landmark, so keep it plain text. */
  title: string;
  links: FooterLink[];
}

export interface BlockFooterProps extends HTMLAttributes<HTMLElement> {
  /** Your logo or name. */
  brand?: ReactNode;
  /** Optional short sentence about the product, shown under the brand. */
  description?: ReactNode;
  /** Groups of links; each column has a `title` and a list of `links` and becomes its own labelled `nav`. */
  columns: FooterColumn[];
  /** Small print: copyright, legal links. */
  legal?: ReactNode;
  /** Outline level of the column titles. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
}

/** A site footer: brand, link columns and small print. Renders a `footer` (the page's contentinfo landmark). */
export const BlockFooter = forwardRef<HTMLElement, BlockFooterProps>(function BlockFooter({brand, description, columns, legal, headingLevel = 2, className, ...rest}, ref) {
  const H = `h${headingLevel}` as 'h2';
  return (
    <footer ref={ref} className={cx('block-footer', className)} {...rest}>
      <Container>
        <div className="block-footer-top">
          {(brand || description) && (
            <div className="block-footer-brand">
              {brand && <div className="block-footer-name">{brand}</div>}
              {description && <p>{description}</p>}
            </div>
          )}
          <div className="block-footer-columns">
            {columns.map((col) => (
              <nav key={col.title} aria-label={col.title} className="block-footer-col">
                <H className="block-footer-heading">{col.title}</H>
                <ul role="list">
                  {col.links.map((l) => <li key={l.href + String(l.label)}><Link href={l.href}>{l.label}</Link></li>)}
                </ul>
              </nav>
            ))}
          </div>
        </div>
        {legal && <div className="block-footer-legal">{legal}</div>}
      </Container>
    </footer>
  );
});
