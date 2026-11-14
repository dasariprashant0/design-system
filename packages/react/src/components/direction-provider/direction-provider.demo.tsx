import type {Demo} from '../../demo';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '../tabs';
import {DirectionProvider} from './direction-provider';

export const demos: Demo[] = [
  {title: 'Right to left', description: 'Tabs inside a DirectionProvider: ArrowLeft moves to the next tab.', render: () => (
    <div dir="rtl">
      <DirectionProvider dir="rtl">
        <Tabs defaultValue="a">
          <TabsList aria-label="Sections">
            <TabsTrigger value="a">الأول</TabsTrigger>
            <TabsTrigger value="b">الثاني</TabsTrigger>
          </TabsList>
          <TabsContent value="a">محتوى</TabsContent>
          <TabsContent value="b">محتوى آخر</TabsContent>
        </Tabs>
      </DirectionProvider>
    </div>
  )},
];
