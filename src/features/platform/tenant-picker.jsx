import { useId, useRef, useState } from "react";
import Link from "next/link";
import { Building2, Check, ChevronDown, Search } from "lucide-react";
import { tenantDetailsHref } from "@/features/platform/tenant-routes";

export default function TenantPicker({ records, selected }) {
  const id = useId();
  const popover = useRef(null);
  const [query, setQuery] = useState("");
  const search = query.trim().toLowerCase();
  const matches = records.filter(({ values }) =>
    [values[0], values[4], values[5]].some((value) =>
      value?.toLowerCase().includes(search),
    ),
  );

  function position(event) {
    const { right, bottom } = event.currentTarget.getBoundingClientRect();
    popover.current.style.setProperty(
      "--tenant-picker-right",
      Math.max(12, window.innerWidth - right) + "px",
    );
    popover.current.style.top = bottom + 6 + "px";
    popover.current.style.maxHeight =
      Math.min(360, window.innerHeight - bottom - 14) + "px";
    setQuery("");
  }

  return (
    <>
      <button
        type="button"
        className="button secondary tenant-picker-trigger"
        popoverTarget={id}
        aria-label="Switch tenant"
        onClick={position}
        disabled={!records.length}
      >
        <Building2 size={16} aria-hidden="true" />
        <span>{selected?.values[0] ?? "Select tenant"}</span>
        <ChevronDown size={16} aria-hidden="true" />
      </button>
      <div
        className="tenant-picker"
        id={id}
        popover="auto"
        ref={popover}
        role="group"
        aria-label="Tenant picker"
      >
        <label className="search tenant-picker-search">
          <Search size={16} aria-hidden="true" />
          <input
            type="search"
            aria-label="Search tenants"
            placeholder="Search by gym, contact, or email"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            autoFocus
          />
        </label>
        <ul className="tenant-picker-results">
          {matches.map(({ id: tenantId, values }) => (
            <li key={tenantId}>
              <Link
                href={tenantDetailsHref(tenantId)}
                scroll={false}
                aria-current={selected?.id === tenantId ? "page" : undefined}
                onClick={() => popover.current.hidePopover()}
              >
                <span>
                  <strong>{values[0]}</strong>
                  <small>{values[5] || values[4] || values[1]}</small>
                </span>
                {selected?.id === tenantId && (
                  <Check size={16} aria-hidden="true" />
                )}
              </Link>
            </li>
          ))}
        </ul>
        {!matches.length && (
          <p className="tenant-picker-empty" role="status">
            No matching tenants.
          </p>
        )}
      </div>
    </>
  );
}
