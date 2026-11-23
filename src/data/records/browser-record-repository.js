/** @typedef {{ id: string, values: string[] }} WorkspaceRecord */
/** @typedef {{ portal: string, section: string }} RecordScope */

const prefix = "Gypptiro:";
const changeEvent = "Gypptiro:records";

/** @param {RecordScope} scope */
function storageKey({ portal, section }) {
  return `${prefix}${portal}:${section}:v1`;
}

export const browserRecordRepository = {
  /** @param {RecordScope} scope */
  getSnapshot(scope) {
    try {
      return window.localStorage.getItem(storageKey(scope));
    } catch {
      return null;
    }
  },

  /** @param {RecordScope} scope @param {() => void} listener */
  subscribe(scope, listener) {
    const key = storageKey(scope);
    function onStorage(event) {
      if (event.key === key || event.key === null) listener();
    }
    function onChange(event) {
      if (event.detail === key) listener();
    }
    window.addEventListener("storage", onStorage);
    window.addEventListener(changeEvent, onChange);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(changeEvent, onChange);
    };
  },

  /** @param {RecordScope} scope @param {WorkspaceRecord[]} records */
  replace(scope, records) {
    const key = storageKey(scope);
    window.localStorage.setItem(key, JSON.stringify(records));
    window.dispatchEvent(new CustomEvent(changeEvent, { detail: key }));
  },
};

/** @returns {WorkspaceRecord[]} */
export function decodeRecords(snapshot, sampleRows) {
  if (snapshot !== null) {
    try {
      const records = JSON.parse(snapshot);
      if (
        Array.isArray(records) &&
        records.every(
          (record) =>
            record &&
            typeof record.id === "string" &&
            Array.isArray(record.values) &&
            record.values.every((value) => typeof value === "string"),
        )
      )
        return records;
    } catch {
      // An invalid snapshot falls back to the bundled records.
    }
  }
  return sampleRows.map((values, index) => ({ id: `sample-${index}`, values }));
}
