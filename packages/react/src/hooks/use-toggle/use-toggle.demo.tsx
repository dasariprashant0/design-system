import type {Demo} from '../../demo';
import {Button} from '../../components/button';
import {useToggle} from './use-toggle';

const themes = ['warm', 'dark', 'midnight'] as const;

function Demo() {
  const [theme, next] = useToggle<string>(themes as unknown as readonly [string, ...string[]]);
  return <Button onClick={() => next()}>Theme: {theme}</Button>;
}

export const demos: Demo[] = [{title: 'Cycle', render: () => <Demo />}];
