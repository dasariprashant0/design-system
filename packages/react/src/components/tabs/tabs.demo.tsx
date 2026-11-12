import type {Demo} from '../../demo';
import {Tabs, TabsContent, TabsList, TabsTrigger} from './tabs';

export const demos: Demo[] = [
  {title: 'Horizontal', render: () => (<Tabs defaultValue="overview"><TabsList aria-label="Project"><TabsTrigger value="overview">Overview</TabsTrigger><TabsTrigger value="activity">Activity</TabsTrigger><TabsTrigger value="settings">Settings</TabsTrigger></TabsList><TabsContent value="overview">Overview content.</TabsContent><TabsContent value="activity">Activity content.</TabsContent><TabsContent value="settings">Settings content.</TabsContent></Tabs>)},
  {title: 'Vertical', render: () => (<Tabs defaultValue="a" orientation="vertical"><TabsList aria-label="Sections"><TabsTrigger value="a">Profile</TabsTrigger><TabsTrigger value="b">Security</TabsTrigger></TabsList><TabsContent value="a">Profile content.</TabsContent><TabsContent value="b">Security content.</TabsContent></Tabs>)},
];
