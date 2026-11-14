import type {Demo} from '../../demo';
import {useState} from 'react';
import {Button} from '../button';
import {Toast, ToastAction, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport} from './toast';

function Example() {
  const [open, setOpen] = useState(false);
  return (
    <ToastProvider duration={5000}>
      <Button onClick={() => setOpen(true)}>Save draft</Button>
      <Toast open={open} onOpenChange={setOpen}>
        <ToastTitle>Draft saved</ToastTitle>
        <ToastDescription>Stored on this device.</ToastDescription>
        <ToastAction altText="Undo the save">Undo</ToastAction>
        <ToastClose />
      </Toast>
      <ToastViewport label="Notifications" />
    </ToastProvider>
  );
}

export const demos: Demo[] = [{
  title: 'Trigger a toast',
  render: () => (
    <Example />
  ),
}];
