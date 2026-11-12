import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {useState} from 'react';
import {axe} from '../../test/axe';
import {Tree, type TreeNode} from './tree';

const items: TreeNode[] = [
  {id: 'src', label: 'src', children: [{id: 'a', label: 'alpha.ts'}, {id: 'b', label: 'beta.ts'}]},
  {id: 'docs', label: 'docs', children: [{id: 'r', label: 'readme'}]},
  {id: 'pkg', label: 'package.json'},
];
const item = (n: string) => screen.getByRole('treeitem', {name: n});

describe('Tree', () => {
  it('renders tree roles with expanded state and levels', () => {
    render(<Tree aria-label="Files" items={items} defaultExpanded={['src']} />);
    expect(screen.getByRole('tree', {name: 'Files'})).toBeInTheDocument();
    expect(screen.getAllByRole('treeitem')).toHaveLength(6 - 1);
    expect(screen.getByRole('group')).toBeInTheDocument();
    expect(screen.getByRole('treeitem', {name: /^src/})).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('treeitem', {name: /^docs/})).toHaveAttribute('aria-expanded', 'false');
    expect(item('alpha.ts')).toHaveAttribute('aria-level', '2');
    expect(item('package.json')).not.toHaveAttribute('aria-expanded');
  });
  it('has a single tab stop (roving tabindex)', async () => {
    const user = userEvent.setup();
    render(<><button type="button">before</button><Tree aria-label="Files" items={items} /><button type="button">after</button></>);
    expect(screen.getAllByRole('treeitem').filter((n) => n.tabIndex === 0)).toHaveLength(1);
    await user.tab(); await user.tab();
    expect(screen.getByRole('treeitem', {name: /^src/})).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', {name: 'after'})).toHaveFocus();
  });
  it('moves with arrows, Home and End', async () => {
    const user = userEvent.setup();
    render(<Tree aria-label="Files" items={items} defaultExpanded={['src']} />);
    await user.tab();
    await user.keyboard('{ArrowDown}');
    expect(item('alpha.ts')).toHaveFocus();
    expect(item('alpha.ts')).toHaveAttribute('tabindex', '0');
    await user.keyboard('{End}');
    expect(item('package.json')).toHaveFocus();
    await user.keyboard('{Home}');
    expect(screen.getByRole('treeitem', {name: /^src/})).toHaveFocus();
    await user.keyboard('{ArrowUp}');
    expect(screen.getByRole('treeitem', {name: /^src/})).toHaveFocus();
  });
  it('ArrowRight opens then enters; ArrowLeft closes then goes to the parent', async () => {
    const user = userEvent.setup();
    render(<Tree aria-label="Files" items={items} />);
    await user.tab();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('treeitem', {name: /^src/})).toHaveAttribute('aria-expanded', 'true');
    await user.keyboard('{ArrowRight}');
    expect(item('alpha.ts')).toHaveFocus();
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('treeitem', {name: /^src/})).toHaveFocus();
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('treeitem', {name: /^src/})).toHaveAttribute('aria-expanded', 'false');
  });
  it('selects with Enter and Space, and with a click (uncontrolled and controlled)', async () => {
    const user = userEvent.setup();
    const fn = vi.fn();
    render(<Tree aria-label="Files" items={items} onValueChange={fn} />);
    await user.tab();
    await user.keyboard('{End}{Enter}');
    expect(fn).toHaveBeenLastCalledWith('pkg');
    expect(item('package.json')).toHaveAttribute('aria-selected', 'true');
    await user.keyboard('{Home}{ }');
    expect(fn).toHaveBeenLastCalledWith('src');
    function C() { const [v, setV] = useState('pkg'); return <><Tree aria-label="Ctl" items={items} value={v} onValueChange={setV} /><output>{v}</output></>; }
    render(<C />);
    await user.click(screen.getAllByText('package.json')[1]!);
    await user.click(screen.getAllByText('docs')[1]!);
    expect(screen.getByText('docs', {selector: 'output'})).toBeInTheDocument();
  });
  it('jumps by typing', async () => {
    const user = userEvent.setup();
    render(<Tree aria-label="Files" items={items} />);
    await user.tab();
    await user.keyboard('p');
    expect(item('package.json')).toHaveFocus();
    await new Promise((r) => setTimeout(r, 650));
    await user.keyboard('d');
    expect(screen.getByRole('treeitem', {name: /^docs/})).toHaveFocus();
  });
  it('forwards its ref', () => {
    const ref = {current: null as HTMLUListElement | null};
    render(<Tree ref={ref} aria-label="Files" items={items} />);
    expect(ref.current).toHaveAttribute('role', 'tree');
  });
  it('has no axe violations', async () => {
    const {container} = render(<Tree aria-label="Files" items={items} defaultExpanded={['src']} defaultValue="a" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
