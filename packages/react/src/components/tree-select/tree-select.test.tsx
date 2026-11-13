import {render, screen, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {axe} from '../../test/axe';
import type {TreeNode} from '../tree';
import {TreeSelect} from './tree-select';

const items: TreeNode[] = [
  {id: 'eng', label: 'Engineering', children: [{id: 'web', label: 'Web'}, {id: 'infra', label: 'Infrastructure'}]},
  {id: 'design', label: 'Design', children: [{id: 'brand', label: 'Brand'}]},
  {id: 'ops', label: 'Operations', disabled: true},
];
const box = () => screen.getByRole('combobox');

describe('TreeSelect', () => {
  it('is a combobox with a tree popup that opens on focus', async () => {
    const user = userEvent.setup();
    render(<TreeSelect aria-label="Team" items={items} />);
    expect(box()).toHaveAttribute('aria-haspopup', 'tree');
    expect(box()).toHaveAttribute('aria-expanded', 'false');
    await user.click(box());
    const tree = screen.getByRole('tree', {name: 'Team'});
    expect(within(tree).getAllByRole('treeitem').map((t) => t.textContent?.replace(/^[+−]/, ''))).toEqual(['Engineering', 'Design', 'Operations']);
    expect(box()).toHaveAttribute('aria-expanded', 'true');
  });
  it('gives each item level, size and position', async () => {
    const user = userEvent.setup();
    render(<TreeSelect aria-label="Team" items={items} />);
    await user.click(box());
    const design = screen.getByRole('treeitem', {name: 'Design'});
    expect(design).toHaveAttribute('aria-level', '1');
    expect(design).toHaveAttribute('aria-posinset', '2');
    expect(design).toHaveAttribute('aria-setsize', '3');
    expect(design).toHaveAttribute('aria-expanded', 'false');
  });
  it('opens and closes branches with ArrowRight and ArrowLeft, and enters a branch', async () => {
    const user = userEvent.setup();
    render(<TreeSelect aria-label="Team" items={items} />);
    await user.click(box());
    await user.keyboard('{ArrowDown}'); // Engineering is active at first; ArrowDown moves to Design
    await user.keyboard('{ArrowUp}{ArrowRight}');
    expect(screen.getByRole('treeitem', {name: 'Web'})).toHaveAttribute('aria-level', '2');
    await user.keyboard('{ArrowRight}');
    expect(box()).toHaveAttribute('aria-activedescendant', screen.getByRole('treeitem', {name: 'Web'}).id);
    await user.keyboard('{ArrowLeft}');
    expect(box()).toHaveAttribute('aria-activedescendant', screen.getByRole('treeitem', {name: 'Engineering'}).id);
    await user.keyboard('{ArrowLeft}');
    expect(screen.queryByRole('treeitem', {name: 'Web'})).toBeNull();
  });
  it('selects with Enter, closes and shows the label', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<TreeSelect aria-label="Team" items={items} onValueChange={onValueChange} />);
    await user.click(box());
    await user.keyboard('{ArrowDown}{Enter}');
    expect(onValueChange).toHaveBeenCalledWith(['design']);
    expect(box()).toHaveValue('Design');
    expect(screen.queryByRole('tree')).toBeNull();
  });
  it('skips disabled items and ignores clicks on them', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<TreeSelect aria-label="Team" items={items} onValueChange={onValueChange} />);
    await user.click(box());
    await user.keyboard('{ArrowDown}{ArrowDown}{Enter}');
    expect(onValueChange).toHaveBeenCalledWith(['design']);
    await user.click(box());
    await user.click(screen.getByRole('treeitem', {name: 'Operations'}));
    expect(onValueChange).toHaveBeenCalledTimes(1);
  });
  it('filters by search and opens the parents of matches', async () => {
    const user = userEvent.setup();
    render(<TreeSelect aria-label="Team" items={items} />);
    await user.click(box());
    await user.keyboard('infra');
    expect(screen.getAllByRole('treeitem').map((t) => t.textContent?.replace(/^[+−]/, ''))).toEqual(['Engineering', 'Infrastructure']);
    await user.clear(box());
    await user.keyboard('zzz');
    expect(screen.getByText('No matches')).toBeInTheDocument();
  });
  it('multiple: toggles, stays open and summarises', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<TreeSelect multiple aria-label="Teams" items={items} onValueChange={onValueChange} defaultValue={['brand']} />);
    await user.click(box());
    expect(screen.getByRole('tree')).toHaveAttribute('aria-multiselectable', 'true');
    await user.keyboard('{Enter}'); // Engineering
    expect(onValueChange).toHaveBeenLastCalledWith(['brand', 'eng']);
    expect(screen.getByRole('tree')).toBeInTheDocument();
    await user.click(screen.getByRole('treeitem', {name: 'Design'}));
    expect(onValueChange).toHaveBeenLastCalledWith(['brand', 'eng', 'design']);
    await user.keyboard('{Escape}');
    expect(box()).toHaveValue('3 selected');
  });
  it('multiple: choosing a selected node deselects it', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<TreeSelect multiple aria-label="Teams" items={items} onValueChange={onValueChange} value={['eng']} />);
    await user.click(box());
    await user.click(screen.getByRole('treeitem', {name: 'Engineering'}));
    expect(onValueChange).toHaveBeenCalledWith([]);
  });
  it('Escape closes the list', async () => {
    const user = userEvent.setup();
    render(<TreeSelect aria-label="Team" items={items} />);
    await user.click(box());
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('tree')).toBeNull();
  });
  it('sets aria-invalid and forwards the ref', () => {
    const ref = {current: null as HTMLInputElement | null};
    render(<TreeSelect ref={ref} aria-label="Team" items={items} invalid />);
    expect(ref.current).toHaveAttribute('aria-invalid', 'true');
  });
  it('has no axe violations closed and open', async () => {
    const user = userEvent.setup();
    const {container} = render(<TreeSelect aria-label="Team" items={items} />);
    expect(await axe(container)).toHaveNoViolations();
    await user.click(box());
    expect(await axe(container)).toHaveNoViolations();
  });
});
