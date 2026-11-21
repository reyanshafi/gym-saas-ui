import { reportingTimeZone } from "@/shared/lib/business-defaults";

import { inr, money, paidAmount } from "@/features/billing/gym-finance";

export function validatePayment(values, existing) {
  const [invoice, , total, status, , , collected] = values;
  const amount = money(total);
  const partialAmount = money(collected);
  if (
    amount <= 0 ||
    (status === "Partially Paid" &&
      (partialAmount <= 0 || partialAmount >= amount))
  ) {
    return "Enter a positive amount and a valid partial payment.";
  }
  if (
    status === "Adjustment" ||
    existing.some((record) => record.values[0] === invoice)
  ) {
    return "Use a unique invoice number. Post reversals from the original payment.";
  }
  return null;
}

export function prepareReversal(record, existing, now = new Date()) {
  const [invoice, member, , , , method] = record.values;
  const reversalInvoice = invoice + "-REV";
  if (
    existing.some(
      ({ values }) =>
        values[3] === "Adjustment" && values[0] === reversalInvoice,
    )
  ) {
    return { error: "This payment has already been reversed." };
  }
  const date = new Intl.DateTimeFormat("en-CA", {
    timeZone: reportingTimeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  return {
    values: [
      reversalInvoice,
      member,
      inr(-paidAmount(record.values)),
      "Adjustment",
      date,
      method || "Other",
      "",
      invoice,
    ],
  };
}
