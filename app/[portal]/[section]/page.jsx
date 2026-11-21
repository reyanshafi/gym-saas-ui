import { notFound } from "next/navigation";
import Portal from "@/features/workspace/portal";
import { platformPages } from "@/data/catalog/platform-pages";
import { portals } from "@/data/catalog/portals";

export default async function Page({ params, searchParams }) {
  const { portal, section } = await params;
  const page =
    portal === "platform" && Object.hasOwn(platformPages, section)
      ? platformPages[section]
      : undefined;
  if (
    !Object.hasOwn(portals, portal) ||
    !Object.hasOwn(portals[portal].sections, page?.source ?? section)
  )
    notFound();
  const { add, q, member, tenant } = await searchParams;
  return (
    <Portal
      key={section + (add ?? "") + (q ?? "") + (member ?? "")}
      id={portal}
      section={section}
      page={page}
      tenantId={
        page?.view === "tenant" && typeof tenant === "string"
          ? tenant
          : undefined
      }
      memberId={
        portal === "gym" && section === "renewals" && typeof member === "string"
          ? member
          : undefined
      }
      search={typeof q === "string" ? q : ""}
      add={page?.create || (portal === "gym" && add === "1")}
    />
  );
}
