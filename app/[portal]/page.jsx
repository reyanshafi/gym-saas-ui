import { notFound } from "next/navigation";
import Portal from "../_components/portal";
import { portals } from "../_data/portals";

export default async function Page({ params }) {
  const { portal } = await params;
  if (!Object.hasOwn(portals, portal)) notFound();
  return <Portal id={portal} />;
}
