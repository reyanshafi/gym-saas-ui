import { notFound } from "next/navigation";
import Portal from "../../_components/portal";
import { portals } from "../../_data/portals";

export default async function Page({ params, searchParams }) {
  const { portal, section } = await params;
  if (
    !Object.hasOwn(portals, portal) ||
    !Object.hasOwn(portals[portal].sections, section)
  )
    notFound();
  const { add, q, member } = await searchParams;
  return (
    <Portal
      key={section + (add ?? "") + (q ?? "") + (member ?? "")}
      id={portal}
      section={section}
      memberId={
        portal === "gym" && section === "renewals" && typeof member === "string"
          ? member
          : undefined
      }
      search={typeof q === "string" ? q : ""}
      add={portal === "gym" && add === "1"}
    />
  );
}
