import { gymSubsections } from "./gym-subsections";
import {
  BarChart3,
  Bell,
  Boxes,
  History,
  ShieldCheck,
  CreditCard,
} from "lucide-react";

export const gymNavigation = [
  ["Gym Management", ["members", "memberships"]],
  ["Finance & Accounting", ["finance", "expenses", "reports"]],
  ["Business Operations", ["staff", "inventory", "branches"]],
  ["Communication", ["notifications"]],
  ["Administration", ["roles", "activity", "settings"]],
];

export const gymSections = {
  ...gymSubsections,
  "member-subscriptions": [
    CreditCard,
    "Member Memberships",
    "Manage individual purchases and membership lifecycle.",
    ["Member", "Plan", "Start date", "End date", "Status"],
    [["Aarav Sharma", "Annual Pro", "2026-10-12", "2027-10-12", "Active"]],
  ],
  inventory: [
    Boxes,
    "Inventory",
    "Track products, stock levels, and suppliers.",
    ["Product", "Category", "Stock", "Reorder level", "Supplier"],
    [
      ["Whey protein", "Supplements", "6", "10", "Peak Nutrition"],
      ["Training gloves", "Accessories", "24", "8", "Summit Supply"],
    ],
  ],
  notifications: [
    Bell,
    "Notifications & Reminders",
    "Manage communication drafts, templates, and reminder rules.",
    ["Message", "Channel", "Audience", "Kind", "Status"],
    [
      [
        "Membership expiring soon",
        "Email",
        "Members",
        "Automation rule",
        "Active",
      ],
      ["Payment due", "WhatsApp", "Members", "Template", "Draft"],
    ],
  ],
  roles: [
    ShieldCheck,
    "Roles & Permissions",
    "Review and configure gym staff roles.",
    ["Role", "Permissions"],
    [
      ["Owner", "All permissions"],
      ["Admin", "View, Create, Edit, Manage Staff"],
      ["Manager", "View, Edit, View Reports"],
      ["Receptionist", "View, Create, Manage Payments"],
      ["Accountant", "View, Manage Payments, View Reports"],
      ["Inventory Manager", "View, Manage Inventory"],
    ],
  ],
  activity: [
    History,
    "Activity Logs",
    "Review administrative activity in this browser.",
    ["Event", "User", "Module", "Date", "Branch"],
    [],
  ],
  reports: [
    BarChart3,
    "Financial Reports",
    "Review payments, expenses, and membership performance.",
    [],
    [],
  ],
};
