import type {Demo} from '../../demo';
import {Button} from '../button';
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from './card';

export const demos: Demo[] = [
  {
    title: 'Basic',
    render: () => (
      <div style={{maxWidth: 360}}>
        <Card>
          <CardHeader>
            <CardTitle>Ship the pricing page</CardTitle>
            <CardDescription>Today, 14:20 · 3 files</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Rewrote the headline and the plan table.</p>
          </CardContent>
          <CardFooter>
            <Button variant="solid" size="sm">Open</Button>
            <Button size="sm">Share</Button>
          </CardFooter>
        </Card>
      </div>
    ),
  },
  {
    title: 'Interactive link',
    description: 'asChild makes the whole card one link.',
    render: () => (
      <div style={{maxWidth: 360}}>
        <Card asChild interactive>
          <a href="#card">
            <CardHeader>
              <CardTitle>Read the guide</CardTitle>
              <CardDescription>5 minutes</CardDescription>
            </CardHeader>
          </a>
        </Card>
      </div>
    ),
  },
];
