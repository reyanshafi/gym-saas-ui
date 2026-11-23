import { Building2, CalendarDays, CreditCard, Wallet } from "lucide-react";
import {
  inr,
  outstandingAmount,
  paidAmount,
} from "@/features/billing/gym-finance";
import { matchesPeriod, summarize } from "@/shared/lib/reporting";

export function collectionsByPlan(payments, tenants, subscriptions) {
  const plans = new Map(tenants.map(({ values }) => [values[0], values[1]]));
  for (const { values } of subscriptions) {
    if (["Active", "Trial", "Past due"].includes(values[4])) {
      plans.set(values[0], values[1]);
    }
  }
  return summarize(payments, (values) => plans.get(values[1]), paidAmount, inr);
}

export function platformMetrics(tenants, subscriptions, payments) {
  const revenue = (period) =>
    payments.reduce(
      (sum, { values }) =>
        sum + (matchesPeriod(values[4], period) ? paidAmount(values) : 0),
      0,
    );
  const current = revenue("This Month");
  const prior = revenue("Last Month");
  const delta =
    prior > 0
      ? new Intl.NumberFormat("en-IN", {
          style: "percent",
          maximumFractionDigits: 1,
          signDisplay: "exceptZero",
        }).format((current - prior) / prior)
      : null;
  const invoiceCount = payments.filter(
    ({ values }) => outstandingAmount(values) > 0,
  ).length;
  return [
    [
      "Monthly revenue",
      inr(current),
      delta ? delta + " vs. last month" : "Net collections this month",
      Wallet,
      "revenue",
    ],
    [
      "Active tenants",
      tenants.filter(({ values }) => values[3] === "Active").length,
      tenants.length + " total tenants",
      Building2,
      "tenants",
    ],
    [
      "Active subscriptions",
      subscriptions.filter(({ values }) => values[4] === "Active").length,
      subscriptions.filter(({ values }) => values[4] === "Trial").length +
        " in trial",
      CreditCard,
      "billing",
    ],
    [
      "Open invoices",
      invoiceCount,
      inr(
        payments.reduce(
          (sum, { values }) => sum + outstandingAmount(values),
          0,
        ),
      ) + " outstanding",
      CalendarDays,
      "payment-outstanding",
    ],
  ];
}
