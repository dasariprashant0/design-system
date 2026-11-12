import type {Demo} from '../../demo';
import {Breadcrumb} from './breadcrumb';

export const demos: Demo[] = [{title: 'Basic', render: () => <Breadcrumb items={[{label: 'Home', href: '#'}, {label: 'Projects', href: '#'}, {label: 'Monoline'}]} />}];
