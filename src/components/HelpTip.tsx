import { useEffect, useRef, useState, type ReactNode } from 'react';

type Props = {
  label: string;
  children: ReactNode;
};

export default function HelpTip({ label, children }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <span className="help-tip" ref={ref}>
      <button
        type="button"
        className="help-tip-btn"
        aria-expanded={open}
        aria-label={`Help: ${label}`}
        onClick={() => setOpen((v) => !v)}
      >
        ?
      </button>
      {open && (
        <span className="help-tip-pop" role="tooltip">
          {children}
        </span>
      )}
    </span>
  );
}
