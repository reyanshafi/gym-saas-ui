import {
  inr,
  outstandingAmount,
  paidAmount,
} from "@/features/billing/gym-finance";
import { matchesPeriod } from "@/shared/lib/reporting";

const percent = new Intl.NumberFormat("en-IN", {
  style: "percent",
  maximumFractionDigits: 1,
});
const signedPercent = new Intl.NumberFormat("en-IN", {
  style: "percent",
  maximumFractionDigits: 1,
  signDisplay: "exceptZero",
});

function change(current, previous, comparison, fallback) {
  if (previous == null || previous <= 0) return { context: fallback };
  const rate = (current - previous) / previous;
  return {
    delta: signedPercent.format(rate),
    trend: rate > 0 ? "up" : rate < 0 ? "down" : "flat",
    context: comparison,
  };
}

function countLabel(count, singular, plural = singular + "s") {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function buildGymKpis(members, payments, branchCount) {
  const count = (status) =>
    members.filter(({ values }) => values[3] === status).length;
  const memberShare = (amount) =>
    members.length
      ? `${percent.format(amount / members.length)} of all members`
      : "No members yet";
  const membersIn = (period) =>
    members.filter(({ values }) => matchesPeriod(values[6], period)).length;
  const collectedIn = (period) => {
    const rows = payments.filter(
      ({ values }) =>
        matchesPeriod(values[4], period) &&
        ["Paid", "Partially Paid", "Adjustment"].includes(values[3]),
    );
    return {
      amount: rows.reduce((sum, { values }) => sum + paidAmount(values), 0),
      count: rows.length,
    };
  };
  const active = count("Active");
  const expired = count("Expired");
  const expiring = count("Expiring");
  const newMembers = membersIn("This Month");
  const today = collectedIn("Today");
  const yesterday = collectedIn("Yesterday");
  const monthly = collectedIn("This Month");
  const previous = collectedIn("Last Month");
  const outstanding = payments
    .map(({ values }) => outstandingAmount(values))
    .filter((amount) => amount > 0);
  return [
    [
      "Total Members",
      members.length,
      {
        context: countLabel(branchCount, "branch", "branches") + " represented",
      },
    ],
    ["Active Members", active, { context: memberShare(active) }],
    ["Expired Members", expired, { context: memberShare(expired) }],
    [
      "New Members This Month",
      newMembers,
      change(
        newMembers,
        membersIn("Last Month"),
        "vs. last month",
        "Registered this month",
      ),
    ],
    ["Memberships Expiring Soon", expiring, { context: memberShare(expiring) }],
    [
      "Today's Collections",
      inr(today.amount),
      change(
        today.amount,
        yesterday.count ? yesterday.amount : null,
        "vs. yesterday",
        countLabel(today.count, "posted entry", "posted entries"),
      ),
    ],
    [
      "Monthly Revenue",
      inr(monthly.amount),
      change(
        monthly.amount,
        previous.count ? previous.amount : null,
        "vs. last month",
        "Net collections this month",
      ),
    ],
    [
      "Outstanding Payments",
      inr(outstanding.reduce((sum, amount) => sum + amount, 0)),
      { context: countLabel(outstanding.length, "open balance") },
    ],
  ];
}
