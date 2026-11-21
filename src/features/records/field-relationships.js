const branch = { section: "branches" };
const plan = { section: "memberships" };
const member = { section: "members" };
const staff = { section: "staff" };
const expenseCategory = { section: "expense-categories" };
const tenant = { section: "tenants" };
const subscription = { section: "subscriptions" };

const relationships = {
  gym: {
    members: { Branch: branch, Membership: plan },
    memberships: {
      Category: { section: "plan-categories" },
      "Branch availability": { ...branch, extra: "All branches" },
    },
    "member-subscriptions": { Member: member, Plan: plan },
    renewals: { Member: member, Membership: plan },
    finance: {
      Member: member,
      "Membership reference": {
        section: "member-subscriptions",
        byMember: true,
      },
    },
    expenses: { Category: expenseCategory, Branch: branch },
    "recurring-expenses": { Category: expenseCategory },
    staff: {
      Branch: { ...branch, extra: "All branches" },
      Role: { section: "roles" },
    },
    branches: { Manager: staff },
    "staff-compensation": { "Staff member": staff },
    "staff-leave": { "Staff member": staff },
    inventory: {
      Category: { section: "product-categories" },
      Supplier: { section: "suppliers" },
    },
    purchases: {
      Product: { section: "inventory" },
      Supplier: { section: "suppliers" },
    },
  },
  platform: {
    tenants: { Subscription: subscription },
    billing: { Tenant: tenant, Plan: subscription },
    finance: { Tenant: tenant },
    "feature-overrides": { Tenant: tenant, Feature: { section: "modules" } },
    support: { Tenant: tenant, Assignee: { section: "access" } },
  },
};

export function getRelationship(portal, section, field) {
  return relationships[portal]?.[section]?.[field];
}
