import type {Demo} from '../../demo';
import {BlockSignup} from './block-signup';
import {Link} from '../link';

export const demos: Demo[] = [
  {title: 'Create an account', description: 'Submit empty to see the validation messages.', render: () => (
    <BlockSignup
      description="It takes a minute."
      footer={<span>Already have an account? <Link href="#">Sign in</Link></span>}
    />
  )},
];
