import { notFound } from "next/navigation";
import Portal from "@/features/workspace/portal";
import { portals } from "@/data/catalog/portals";

export default async function Page({ params }) {
  const { portal } = await params;
  if (!Object.hasOwn(portals, portal)) notFound();
  return <Portal id={portal} />;
}
