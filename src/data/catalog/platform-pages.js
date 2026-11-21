import { Activity, BarChart3, Settings2 } from "lucide-react";

export const platformPages = {
  "tenant-onboarding": {
    source: "tenants",
    title: "Onboard tenant",
    create: true,
  },
  "tenant-details": {
    source: "tenants",
    title: "Tenant details",
    view: "tenant",
  },
  "tenant-access": {
    source: "tenants",
    title: "Tenant access",
    manageAccess: true,
  },
  "plan-create": {
    source: "subscriptions",
    title: "Create subscription plan",
    create: true,
  },
  "plan-archive": {
    source: "subscriptions",
    title: "Archived plans",
    statuses: ["Archived"],
  },
  "subscription-create": {
    source: "billing",
    title: "Add subscription",
    create: true,
  },
  "subscription-renewals": {
    source: "billing",
    title: "Subscription renewals",
    statuses: ["Active", "Trial", "Past due"],
    sortColumn: "Renewal date",
  },
  "payment-create": {
    source: "finance",
    title: "Record payment",
    create: true,
  },
  "payment-outstanding": {
    source: "finance",
    title: "Outstanding invoices",
    statuses: ["Pending", "Partially Paid", "Overdue"],
  },
  revenue: { title: "Revenue Analytics", view: "revenue" },
  "revenue-by-plan": { title: "Revenue by plan", view: "plan-revenue" },
  "feature-overrides": { title: "Tenant feature overrides" },
  "support-queue": {
    source: "support",
    title: "Open support queue",
    statuses: ["Open", "In progress"],
  },
  audit: { title: "Audit Logs", readOnly: true },
};

export const platformNavigation = [
  [
    "Customers",
    [
      ["tenants", ["tenant-onboarding", "tenant-details", "tenant-access"]],
      ["support", ["support-queue"]],
    ],
  ],
  [
    "Billing",
    [
      ["subscriptions", ["plan-create", "plan-archive"]],
      ["billing", ["subscription-create", "subscription-renewals"]],
      ["finance", ["payment-create", "payment-outstanding"]],
      ["revenue", ["revenue-by-plan"]],
    ],
  ],
  [
    "Administration",
    [
      ["modules", ["feature-overrides"]],
      ["settings", ["access"]],
      ["audit", []],
    ],
  ],
];

export const platformExtraSections = {
  revenue: [
    BarChart3,
    "Revenue Analytics",
    "Review recorded platform collections and open balances.",
    [],
    [],
  ],
  "revenue-by-plan": [
    BarChart3,
    "Revenue by plan",
    "Compare recorded collections by subscription plan.",
    [],
    [],
  ],
  "feature-overrides": [
    Settings2,
    "Tenant feature overrides",
    "Manage tenant-specific feature exceptions.",
    ["Tenant", "Feature", "Override", "Reason"],
    [],
  ],
  audit: [
    Activity,
    "Audit Logs",
    "Review Super Admin activity recorded in this browser.",
    ["Event", "User", "Module", "Date"],
    [],
  ],
};
