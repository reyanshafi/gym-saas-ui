export const gymProfiles = {
  staff: {
    related: [
      { key: "staff-compensation", nameColumn: 0 },
      { key: "staff-leave", nameColumn: 0 },
    ],
  },
  branches: {
    related: [
      { key: "members", nameColumn: 2 },
      { key: "staff", nameColumn: 2 },
      { key: "expenses", nameColumn: 5 },
    ],
  },
};

export const profiles = {
  finance: { related: [] },
  "feature-overrides": { related: [] },
  members: {
    fields: [
      { label: "Email", type: "email", optional: true },
      { label: "Phone", type: "tel", optional: true },
      { label: "Joined date", type: "date", optional: true },
      {
        label: "Gender",
        type: "text",
        optional: true,
        options: ["", "Male", "Female", "Other", "Prefer not to say"],
      },
      { label: "Date of birth", type: "date", optional: true },
      { label: "Address", type: "text", optional: true },
      { label: "Emergency contact", type: "text", optional: true },
      { label: "Photo URL", type: "url", optional: true },
    ],
    related: [
      { key: "member-subscriptions", nameColumn: 0 },
      { key: "renewals", nameColumn: 0 },
      { key: "finance", nameColumn: 1 },
    ],
  },
  tenants: {
    fields: [
      { label: "Contact name", type: "text", optional: true },
      { label: "Contact email", type: "email", optional: true },
      { label: "Onboarded date", type: "date", optional: true },
    ],
    related: [
      { key: "billing", nameColumn: 0 },
      { key: "finance", nameColumn: 1 },
      { key: "support", nameColumn: 1 },
    ],
  },
};
