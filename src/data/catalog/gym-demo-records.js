const branches = ["Indiranagar", "Koramangala", "Whitefield"];
const firstNames = [
  "Aditi", "Vikram", "Meera", "Arjun", "Kavya", "Aditya", "Neha", "Nikhil",
  "Priya", "Siddharth", "Tara", "Rahul", "Diya", "Varun", "Sana", "Rishi",
];
const surnames = [
  "Bhat", "Gupta", "Iyer", "Joshi", "Kumar", "Malhotra", "Pillai",
  "Reddy", "Saxena", "Shah", "Sinha", "Verma", "Desai", "Das",
];
const plans = [
  ["Monthly Core", "1999", 1],
  ["Quarterly Plus", "5499", 3],
  ["Annual Pro", "17999", 12],
];
const methods = ["UPI", "Card", "Cash", "Bank Transfer"];
const signupCounts = [9, 12, 10, 14, 13, 16, 15, 19, 16, 23, 18, 24];
const demoDate = "2026-11-23";

function date(month, day) {
  return new Date(Date.UTC(2025, 11 + month, day)).toISOString().slice(0, 10);
}

export const demoMembers = [];
export const demoMemberships = [];
export const demoPayments = [];
export const demoRenewals = [];

for (const [month, count] of signupCounts.entries()) {
  for (let entry = 0; entry < count; entry++) {
    const index = demoMembers.length;
    const name = firstNames[index % firstNames.length] + " " +
      surnames[Math.floor(index / firstNames.length)];
    const branch = branches[(index + Math.floor(index / 5)) % branches.length];
    const [plan, price, duration] = plans[(entry + month * 2) % plans.length];
    const day = entry === count - 1 ? 23 : entry === count - 2 ? 22 : 2 + (entry * 7) % 19;
    const joined = date(month, day);
    const cycles = month < 10 && index % 4 !== 0
      ? Math.floor((10 - month) / duration)
      : 0;
    const start = date(month + cycles * duration, day);
    const end = date(month + (cycles + 1) * duration, day);
    const status = end < demoDate ? "Expired" : end <= "2026-12-07" ? "Expiring" : "Active";
    const email = name.toLowerCase().replace(" ", ".") + "@example.com";
    demoMembers.push([name, plan, branch, status, email, "", joined, index % 2 === 0 ? "Female" : "Male"]);
    demoMemberships.push([name, plan, start, end, status]);
    if (status !== "Active") {
      demoRenewals.push([name, plan, end, status === "Expired" ? "Overdue" : "Due"]);
    } else if (cycles > 0) {
      demoRenewals.push([name, plan, start, "Renewed"]);
    }

    for (let cycle = 0; cycle <= cycles; cycle++) {
      const posted = date(month + cycle * duration, day);
      const paymentStatus = cycle === 0 && month >= 10
        ? index % 11 === 0 ? "Pending" : index % 7 === 0 ? "Partially Paid" : "Paid"
        : "Paid";
      const amountPaid = paymentStatus === "Pending" ? "0"
        : paymentStatus === "Partially Paid" ? String(Math.floor(Number(price) / 2))
        : price;
      const invoice = String(1100 + demoPayments.length);
      demoPayments.push([
        "GYM-" + invoice, name, price, paymentStatus, posted,
        methods[(index + cycle) % methods.length], amountPaid, "TX-" + invoice, plan,
      ]);
    }
  }
}

export const demoExpenses = signupCounts.flatMap((_, month) =>
  branches.flatMap((branch, index) => [
    ["Facility rent", "Rent", String(31000 + index * 4500), date(month, 1), "Paid", branch, "Bank Transfer", "Monthly"],
    ["Utilities", "Electricity", String(4700 + (month * 719 + index * 370) % 3100), date(month, 10), "Paid", branch, "UPI", "Monthly"],
    ["Equipment service", "Maintenance", String(2800 + (month * 1337 + index * 900) % 9200), date(month, 18), "Paid", branch, "Bank Transfer"],
  ]),
);
