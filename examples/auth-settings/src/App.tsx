import {useHash} from '@monoline/react';
import {SignIn, SignUp} from './Auth';
import {Settings} from './Settings';
import {Toasts, useToast} from './toasts';

function Routes() {
  const [hash, go] = useHash();
  const toast = useToast();
  if (hash === 'settings') return <Settings onSignOut={() => { go('signin'); toast('Account deleted'); }} />;
  const done = () => go('settings');
  return <main className="auth">{hash === 'signup' ? <SignUp onDone={done} go={go} /> : <SignIn onDone={done} go={go} />}</main>;
}

export const App = () => <Toasts><Routes /></Toasts>;
