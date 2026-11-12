import {CodeBlock} from '@monoline/react';
import {Section, P} from './guide-parts';
import {registerSnippet, controllerSnippet, moreControlledSnippet, zodSnippet, summarySnippet, plainSnippet, tanstackSnippet} from './forms-snippets';

export const forms = () => (
  <>
    <Section title="How far this is checked">
      <P>Monoline does not depend on a form library, so react-hook-form is not installed in this repository. The snippets follow the react-hook-form v7 API and the Monoline prop names in this repo. The Monoline side of the register, Controller, summary and plain-state snippets (component names, props, <code>ref</code> targets, value types) was type-checked against <code>@monoline/react</code> with the react-hook-form calls stubbed. The library side (<code>register</code> options, <code>Controller</code>, resolvers) is written from the library docs and has not been run here. The Zod and TanStack Form snippets were not type-checked at all. Check versions against the library docs before you copy.</P>
    </Section>
    <Section title="The pieces">
      <dl className="kv">
        <dt><code>Field</code></dt><dd>Label, hint and error around one control. <code>error</code> marks the control invalid, sets <code>aria-describedby</code> and announces the message. Input, Textarea, NativeSelect, NumberInput, Combobox, SelectTrigger, DatePicker and Checkbox pick this up on their own.</dd>
        <dt><code>Form</code></dt><dd>A <code>&lt;form&gt;</code>. Pass <code>errors</code> (an array of <code>{'{name, message}'}</code>) for a summary at the top; each item links to the control with that <code>name</code> and moves focus there. <code>preventDefault</code> stops the native post for forms handled in JS.</dd>
        <dt><code>FormActions</code></dt><dd>The footer row. One <code>variant="solid"</code> button per form.</dd>
        <dt><code>Button</code></dt><dd>Defaults to <code>type="button"</code>, so the submit button needs <code>type="submit"</code>. <code>loading</code> shows a spinner, sets <code>aria-busy</code> and ignores clicks, so a double click cannot submit twice.</dd>
      </dl>
      <P>Add <code>noValidate</code> to the form so your messages replace the browser's bubbles. <code>Field required</code> still sets the <code>required</code> attribute on the control, which is what assistive technology reads.</P>
    </Section>
    <Section title="Native-like inputs: register">
      <P><code>Input</code>, <code>Textarea</code>, <code>NativeSelect</code>, <code>PasswordInput</code> and <code>NumberInput</code> forward <code>ref</code> to the real <code>&lt;input&gt;</code> and fire normal change and blur events, so <code>{'{...register(name)}'}</code> works as it does on a plain element. <code>NumberInput</code> returns a string unless you pass <code>valueAsNumber: true</code>; its step buttons dispatch an input event, so they update the form too.</P>
      <CodeBlock title="signup-form.tsx" code={registerSnippet} />
    </Section>
    <Section title="Value components: Controller">
      <P>Combobox, Select, DatePicker, Checkbox and the rest do not expose a native change event, so connect them with <code>Controller</code>. The pattern is the same each time: <code>value</code> (or <code>checked</code>) from <code>field.value</code>, the change callback to <code>field.onChange</code>, <code>ref</code> to <code>field.ref</code> so react-hook-form can focus the first invalid control, and <code>error</code> on the <code>Field</code> from <code>fieldState.error?.message</code>.</P>
      <ul className="why">
        <li><code>Combobox</code>: <code>value</code> and <code>onValueChange(value: string)</code>. It sends an empty string when the text is cleared.</li>
        <li><code>Select</code> (Radix): <code>value</code> and <code>onValueChange(value: string)</code> on the root, and <code>ref</code> and <code>onBlur</code> on <code>SelectTrigger</code>. Start with <code>''</code> to show the placeholder.</li>
        <li><code>DatePicker</code>: <code>value: Date | null</code> and <code>onValueChange(date: Date)</code>. <code>ref</code> reaches the trigger button.</li>
        <li><code>Checkbox</code>: <code>checked</code> and <code>onCheckedChange</code>. The value can be <code>'indeterminate'</code>, so convert with <code>c === true</code> for a boolean field.</li>
      </ul>
      <CodeBlock title="profile-form.tsx" code={controllerSnippet} />
      <P>The same pattern for the other value components. <code>Slider</code> reports an array, so take the first item. <code>OtpInput</code>, <code>Rating</code>, <code>Slider</code> and <code>SegmentedControl</code> need an <code>aria-label</code> because they have no native label. <code>RadioGroup</code> belongs in a <code>Fieldset</code> with a <code>legend</code>, not a <code>Field</code>.</P>
      <CodeBlock title="controlled-examples.tsx" code={moreControlledSnippet} />
    </Section>
    <Section title="Validation with Zod">
      <P>Messages come from the schema, not the components. Pass the resolver and the rest of the code does not change: <code>errors.email?.message</code> and <code>fieldState.error?.message</code> keep feeding <code>Field</code>'s <code>error</code>. Write messages as an instruction (&ldquo;Enter your email&rdquo;), as <code>DESIGN.md</code> asks of all copy.</P>
      <CodeBlock title="schema.ts" code={zodSnippet} />
    </Section>
    <Section title="Errors, summary and submit states">
      <P>Show the message beside the field, and also list all of them at the top once the user has tried to submit. <code>Form</code> renders the summary as a <code>role="alert"</code> region; each link calls <code>focus()</code> on <code>form.elements.namedItem(name)</code>, so it works for controls that carry that <code>name</code> (Input, Textarea, NativeSelect, NumberInput, and Combobox if you pass <code>name</code>). For Select and DatePicker use <code>field.ref</code>: with the default <code>shouldFocusError</code>, react-hook-form focuses the first invalid control after a failed submit.</P>
      <CodeBlock title="summary-and-server-errors.tsx" code={summarySnippet} />
      <ul className="why">
        <li><code>isSubmitting</code> is true while your async <code>onSubmit</code> runs. Pass it to <code>Button loading</code>.</li>
        <li>Keep the label on a loading button. Do not swap it for &ldquo;Please wait&rdquo;; <code>aria-busy</code> already carries the state.</li>
        <li>Do not disable the submit button to signal an invalid form. Let the user submit and tell them what to fix.</li>
      </ul>
    </Section>
    <Section title="Plain controlled state">
      <P>No library is needed for a small form. Hold the values and errors in state, validate on submit, and pass the same props. Here <code>Form preventDefault</code> stops the native post, and the <code>name</code> on each input lets the summary links find it.</P>
      <CodeBlock title="plain-form.tsx" code={plainSnippet} />
    </Section>
    <Section title="TanStack Form">
      <P>The same props apply. Wire <code>field.state.value</code>, <code>field.handleChange</code> and <code>field.handleBlur</code> to a Monoline control, and <code>field.state.meta.errors</code> to <code>Field error</code>. This follows the TanStack Form v1 API and has not been run here; for Controller-style components use <code>onValueChange={'{field.handleChange}'}</code>.</P>
      <CodeBlock title="tanstack-example.tsx" code={tanstackSnippet} />
    </Section>
  </>
);
