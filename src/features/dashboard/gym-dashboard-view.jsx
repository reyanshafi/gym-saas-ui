import { useState } from "react";
import Link from "next/link";
import {
  Bell,
  Building2,
  CalendarClock,
  CircleDollarSign,
  HandCoins,
  ChevronRight,
  ClipboardList,
  CreditCard,
  Receipt,
  UserCheck,
  UserPlus,
  Users,
  UserX,
  Wallet,
} from "lucide-react";
import RevenueArea from "@/features/dashboard/revenue-area";
import { inr } from "@/features/billing/gym-finance";

const metrics = [
  [Users, "members"],
  [UserCheck, "members"],
  [UserX, "members"],
  [UserPlus, "members"],
  [CalendarClock, "renewals"],
  [HandCoins, "finance"],
  [Wallet, "reports"],
  [CircleDollarSign, "finance"],
];
const actions = [
  ["Add New Member", "members", UserPlus],
  ["Create Membership", "member-subscriptions", ClipboardList],
  ["Collect Payment", "finance", CreditCard],
  ["Add Expense", "expenses", Receipt],
  ["Add Staff Member", "staff", Users],
];
const compact = new Intl.NumberFormat("en-IN", {
  notation: "compact",
  maximumFractionDigits: 1,
});
const monthFormat = new Intl.DateTimeFormat("en-IN", {
  month: "short",
  timeZone: "UTC",
});

export default function GymDashboardView({ totals, charts, alerts, feed }) {
  const [range, setRange] = useState(3);
  const [revenue, growth, plans, expenses, branches] = charts;
  const observedMonths = [revenue, growth, expenses]
    .flatMap(([, rows]) => rows.map(({ key }) => key))
    .filter((key) => /^\d{4}-\d{2}$/.test(key))
    .sort();
  const lastMonth = observedMonths.at(-1);
  const periods = lastMonth
    ? Array.from({ length: range }, (_, index) => {
        const [year, month] = lastMonth.split("-").map(Number);
        return new Date(Date.UTC(year, month - range + index, 1))
          .toISOString()
          .slice(0, 7);
      })
    : [];

  return (
    <div className="gym-overview">
      <div className="panel gym-kpis">
        {totals.map(([label, value, detail], index) => {
          const [Icon, destination] = metrics[index];
          return (
            <Link
              href={`/gym/${destination}`}
              className="gym-kpi"
              data-tone={
                [
                  "primary",
                  "primary",
                  "rose",
                  "blue",
                  "amber",
                  "blue",
                  "primary",
                  "amber",
                ][index]
              }
              key={label}
            >
              <span className="gym-kpi-icon">
                <Icon size={18} />
              </span>
              <div className="gym-kpi-copy">
                <span>{label}</span>
                <strong>{value}</strong>
                <small className="gym-kpi-detail">
                  {detail.delta && (
                    <b data-trend={detail.trend}>{detail.delta}</b>
                  )}{" "}
                  {detail.context}
                </small>
              </div>
            </Link>
          );
        })}
      </div>
      <section className="gym-analytics" aria-label="Analytics">
        <header className="gym-overview-heading">
          <div>
            <h2>Performance</h2>
            <p>Collections, membership growth, and operating costs</p>
          </div>
          <label className="gym-range">
            Trend range{" "}
            <select
              className="filter-select"
              value={range}
              onChange={(event) => setRange(Number(event.target.value))}
            >
              <option value={3}>3 months</option>
              <option value={6}>6 months</option>
              <option value={12}>12 months</option>
            </select>
          </label>
        </header>
        <div className="gym-chart-grid gym-chart-featured">
          <Trend
            title={revenue[0]}
            rows={revenue[1]}
            periods={periods}
            currency
            featured
          />
          <section
            className="panel gym-quick-actions"
            aria-label="Quick actions"
          >
            <div className="panel-header">
              <h2>Quick actions</h2>
            </div>
            <div className="gym-action-grid">
              {actions.map(([label, key, Icon], index) => (
                <Link
                  className="gym-action-tile"
                  data-primary={index === 0 || undefined}
                  key={key}
                  href={`/gym/${key}?add=1`}
                >
                  <span className="gym-action-icon">
                    <Icon size={18} aria-hidden="true" />
                  </span>
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          </section>
        </div>
        <div className="gym-chart-grid">
          <Trend title={growth[0]} rows={growth[1]} periods={periods} />
          <Trend
            title={expenses[0]}
            rows={expenses[1]}
            periods={periods}
            currency
            tone="amber"
          />
        </div>
        <div className="gym-chart-grid">
          <PlanRevenue title={plans[0]} rows={plans[1]} />
          <BranchMemberships title={branches[0]} rows={branches[1]} />
        </div>
      </section>
      <div className="gym-chart-grid">
        <section className="panel gym-overview-list">
          <div className="panel-header">
            <h2>
              <Bell size={18} /> Important alerts
            </h2>
          </div>
          {alerts.map(([label, value, key]) => (
            <Link href={`/gym/${key}`} key={label}>
              <span>{label}</span>
              <strong className={value ? "attention" : ""}>{value}</strong>
            </Link>
          ))}
          <Link href="/gym/settings">
            <span>SaaS subscription renewal</span>
            <strong>Demo</strong>
          </Link>
        </section>
        <section className="panel gym-overview-list">
          <div className="panel-header">
            <h2>
              <Building2 size={18} /> Recent activity
            </h2>
          </div>
          {feed.map(([title, key, rows]) => (
            <Link key={key} href={`/gym/${key}`}>
              <span>
                {title}
                <small>
                  {rows
                    .slice(0, 2)
                    .map(({ values }) => values[0])
                    .join(", ") || "No activity yet"}
                </small>
              </span>
              <ChevronRight size={17} />
            </Link>
          ))}
        </section>
      </div>
    </div>
  );
}

function ChartCard({
  title,
  caption,
  children,
  featured,
  summary,
  summaryLabel = "Period total",
}) {
  return (
    <section
      className="panel gym-data-card"
      data-featured={featured || undefined}
    >
      <div className="panel-header">
        <div>
          <h3>{title}</h3>
          <p>{caption}</p>
        </div>
        {summary && (
          <div className="gym-chart-summary">
            <span>{summaryLabel}</span>
            <strong>{summary}</strong>
          </div>
        )}
      </div>
      {children}
    </section>
  );
}

function Trend({ title, rows, periods, currency, tone, featured }) {
  const byMonth = new Map(rows.map(({ key, value }) => [key, value]));
  const values = periods.map((key) => byMonth.get(key) ?? 0);
  const format = currency ? inr : String;
  const previousPeriods = featured
    ? periods.map((key) => {
        const [year, month] = key.split("-").map(Number);
        return new Date(Date.UTC(year, month - 1 - periods.length, 1))
          .toISOString()
          .slice(0, 7);
      })
    : [];
  const previous = previousPeriods.some((key) => byMonth.has(key))
    ? previousPeriods.map((key) => byMonth.get(key) ?? 0)
    : undefined;
  const maximum = Math.max(...values, ...(previous ?? []), currency ? 1 : 4);
  const minimum = Math.min(...values, ...(previous ?? []), 0);
  const step = Math.max(
    1,
    10 ** Math.floor(Math.log10((maximum - minimum) / 4)),
  );
  const high = currency
    ? Math.ceil(maximum / step) * step
    : Math.ceil(maximum / 4) * 4;
  const low = Math.floor(minimum / step) * step;
  const span = high - low;
  const zero = (-low / span) * 100;
  const ticks = Array.from(
    { length: 5 },
    (_, index) => high - (index * span) / 4,
  );
  return (
    <ChartCard
      title={title}
      featured={featured}
      summary={
        featured && values.length
          ? format(values.reduce((sum, value) => sum + value, 0))
          : undefined
      }
      caption={currency ? "INR per month" : "New members per month"}
    >
      {previous && (
        <div className="gym-revenue-legend">
          <span>Selected period</span>
          <span>Previous period</span>
        </div>
      )}
      {values.length ? (
        <div className="gym-trend">
          <div className="gym-axis" aria-hidden="true">
            {ticks.map((value) => (
              <span key={value}>
                {currency && value !== 0 ? "₹" : ""}
                {compact.format(value)}
              </span>
            ))}
          </div>
          <div
            className="gym-plot"
            data-tone={tone}
            data-range={values.length}
            style={{ "--period-count": values.length, "--zero": zero + "%" }}
          >
            {featured && (
              <RevenueArea
                values={values}
                previous={previous}
                low={low}
                span={span}
              />
            )}
            {periods.map((key, index) => {
              const value = values[index];
              const month = monthFormat.format(new Date(key + "-01T00:00:00Z"));
              return (
                <div
                  className="gym-month"
                  key={key}
                  tabIndex={0}
                  role="img"
                  aria-label={
                    key +
                    ": " +
                    format(value) +
                    (previous
                      ? "; " +
                        previousPeriods[index] +
                        ": " +
                        format(previous[index])
                      : "")
                  }
                >
                  {featured ? (
                    <span
                      className="gym-revenue-dot"
                      style={{ bottom: ((value - low) / span) * 100 + "%" }}
                    />
                  ) : (
                    <span
                      className="gym-column"
                      style={{
                        bottom:
                          (value < 0 ? ((value - low) / span) * 100 : zero) +
                          "%",
                        height: (Math.abs(value) / span) * 100 + "%",
                      }}
                    />
                  )}
                  <span className="gym-chart-value">
                    {format(value)}
                    {previous && (
                      <small>Previous {format(previous[index])}</small>
                    )}
                  </span>
                  <span className="gym-month-label">{month}</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <p className="gym-chart-empty">No dated records to chart.</p>
      )}
    </ChartCard>
  );
}

const planColors = ["#193e76", "#527fbd", "#8eaad4", "#476f9d", "#7686b2"];
const percent = new Intl.NumberFormat("en-IN", {
  style: "percent",
  maximumFractionDigits: 1,
});

function PlanRevenue({ title, rows }) {
  const sorted = [...rows].sort((a, b) => b.value - a.value);
  const positiveTotal = rows.reduce(
    (sum, { value }) => sum + Math.max(0, value),
    0,
  );
  const net = rows.reduce((sum, { value }) => sum + value, 0);
  return (
    <ChartCard
      title={title}
      caption="Net collections by plan"
      summaryLabel="Net total"
      summary={rows.length ? inr(net) : undefined}
    >
      {rows.length ? (
        <div className="gym-plan-chart">
          {positiveTotal > 0 && (
            <div
              className="gym-plan-strip"
              aria-label="Share of positive plan revenue"
              role="group"
            >
              {sorted.map(
                ({ key, value }, index) =>
                  value > 0 && (
                    <div
                      key={key}
                      tabIndex={0}
                      className="gym-plan-segment"
                      style={{
                        flexGrow: value / positiveTotal,
                        background: planColors[index % planColors.length],
                      }}
                      aria-label={
                        key + ": " + percent.format(value / positiveTotal)
                      }
                    />
                  ),
              )}
            </div>
          )}
          <ul className="gym-plan-legend">
            {sorted.map(({ key, value, label }, index) => (
              <li key={key}>
                <span
                  className="gym-plan-key"
                  style={{
                    background:
                      value > 0
                        ? planColors[index % planColors.length]
                        : value < 0
                          ? "#a45259"
                          : "#c1cad8",
                  }}
                  aria-hidden="true"
                />
                <span>{key}</span>
                <span className="gym-plan-share">
                  {positiveTotal > 0 && value >= 0
                    ? percent.format(value / positiveTotal)
                    : ""}
                </span>
                <strong>{label}</strong>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="gym-chart-empty">No plan revenue to compare.</p>
      )}
    </ChartCard>
  );
}

function BranchMemberships({ title, rows }) {
  const max = Math.max(1, ...rows.map(({ total }) => total));
  return (
    <ChartCard title={title} caption="Active and other members by branch">
      {rows.length ? (
        <div className="gym-branch-chart">
          <div className="gym-branch-legend">
            <span>Active</span>
            <span>Other</span>
          </div>
          <div
            className="gym-branch-plot"
            style={{ "--branch-count": rows.length }}
          >
            {rows.map(({ key, total, active }) => (
              <div
                className="gym-branch-point"
                key={key}
                tabIndex={0}
                role="img"
                aria-label={`${key}: ${active} active, ${total - active} other`}
              >
                <div
                  className="gym-branch-stack"
                  style={{ height: (total / max) * 100 + "%" }}
                >
                  <span className="gym-branch-total">{total}</span>
                  {total - active > 0 && (
                    <span
                      className="gym-branch-other"
                      style={{ flexGrow: total - active }}
                    />
                  )}
                  {active > 0 && (
                    <span
                      className="gym-branch-active"
                      style={{ flexGrow: active }}
                    />
                  )}
                </div>
                <span className="gym-branch-label" title={key}>
                  {key}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="gym-chart-empty">No members to compare by branch.</p>
      )}
    </ChartCard>
  );
}
