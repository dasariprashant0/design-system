'use client';
import {forwardRef, useId, useState, type DragEvent, type InputHTMLAttributes, type ReactNode} from 'react';
import {cx} from '../../utils/cx';

export interface FileUploadProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'defaultValue' | 'onChange' | 'children'> {
  /** The visible prompt, for example "Drop files here or choose". */
  label?: ReactNode;
  /** Called with the full current list whenever it changes. */
  onFilesChange?: (files: File[]) => void;
}

const size = (n: number) => (n < 1024 ? `${n} B` : n < 1048576 ? `${(n / 1024).toFixed(1)} KB` : `${(n / 1048576).toFixed(1)} MB`);

/** Controls are native: the input is visually hidden but focusable. Use `accept` and `multiple` as on any file input. */
export const FileUpload = forwardRef<HTMLInputElement, FileUploadProps>(function FileUpload({label = 'Drop files here or choose', onFilesChange, multiple, className, ...rest}, ref) {
  const id = useId();
  const [files, setFiles] = useState<File[]>([]);
  const [over, setOver] = useState(false);
  const [note, setNote] = useState('');
  const set = (next: File[], msg: string) => { setFiles(next); setNote(msg); onFilesChange?.(next); };
  const add = (list: FileList | null) => {
    if (!list?.length) return;
    const incoming = Array.from(list);
    set(multiple ? [...files, ...incoming] : incoming.slice(0, 1), `${incoming.length} file${incoming.length > 1 ? 's' : ''} added`);
  };
  const drop = (e: DragEvent) => { e.preventDefault(); setOver(false); add(e.dataTransfer.files); };
  return (
    <div className={cx('upload', className)}>
      <label
        htmlFor={id}
        className="upload-zone"
        data-over={over || undefined}
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={drop}
      >
        <input ref={ref} id={id} type="file" className="sr-only" multiple={multiple} onChange={(e) => { add(e.target.files); e.target.value = ''; }} {...rest} />
        <span>{label}</span>
      </label>
      {files.length > 0 && (
        <ul className="upload-list" aria-label="Selected files">
          {files.map((f, i) => (
            <li key={f.name + i}>
              <span className="upload-name">{f.name}</span><span className="muted small">{size(f.size)}</span>
              <button type="button" className="upload-remove" onClick={() => set(files.filter((_, j) => j !== i), `${f.name} removed`)}>Remove<span className="sr-only"> {f.name}</span></button>
            </li>
          ))}
        </ul>
      )}
      <span className="sr-only" role="status">{note}</span>
    </div>
  );
});
