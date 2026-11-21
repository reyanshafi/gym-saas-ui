import { reportingTimeZone } from "@/shared/lib/business-defaults";

function dateKey(date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: reportingTimeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function matchesPeriod(date, period, start, end) {
  if (period === "All dates") return true;
  if (!date) return false;
  const now = new Date();
  const day = (offset) => dateKey(new Date(now.getTime() + offset * 86400000));
  const today = day(0);
  switch (period) {
    case "Today":
      return date === today;
    case "Yesterday":
      return date === day(-1);
    case "Last 7 Days":
      return date >= day(-6) && date <= today;
    case "Next 7 Days":
      return date >= today && date <= day(6);
    case "Next 30 Days":
      return date >= today && date <= day(29);
    case "This Month":
      return date.slice(0, 7) === today.slice(0, 7);
    case "Last Month":
      return date.slice(0, 7) === day(-Number(today.slice(-2))).slice(0, 7);
    case "This Year":
      return date.slice(0, 4) === today.slice(0, 4);
    default:
      return (!start || date >= start) && (!end || date <= end);
  }
}

export function summarize(records, group, amount, format = String) {
  const totals = new Map();
  for (const { values } of records) {
    const key = group(values) || "Unspecified";
    totals.set(key, (totals.get(key) ?? 0) + amount(values));
  }
  return [...totals]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => ({ key, value, label: format(value) }));
}
