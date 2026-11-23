import Link from "next/link";
import { ArrowUpRight, ChevronRight } from "lucide-react";
import { useRecords } from "@/data/records/use-records";
import Records from "@/shared/ui/records";
import { platformMetrics } from "@/features/platform/platform-metrics";
import { paidAmount } from "@/features/billing/gym-finance";
import { summarize } from "@/shared/lib/reporting";
import RevenueChart from "@/features/dashboard/revenue-chart";
import PlatformOverviewInsights from "@/features/dashboard/platform-overview-insights";

export default function Dashboard({ id, data }) {
  const { records: tenants } = useRecords(
    id,
    "tenants",
    data.sections.tenants[4],
  );
  const { records: subscriptions } = useRecords(
    id,
    "billing",
    data.sections.billing[4],
  );
  const { records: payments } = useRecords(
    id,
    "finance",
    data.sections.finance[4],
  );
  const metrics = platformMetrics(tenants, subscriptions, payments);
  const revenue = summarize(payments, (v) => v[4]?.slice(0, 7), paidAmount);
  return (
    <>
      <div className="metrics overview-headlines" aria-label="Key platform metrics">
        {metrics.map(([label, value, change, Icon, destination]) => {
          const increased = change.startsWith("+");
          return (
            <Link
              className="metric metric-link"
              key={label}
              href={`/${id}/${destination}`}
            >
              <div className="metric-top">
                <p>{label}</p>
                <span className="metric-icon">
                  <Icon size={18} />
                </span>
              </div>
              <strong>{value}</strong>
              <small className={increased ? "positive" : ""}>{change}</small>
              <ArrowUpRight className="overview-kpi-arrow" size={16} aria-hidden="true" />
            </Link>
          );
        })}
      </div>
      <div className="dashboard-grid overview-spotlight">
        <RevenueChart title={data.revenue} rows={revenue} />
        <section className="panel dashboard-links">
          <div className="panel-header">
            <div>
              <h2>Quick access</h2>
            </div>
          </div>
          {data.shortcuts.map((key) => {
            const [Icon, label] = data.sections[key];
            return (
              <Link href={`/${id}/${key}`} key={key}>
                <span className="quick-icon">
                  <Icon size={17} />
                </span>
                <span>{label}</span>
                <ChevronRight size={16} className="quick-chevron" />
              </Link>
            );
          })}
        </section>
      </div>
      <PlatformOverviewInsights tenants={tenants} subscriptions={subscriptions} payments={payments} />
      <div className="overview-tables">
        <OverviewTable
          portal={id}
          sectionKey={data.recentKey}
          section={data.sections[data.recentKey]}
          title={data.recent}
        />
        <OverviewTable
          portal={id}
          sectionKey={data.activityKey}
          section={data.sections[data.activityKey]}
        />
      </div>
    </>
  );
}

function OverviewTable({ portal, sectionKey, section, title }) {
  const [, label, , headings, sampleRows] = section;
  const { records } = useRecords(portal, sectionKey, sampleRows);
  const columns = [0, 1, headings.indexOf("Status")].filter(
    (index) => index >= 0,
  );
  const dateColumn = sectionKey === "tenants" ? 6 : headings.indexOf("Opened date");
  const recentRecords = [...records].sort((a, b) =>
    (b.values[dateColumn] ?? "").localeCompare(a.values[dateColumn] ?? ""),
  );
  const preview = recentRecords.slice(0, 4).map((record) => ({
    ...record,
    values: columns.map((index) => record.values[index]),
  }));
  return (
    <section className="panel">
      <div className="panel-header">
        <h2>{title ?? label}</h2>
        <Link
          className="button secondary"
          href={`/${portal}/${sectionKey}`}
          aria-label={`View all ${label.toLowerCase()}`}
        >
          View all
        </Link>
      </div>
      <Records
        headings={columns.map((index) => headings[index])}
        records={preview}
      />
    </section>
  );
}
