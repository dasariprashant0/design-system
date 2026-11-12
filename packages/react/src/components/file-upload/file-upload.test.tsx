import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {axe} from '../../test/axe';
import {fireEvent} from '@testing-library/react';
import {FileUpload} from './file-upload';

const file = (n: string) => new File(['hello'], n, {type: 'text/plain'});

describe('FileUpload', () => {
  it('has a native file input named by the prompt', () => {
    render(<FileUpload label="Attach files" />);
    expect(screen.getByLabelText('Attach files')).toHaveAttribute('type', 'file');
  });
  it('lists chosen files and reports them', async () => {
    const user = userEvent.setup();
    const fn = vi.fn();
    render(<FileUpload multiple onFilesChange={fn} />);
    await user.upload(screen.getByLabelText(/drop files/i), [file('a.txt'), file('b.txt')]);
    expect(screen.getByRole('list', {name: 'Selected files'})).toBeInTheDocument();
    expect(screen.getByText('a.txt', {selector: '.upload-name'})).toBeInTheDocument();
    expect(fn).toHaveBeenLastCalledWith(expect.arrayContaining([expect.any(File)]));
    expect(screen.getByRole('status')).toHaveTextContent('2 files added');
  });
  it('removes a file by button', async () => {
    const user = userEvent.setup();
    render(<FileUpload multiple />);
    await user.upload(screen.getByLabelText(/drop files/i), [file('a.txt'), file('b.txt')]);
    await user.click(screen.getByRole('button', {name: 'Remove a.txt'}));
    expect(screen.queryByText('a.txt', {selector: '.upload-name'})).not.toBeInTheDocument();
    expect(screen.getByText('b.txt', {selector: '.upload-name'})).toBeInTheDocument();
  });
  it('accepts a drop', () => {
    render(<FileUpload />);
    const zone = screen.getByText(/drop files/i).closest('label')!;
    fireEvent.drop(zone, {dataTransfer: {files: [file('dropped.txt')]}});
    expect(screen.getByText('dropped.txt', {selector: '.upload-name'})).toBeInTheDocument();
  });
  it('has no axe violations', async () => {
    const {container} = render(<FileUpload />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
