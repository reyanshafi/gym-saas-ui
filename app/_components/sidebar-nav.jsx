import Link from "next/link";
import { LayoutDashboard } from "lucide-react";

import { gymNavigation } from "../_data/gym";

const groups = {
  gym: gymNavigation,
  platform: [
    ["Platform operations", ["tenants", "subscriptions", "modules"]],
    ["Service", ["support", "access"]],
    ["Billing", ["billing", "finance", "settings"]],
  ],
};

export default function SidebarNav({ id, sections, current, onNavigate }) {
  const navigation = [["", [""]], ...groups[id]];

  return (
    <nav aria-label="Workspace navigation">
      {navigation.map(([group, keys]) => (
        <div className="nav-group" key={group}>
          {group && <div className="nav-label sidebar-text">{group}</div>}
          {keys.map((key) => {
            const [Icon, label] = key
              ? sections[key]
              : [LayoutDashboard, id === "gym" ? "Dashboard" : "Overview"];
            return (
              <Link
                key={key}
                href={key ? `/${id}/${key}` : `/${id}`}
                aria-current={(current ?? "") === key ? "page" : undefined}
                title={label}
                aria-label={label}
                onClick={onNavigate}
              >
                <Icon size={17} strokeWidth={1.8} aria-hidden="true" />
                <span className="sidebar-text">{label}</span>
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
