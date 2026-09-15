import React, { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from './Controls';

/** Native modal supplies focus containment, Escape, inert background and focus return. */
export default function BottomSheet({
  open,
  title,
  onClose,
  children,
  footer,
}) {
  const ref = useRef(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    if (!open || !dialog) return;
    const trigger = document.activeElement;
    dialog.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      dialog.close();
      document.body.style.overflow = overflow;
      if (trigger?.isConnected) trigger.focus();
    };
  }, [open]);
  if (!open) return null;
  return createPortal(
    <dialog
      ref={ref}
      className="bb-sheet"
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
    >
      <header>
        <h2 id={titleId}>{title}</h2>
        <button
          type="button"
          className="bb-icon-button"
          aria-label="Close dialog"
          onClick={onClose}
        >
          <Icon name="close" />
        </button>
      </header>
      <div className="bb-sheet-body">{children}</div>
      {footer && <footer>{footer}</footer>}
    </dialog>,
    document.body,
  );
}
