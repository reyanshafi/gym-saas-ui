const recordLabels = {
  members: "member",
  memberships: "membership plan",
  finance: "invoice",
  branches: "branch",
  staff: "staff member",
  settings: "setting",
  tenants: "tenant",
  subscriptions: "subscription plan",
  modules: "module",
  renewals: "renewal",
  expenses: "expense",
  billing: "tenant subscription",
  support: "support ticket",
  access: "team member",
  inventory: "product",
  notifications: "communication item",
  "member-subscriptions": "membership",
  roles: "role",
  "plan-categories": "plan category",
  "expense-categories": "expense category",
  "recurring-expenses": "recurring expense",
  "staff-compensation": "compensation entry",
  "staff-leave": "leave request",
  "product-categories": "product category",
  suppliers: "supplier",
  purchases: "purchase",
};

const statuses = {
  members: ["Active", "Expiring", "Expired", "Paused", "Archived"],
  finance: ["Pending", "Paid", "Overdue", "Void"],
  tenants: ["Active", "Trial", "Suspended"],
  renewals: ["Due", "Overdue", "Renewed"],
  expenses: ["Pending", "Paid", "Void"],
  billing: ["Active", "Trial", "Past due", "Canceled"],
  support: ["Open", "In progress", "Resolved"],
  access: ["Active", "Invited", "Disabled"],
  "member-subscriptions": ["Active", "Frozen", "Expired", "Cancelled"],
  "staff-leave": ["Pending", "Approved", "Rejected"],
  "staff-compensation": ["Pending", "Paid"],
  memberships: ["Active", "Inactive", "Archived"],
  notifications: ["Draft", "Active", "Disabled"],
};

export function getSectionFields(sectionId, headings, portal) {
  return headings.map((label, index) => {
    let options;
    if (label === "Status")
      options =
        portal === "gym" && sectionId === "finance"
          ? [
              "Pending",
              "Paid",
              "Partially Paid",
              "Overdue",
              "Failed",
              "Cancelled",
              "Adjustment",
            ]
          : (statuses[sectionId] ?? ["Active", "Inactive"]);
    if (label === "Term")
      options = ["Monthly", "Quarterly", "Half-Yearly", "Annual", "Custom"];
    if (sectionId === "modules" && index > 0)
      options = ["Included", "Unavailable"];
    if (label === "Billing cycle") options = ["Monthly", "Annual"];
    if (label === "Payment method")
      options = ["Cash", "UPI", "Card", "Bank transfer", "Other"];
    if (label === "Gender eligibility")
      options = ["All genders", "Male", "Female", "Other"];
    if (label === "Recurrence" || label === "Frequency")
      options = ["One-time", "Weekly", "Monthly", "Quarterly", "Annual"];
    if (label === "Audience")
      options = ["Members", "Staff", "Members and staff"];
    if (sectionId === "staff-compensation" && label === "Type")
      options = ["Salary", "Commission", "Bonus"];
    if (label === "Channel") options = ["Email", "SMS", "WhatsApp"];
    if (label === "Kind")
      options = ["Draft message", "Template", "Automation rule"];
    if (label === "Priority") options = ["Low", "Normal", "High", "Urgent"];
    if (sectionId === "access" && label === "Role")
      options = ["Super Admin", "Support", "Billing"];
    const type = label.endsWith(" date")
      ? "date"
      : label.endsWith("email") || label === "Email"
        ? "email"
        : "text";
    return {
      label,
      options,
      type,
      optional:
        portal === "gym" &&
        ((sectionId === "finance" && headings.indexOf(label) >= 6) ||
          (["memberships", "staff", "branches"].includes(sectionId) &&
            headings.indexOf(label) >= 4) ||
          (sectionId === "expenses" && headings.indexOf(label) >= 5)),
    };
  });
}

export function getRecordLabel(sectionId) {
  return recordLabels[sectionId];
}
