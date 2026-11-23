import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import {
  platformNavigation,
  platformPages,
} from "@/data/catalog/platform-pages";
import { useRecords } from "@/data/records/use-records";
import { tenantDetailsHref } from "@/features/platform/tenant-routes";

export default function PlatformSearch({ sections }) {
  const [query, setQuery] = useState("");
  const { records: tenants } = useRecords(
    "platform",
    "tenants",
    sections.tenants[4],
  );
  const needle = query.trim().toLowerCase();
  const entries = platformNavigation
    .flatMap(([, items]) =>
      items.flatMap(([key, children]) => [key, ...children]),
    )
    .map((key) => ({
      id: key,
      label: platformPages[key]?.title ?? sections[key]?.[1],
      url: "/platform/" + key,
    }));
  const results =
    needle.length >= 2
      ? [
          ...entries
            .filter(({ label }) => label.toLowerCase().includes(needle))
            .slice(0, 5),
          ...tenants
            .filter(({ values }) =>
              [values[0], values[5]].some((value) =>
                value?.toLowerCase().includes(needle),
              ),
            )
            .slice(0, 4)
            .map(({ id, values }) => ({
              id,
              url: tenantDetailsHref(id),
              label: values[0],
            })),
        ]
      : [];
  return (
    <div className="gym-toolbar">
      <div
        className="gym-search"
        onKeyDown={(event) => {
          if (event.key === "Escape") setQuery("");
        }}
      >
        <label className="search">
          <Search size={17} aria-hidden="true" />
          <input
            type="search"
            aria-label="Search platform"
            placeholder="Find tenants or pages"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        {needle.length >= 2 && (
          <div className="gym-search-results panel">
            {results.length ? (
              results.map(({ id, url, label }) => (
                <Link key={id} href={url} onClick={() => setQuery("")}>
                  {label}
                </Link>
              ))
            ) : (
              <p role="status">No results found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
