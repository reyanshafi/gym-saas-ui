import { notFound } from "next/navigation";
import { portals } from "@/data/catalog/portals";
import WorkspaceShell from "@/features/workspace/workspace-shell";

export default async function PortalLayout({ children, params }) {
  const { portal } = await params;
  if (!Object.hasOwn(portals, portal)) notFound();

  return <WorkspaceShell key={portal} id={portal}>{children}</WorkspaceShell>;
}
