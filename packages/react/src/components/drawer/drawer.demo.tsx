import type {Demo} from '../../demo';
import {Button} from '../button';
import {Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger} from './drawer';

export const demos: Demo[] = [
  {title: 'Right and left', render: () => (
    <div style={{display: 'flex', gap: 'var(--s3)'}}>
      {(['right', 'left'] as const).map((side) => (
        <Drawer key={side}>
          <DrawerTrigger asChild><Button>Open {side}</Button></DrawerTrigger>
          <DrawerContent side={side}><DrawerHeader><DrawerTitle>Filters</DrawerTitle><DrawerDescription>Narrow the list by status or owner.</DrawerDescription></DrawerHeader></DrawerContent>
        </Drawer>
      ))}
    </div>
  )},
];
