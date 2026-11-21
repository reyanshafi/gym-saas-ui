"use client";

import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { getRecordLabel, getSectionFields } from "../_data/section-fields";
import { memberTableRows } from "../_data/member-table";
import { portals } from "../_data/portals";
import { inr, money, paidAmount } from "../_data/gym-finance";
import { gymProfiles, profiles } from "../_data/profiles";
import { useRecords } from "../_data/use-records";
import RecordActions from "./record-actions";
import { downloadCsv } from "../_data/csv";
import { useGymBranch } from "./gym-toolbar";
import ImportMembers from "./import-members";
import RecordDetails from "./record-details";
import RecordDialog from "./record-dialog";
import Records from "./records";

export default function SectionRecords({
  portal,
  sectionId,
  section,
  initialAdd,
  initialSearch,
  memberId,
}) {
  const [, title, , headings, sampleRows] = section;
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
  const [dialog, setDialog] = useState(
    initialAdd && sectionId !== "activity" ? { mode: "create" } : null,
  );
  const { records: activity, saveRecords: saveActivity } = useRecords(
    portal,
    "activity",
    [],
  );
  const audit = portal === "gym" && sectionId === "activity";
  const ledger = portal === "gym" && sectionId === "finance";
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const label = getRecordLabel(sectionId);
  const profile =
    profiles[sectionId] ??
    (portal === "gym" ? gymProfiles[sectionId] : undefined);
  const fields = [
    ...getSectionFields(sectionId, headings, portal),
    ...(profile?.fields ?? []),
  ];
  const statusIndex = headings.indexOf("Status");
  const gym = portal === "gym";
  const filterFields = gym
    ? ({
        members: ["Gender", "Membership", "Joined date"],
        expenses: ["Category", "Expense date"],
        activity: ["User", "Module", "Date", "Branch"],
        notifications: ["Kind", "Channel"],
      }[sectionId] ?? [])
    : [];
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

  function importMembers(rows) {
    saveRecords([
      ...rows.map((values) => ({ id: crypto.randomUUID(), values })),
      ...records,
    ]);
  }

  function openDialog(mode, record) {
    setError("");
    setDialog({ mode, record });
  }

  function commit(values) {
    if (audit) return;
    const { mode, record, newStatus } = dialog;
    let nextRecords;
    if (
      ledger &&
      mode === "create" &&
      (money(values[2]) <= 0 ||
        (values[3] === "Partially Paid" &&
          (money(values[6]) <= 0 || money(values[6]) >= money(values[2]))))
    ) {
      setError("Enter a positive amount and a valid partial payment.");
      return;
    }
    if (
      ledger &&
      mode === "create" &&
      (values[3] === "Adjustment" ||
        records.some((item) => item.values[0] === values[0]))
    ) {
      setError(
        "Use a unique invoice number. Post reversals from the original payment.",
      );
      return;
    }
    if (mode === "status") {
      nextRecords = records.map((item) =>
        item.id === record.id
          ? {
              ...item,
              values: item.values.map((value, index) =>
                index === statusIndex ? newStatus : value,
              ),
            }
          : item,
      );
    } else if (mode === "duplicate") {
      nextRecords = [{ id: crypto.randomUUID(), values }, ...records];
    } else if (mode === "adjust") {
      const reference = record.values[0];
      if (
        records.some(
          ({ values }) =>
            values[3] === "Adjustment" && values[0] === reference + "-REV",
        )
      ) {
        setError("This payment has already been reversed.");
        return;
      }
      nextRecords = [
        {
          id: crypto.randomUUID(),
          values: [
            reference + "-REV",
            record.values[1],
            inr(-paidAmount(record.values)),
            "Adjustment",
            new Intl.DateTimeFormat("en-CA", {
              timeZone: "Asia/Kolkata",
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            }).format(new Date()),
            record.values[5] || "Other",
            "",
            reference,
          ],
        },
        ...records,
      ];
    } else if (mode === "delete")
      nextRecords = records.filter((item) => item.id !== record.id);
    else if (record)
      nextRecords = records.map((item) =>
        item.id === record.id ? { ...item, values } : item,
      );
    else nextRecords = [{ id: crypto.randomUUID(), values }, ...records];

    try {
      saveRecords(nextRecords);
      if (portal === "gym") {
        try {
          saveActivity([
            {
              id: crypto.randomUUID(),
              values: [
                `${mode === "adjust" ? "Payment reversed" : ["edit", "status"].includes(mode) ? "Updated" : mode === "delete" ? "Deleted" : "Created"} ${record?.values[0] ?? values[0]}`,
                "Gym Admin",
                title,
                new Date().toISOString().slice(0, 10),
                sectionId === "members" ? (values ?? record.values)[2] : "",
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
  const listHeadings = memberTable
    ? [
        "Member",
        "Contact",
        "Membership",
        "Branch",
        "Join date",
        "Membership expiry",
        "Status",
      ]
    : primaryColumns;
  const listRecords = memberTable
    ? memberTableRows(records, matches, memberships, fields)
    : matches;
  const memberPanel =
    portal === "gym" && sectionId === "members" && dialog?.mode === "view";

  return (
    <div className={memberPanel ? "member-split" : "min-w-0"}>
      <section
        className={
          memberTable
            ? "panel management-panel member-list-panel"
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
          {!audit && (
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
          {gym && ["members", "finance", "expenses"].includes(sectionId) && (
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
        <Records
          headings={listHeadings}
          records={listRecords}
          actions={
            audit
              ? undefined
              : (record) => (
                  <RecordActions
                    name={record.values[0]}
                    viewLabel={profile ? `View ${label}` : undefined}
                    onView={
                      profile ? () => openDialog("view", record) : undefined
                    }
                    onEdit={
                      ledger ? undefined : () => openDialog("edit", record)
                    }
                    statusActions={
                      gym && sectionId === "members"
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
                      setDialog({ mode: "status", record, action, newStatus });
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
                      ledger ? undefined : () => openDialog("delete", record)
                    }
                  />
                )
          }
        />
        <div className="table-footer">
          Showing {matches.length} of {records.length}
          <span role="status">{feedback}</span>
        </div>
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
  );
}
