import type {Demo} from '../../demo';
import {RangeCalendar} from './range-calendar';

export const demos: Demo[] = [
  {title: 'Basic', render: () => <RangeCalendar weekStartsOn={1} />},
  {title: 'With limits and blocked days', description: 'Weekends are blocked; only the next 60 days can be chosen.', render: () => {
    const now = new Date();
    return <RangeCalendar min={now} max={new Date(now.getFullYear(), now.getMonth(), now.getDate() + 60)} isDateDisabled={(d) => d.getDay() === 0 || d.getDay() === 6} />;
  }},
];
