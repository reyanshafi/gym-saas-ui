"use client";

import { useSyncExternalStore } from "react";

const changeEvent = "GymSaas:records";

function subscribe(listener) {
  window.addEventListener("storage", listener);
  window.addEventListener(changeEvent, listener);
  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener(changeEvent, listener);
  };
}

const serverSnapshot = () => null;

export function useRecords(portal, section, sampleRows) {
  const key = `GymSaas:${portal}:${section}:v1`;
  const saved = useSyncExternalStore(
    subscribe,
    () => {
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    serverSnapshot,
  );
  const initialRecords = sampleRows.map((values, index) => ({
    id: `sample-${index}`,
    values,
  }));
  let records = initialRecords;
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) records = parsed;
    } catch {
      // A damaged local record set falls back to the demo data.
    }
  }

  function saveRecords(nextRecords) {
    localStorage.setItem(key, JSON.stringify(nextRecords));
    window.dispatchEvent(new Event(changeEvent));
  }

  return { records, saveRecords };
}
