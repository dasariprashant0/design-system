import {fireEvent, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {Calendar} from './components/calendar';
import {Carousel} from './components/carousel';
import {DirectionProvider} from './components/direction-provider';
import {OtpInput} from './components/otp-input';
import {Slider} from './components/slider';
import {Tabs, TabsContent, TabsList, TabsTrigger} from './components/tabs';
import {Tree, type TreeNode} from './components/tree';

// Radix reads direction from DirectionProvider; Monoline's own widgets also read the `dir` attribute.
const rtl = (ui: React.ReactNode) => <div dir="rtl"><DirectionProvider dir="rtl">{ui}</DirectionProvider></div>;
const ltr = (ui: React.ReactNode) => <div dir="ltr"><DirectionProvider dir="ltr">{ui}</DirectionProvider></div>;

describe('RTL keyboard behaviour', () => {
  describe('Calendar', () => {
    const jan = new Date(2026, 0, 15);
    const day = (d: number) => screen.getByRole('button', {name: new RegExp(`January ${d}, 2026`)});
    it('ArrowRight is the next day in ltr', async () => {
      const user = userEvent.setup();
      render(ltr(<Calendar defaultValue={jan} locale="en-US" />));
      day(15).focus();
      await user.keyboard('{ArrowRight}');
      await vi.waitFor(() => expect(day(16)).toHaveFocus());
    });
    it('ArrowRight is the previous day in rtl, ArrowLeft the next', async () => {
      const user = userEvent.setup();
      render(rtl(<Calendar defaultValue={jan} locale="en-US" />));
      day(15).focus();
      await user.keyboard('{ArrowRight}');
      await vi.waitFor(() => expect(day(14)).toHaveFocus());
      await user.keyboard('{ArrowLeft}{ArrowLeft}');
      await vi.waitFor(() => expect(day(16)).toHaveFocus());
    });
    it('ArrowUp and ArrowDown still move by a week in rtl', async () => {
      const user = userEvent.setup();
      render(rtl(<Calendar defaultValue={jan} locale="en-US" />));
      day(15).focus();
      await user.keyboard('{ArrowDown}');
      await vi.waitFor(() => expect(day(22)).toHaveFocus());
    });
  });

  describe('OtpInput', () => {
    const boxes = () => screen.getAllByRole('textbox');
    it('ArrowRight moves to the next box in ltr', async () => {
      const user = userEvent.setup();
      render(ltr(<OtpInput aria-label="Code" length={4} />));
      boxes()[1]!.focus();
      await user.keyboard('{ArrowRight}');
      expect(boxes()[2]).toHaveFocus();
    });
    it('ArrowLeft moves to the next box and ArrowRight to the previous in rtl', async () => {
      const user = userEvent.setup();
      render(rtl(<OtpInput aria-label="Code" length={4} />));
      boxes()[1]!.focus();
      await user.keyboard('{ArrowLeft}');
      expect(boxes()[2]).toHaveFocus();
      await user.keyboard('{ArrowRight}{ArrowRight}');
      expect(boxes()[0]).toHaveFocus();
    });
  });

  describe('Tree', () => {
    const items: TreeNode[] = [{id: 'src', label: 'src', children: [{id: 'a', label: 'alpha.ts'}]}, {id: 'pkg', label: 'package.json'}];
    const src = () => screen.getByRole('treeitem', {name: /^src/});
    it('ArrowRight opens a folder in ltr', async () => {
      const user = userEvent.setup();
      render(ltr(<Tree aria-label="Files" items={items} />));
      src().focus();
      await user.keyboard('{ArrowRight}');
      expect(src()).toHaveAttribute('aria-expanded', 'true');
    });
    it('ArrowLeft opens and ArrowRight closes or goes to the parent in rtl', async () => {
      const user = userEvent.setup();
      render(rtl(<Tree aria-label="Files" items={items} />));
      src().focus();
      await user.keyboard('{ArrowRight}');
      expect(src()).toHaveAttribute('aria-expanded', 'false');
      await user.keyboard('{ArrowLeft}');
      expect(src()).toHaveAttribute('aria-expanded', 'true');
      await user.keyboard('{ArrowLeft}');
      expect(screen.getByRole('treeitem', {name: 'alpha.ts'})).toHaveFocus();
      await user.keyboard('{ArrowRight}');
      expect(src()).toHaveFocus();
    });
  });

  describe('Carousel', () => {
    const scroll = (wrapper: (ui: React.ReactNode) => React.ReactElement) => {
      const {container} = render(wrapper(<Carousel aria-label="Projects"><div>One</div><div>Two</div></Carousel>));
      const track = container.querySelector('.carousel-track') as HTMLElement;
      const by = vi.fn();
      track.scrollBy = by;
      Object.defineProperty(track, 'clientWidth', {value: 100});
      fireEvent.click(screen.getByRole('button', {name: /Next/}));
      return by.mock.calls[0]![0].left as number;
    };
    it('Next scrolls forward (positive) in ltr', () => expect(scroll(ltr)).toBeGreaterThan(0));
    it('Next scrolls toward negative scrollLeft in rtl', () => expect(scroll(rtl)).toBeLessThan(0));
  });

  describe('Radix widgets through DirectionProvider', () => {
    it('tabs: ArrowLeft moves to the next tab in rtl', async () => {
      const user = userEvent.setup();
      render(rtl(
        <Tabs defaultValue="a"><TabsList aria-label="S"><TabsTrigger value="a">A</TabsTrigger><TabsTrigger value="b">B</TabsTrigger></TabsList><TabsContent value="a">x</TabsContent><TabsContent value="b">y</TabsContent></Tabs>,
      ));
      screen.getByRole('tab', {name: 'A'}).focus();
      await user.keyboard('{ArrowLeft}');
      expect(screen.getByRole('tab', {name: 'B'})).toHaveFocus();
    });
    it('slider: ArrowLeft increases the value in rtl', async () => {
      const user = userEvent.setup();
      render(rtl(<Slider aria-label="Volume" defaultValue={50} />));
      const thumb = screen.getByRole('slider', {name: 'Volume'});
      thumb.focus();
      await user.keyboard('{ArrowLeft}');
      expect(thumb).toHaveAttribute('aria-valuenow', '51');
    });
  });
});
