import { useId, useRef } from "react";
import Link from "next/link";
import { ChevronDown, LogOut } from "lucide-react";

export default function ProfileMenu({ name, role }) {
  const menuId = useId();
  const menu = useRef(null);
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("");

  function positionMenu(event) {
    const { right, bottom } = event.currentTarget.getBoundingClientRect();
    menu.current.style.right = Math.max(12, window.innerWidth - right) + "px";
    menu.current.style.top = bottom + 6 + "px";
  }

  return (
    <>
      <button
        type="button"
        className="profile profile-trigger"
        aria-label={"Profile options for " + name}
        popoverTarget={menuId}
        onClick={positionMenu}
      >
        <span className="avatar" aria-hidden="true">
          {initials}
        </span>
        <div>
          <strong>{name}</strong>
          <small>{role}</small>
        </div>
        <ChevronDown size={15} aria-hidden="true" />
      </button>
      <div
        id={menuId}
        ref={menu}
        popover="auto"
        className="profile-menu"
        aria-label="Profile options"
      >
        <Link href="/login" replace onClick={() => menu.current.hidePopover()}>
          <LogOut size={17} aria-hidden="true" /> Log out
        </Link>
      </div>
    </>
  );
}
