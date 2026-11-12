'use client';
import {useState} from 'react';
import type {Demo} from '../../demo';
import {Form, FormActions, type FormError} from './form';
import {Field} from '../field';
import {Input} from '../input';
import {Button} from '../button';

function Example() {
  const [errors, setErrors] = useState<FormError[]>([]);
  return (
    <Form
      aria-label="Contact"
      noValidate
      preventDefault
      errors={errors}
      onSubmit={(e) => {
        const data = new FormData(e.currentTarget);
        const next: FormError[] = [];
        if (!data.get('name')) next.push({name: 'name', message: 'Enter your name.'});
        if (!data.get('email')) next.push({name: 'email', message: 'Enter your email.'});
        setErrors(next);
      }}
    >
      <Field label="Name" error={errors.find((e) => e.name === 'name')?.message}><Input name="name" /></Field>
      <Field label="Email" error={errors.find((e) => e.name === 'email')?.message}><Input name="email" type="email" /></Field>
      <FormActions><Button type="submit" variant="solid">Send</Button><Button type="reset">Clear</Button></FormActions>
    </Form>
  );
}

export const demos: Demo[] = [
  {title: 'With an error summary', description: 'Submit empty. The summary links to each invalid field.', render: () => <Example />},
];
