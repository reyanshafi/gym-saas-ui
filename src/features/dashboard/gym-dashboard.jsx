"use client";

import { useRecords } from "@/data/records/use-records";
import { inr, money, paidAmount } from "@/features/billing/gym-finance";
import { useGymBranch } from "@/features/workspace/use-gym-branch";
import { buildGymKpis } from "@/features/dashboard/gym-kpis";
import GymDashboardView from "@/features/dashboard/gym-dashboard-view";

import { summarize } from "@/shared/lib/reporting";

export function GymDashboard({ data }) {
  const [branch] = useGymBranch();
  const { records: allMembers } = useRecords(
    "gym",
    "members",
    data.sections.members[4],
  );
  const { records: allPayments } = useRecords(
    "gym",
    "finance",
    data.sections.finance[4],
  );
  const { records: allExpenses } = useRecords(
    "gym",
    "expenses",
    data.sections.expenses[4],
  );
  const { records: inventory } = useRecords(
    "gym",
    "inventory",
    data.sections.inventory[4],
  );
  const { records: allRenewals } = useRecords(
    "gym",
    "renewals",
    data.sections.renewals[4],
  );
  const { records: staffActivity } = useRecords("gym", "activity", []);
  const members = branch
    ? allMembers.filter(({ values }) => values[2] === branch)
    : allMembers;
  const names = new Set(members.map(({ values }) => values[0]));
  const payments = branch
    ? allPayments.filter(({ values }) => names.has(values[1]))
    : allPayments;
  const expenses = branch
    ? allExpenses.filter(({ values }) => values[5] === branch)
    : allExpenses;
  const renewals = branch
    ? allRenewals.filter(({ values }) => names.has(values[0]))
    : allRenewals;
  const count = (status) =>
    members.filter(({ values }) => values[3] === status).length;
  const alerts = [
    ["Memberships expiring soon", count("Expiring"), "members"],
    [
      "Pending payments",
      payments.filter(({ values }) =>
        ["Pending", "Partially Paid"].includes(values[3]),
      ).length,
      "finance",
    ],
    [
      "Overdue payments",
      payments.filter(({ values }) => values[3] === "Overdue").length,
      "finance",
    ],
    [
      "Low inventory",
      inventory.filter(({ values }) => money(values[2]) <= money(values[3]))
        .length,
      "inventory",
    ],
  ];
  const memberByName = new Map(
    members.map(({ values }) => [values[0], values]),
  );
  const branchCounts = new Map();
  for (const { values } of members) {
    const key = values[2] || "Unspecified";
    const count = branchCounts.get(key) ?? { key, total: 0, active: 0 };
    count.total++;
    if (values[3] === "Active") count.active++;
    branchCounts.set(key, count);
  }
  const charts = [
    [
      "Monthly Revenue",
      summarize(payments, (v) => v[4]?.slice(0, 7), paidAmount, inr),
    ],
    [
      "Membership Growth",
      summarize(
        members,
        (v) => v[6]?.slice(0, 7),
        () => 1,
      ),
    ],
    [
      "Revenue by Membership Plan",
      summarize(payments, (v) => memberByName.get(v[1])?.[1], paidAmount, inr),
    ],
    [
      "Monthly Expenses",
      summarize(
        expenses,
        (v) => v[3]?.slice(0, 7),
        (v) => (v[4] === "Paid" ? money(v[2]) : 0),
        inr,
      ),
    ],
    [
      "Branch-wise Performance",
      [...branchCounts.values()].sort((a, b) => a.key.localeCompare(b.key)),
    ],
  ];
  const feed = [
    ["Recently Registered Members", "members", members],
    ["Recent Payments", "finance", payments],
    ["Recent Membership Renewals", "renewals", renewals],
    ["Recently Added Expenses", "expenses", expenses],
    [
      "Recent Staff Activities",
      "activity",
      staffActivity.filter(({ values }) => values[2] === "Staff Management"),
    ],
  ];
  return (
    <GymDashboardView
      totals={buildGymKpis(members, payments, branchCounts.size)}
      charts={charts}
      alerts={alerts}
      feed={feed}
    />
  );
}
