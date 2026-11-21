"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import {
  browserRecordRepository,
  decodeRecords,
} from "@/data/records/browser-record-repository";

const serverSnapshot = () => null;

export function useRecords(portal, section, sampleRows) {
  const scope = useMemo(() => ({ portal, section }), [portal, section]);
  const subscribe = useCallback(
    (listener) => browserRecordRepository.subscribe(scope, listener),
    [scope],
  );
  const getSnapshot = useCallback(
    () => browserRecordRepository.getSnapshot(scope),
    [scope],
  );
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, serverSnapshot);
  const records = useMemo(
    () => decodeRecords(snapshot, sampleRows),
    [snapshot, sampleRows],
  );

  return {
    records,
    saveRecords: (nextRecords) =>
      browserRecordRepository.replace(scope, nextRecords),
  };
}
