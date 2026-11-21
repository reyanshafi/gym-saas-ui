import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useRecords } from "../_data/use-records";
import Records from "./records";
import RevenueChart from "./revenue-chart";

export default function Dashboard({ id, data }) {
  return (
    <>
      <div className="metrics">
        {data.metrics.map(([label, value, change, Icon]) => {
          const increased = change.startsWith("+");
          return (
            <article className="metric" key={label}>
              <div className="metric-top">
                <p>{label}</p>
                <span className="metric-icon">
                  <Icon size={18} />
                </span>
              </div>
              <strong>{value}</strong>
              <small className={increased ? "positive" : ""}>
                {change}
                {increased && <span> vs. last month</span>}
              </small>
            </article>
          );
        })}
      </div>
      <div className="dashboard-grid">
        <RevenueChart title={data.revenue} values={data.chart} />
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
  const columns = [0, 1, headings.length - 1];
  const preview = records.slice(0, 4).map((record) => ({
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
