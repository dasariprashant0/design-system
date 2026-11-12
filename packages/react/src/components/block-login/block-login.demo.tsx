import type {Demo} from '../../demo';
import {BlockLogin} from './block-login';
import {Link} from '../link';

export const demos: Demo[] = [
  {title: 'Sign in', description: 'Submit empty to see the validation messages.', render: () => (
    <BlockLogin description="Use the email you signed up with." footer={<><Link href="#">Forgot your password?</Link><Link href="#">Create an account</Link></>} />
  )},
];
