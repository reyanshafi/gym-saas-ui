"use client";

import Link from "next/link";
import { useId, useRef } from "react";
import { Ellipsis, Eye, Pencil, Trash2 } from "lucide-react";

export default function RecordActions({
  name,
  onEdit,
  onDelete,
  onAdjust,
  onDuplicate,
  onView,
  viewLabel,
  viewHref,
  statusActions = [],
  onStatus,
}) {
  const id = useId();
  const menu = useRef(null);

  function positionMenu(event) {
    const { right, top, bottom } = event.currentTarget.getBoundingClientRect();
    const above =
      window.innerHeight - bottom <
      (onView || viewHref || onDuplicate ? 150 : 110);
    Object.assign(menu.current.style, {
      right: Math.max(12, window.innerWidth - right) + "px",
      top: above ? "auto" : bottom + 6 + "px",
      bottom: above ? window.innerHeight - top + 6 + "px" : "auto",
    });
  }

  function run(action) {
    menu.current.hidePopover();
    action();
  }

  if (
    !viewHref &&
    !onView &&
    !onEdit &&
    !onDelete &&
    !onAdjust &&
    !onDuplicate &&
    !statusActions.length
  )
    return null;

  return (
    <>
      <button
        type="button"
        className="icon-button"
        popoverTarget={id}
        aria-label={`Actions for ${name}`}
        title="Actions"
        onClick={positionMenu}
      >
        <Ellipsis size={18} aria-hidden="true" />
      </button>
      <div
        id={id}
        ref={menu}
        popover="auto"
        className="record-actions"
        role="group"
        aria-label={`Actions for ${name}`}
      >
        {viewHref && (
          <Link href={viewHref} onClick={() => menu.current.hidePopover()}>
            <Eye size={15} /> {viewLabel}
          </Link>
        )}
        {onView && (
          <button type="button" autoFocus onClick={() => run(onView)}>
            <Eye size={15} /> {viewLabel}
          </button>
        )}
        {onEdit && (
          <button
            type="button"
            autoFocus={!onView && !viewHref}
            onClick={() => run(onEdit)}
          >
            <Pencil size={15} /> Edit
          </button>
        )}
        {statusActions.map(([action, value]) => (
          <button
            type="button"
            key={value}
            onClick={() => run(() => onStatus(action, value))}
          >
            {action}
          </button>
        ))}
        {onDuplicate && (
          <button type="button" onClick={() => run(onDuplicate)}>
            Duplicate plan
          </button>
        )}
        {onAdjust && (
          <button type="button" onClick={() => run(onAdjust)}>
            Reverse payment
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            className="delete-action"
            onClick={() => run(onDelete)}
          >
            <Trash2 size={15} /> Delete
          </button>
        )}
      </div>
    </>
  );
}
