import type {Demo} from '../../demo';
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from './accordion';

export const demos: Demo[] = [
  {title: 'Single, collapsible', render: () => (
    <Accordion type="single" collapsible defaultValue="a">
      <AccordionItem value="a"><AccordionTrigger>What is Monoline?</AccordionTrigger><AccordionContent>A small UI kit: plain CSS plus accessible React components.</AccordionContent></AccordionItem>
      <AccordionItem value="b"><AccordionTrigger>Do I need React?</AccordionTrigger><AccordionContent>No. The CSS works on its own.</AccordionContent></AccordionItem>
    </Accordion>
  )},
];
