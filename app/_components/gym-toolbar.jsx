"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { useRecords } from "../_data/use-records";

export function useGymBranch() {
  const { records, saveRecords } = useRecords("gym", "active-branch", []);
  return [
    records[0]?.values[0] ?? "",
    (value) => saveRecords(value ? [{ id: "active", values: [value] }] : []),
  ];
}

export default function GymToolbar({ sections }) {
  const [query, setQuery] = useState("");
  const { records: members } = useRecords(
    "gym",
    "members",
    sections.members[4],
  );
  const { records: payments } = useRecords(
    "gym",
    "finance",
    sections.finance[4],
  );
  const { records: branches } = useRecords(
    "gym",
    "branches",
    sections.branches[4],
  );
  const [branch, setBranch] = useGymBranch();
  const needle = query.trim().toLowerCase();
  const results =
    needle.length < 2
      ? []
      : [
          ...members
            .filter(({ values }) =>
              [values[0], values[4], values[5]].some((value) =>
                value?.toLowerCase().includes(needle),
              ),
            )
            .slice(0, 4)
            .map((record) => ({ ...record, key: "members", label: "Member" })),
          ...payments
            .filter(({ values }) =>
              [values[0], values[1], values[7]].some((value) =>
                value?.toLowerCase().includes(needle),
              ),
            )
            .slice(0, 4)
            .map((record) => ({ ...record, key: "finance", label: "Payment" })),
        ];
  return (
    <div className="gym-toolbar">
      <div
        className="gym-search"
        onKeyDown={(event) => {
          if (event.key === "Escape") setQuery("");
        }}
      >
        <label className="search">
          <Search size={17} />
          <input
            type="search"
            aria-label="Global search"
            placeholder="Find members or payments"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        {needle.length >= 2 && (
          <div className="gym-search-results panel">
            {results.length ? (
              results.map(({ id, key, values, label }) => (
                <Link
                  key={key + id}
                  href={"/gym/" + key + "?q=" + encodeURIComponent(values[0])}
                  onClick={() => setQuery("")}
                >
                  {values[0]} <small>{label}</small>
                </Link>
              ))
            ) : (
              <p>No results found.</p>
            )}
          </div>
        )}
      </div>
      {branches.length > 1 && (
        <select
          className="filter-select"
          aria-label="Active branch"
          value={branch}
          onChange={(event) => setBranch(event.target.value)}
        >
          <option value="">All branches</option>
          {branches.map(({ id, values }) => (
            <option key={id}>{values[0]}</option>
          ))}
        </select>
      )}
    </div>
  );
}
