import { gymNavigation } from "@/data/catalog/gym";
import {
  platformNavigation,
  platformPages,
} from "@/data/catalog/platform-pages";

const gymSubpages = {
  members: ["renewals"],
  memberships: ["member-subscriptions", "plan-categories"],
  expenses: ["expense-categories", "recurring-expenses"],
  staff: ["staff-compensation", "staff-leave"],
  inventory: ["product-categories", "suppliers", "purchases"],
};

export const workspaceNavigation = {
  gym: gymNavigation.map(([group, keys]) => [
    group,
    keys.map((key) => [key, gymSubpages[key] ?? []]),
  ]),
  platform: platformNavigation,
};

export function workspacePageLabel(portal, sections, key) {
  return (
    (portal === "platform" ? platformPages[key]?.title : undefined) ??
    sections[key][1]
  );
}

export function getModuleTabs(portal, section) {
  if (!section) return [];
  const entry = workspaceNavigation[portal]
    .flatMap(([, entries]) => entries)
    .find(([key, children]) => key === section || children.includes(section));
  return entry?.[1].length ? [entry[0], ...entry[1]] : [];
}
