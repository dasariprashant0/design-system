import {useState} from 'react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger, Button, Field, FileUpload, Form, FormActions, Heading, Input, NativeSelect, Select, SelectContent, SelectItem,
  SelectTrigger, Stack, SelectValue, Switch, Tabs, TabsContent, TabsList, TabsTrigger, Text, Textarea,
} from '@monoline/react';
import {useToast} from './toasts';

export function Settings({onSignOut}: {onSignOut: () => void}) {
  const toast = useToast();
  const [file, setFile] = useState<File[]>([]);
  const [lang, setLang] = useState('en');
  const [notify, setNotify] = useState({product: true, billing: true, digest: false});
  const [dirty, setDirty] = useState(false);

  return (
    <main className="page">
      <Heading level={1} size="lg">Settings</Heading>
      <Tabs defaultValue="profile">
        <TabsList aria-label="Settings sections">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Form preventDefault onSubmit={() => { setDirty(false); toast('Profile saved'); }} onChange={() => setDirty(true)}>
            <Field label="Display name"><Input defaultValue="Prashant D" /></Field>
            <Field label="Bio" hint="Shown on your public profile."><Textarea rows={3} /></Field>
            <Field label="Avatar" hint="PNG or JPG, up to 2 MB.">
              <FileUpload accept="image/png,image/jpeg" onFilesChange={setFile} />
            </Field>
            {file[0] && <Text size="sm">Selected: {file[0].name} ({Math.round(file[0].size / 1024)} KB)</Text>}
            <FormActions><Button type="submit" variant="solid" disabled={!dirty}>Save changes</Button></FormActions>
          </Form>
        </TabsContent>

        <TabsContent value="notifications">
          {(['product', 'billing', 'digest'] as const).map((k) => (
            <div className="setting-row" key={k}>
              <Text>{{product: 'Product updates', billing: 'Billing alerts', digest: 'Weekly digest'}[k]}</Text>
              <Switch aria-label={k} checked={notify[k]} onCheckedChange={(c) => { setNotify({...notify, [k]: c}); toast('Preference updated'); }} />
            </div>
          ))}
        </TabsContent>

        <TabsContent value="preferences">
          <Field label="Language">
            <Select value={lang} onValueChange={setLang}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="en">English</SelectItem><SelectItem value="de">Deutsch</SelectItem><SelectItem value="fr">Français</SelectItem></SelectContent>
            </Select>
          </Field>
          <Field label="Time zone"><NativeSelect defaultValue="utc"><option value="utc">UTC</option><option value="ist">India (IST)</option><option value="pst">Pacific (PST)</option></NativeSelect></Field>
        </TabsContent>

        <TabsContent value="account">
          <Stack className="danger-zone" gap={3} align="start">
            <Heading level={2} size="md">Danger zone</Heading>
            <Text tone="muted">Deleting your account removes every project. This cannot be undone.</Text>
            <AlertDialog>
              <AlertDialogTrigger asChild><Button variant="danger">Delete account</Button></AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader><AlertDialogTitle>Delete your account?</AlertDialogTitle><AlertDialogDescription>All projects and data will be removed permanently.</AlertDialogDescription></AlertDialogHeader>
                <AlertDialogFooter><AlertDialogCancel>Keep account</AlertDialogCancel><AlertDialogAction onClick={onSignOut}>Delete account</AlertDialogAction></AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </Stack>
        </TabsContent>
      </Tabs>
    </main>
  );
}
