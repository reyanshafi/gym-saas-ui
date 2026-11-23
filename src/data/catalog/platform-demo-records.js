const clients = [
  ["Atlas Strength", "Growth", 4, "Active", "Ira Sen", "2026-03-03"],
  ["Harbor Fitness", "Starter", 1, "Active", "Sara Bose", "2026-03-09"],
  ["Ironwood Training", "Scale", 9, "Active", "Kunal Shah", "2026-04-06"],
  ["Studio Tempo", "Starter", 1, "Active", "Alina Thomas", "2026-04-15"],
  ["Redwood Barbell", "Growth", 2, "Active", "Yash Rao", "2026-05-11"],
  ["Foundry Fitness", "Growth", 3, "Active", "Neel Das", "2026-06-02"],
  ["Pace House", "Starter", 1, "Active", "Rhea Sethi", "2026-07-06"],
  ["Latitude Wellness", "Scale", 7, "Active", "Vivek Jain", "2026-07-14"],
  ["Peak District Gym", "Growth", 5, "Active", "Nina Bhat", "2026-08-10"],
  ["Form & Field", "Starter", 1, "Active", "Asha Nair", "2026-08-21"],
  ["Westbridge Athletics", "Scale", 11, "Active", "Ishan Joshi", "2026-09-16"],
  ["Common Ground Fitness", "Growth", 2, "Active", "Rohan Gill", "2026-10-09"],
  ["Lift Society", "Growth", 3, "Active", "Dev Kapoor", "2026-11-06"],
  ["Oakline Training", "Starter", 1, "Trial", "Meera Gupta", "2026-11-16"],
  ["Northstar Performance", "Growth", 2, "Trial", "Tara Desai", "2026-11-20"],
];

const prices = { Starter: 2999, Growth: 6999, Scale: 14999 };
const methods = ["UPI", "Card", "Bank transfer"];

function renewalDate(joined, status) {
  if (status !== "Trial") return "2026-12-" + joined.slice(-2);
  const end = new Date(joined);
  end.setUTCDate(end.getUTCDate() + 15);
  return end.toISOString().slice(0, 10);
}

export const demoTenants = clients.map(([name, plan, branches, status, contact, joined]) => [
  name, plan, String(branches), status, contact,
  contact.toLowerCase().replace(" ", ".") + "@example.com", joined,
]);

export const demoSubscriptions = [
  ["Core Collective", "Growth", "Monthly", "2026-12-12", "Active"],
  ...clients.map(([name, plan, , status, , joined]) => [
    name, plan, "Monthly", renewalDate(joined, status), status,
  ]),
];

export const demoPlatformPayments = [
  ...clients,
  ["Core Collective", "Growth", 2, "Active", "Leena Roy", "2026-08-12"],
]
  .filter(([, , , status]) => status === "Active")
  .flatMap(([name, plan, , , , joined], index) => {
    const firstMonth = Number(joined.slice(5, 7));
    const price = prices[plan];
    return Array.from({ length: 12 - firstMonth }, (_, offset) => {
      const month = firstMonth + offset;
      const currentMonth = month === 11;
      const status = currentMonth && index === 4 ? "Partially Paid"
        : currentMonth && index === 7 ? "Pending" : "Paid";
      const invoiceId = String(2100 + index * 12 + offset);
      const amountPaid = status === "Paid" ? price
        : status === "Partially Paid" ? Math.floor(price / 2) : 0;
      const date = `2026-${String(month).padStart(2, "0")}-${joined.slice(-2)}`;
      return [
        "SAA-" + invoiceId, name, String(price), status, date,
        methods[(index + offset) % methods.length], String(amountPaid),
        status === "Pending" ? "" : "TX-" + invoiceId, plan,
      ];
    });
  });

export const demoSupport = [
  ["Add a fifth branch", "Peak District Gym", "Normal", "Open", "Priya Shah", "2026-11-23"],
  ["Confirm account activation", "Northstar Performance", "Normal", "Open", "Priya Shah", "2026-11-22"],
  ["Update billing contact", "Latitude Wellness", "Normal", "In progress", "Jordan Lee", "2026-11-21"],
  ["Resolve duplicate invoice reminder", "Redwood Barbell", "High", "In progress", "Jordan Lee", "2026-11-19"],
  ["Set up branch manager permissions", "Westbridge Athletics", "Normal", "Resolved", "Priya Shah", "2026-11-17"],
];
