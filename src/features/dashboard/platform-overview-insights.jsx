import Link from "next/link";
import ReportBreakdown from "@/features/billing/report-breakdown";
import { collectionsByPlan } from "@/features/platform/platform-metrics";
import { matchesPeriod, summarize } from "@/shared/lib/reporting";
import Records from "@/shared/ui/records";
import { inr } from "@/features/billing/gym-finance";

const planColors = ["#3b3923", "#807b50", "#b2a674", "#c3aa8f", "#9a826c"];
const monthLabel = new Intl.DateTimeFormat("en-IN", { month: "short", timeZone: "UTC" });

function PlanMix({ rows }) {
  const total = rows.reduce((sum, row) => sum + row.value, 0);
  const title = "Collections by plan";
  const caption = "Net collections this month by current plan";
  if (total <= 0 || rows.some(({ value }) => value < 0)) {
    return <ReportBreakdown title={title} caption={caption} rows={rows} />;
  }

  let position = 0;
  const plans = [...rows].sort((a, b) => b.value - a.value).map((row, index) => {
    const start = position;
    position += row.value / total * 100;
    const color = planColors[index % planColors.length];
    return { ...row, color, share: position - start, segment: `${color} ${start}% ${position}%` };
  });

  return (
    <section className="panel">
      <header className="panel-header"><div><h2>{title}</h2><p>{caption}</p></div></header>
      <div className="platform-plan-mix">
        <div className="platform-plan-donut" style={{ backgroundImage: `conic-gradient(${plans.map(({ segment }) => segment).join(", ")})` }}>
          <div><strong>{inr(total)}</strong><span>Total collected</span></div>
        </div>
        <ul className="platform-plan-legend">
          {plans.map(({ key, color, label, share }) => (
            <li key={key}>
              <span className="platform-plan-swatch" aria-hidden="true" style={{ backgroundColor: color }} />
              <span>{key}<small>{share.toFixed(1)}%</small></span>
              <strong>{label}</strong>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function TenantOnboarding({ rows }) {
  const months = rows.slice(-12);
  const maximum = Math.max(1, ...months.map(({ value }) => value));
  return (
    <section className="panel">
      <header className="panel-header">
        <div><h2>Tenant onboarding</h2><p>New tenants by onboarding month</p></div>
      </header>
      {months.length ? (
        <ul className="platform-onboarding-columns" style={{ "--month-count": months.length }}>
          {months.map(({ key, value }) => (
            <li key={key}>
              <div className="platform-onboarding-track">
                <div style={{ "--column-height": value / maximum * 100 + "%" }}>
                  <strong>{value}</strong>
                </div>
              </div>
              <time dateTime={key} title={key}>{monthLabel.format(new Date(key + "-01T00:00:00Z"))}</time>
            </li>
          ))}
        </ul>
      ) : <p className="finance-chart-empty">No dated onboarding records.</p>}
    </section>
  );
}

export default function PlatformOverviewInsights({ tenants, subscriptions, payments }) {
  const monthlyCollections = payments.filter(({ values }) =>
    matchesPeriod(values[4], "This Month"),
  );
  const tenantGrowth = summarize(
    tenants.filter(({ values }) => /^\d{4}-(0[1-9]|1[0-2])-\d{2}$/.test(values[6] ?? "")),
    (values) => values[6].slice(0, 7),
    () => 1,
  );
  const renewals = subscriptions.filter(({ values }) =>
    ["Active", "Trial"].includes(values[4]) &&
    matchesPeriod(values[3], "Next 30 Days"),
  ).sort((a, b) => a.values[3].localeCompare(b.values[3]));

  return (
    <div className="overview-tables">
      <PlanMix rows={collectionsByPlan(monthlyCollections, tenants, subscriptions)} />
      <TenantOnboarding rows={tenantGrowth} />
      <section className="panel platform-renewal-preview">
        <div className="panel-header">
          <div>
            <h2>Upcoming renewals</h2>
            <p>{renewals.length} subscriptions and trials due in the next 30 days</p>
          </div>
          <Link className="button secondary" href="/platform/subscription-renewals">
            View renewals
          </Link>
        </div>
        <Records
          headings={["Tenant", "Plan", "Renewal date", "Status"]}
          records={renewals.slice(0, 5).map((record) => ({
            ...record,
            values: [record.values[0], record.values[1], record.values[3], record.values[4]],
          }))}
        />
      </section>
    </div>
  );
}
