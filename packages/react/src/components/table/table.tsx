import {forwardRef, type HTMLAttributes, type TableHTMLAttributes, type TdHTMLAttributes, type ThHTMLAttributes} from 'react';
import {cx} from '../../utils/cx';

export interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
  /** Names the scrollable wrapper. Give it when the table can overflow. */
  wrapperLabel?: string;
}

/** A data table. Compose with TableHeader, TableBody, TableRow, TableHead and TableCell. */
export const Table = forwardRef<HTMLTableElement, TableProps>(function Table({wrapperLabel, className, ...rest}, ref) {
  return (
    <div className="table-wrap" tabIndex={0} role="region" aria-label={wrapperLabel ?? 'Table'}>
      <table ref={ref} className={cx('table', className)} {...rest} />
    </div>
  );
});

export const TableCaption = forwardRef<HTMLTableCaptionElement, HTMLAttributes<HTMLTableCaptionElement>>(function TableCaption(props, ref) { return <caption ref={ref} {...props} />; });
export const TableHeader = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(function TableHeader(props, ref) { return <thead ref={ref} {...props} />; });
export const TableBody = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(function TableBody(props, ref) { return <tbody ref={ref} {...props} />; });
export const TableRow = forwardRef<HTMLTableRowElement, HTMLAttributes<HTMLTableRowElement>>(function TableRow(props, ref) { return <tr ref={ref} {...props} />; });

export interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  /** Right-aligns numbers. */
  numeric?: boolean;
}
export const TableHead = forwardRef<HTMLTableCellElement, ThHTMLAttributes<HTMLTableCellElement> & {numeric?: boolean}>(function TableHead({numeric, className, scope = 'col', ...rest}, ref) {
  return <th ref={ref} scope={scope} className={cx(numeric && 'num', className)} {...rest} />;
});
export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(function TableCell({numeric, className, ...rest}, ref) {
  return <td ref={ref} className={cx(numeric && 'num', className)} {...rest} />;
});
