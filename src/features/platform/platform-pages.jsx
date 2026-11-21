"use client";

import { useState } from "react";
import { useRecords } from "@/data/records/use-records";
import TenantPicker from "@/features/platform/tenant-picker";
import { profiles } from "@/features/records/profiles";
import { inr, paidAmount } from "@/features/billing/gym-finance";
import { matchesPeriod, summarize } from "@/shared/lib/reporting";
import { downloadCsv } from "@/shared/lib/csv";
import PageKpis from "@/shared/ui/page-kpis";
import { paymentKpis } from "@/features/records/section-kpis";
import Records from "@/shared/ui/records";

export function TenantDirectory({ sections, tenantId }) {
  const { records } = useRecords("platform", "tenants", sections.tenants[4]);
  const tenant = tenantId
    ? records.find((record) => record.id === tenantId)
    : records[0];
  const fields = [
    ...sections.tenants[3],
    ...profiles.tenants.fields.map((field) => field.label),
  ];
  return (
    <section className="panel">
      <div className="panel-header">
        <h2>{tenant?.values[0] ?? "Tenant profile"}</h2>
        <TenantPicker records={records} selected={tenant} />
      </div>
      {!tenant && (
        <div className="dialog-body">
          <p>
            {tenantId
              ? "This tenant could not be found. Select another tenant to view its details."
              : "No tenants have been added yet."}
          </p>
        </div>
      )}
      {tenant && (
        <div className="dialog-body">
          <dl className="profile-fields">
            {fields.slice(1).map((field, index) => (
              <div key={field}>
                <dt>{field}</dt>
                <dd>{tenant.values[index + 1] || "Not provided"}</dd>
              </div>
            ))}
          </dl>
          {records.filter(({ values }) => values[0] === tenant.values[0])
            .length === 1 ? (
            profiles.tenants.related.map(({ key, nameColumn }) => (
              <TenantRelated
                key={key}
                sectionKey={key}
                section={sections[key]}
                nameColumn={nameColumn}
                name={tenant.values[0]}
              />
            ))
          ) : (
            <p>Related records require a unique tenant name.</p>
          )}
        </div>
      )}
    </section>
  );
}

function TenantRelated({ sectionKey, section, nameColumn, name }) {
  const [, title, , columns, rows] = section;
  const { records } = useRecords("platform", sectionKey, rows);
  const shown = columns.slice(0, sectionKey === "finance" ? 6 : columns.length);
  return (
    <section className="profile-activity">
      <h3>{title}</h3>
      <Records
        headings={shown}
        records={records.filter(({ values }) => values[nameColumn] === name)}
      />
    </section>
  );
}

const periods = [
  "All dates",
  "Today",
  "Last 7 Days",
  "This Month",
  "Last Month",
  "This Year",
  "Custom Date Range",
];

export function PlatformRevenue({ sections, byPlan }) {
  const { records: payments } = useRecords(
    "platform",
    "finance",
    sections.finance[4],
  );
  const { records: tenants } = useRecords(
    "platform",
    "tenants",
    sections.tenants[4],
  );
  const { records: subscriptions } = useRecords(
    "platform",
    "billing",
    sections.billing[4],
  );
  const [period, setPeriod] = useState("All dates");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const selected = payments.filter(({ values }) =>
    matchesPeriod(values[4], period, start, end),
  );
  const groups = new Map(tenants.map(({ values }) => [values[0], values[1]]));
  for (const { values } of subscriptions)
    if (["Active", "Trial", "Past due"].includes(values[4]))
      groups.set(values[0], values[1]);
  const results = summarize(
    selected,
    (v) => (byPlan ? groups.get(v[1]) : v[4]?.slice(0, 7)),
    paidAmount,
    inr,
  );
  const maximum = Math.max(1, ...results.map(({ value }) => Math.abs(value)));
  return (
    <>
      <PageKpis
        items={paymentKpis(selected)}
        label="Selected period revenue summary"
      />
      <section className="panel platform-revenue">
        <div className="panel-header">
          <div>
            <h2>
              {byPlan ? "Collections by current plan" : "Net collections"}
            </h2>
            <p>
              {byPlan
                ? "Groups payments by each tenant’s current plan."
                : "Based on recorded payments and reversals."}
            </p>
          </div>
          <select
            className="filter-select"
            aria-label="Revenue period"
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
          >
            {periods.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </div>
        {period === "Custom Date Range" && (
          <div className="table-tools">
            <label>
              From{" "}
              <input
                type="date"
                className="filter-select"
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
            </label>
            <label>
              To{" "}
              <input
                type="date"
                className="filter-select"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
              />
            </label>
          </div>
        )}
        <div className="platform-revenue-bars">
          {results.length ? (
            results.map(({ key, value, label }) => (
              <div key={key}>
                <div>
                  <span>{key}</span>
                  <strong>{label}</strong>
                </div>
                <meter
                  min={0}
                  max={maximum}
                  value={Math.abs(value)}
                  aria-label={key + ": " + label}
                />
              </div>
            ))
          ) : (
            <p>No payments in this period.</p>
          )}
        </div>
      </section>
      <section className="panel">
        <div className="panel-header">
          <h2>Revenue breakdown</h2>
          <button
            type="button"
            className="button secondary"
            onClick={() =>
              downloadCsv(
                "platform-revenue.csv",
                [byPlan ? "Plan" : "Month", "Net collections"],
                results.map(({ key, value }) => [key, value]),
              )
            }
          >
            Export CSV
          </button>
        </div>
        <Records
          headings={[byPlan ? "Plan" : "Month", "Net collections"]}
          records={results.map(({ key, label }) => ({
            id: key,
            values: [key, label],
          }))}
        />
      </section>
    </>
  );
}
