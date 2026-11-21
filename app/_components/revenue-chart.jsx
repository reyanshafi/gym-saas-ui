"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const months = ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov"];

export default function RevenueChart({ title, values }) {
  const [period, setPeriod] = useState("6");
  const visibleMonths = months.slice(-Number(period));
  const visibleValues = values.slice(-Number(period));
  return (
    <section className="panel chart-panel">
      <div className="panel-header">
        <div>
          <h2>{title}</h2>
          <p>Monthly revenue in INR</p>
        </div>
        <label className="period">
          <select
            aria-label="Revenue date range"
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
          >
            <option value="6">Last 6 months</option>
            <option value="3">Last 3 months</option>
          </select>
          <ChevronDown size={15} />
        </label>
      </div>
      <div className="chart">
        <div className="axis">
          {["₹10L", "₹7.5L", "₹5L", "₹2.5L", "₹0"].map((value) => (
            <span key={value}>{value}</span>
          ))}
        </div>
        <div className="plot">
          {visibleMonths.map((month, index) => {
            const percent = visibleValues[index];
            const value = new Intl.NumberFormat("en-IN", {
              style: "currency",
              currency: "INR",
              maximumFractionDigits: 0,
            }).format(percent * 10000);
            return (
              <div className="bar-cell" key={month}>
                <div
                  className="bar"
                  style={{ height: percent + "%" }}
                  tabIndex={0}
                  role="img"
                  aria-label={month + ": " + value}
                >
                  <span>{value}</span>
                </div>
                <span className="month">{month}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
