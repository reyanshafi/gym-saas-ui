import {
  inr,
  money,
  outstandingAmount,
  paidAmount,
} from "@/features/billing/gym-finance";

export function paymentKpis(records) {
  const sum = (calculation) =>
    records.reduce((total, { values }) => total + calculation(values), 0);
  return [
    ["Net collected", inr(sum(paidAmount)), "Includes reversals"],
    [
      "Outstanding",
      inr(sum(outstandingAmount)),
      records.filter(({ values }) => outstandingAmount(values) > 0).length +
        " open balances",
    ],
    [
      "Paid invoices",
      records.filter(({ values }) => values[3] === "Paid").length,
    ],
    [
      "Overdue invoices",
      records.filter(({ values }) => values[3] === "Overdue").length,
    ],
  ];
}

const statusSummaries = {
  gym: {
    members: [3, "Members", ["Active", "Expiring", "Expired"]],
    memberships: [3, "Membership plans", ["Active", "Inactive", "Archived"]],
    "member-subscriptions": [4, "Memberships", ["Active", "Frozen", "Expired"]],
    renewals: [3, "Renewals", ["Due", "Overdue", "Renewed"]],
    staff: [3, "Staff members", ["Active", "Inactive"]],
    branches: [3, "Branches", ["Active", "Inactive"]],
    notifications: [4, "Communication items", ["Active", "Draft", "Disabled"]],
  },
  platform: {
    tenants: [3, "Tenants", ["Active", "Trial", "Suspended"]],
    subscriptions: [3, "Plans", ["Active", "Inactive", "Archived"]],
    billing: [4, "Subscriptions", ["Active", "Trial", "Past due"]],
    support: [3, "Tickets", ["Open", "In progress", "Resolved"]],
    access: [3, "Team members", ["Active", "Invited", "Disabled"]],
  },
};

export function sectionKpis(portal, section, records) {
  if (section === "finance") return paymentKpis(records);
  const rows = records.map((record) => record.values);
  if (portal === "gym" && section === "expenses") {
    const paid = rows.filter((row) => row[4] === "Paid");
    const pending = rows.filter((row) => row[4] === "Pending");
    const sum = (values) =>
      values.reduce((total, row) => total + money(row[2]), 0);
    return [
      ["Expense records", rows.length],
      ["Paid expenses", inr(sum(paid))],
      ["Pending expenses", inr(sum(pending))],
      ["Categories", new Set(rows.map((row) => row[1]).filter(Boolean)).size],
    ];
  }
  if (portal === "gym" && section === "inventory") {
    return [
      ["Products", rows.length],
      ["Units in stock", rows.reduce((total, row) => total + money(row[2]), 0)],
      [
        "Low stock",
        rows.filter(
          (row) => money(row[2]) > 0 && money(row[2]) <= money(row[3]),
        ).length,
        "At or below reorder level",
      ],
      ["Out of stock", rows.filter((row) => money(row[2]) <= 0).length],
    ];
  }
  if (portal === "platform" && section === "feature-overrides") {
    return [
      ["Overrides", rows.length],
      ["Enabled", rows.filter((row) => row[2] === "Enabled").length],
      ["Disabled", rows.filter((row) => row[2] === "Disabled").length],
    ];
  }
  const settings = statusSummaries[portal]?.[section];
  if (!settings) return null;
  const [column, label, statuses] = settings;
  return [
    [label, rows.length],
    ...statuses.map((status) => [
      status,
      rows.filter((row) => row[column] === status).length,
    ]),
  ];
}
