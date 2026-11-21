import Link from "next/link";
import { LayoutDashboard } from "lucide-react";
import { gymNavigation } from "@/data/catalog/gym";
import {
  platformNavigation,
  platformPages,
} from "@/data/catalog/platform-pages";

export default function SidebarNav({ id, sections, current, onNavigate }) {
  const groups =
    id === "gym"
      ? gymNavigation.map(([group, keys]) => [
          group,
          keys.map((key) => [key, []]),
        ])
      : platformNavigation;
  const navigation = [["", [["", []]]], ...groups];
  return (
    <nav aria-label="Workspace navigation">
      {navigation.map(([group, keys]) => (
        <div className="nav-group" key={group}>
          {group && <div className="nav-label sidebar-text">{group}</div>}
          {keys.map(([key, children]) => {
            const [Icon, label] = key
              ? sections[key]
              : [LayoutDashboard, "Dashboard"];
            const active = (current ?? "") === key;
            const activeChild = children.includes(current);
            return (
              <div key={key}>
                <Link
                  href={key ? `/${id}/${key}` : `/${id}`}
                  aria-current={active ? "page" : undefined}
                  data-section-active={activeChild || undefined}
                  title={label}
                  aria-label={label}
                  onClick={onNavigate}
                >
                  <Icon size={17} strokeWidth={1.8} aria-hidden="true" />
                  <span className="sidebar-text">{label}</span>
                </Link>
                {children.length > 0 && (active || activeChild) && (
                  <div className="nav-subpages sidebar-text">
                    {children.map((child) => (
                      <Link
                        key={child}
                        href={`/platform/${child}`}
                        aria-current={current === child ? "page" : undefined}
                        onClick={onNavigate}
                      >
                        {platformPages[child]?.title ?? sections[child][1]}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
