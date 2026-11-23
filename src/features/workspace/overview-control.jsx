import { useId, useRef } from "react";

export default function OverviewControl({
  label,
  Icon,
  value,
  children,
  onOpen,
}) {
  const id = useId();
  const popup = useRef(null);

  function position(event) {
    const { right, bottom } = event.currentTarget.getBoundingClientRect();
    popup.current.style.setProperty(
      "--control-right",
      Math.max(12, window.innerWidth - right) + "px",
    );
    popup.current.style.top = bottom + 8 + "px";
    onOpen?.();
  }

  return (
    <>
      <button
        type="button"
        className="gym-overview-control"
        aria-label={label}
        title={label}
        popoverTarget={id}
        onClick={position}
      >
        <Icon size={18} aria-hidden="true" />
        {value && <span>{value}</span>}
      </button>
      <div
        id={id}
        ref={popup}
        popover="auto"
        className="gym-control-popover"
        role="group"
        aria-label={label}
      >
        {children(() => popup.current.hidePopover())}
      </div>
    </>
  );
}
