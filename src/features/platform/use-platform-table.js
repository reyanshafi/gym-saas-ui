import { platformPortal } from "@/data/catalog/platform-portal";
import { useRecords } from "@/data/records/use-records";
import {
  inr,
  outstandingAmount,
  paidAmount,
} from "@/features/billing/gym-finance";

const dateFormat = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});
const missing = "\u2014";

function showDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value ?? "")) return missing;
  const date = new Date(value + "T00:00:00Z");
  return Number.isNaN(date.valueOf()) ? missing : dateFormat.format(date);
}

function tenantRows(records, matches, subscriptions) {
  const unique = new Map();
  for (const { values } of records)
    unique.set(values[0], (unique.get(values[0]) ?? 0) + 1);
  const dates = new Map();
  for (const {
    values: [tenant, , , date, status],
  } of subscriptions) {
    if (
      unique.get(tenant) !== 1 ||
      !["Active", "Trial", "Past due"].includes(status) ||
      showDate(date) === missing
    )
      continue;
    if (!dates.has(tenant) || date < dates.get(tenant)) dates.set(tenant, date);
  }
  return matches.map((record) => {
    const [tenant, plan, branches, status, contact, email, onboarded] =
      record.values;
    const date = dates.get(tenant);
    return {
      ...record,
      displayValues: [
        tenant,
        plan,
        contact || missing,
        email || missing,
        branches,
        showDate(onboarded),
        showDate(date),
        status,
      ],
    };
  });
}

export function usePlatformTable(portal, section, records, matches, headings) {
  const { records: subscriptions } = useRecords(
    "platform",
    "billing",
    platformPortal.sections.billing[4],
  );
  if (portal !== "platform") return null;
  if (section === "tenants")
    return {
      headings: [
        "Tenant",
        "Subscription",
        "Primary contact",
        "Contact email",
        "Branches",
        "Onboarded",
        "Next renewal",
        "Status",
      ],
      records: tenantRows(records, matches, subscriptions),
    };
  if (section === "finance")
    return {
      headings: [
        "Invoice",
        "Tenant",
        "Invoice amount",
        "Net collected",
        "Outstanding",
        "Payment date",
        "Payment method",
        "Status",
      ],
      records: matches.map((record) => {
        const [invoice, tenant, amount, status, date, method] = record.values;
        return {
          ...record,
          displayValues: [
            invoice,
            tenant,
            amount,
            inr(paidAmount(record.values)),
            inr(outstandingAmount(record.values)),
            showDate(date),
            method || missing,
            status,
          ],
        };
      }),
    };
  if (section === "support")
    return {
      headings,
      records: matches.map((record) => ({
        ...record,
        displayValues: headings.map((heading, index) =>
          heading === "Opened date"
            ? showDate(record.values[index])
            : record.values[index] || missing,
        ),
      })),
    };
  return null;
}
