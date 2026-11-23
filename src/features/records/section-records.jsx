"use client";

import { useState } from "react";
import { Plus, Search } from "lucide-react";
import {
  getRecordLabel,
  getSectionFields,
} from "@/features/records/section-fields";
import { planFeatureIds } from "@/features/platform/plan-entitlements";
import { tenantDetailsHref } from "@/features/platform/tenant-routes";
import { usePlatformTable } from "@/features/platform/use-platform-table";
import { memberTableRows } from "@/features/members/member-table";
import { portals } from "@/data/catalog/portals";
import { money, paidAmount } from "@/features/billing/gym-finance";
import {
  prepareReversal,
  validatePayment,
} from "@/features/billing/payment-ledger";
import {
  applyRecordChange,
  createRecord,
} from "@/features/records/record-mutations";
import { gymProfiles, profiles } from "@/features/records/profiles";
import { useRecords } from "@/data/records/use-records";
import RecordActions from "@/features/records/record-actions";
import { matchesPeriod } from "@/shared/lib/reporting";
import { downloadCsv } from "@/shared/lib/csv";
import { useGymBranch } from "@/features/workspace/use-gym-branch";
import ImportMembers from "@/features/members/import-members";
import RecordDetails from "@/features/records/record-details";
import RecordDialog from "@/features/records/record-dialog";
import PageKpis from "@/shared/ui/page-kpis";
import { sectionKpis } from "@/features/records/section-kpis";
import PaginatedRecords from "@/shared/ui/paginated-records";

export default function SectionRecords({
  portal,
  sectionId,
  section,
  initialAdd,
  initialSearch,
  memberId,
  page,
}) {
  const [, moduleTitle, , originalHeadings, sampleRows] = section;
  const planPage = portal === "platform" && sectionId === "subscriptions";
  const featurePage = portal === "platform" && sectionId === "modules";
  const platformSections = portals.platform.sections;
  const { records: platformFeatures } = useRecords(
    "platform",
    "modules",
    platformSections.modules[4],
  );
  const { records: platformPlans } = useRecords(
    "platform",
    "subscriptions",
    platformSections.subscriptions[4],
  );
  const headings = featurePage
    ? originalHeadings.slice(0, 1)
    : originalHeadings;
  const legacyPlanNames = platformSections.subscriptions[4].map(
    (values) => values[0],
  );
  const featureIds = (plan) =>
    planFeatureIds(
      plan,
      platformFeatures,
      legacyPlanNames,
      platformSections.modules[3],
    );
  const title = page?.title ?? moduleTitle;
  const audit = !!page?.readOnly || sectionId === "activity";
  const ledger = sectionId === "finance";
  const { records, saveRecords } = useRecords(portal, sectionId, sampleRows);
  const { records: members } = useRecords(
    "gym",
    "members",
    portals.gym.sections.members[4],
  );
  const { records: memberships } = useRecords(
    "gym",
    "member-subscriptions",
    portals.gym.sections["member-subscriptions"][4],
  );
  const renewalMember = memberId
    ? members.find((member) => member.id === memberId)
    : undefined;
  const [search, setSearch] = useState(initialSearch ?? "");
  const [branch] = useGymBranch();
  const branchIndex = headings.indexOf("Branch");
  const [status, setStatus] = useState("");
  const [filters, setFilters] = useState({});
  const [period, setPeriod] = useState("All dates");
  const [stock, setStock] = useState("");
  const [dialog, setDialog] = useState(
    initialAdd && !audit ? { mode: "create" } : null,
  );
  const { records: activity, saveRecords: saveActivity } = useRecords(
    portal,
    portal === "platform" ? "audit" : "activity",
    [],
  );
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const label = getRecordLabel(sectionId);
  const profile =
    profiles[sectionId] ??
    (portal === "gym" ? gymProfiles[sectionId] : undefined);
  const fields = [
    ...getSectionFields(sectionId, headings, portal),
    ...(profile?.fields ?? []),
    ...(planPage
      ? [
          {
            label: "Included features",
            type: "feature-list",
            options: platformFeatures,
          },
        ]
      : []),
  ];
  const statusIndex = headings.indexOf("Status");
  const gym = portal === "gym";
  const tenantList = portal === "platform" && sectionId === "tenants";
  const filterFields =
    {
      gym: {
        members: ["Gender", "Membership", "Joined date"],
        expenses: ["Category", "Payment method"],
        finance: ["Payment method"],
        staff: ["Role"],
        inventory: ["Category", "Supplier"],
        activity: ["User", "Module", "Date", "Branch"],
        notifications: ["Kind", "Channel"],
      },
      platform: {
        tenants: ["Subscription"],
        billing: ["Plan", "Billing cycle"],
        finance: ["Payment method"],
        support: ["Priority", "Assignee"],
        "feature-overrides": ["Override"],
        audit: ["User", "Module", "Date"],
      },
    }[portal]?.[sectionId] ?? [];
  const dateField = {
    finance: "Payment date",
    expenses: "Expense date",
    renewals: "Renewal date",
    billing: "Renewal date",
    support: "Opened date",
  }[sectionId];
  const dateIndex = headings.indexOf(dateField);
  const filtered = Boolean(
    search ||
    status ||
    period !== "All dates" ||
    stock ||
    Object.values(filters).some(Boolean),
  );
  const primaryColumns =
    gym &&
    ["finance", "memberships", "staff", "branches", "expenses"].includes(
      sectionId,
    )
      ? headings.slice(
          0,
          sectionId === "finance" ? 6 : sectionId === "expenses" ? 5 : 4,
        )
      : headings;
  const query = search.trim().toLowerCase();
  const matches = records.filter(
    ({ values }) =>
      (!page?.statuses || page.statuses.includes(values[statusIndex])) &&
      (dateIndex < 0 || matchesPeriod(values[dateIndex], period)) &&
      (!stock ||
        (stock === "out"
          ? money(values[2]) <= 0
          : money(values[2]) > 0 && money(values[2]) <= money(values[3]))) &&
      (!status || values[statusIndex] === status) &&
      (!gym ||
        !branch ||
        branchIndex < 0 ||
        values[branchIndex] === branch ||
        values[branchIndex] === "All branches") &&
      filterFields.every(
        (field) =>
          !filters[field] ||
          values[fields.findIndex((item) => item.label === field)] ===
            filters[field],
      ) &&
      values.some((value) => value.toLowerCase().includes(query)),
  );

  if (page?.sortColumn) {
    const column = headings.indexOf(page.sortColumn);
    matches.sort((a, b) =>
      (a.values[column] || "9999").localeCompare(b.values[column] || "9999"),
    );
  }

  function importMembers(rows) {
    saveRecords([...rows.map(createRecord), ...records]);
  }

  function openDialog(mode, record) {
    setError("");
    setDialog({ mode, record });
  }

  function commit(values) {
    if (audit) return;
    const { mode, record, newStatus } = dialog;
    let nextValues =
      featurePage && mode === "edit"
        ? [...values, ...record.values.slice(1)]
        : values;
    if (
      planPage &&
      (mode === "create" || mode === "edit") &&
      records.some(
        (item) =>
          item.id !== record?.id &&
          item.values[0].trim().toLowerCase() === values[0].toLowerCase(),
      )
    ) {
      setError("A subscription plan with this name already exists.");
      return;
    }
    if (ledger && mode === "create") {
      const validationError = validatePayment(values, records);
      if (validationError) {
        setError(validationError);
        return;
      }
    }
    if (mode === "adjust") {
      const reversal = prepareReversal(record, records);
      if (reversal.error) {
        setError(reversal.error);
        return;
      }
      nextValues = reversal.values;
    }
    const nextRecords = applyRecordChange(records, {
      mode,
      record,
      newStatus,
      statusIndex,
      values: nextValues,
    });

    try {
      saveRecords(nextRecords);
      {
        try {
          saveActivity([
            {
              id: crypto.randomUUID(),
              values: [
                `${mode === "adjust" ? "Payment reversed" : ["edit", "status"].includes(mode) ? "Updated" : mode === "delete" ? "Deleted" : "Created"} ${record?.values[0] ?? values[0]}`,
                portals[portal].admin,
                moduleTitle,
                new Date().toISOString().slice(0, 10),
                ...(portal === "gym"
                  ? [
                      sectionId === "members"
                        ? (values ?? record.values)[2]
                        : "",
                    ]
                  : []),
              ],
            },
            ...activity,
          ]);
        } catch {
          /* Demo activity is best effort. */
        }
      }
      setFeedback(mode === "delete" ? "Record deleted." : "Record saved.");
      setDialog(null);
    } catch {
      setError("The browser could not save this change.");
    }
  }

  const memberTable = portal === "gym" && sectionId === "members";
  const platformTable = usePlatformTable(
    portal,
    sectionId,
    records,
    matches,
    headings,
  );
  const matrixPlans = featurePage
    ? platformPlans
        .filter((plan) => plan.values[3] !== "Archived")
        .map((plan) => ({
          id: plan.id,
          name: plan.values[0],
          included: new Set(featureIds(plan)),
        }))
    : [];
  const listHeadings = featurePage
    ? ["Feature", ...matrixPlans.map((plan) => plan.name)]
    : planPage
      ? [...headings, "Included features"]
      : memberTable
        ? [
            "Member",
            "Contact",
            "Membership",
            "Branch",
            "Join date",
            "Membership expiry",
            "Status",
          ]
        : (platformTable?.headings ?? primaryColumns);
  const listRecords = featurePage
    ? matches.map((feature) => ({
        ...feature,
        displayValues: [
          feature.values[0],
          ...matrixPlans.map((plan) =>
            plan.included.has(feature.id) ? "Included" : "Unavailable",
          ),
        ],
      }))
    : planPage
      ? matches.map((plan) => ({
          ...plan,
          displayValues: [
            ...plan.values.slice(0, 4),
            String(
              featureIds(plan).filter((id) =>
                platformFeatures.some((feature) => feature.id === id),
              ).length,
            ),
          ],
        }))
      : memberTable
        ? memberTableRows(records, matches, memberships, fields)
        : (platformTable?.records ?? matches);
  const memberPanel =
    portal === "gym" && sectionId === "members" && dialog?.mode === "view";

  return (
    <>
      <PageKpis
        items={sectionKpis(portal, sectionId, matches)}
        label={filtered ? "Filtered records summary" : "Records summary"}
      />
      <div className={memberPanel ? "member-split" : "min-w-0"}>
        <section
          className={
            memberTable || platformTable || featurePage
              ? "panel management-panel wide-list-panel"
              : "panel management-panel"
          }
        >
          <div className="panel-header">
            <div>
              <h2>{title}</h2>
              <p>
                {records.length} {records.length === 1 ? "record" : "records"}
              </p>
            </div>
            {!audit && !page?.manageAccess && !page?.statuses && (
              <button
                type="button"
                className="button primary"
                onClick={() => openDialog("create")}
              >
                <Plus size={17} /> {ledger ? "Collect payment" : "Add " + label}
              </button>
            )}
          </div>
          <div className="table-tools">
            {gym && sectionId === "members" && (
              <ImportMembers fields={fields} onImport={importMembers} />
            )}
            {["members", "finance", "expenses", "tenants", "support"].includes(
              sectionId,
            ) && (
              <button
                className="button secondary"
                type="button"
                onClick={() =>
                  downloadCsv(
                    sectionId + ".csv",
                    fields.map((field) => field.label),
                    matches.map(({ values }) =>
                      fields.map((_, index) => values[index]),
                    ),
                  )
                }
              >
                Export CSV
              </button>
            )}
            {dateIndex >= 0 && (
              <select
                className="filter-select"
                aria-label={dateField + " period"}
                value={period}
                onChange={(event) => setPeriod(event.target.value)}
              >
                {[
                  "All dates",
                  "Today",
                  "Last 7 Days",
                  ...(dateField === "Renewal date"
                    ? ["Next 7 Days", "Next 30 Days"]
                    : []),
                  "This Month",
                  "Last Month",
                  "This Year",
                ].map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            )}
            {gym && sectionId === "inventory" && (
              <select
                className="filter-select"
                aria-label="Stock level"
                value={stock}
                onChange={(event) => setStock(event.target.value)}
              >
                <option value="">All stock levels</option>
                <option value="low">Low stock</option>
                <option value="out">Out of stock</option>
              </select>
            )}
            {filtered && (
              <button
                type="button"
                className="button secondary"
                onClick={() => {
                  setSearch("");
                  setStatus("");
                  setFilters({});
                  setPeriod("All dates");
                  setStock("");
                }}
              >
                Clear filters
              </button>
            )}
            {filterFields.map((field) => {
              const index = fields.findIndex((item) => item.label === field);
              const choices = [
                ...new Set(
                  records.map(({ values }) => values[index]).filter(Boolean),
                ),
              ].sort();
              return (
                <select
                  className="filter-select"
                  key={field}
                  aria-label={"Filter by " + field}
                  value={filters[field] ?? ""}
                  onChange={(event) =>
                    setFilters({ ...filters, [field]: event.target.value })
                  }
                >
                  <option value="">All {field.toLowerCase()}</option>
                  {choices.map((choice) => (
                    <option key={choice}>{choice}</option>
                  ))}
                </select>
              );
            })}
            <label className="search">
              <Search size={17} />
              <input
                type="search"
                aria-label={`Search ${title}`}
                placeholder={`Search ${title.toLowerCase()}`}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
            {statusIndex >= 0 && (
              <select
                className="filter-select"
                aria-label="Filter by status"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
              >
                <option value="">All statuses</option>
                {fields[statusIndex].options.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            )}
          </div>
          <PaginatedRecords
            headings={listHeadings}
            records={listRecords}
            paginationKey={JSON.stringify([query, status, period, stock, branch, filters])}
            totalCount={records.length}
            feedback={feedback}
            actions={
              audit
                ? undefined
                : (record) => (
                    <RecordActions
                      name={record.values[0]}
                      viewLabel={profile ? `View ${label}` : undefined}
                      viewHref={
                        tenantList ? tenantDetailsHref(record.id) : undefined
                      }
                      onView={
                        profile && !tenantList
                          ? () => openDialog("view", record)
                          : undefined
                      }
                      onEdit={
                        ledger || page?.manageAccess
                          ? undefined
                          : () => openDialog("edit", record)
                      }
                      statusActions={
                        !gym && sectionId === "tenants"
                          ? record.values[3] === "Suspended"
                            ? [["Reactivate tenant", "Active"]]
                            : [["Suspend tenant", "Suspended"]]
                          : !gym && sectionId === "subscriptions"
                            ? record.values[3] === "Archived"
                              ? [["Restore plan", "Active"]]
                              : [["Archive plan", "Archived"]]
                            : gym && sectionId === "members"
                              ? [
                                  record.values[3] === "Archived"
                                    ? ["Activate member", "Active"]
                                    : ["Archive member", "Archived"],
                                ]
                              : gym && sectionId === "member-subscriptions"
                                ? record.values[4] === "Active"
                                  ? [
                                      ["Freeze membership", "Frozen"],
                                      ["Cancel membership", "Cancelled"],
                                    ]
                                  : record.values[4] === "Frozen"
                                    ? [
                                        ["Unfreeze membership", "Active"],
                                        ["Cancel membership", "Cancelled"],
                                      ]
                                    : []
                                : []
                      }
                      onStatus={(action, newStatus) => {
                        setError("");
                        setDialog({
                          mode: "status",
                          record,
                          action,
                          newStatus,
                        });
                      }}
                      onDuplicate={
                        gym && sectionId === "memberships"
                          ? () =>
                              openDialog("duplicate", {
                                ...record,
                                values: [
                                  record.values[0] + " copy",
                                  ...record.values.slice(1),
                                ],
                              })
                          : undefined
                      }
                      onAdjust={
                        ledger && paidAmount(record.values) > 0
                          ? () => openDialog("adjust", record)
                          : undefined
                      }
                      onDelete={
                        ledger || page?.manageAccess
                          ? undefined
                          : () => openDialog("delete", record)
                      }
                    />
                  )
            }
          />
        </section>
        {dialog?.mode === "view" ? (
          <RecordDetails
            docked={memberPanel}
            onEdit={() => openDialog("edit", dialog.record)}
            portal={portal}
            label={label}
            record={dialog.record}
            fields={fields}
            related={profile.related}
            nameIsUnique={
              records.filter(
                ({ values }) => values[0] === dialog.record.values[0],
              ).length === 1
            }
            onClose={() => setDialog(null)}
          />
        ) : (
          dialog && (
            <RecordDialog
              {...dialog}
              selectedFeatures={
                planPage ? featureIds(dialog.record) : undefined
              }
              subscriptionFeatures={
                portal === "platform" && sectionId === "billing"
                  ? Object.fromEntries(
                      platformPlans.map((plan) => {
                        const included = new Set(featureIds(plan));
                        return [
                          plan.values[0],
                          platformFeatures
                            .filter((feature) => included.has(feature.id))
                            .map((feature) => feature.values[0]),
                        ];
                      }),
                    )
                  : undefined
              }
              portal={portal}
              sectionId={sectionId}
              key={renewalMember?.id ?? "record-form"}
              defaults={
                dialog.mode === "create" && renewalMember
                  ? [
                      renewalMember.values[0],
                      renewalMember.values[1],
                      "",
                      "Renewed",
                    ]
                  : undefined
              }
              fields={
                ledger
                  ? fields.map((field) =>
                      field.label === "Status"
                        ? {
                            ...field,
                            options: field.options.filter(
                              (value) => value !== "Adjustment",
                            ),
                          }
                        : field,
                    )
                  : fields
              }
              label={label}
              error={error}
              onClose={() => setDialog(null)}
              onSubmit={commit}
            />
          )
        )}
      </div>
    </>
  );
}
