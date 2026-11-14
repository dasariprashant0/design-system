import type {Demo} from '../../demo';
import {Breadcrumb} from '../breadcrumb';
import {Button} from '../button';
import {PageHeader} from './page-header';

export const demos: Demo[] = [
  {title: 'Title, description and actions', render: () => (
    <PageHeader
      breadcrumbs={<Breadcrumb items={[{label: 'Home', href: '#'}, {label: 'Customers', href: '#'}, {label: 'Ada Example'}]} />}
      title="Ada Example"
      description="Joined in March. On the Team plan."
      actions={<><Button>Export</Button><Button variant="solid">Edit customer</Button></>}
    />
  )},
  {title: 'Title only', render: () => <PageHeader title="Settings" level={2} />},
];
