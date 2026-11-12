import {forwardRef, type ComponentPropsWithoutRef, type ElementRef} from 'react';
import {Accordion as RadixAccordion} from 'radix-ui';
import {cx} from '../../utils/cx';

/** `type="single"` (optionally `collapsible`) or `type="multiple"`. */
export const Accordion = RadixAccordion.Root;

/** One collapsible section. Give it a unique `value` and put an `AccordionTrigger` and an `AccordionContent` inside. */
export const AccordionItem = forwardRef<ElementRef<typeof RadixAccordion.Item>, ComponentPropsWithoutRef<typeof RadixAccordion.Item>>(function AccordionItem({className, ...rest}, ref) {
  return <RadixAccordion.Item ref={ref} className={cx('acc-item', className)} {...rest} />;
});

/** The heading button that opens and closes its item; wrapped in an h-level header so it appears in the page outline. */
export const AccordionTrigger = forwardRef<ElementRef<typeof RadixAccordion.Trigger>, ComponentPropsWithoutRef<typeof RadixAccordion.Trigger>>(function AccordionTrigger({className, children, ...rest}, ref) {
  return (
    <RadixAccordion.Header className="acc-header">
      <RadixAccordion.Trigger ref={ref} className={cx('acc-trigger', className)} {...rest}>{children}</RadixAccordion.Trigger>
    </RadixAccordion.Header>
  );
});

/** The panel revealed when the item is open; its children sit inside a padded body. */
export const AccordionContent = forwardRef<ElementRef<typeof RadixAccordion.Content>, ComponentPropsWithoutRef<typeof RadixAccordion.Content>>(function AccordionContent({className, children, ...rest}, ref) {
  return <RadixAccordion.Content ref={ref} className="acc-content" {...rest}><div className={cx('acc-body', className)}>{children}</div></RadixAccordion.Content>;
});
