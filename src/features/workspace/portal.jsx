"use client";

import { CalendarDays } from "lucide-react";
import { portals } from "@/data/catalog/portals";
import { GymDashboard } from "@/features/dashboard/gym-dashboard";
import { GymReports } from "@/features/billing/gym-reports";
import SectionRecords from "@/features/records/section-records";
import Dashboard from "@/features/dashboard/dashboard";
import {
  PlatformRevenue,
  TenantDirectory,
} from "@/features/platform/platform-pages";
import PlatformSettings from "@/features/platform/platform-settings";
import SectionTabs from "@/features/workspace/section-tabs";

export default function Portal({
  id,
  section,
  add,
  search,
  memberId,
  tenantId,
  page,
}) {
  const data = portals[id];
  const source = page?.source ?? section;
  const active = source ? data.sections[source] : null;
  const currentPage = page?.title ?? active?.[1];

  return (
    <main className="content">
      <div className="page-heading">
        <div>
          <h1>
            {active
              ? currentPage
              : id === "gym"
                ? data.workspace
                : "Platform overview"}
          </h1>
          <p>{active?.[2] ?? data.summary}</p>
        </div>
        {!active && (
          <div className="date">
            <CalendarDays size={17} /> November 2026
          </div>
        )}
      </div>
      <SectionTabs portal={id} section={section} sections={data.sections} />
      {id === "gym" && section === "reports" ? (
        <GymReports sections={data.sections} />
      ) : id === "platform" && section === "settings" ? (
        <PlatformSettings />
      ) : page?.view === "tenant" ? (
        <TenantDirectory sections={data.sections} tenantId={tenantId} />
      ) : page?.view ? (
        <PlatformRevenue
          sections={data.sections}
          byPlan={page.view === "plan-revenue"}
        />
      ) : active ? (
        <SectionRecords
          initialAdd={add}
          memberId={memberId}
          initialSearch={search}
          key={section}
          portal={id}
          page={page}
          sectionId={source}
          section={active}
        />
      ) : id === "gym" ? (
        <GymDashboard data={data} />
      ) : (
        <Dashboard id={id} data={data} />
      )}
    </main>
  );
}
