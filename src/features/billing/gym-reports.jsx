"use client";

import { useState } from "react";
import { useRecords } from "@/data/records/use-records";
import {
  inr,
  money,
  outstandingAmount,
  paidAmount,
} from "@/features/billing/gym-finance";
import { downloadCsv } from "@/shared/lib/csv";
import { useGymBranch } from "@/features/workspace/use-gym-branch";
import PageKpis from "@/shared/ui/page-kpis";
import PaginatedRecords from "@/shared/ui/paginated-records";
import ReportBreakdown from "@/features/billing/report-breakdown";

import { matchesPeriod, summarize } from "@/shared/lib/reporting";

const reportGroups = {
  Revenue: ["Revenue Report", "Payment Collection Report", "Branch-wise Financial Report"],
  Expenses: ["Expense Report"],
  "Cash flow": ["Profit & Loss Summary"],
  Billing: ["Outstanding Payments Report", "Refund Report", "Tax Report"],
  Memberships: ["Membership Sales Report", "Membership Renewal Report"],
};
const periods = [
  "All dates",
  "Today",
  "Yesterday",
  "Last 7 Days",
  "This Month",
  "Last Month",
  "This Year",
  "Custom Date Range",
];

export function GymReports({ sections }) {
  const [activeBranch] = useGymBranch();
  const { records: payments } = useRecords(
    "gym",
    "finance",
    sections.finance[4],
  );
  const { records: expenses } = useRecords(
    "gym",
    "expenses",
    sections.expenses[4],
  );
  const { records: renewals } = useRecords(
    "gym",
    "renewals",
    sections.renewals[4],
  );
  const { records: memberships } = useRecords(
    "gym",
    "member-subscriptions",
    sections["member-subscriptions"][4],
  );
  const { records: members } = useRecords(
    "gym",
    "members",
    sections.members[4],
  );
  const { records: branches } = useRecords(
    "gym",
    "branches",
    sections.branches[4],
  );
  const [group, setGroup] = useState("Revenue");
  const [report, setReport] = useState(reportGroups.Revenue[0]);
  const [period, setPeriod] = useState(periods[0]);
  const [branchOverride, setBranch] = useState(null);
  const branch = branchOverride ?? activeBranch;
  const [method, setMethod] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const usesPaymentMethod = group !== "Memberships";
  const selectedMethod = usesPaymentMethod ? method.toLowerCase() : "";
  const methods = [...new Map([...payments.map(({ values }) => values[5]), ...expenses.map(({ values }) => values[6])]
    .filter(Boolean)
    .map((value) => [value.toLowerCase(), value])).values()].sort();
  const memberBranches = new Map(
    members.map(({ values }) => [values[0], values[2]]),
  );
  const filteredPayments = payments.filter(
    ({ values: v }) =>
      matchesPeriod(v[4], period, start, end) &&
      (!selectedMethod || selectedMethod === v[5]?.toLowerCase()) &&
      (!branch || branch === memberBranches.get(v[1])),
  );
  const filteredExpenses = expenses.filter(
    ({ values: v }) =>
      matchesPeriod(v[3], period, start, end) &&
      (!branch || branch === v[5]) &&
      (!selectedMethod || selectedMethod === v[6]?.toLowerCase()),
  );
  const total = (records, accessor) =>
    records.reduce((sum, { values }) => sum + accessor(values), 0);
  const revenue = total(filteredPayments, paidAmount);
  const spending = total(filteredExpenses, (v) =>
    v[4] === "Paid" ? money(v[2]) : 0,
  );
  const filteredMemberships = memberships.filter(
    ({ values: v }) =>
      matchesPeriod(v[2], period, start, end) &&
      (!branch || memberBranches.get(v[0]) === branch),
  );
  const filteredRenewals = renewals.filter(
    ({ values: v }) =>
      matchesPeriod(v[2], period, start, end) &&
      (!branch || memberBranches.get(v[0]) === branch),
  );
  const reports = {
    "Revenue Report": summarize(
      filteredPayments,
      (v) => v[4]?.slice(0, 7),
      paidAmount,
      inr,
    ),
    "Expense Report": summarize(
      filteredExpenses,
      (v) => v[1],
      (v) => money(v[2]),
      inr,
    ),
    "Profit & Loss Summary": [
      ["Collections", revenue],
      ["Paid expenses", spending],
      ["Difference", revenue - spending],
    ].map(([key, value]) => ({ key, value, label: inr(value) })),
    "Payment Collection Report": summarize(
      filteredPayments,
      (v) => v[5],
      paidAmount,
      inr,
    ),
    "Outstanding Payments Report": summarize(
      filteredPayments.filter(({ values }) => outstandingAmount(values) > 0),
      (v) => v[1],
      outstandingAmount,
      inr,
    ),
    "Membership Sales Report": summarize(
      filteredMemberships,
      (v) => v[1],
      () => 1,
    ),
    "Membership Renewal Report": summarize(
      filteredRenewals,
      (v) => v[3],
      () => 1,
    ),
    "Refund Report": summarize(
      filteredPayments.filter(({ values }) => values[3] === "Adjustment" && paidAmount(values) < 0),
      (v) => v[1],
      (v) => -paidAmount(v),
      inr,
    ),
    "Tax Report": summarize(
      filteredPayments,
      (v) => v[4]?.slice(0, 7),
      (v) => money(v[9]),
      inr,
    ),
    "Branch-wise Financial Report": summarize(
      filteredPayments,
      (v) => memberBranches.get(v[1]),
      paidAmount,
      inr,
    ),
  };
  const reportRows = reports[report];
  const headings = [report === "Revenue Report" || report === "Tax Report" ? "Month" : "Category", usesPaymentMethod ? "Amount" : "Count"];
  return (
    <div className="gym-financial-reports">
      <div className="workspace-section-tabs finance-report-tabs" role="group" aria-label="Report categories">
        {Object.keys(reportGroups).map((name) => (
          <button key={name} type="button" aria-pressed={name === group} onClick={() => {
            if (name === group) return;
            setGroup(name);
            setReport(reportGroups[name][0]);
          }}>{name}</button>
        ))}
      </div>
      <PageKpis
        label={usesPaymentMethod ? "Selected period financial summary" : "Selected period membership summary"}
        items={usesPaymentMethod ? [
          ["Net collections", inr(revenue)],
          ["Paid expenses", inr(spending)],
          [
            "Net cash flow",
            inr(revenue - spending),
            "Collections less paid expenses",
          ],
          [
            "Outstanding payments",
            inr(total(filteredPayments, outstandingAmount)),
          ],
        ] : [
          ["Membership records", filteredMemberships.length],
          ["Renewed", filteredRenewals.filter(({ values }) => values[3] === "Renewed").length],
          ["Due", filteredRenewals.filter(({ values }) => values[3] === "Due").length],
          ["Overdue", filteredRenewals.filter(({ values }) => values[3] === "Overdue").length],
        ]}
      />
      <section className="panel" aria-label="Report filters">
        <div className="panel-header">
          <h2>{report}</h2>
          <button
            type="button"
            className="button secondary"
            onClick={() =>
              downloadCsv(
                "financial-report.csv",
                headings,
                reportRows.map(({ key, value }) => [key, value]),
              )
            }
          >
            Export CSV
          </button>
          <button className="button secondary" onClick={() => window.print()}>
            Print report
          </button>
        </div>
        <div className="table-tools">
          {reportGroups[group].length > 1 && <select
            className="filter-select"
            aria-label="Report"
            value={report}
            onChange={(e) => setReport(e.target.value)}
          >
            {reportGroups[group].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>}
          <select
            className="filter-select"
            aria-label="Period"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            {periods.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          {period === "Custom Date Range" && (
            <>
              <input
                className="filter-select"
                type="date"
                aria-label="From"
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
              <input
                className="filter-select"
                type="date"
                aria-label="To"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
              />
            </>
          )}
          <select
            className="filter-select"
            aria-label="Branch"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
          >
            <option value="">All branches</option>
            {branches.map(({ id, values }) => (
              <option key={id}>{values[0]}</option>
            ))}
          </select>
          {usesPaymentMethod && <select
            className="filter-select"
            aria-label="Payment method"
            value={selectedMethod}
            onChange={(e) => setMethod(e.target.value)}
          >
            <option value="">All methods</option>
            {methods.map((t) => (
              <option key={t} value={t.toLowerCase()}>{t}</option>
            ))}
          </select>}
        </div>
      </section>
      <div className="finance-report-results">
        <ReportBreakdown title="Breakdown" rows={reportRows} chronological={headings[0] === "Month"} />
        <section className="panel finance-report-table">
          <header className="panel-header"><h2>Report details</h2><p>{reportRows.length} rows</p></header>
        <PaginatedRecords
          headings={headings}
          paginationKey={JSON.stringify([report, period, branch, selectedMethod, start, end])}
          records={reportRows.map(({ key, label }) => ({
            id: key,
            values: [key, label],
          }))}
        />
        </section>
      </div>
    </div>
  );
}
