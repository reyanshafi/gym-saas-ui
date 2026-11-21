"use client";

import { useRecords } from "@/data/records/use-records";

export function useGymBranch() {
  const { records, saveRecords } = useRecords("gym", "active-branch", []);
  return [
    records[0]?.values[0] ?? "",
    (value) => saveRecords(value ? [{ id: "active", values: [value] }] : []),
  ];
}
