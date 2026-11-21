export function money(value) {
  return Number(String(value ?? "").replace(/[^\d.-]/g, "")) || 0;
}

export function inr(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

export function paidAmount(values) {
  if (values[3] === "Adjustment") return money(values[2]);
  if (values[3] === "Paid") return money(values[2]);
  if (values[3] === "Partially Paid") return money(values[6]);
  return 0;
}

export function outstandingAmount(values) {
  return ["Pending", "Overdue", "Partially Paid"].includes(values[3])
    ? Math.max(0, money(values[2]) - paidAmount(values))
    : 0;
}
