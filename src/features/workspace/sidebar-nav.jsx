import Link from "next/link";
import { LayoutDashboard } from "lucide-react";
import { workspaceNavigation } from "@/features/workspace/workspace-navigation";

export default function SidebarNav({ id, sections, current, onNavigate }) {
  const groups = [["Dashboard", [["", []]]], ...workspaceNavigation[id]];
  return (
    <nav className="workspace-icon-nav" aria-label="Workspace navigation">
      {groups.map(([group, links]) => (
        <div className="nav-group" key={group}>
          {group !== "Dashboard" && <div className="nav-label sidebar-text">{group}</div>}
          {links.map(([key, children]) => {
            const [Icon, label] = key
              ? sections[key]
              : [LayoutDashboard, "Dashboard"];
            const currentPage = (current ?? "") === key;
            const currentModule = children.includes(current);
            return (
              <Link
                key={key}
                href={key ? `/${id}/${key}` : `/${id}`}
                aria-current={
                  currentPage ? "page" : currentModule ? "location" : undefined
                }
                title={label}
                aria-label={label}
                onClick={onNavigate}
              >
                <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
                <span className="sidebar-text">{label}</span>
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
