import { useEffect, useId, useRef } from "react";

export default function ConfirmFormAction({
  title,
  message,
  action,
  destructive,
  onCancel,
  onConfirm,
}) {
  const dialog = useRef(null);
  const titleId = useId();
  const messageId = useId();

  useEffect(() => {
    const element = dialog.current;
    element.showModal();
    return () => element.close();
  }, []);

  return (
    <dialog
      ref={dialog}
      className="record-dialog"
      aria-labelledby={titleId}
      aria-describedby={messageId}
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
    >
      <header className="dialog-header">
        <h2 id={titleId}>{title}</h2>
      </header>
      <div className="dialog-body">
        <p id={messageId}>{message}</p>
      </div>
      <footer className="dialog-footer">
        <button
          type="button"
          className="button secondary"
          autoFocus
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          type="button"
          className={destructive ? "button danger" : "button primary"}
          onClick={onConfirm}
        >
          {action}
        </button>
      </footer>
    </dialog>
  );
}
