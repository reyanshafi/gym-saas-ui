export function createRecord(values) {
  return { id: crypto.randomUUID(), values };
}

export function applyRecordChange(
  records,
  { mode, record, newStatus, statusIndex, values },
) {
  if (mode === "delete") return records.filter((item) => item.id !== record.id);
  if (!record || mode === "duplicate" || mode === "adjust")
    return [createRecord(values), ...records];
  return records.map((item) => {
    if (item.id !== record.id) return item;
    if (mode === "status") {
      const nextValues = [...item.values];
      nextValues[statusIndex] = newStatus;
      return { ...item, values: nextValues };
    }
    return { ...item, values };
  });
}
