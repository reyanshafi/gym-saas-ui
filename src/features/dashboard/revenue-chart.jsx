"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { inr } from "@/features/billing/gym-finance";
import RevenueArea from "@/features/dashboard/revenue-area";

const monthLabel = new Intl.DateTimeFormat("en-IN", {
  month: "short",
  timeZone: "UTC",
});
const compact = new Intl.NumberFormat("en-IN", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export default function RevenueChart({ title, rows }) {
  const [range, setRange] = useState(12);
  const byMonth = new Map(
    rows
      .filter(({ key }) => /^\d{4}-\d{2}$/.test(key))
      .map(({ key, value }) => [key, value]),
  );
  const latest = [...byMonth.keys()].sort().at(-1);
  const periods = latest
    ? Array.from({ length: range }, (_, index) => {
        const [year, month] = latest.split("-").map(Number);
        return new Date(Date.UTC(year, month - range + index, 1))
          .toISOString()
          .slice(0, 7);
      })
    : [];
  const values = periods.map((key) => byMonth.get(key) ?? 0);
  const min = Math.min(0, ...values);
  const max = Math.max(1, ...values);
  const span = max - min;

  return (
    <section className="panel chart-panel">
      <div className="panel-header">
        <div>
          <h2>{title}</h2>
          <p>Net collections in INR</p>
        </div>
        <label className="period">
          <select
            aria-label="Revenue date range"
            value={range}
            onChange={(event) => setRange(Number(event.target.value))}
          >
            <option value={12}>Last 12 months</option>
            <option value={6}>Last 6 months</option>
            <option value={3}>Last 3 months</option>
          </select>
          <ChevronDown size={15} />
        </label>
      </div>
      {periods.length > 0 && (
        <div className="overview-revenue-total">
          <strong>{inr(values.reduce((sum, value) => sum + value, 0))}</strong>
          <span>Net total over {range} months</span>
        </div>
      )}
      {periods.length ? (
        <div className="gym-trend">
          <div className="gym-axis" aria-hidden="true">
            {[0, 1, 2, 3, 4].map((i) => (
              <span key={i}>{compact.format(max - (span * i) / 4)}</span>
            ))}
          </div>
          <div
            className="gym-plot"
            data-range={periods.length}
            style={{
              "--period-count": periods.length,
              "--zero": (-min / span) * 100 + "%",
            }}
          >
            <RevenueArea values={values} low={min} span={span} />
            {periods.map((key, index) => (
              <div
                className="gym-month"
                key={key}
                tabIndex={0}
                role="img"
                aria-label={key + ": " + inr(values[index])}
              >
                <span
                  className="gym-revenue-dot"
                  style={{ bottom: ((values[index] - min) / span) * 100 + "%" }}
                />
                <span className="gym-chart-value">{inr(values[index])}</span>
                <span className="gym-month-label">
                  {monthLabel.format(new Date(key + "-01T00:00:00Z"))}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="gym-chart-empty">No dated payment records to chart.</p>
      )}
    </section>
  );
}
