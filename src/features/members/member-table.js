const memberDate = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

function formatDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value ?? "")) return "—";
  const date = new Date(value + "T00:00:00Z");
  return Number.isNaN(date.valueOf()) ? "—" : memberDate.format(date);
}

export function memberTableRows(records, matches, memberships, fields) {
  const names = new Map();
  for (const { values } of records)
    names.set(values[0], (names.get(values[0]) ?? 0) + 1);

  const latest = new Map();
  for (const {
    values: [name, plan, start, end, status],
  } of memberships) {
    if (
      names.get(name) !== 1 ||
      status === "Cancelled" ||
      formatDate(end) === "—"
    )
      continue;
    const key = JSON.stringify([name, plan]);
    const previous = latest.get(key);
    if (
      !previous ||
      (start ?? "") > previous.start ||
      ((start ?? "") === previous.start && end > previous.end)
    ) {
      latest.set(key, { start: start ?? "", end });
    }
  }

  const index = (label) => fields.findIndex((field) => field.label === label);
  const phone = index("Phone");
  const email = index("Email");
  const joined = index("Joined date");
  return matches.map((record) => {
    const [name, plan, branch, status] = record.values;
    return {
      ...record,
      displayValues: [
        name,
        record.values[phone] || record.values[email] || "—",
        plan,
        branch,
        formatDate(record.values[joined]),
        formatDate(latest.get(JSON.stringify([name, plan]))?.end),
        status,
      ],
    };
  });
}
