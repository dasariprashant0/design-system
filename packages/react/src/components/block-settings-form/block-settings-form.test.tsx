import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {axe} from '../../test/axe';
import {BlockSettingsForm, type SettingsSection} from './block-settings-form';

const sections: SettingsSection[] = [
  {legend: 'Notifications', description: 'Choose what we email.', items: [
    {kind: 'switch', name: 'product', label: 'Product updates', hint: 'About once a month.', defaultChecked: true},
    {kind: 'switch', name: 'digest', label: 'Weekly digest'},
  ]},
  {legend: 'Display', items: [
    {kind: 'select', name: 'theme', label: 'Theme', options: [{value: 'warm', label: 'Warm'}, {value: 'dark', label: 'Dark'}], defaultValue: 'warm'},
  ]},
];

describe('BlockSettingsForm', () => {
  it('renders an h1, a group per section and labelled controls', () => {
    render(<BlockSettingsForm title="Settings" sections={sections} />);
    expect(screen.getByRole('heading', {level: 1, name: 'Settings'})).toBeInTheDocument();
    expect(screen.getByRole('group', {name: 'Notifications'})).toBeInTheDocument();
    expect(screen.getByRole('group', {name: 'Display'})).toBeInTheDocument();
    expect(screen.getByRole('switch', {name: 'Product updates'})).toBeChecked();
    expect(screen.getByRole('switch', {name: 'Weekly digest'})).not.toBeChecked();
    expect(screen.getByRole('combobox', {name: 'Theme'})).toHaveValue('warm');
  });
  it('submits the current values', async () => {
    const onSubmit = vi.fn();
    render(<BlockSettingsForm title="Settings" sections={sections} onSubmit={onSubmit} />);
    await userEvent.click(screen.getByRole('switch', {name: 'Weekly digest'}));
    await userEvent.selectOptions(screen.getByRole('combobox', {name: 'Theme'}), 'dark');
    await userEvent.click(screen.getByRole('button', {name: 'Save changes'}));
    expect(onSubmit).toHaveBeenCalledWith({product: true, digest: true, theme: 'dark'});
  });
  it('forwards ref and shows custom button labels', () => {
    const ref = {current: null as HTMLElement | null};
    render(<BlockSettingsForm ref={ref} title="Settings" sections={sections} saveLabel="Apply" resetLabel="Undo" />);
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(screen.getByRole('button', {name: 'Apply'})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Undo'})).toBeInTheDocument();
  });
  it('has no axe violations', async () => {
    const {container} = render(<BlockSettingsForm title="Settings" description="Manage your account." sections={sections} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
