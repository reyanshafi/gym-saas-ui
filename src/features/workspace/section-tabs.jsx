import Link from "next/link";
import {
  getModuleTabs,
  workspacePageLabel,
} from "@/features/workspace/workspace-navigation";

export default function SectionTabs({ portal, section, sections }) {
  const keys = getModuleTabs(portal, section);
  if (!keys.length) return null;
  return (
    <nav className="workspace-section-tabs" aria-label="Module pages">
      {keys.map((key) => (
        <Link
          key={key}
          href={`/${portal}/${key}`}
          aria-current={key === section ? "page" : undefined}
        >
          {workspacePageLabel(portal, sections, key)}
        </Link>
      ))}
    </nav>
  );
}
