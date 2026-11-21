"use client";

import { useEffect, useId, useRef, useState } from "react";
import { X } from "lucide-react";
import { getRelationship } from "../_data/field-relationships";
import ConfirmFormAction from "./confirm-form-action";
import RecordReference from "./record-reference";

export default function RecordDialog({
  mode,
  record,
  action,
  defaults,
  portal,
  sectionId,
  fields,
  label,
  error,
  onClose,
  onSubmit,
}) {
  const dialog = useRef(null);
  const titleId = useId();
  const [dirty, setDirty] = useState(false);
  const [pending, setPending] = useState(null);
  const [referenceValues, setReferenceValues] = useState({});
  const getValue = (index) =>
    referenceValues[index] ?? record?.values[index] ?? defaults?.[index] ?? "";
  const memberIndex = fields.findIndex((field) => field.label === "Member");
  const referenceIndex = fields.findIndex(
    (field) => field.label === "Membership reference",
  );

  function changeReference(index, value) {
    setReferenceValues((previous) => ({
      ...previous,
      ...(index === memberIndex && referenceIndex >= 0
        ? { [referenceIndex]: "" }
        : {}),
      [index]: value,
    }));
  }
  const adjusting = mode === "adjust";
  const deleting = mode === "delete" || adjusting;
  const statusChange = mode === "status";
  const confirmation = deleting || statusChange;
  const title = statusChange
    ? action
    : deleting
      ? adjusting
        ? "Reverse payment"
        : `Delete ${label}`
      : mode === "duplicate"
        ? `Duplicate ${label}`
        : `${record ? "Edit" : "Add"} ${label}`;

  useEffect(() => {
    const element = dialog.current;
    element.showModal();
    return () => element.close();
  }, []);

  function requestClose() {
    if (dirty && !confirmation) setPending({ type: "discard" });
    else onClose();
  }

  function submit(event) {
    event.preventDefault();
    if (confirmation) {
      onSubmit(null);
      return;
    }
    const formData = new FormData(event.currentTarget);
    const values = fields.map((_, index) =>
      String(formData.get(String(index)) ?? "").trim(),
    );
    const roleIndex = fields.findIndex((field) => field.label === "Role");
    const changesStaffRole =
      sectionId === "staff" &&
      record &&
      roleIndex >= 0 &&
      values[roleIndex] !== record.values[roleIndex];
    if (sectionId === "finance") setPending({ type: "payment", values });
    else if (["roles", "access"].includes(sectionId) || changesStaffRole)
      setPending({ type: "role", values });
    else onSubmit(values);
  }

  function confirmPending() {
    const choice = pending;
    setPending(null);
    if (choice.type === "discard") onClose();
    else onSubmit(choice.values);
  }

  const confirmationCopy =
    pending &&
    {
      discard: [
        "Discard unsaved changes?",
        "Your changes to this form will be lost.",
        "Discard changes",
      ],
      payment: [
        "Record this payment?",
        "Check the transaction details before adding this entry to billing.",
        "Record payment",
      ],
      role: [
        "Save these role changes?",
        "Confirm the role or permissions selected for this record.",
        "Save role changes",
      ],
    }[pending.type];

  return (
    <>
      <dialog
        ref={dialog}
        className={
          confirmation ? "record-dialog" : "record-dialog record-form-drawer"
        }
        aria-labelledby={titleId}
        onCancel={(event) => {
          event.preventDefault();
          requestClose();
        }}
      >
        <form onSubmit={submit} onChange={() => setDirty(true)}>
          <header className="dialog-header">
            <h2 id={titleId}>{title}</h2>
            <button
              type="button"
              className="icon-button"
              aria-label="Close dialog"
              onClick={requestClose}
            >
              <X size={19} />
            </button>
          </header>
          <div className="dialog-body">
            {statusChange ? (
              <p>
                Confirm the status change for{" "}
                <strong>{record.values[0]}</strong>.
              </p>
            ) : deleting ? (
              <p>
                {adjusting ? (
                  <>
                    Post a reversal for <strong>{record.values[0]}</strong>?
                  </>
                ) : (
                  <>
                    Remove <strong>{record.values[0]}</strong> from this
                    workspace?
                  </>
                )}
              </p>
            ) : (
              fields.map(({ label: field, options, type, optional }, index) => {
                const relation = getRelationship(portal, sectionId, field);
                return (
                  <label
                    key={field}
                    data-wide={
                      [
                        "Address",
                        "Notes",
                        "Photo URL",
                        "Permissions",
                        "Description",
                      ].includes(field) || undefined
                    }
                  >
                    <span>{field}</span>
                    {relation ? (
                      <RecordReference
                        portal={portal}
                        relation={relation}
                        field={field}
                        name={index}
                        value={getValue(index)}
                        onChange={(value) => changeReference(index, value)}
                        optional={optional}
                        selectedMember={getValue(memberIndex)}
                      />
                    ) : options ? (
                      <select
                        required={!optional}
                        name={index}
                        defaultValue={
                          record?.values[index] ??
                          defaults?.[index] ??
                          (optional ? "" : options[0])
                        }
                      >
                        {optional && !options.includes("") && (
                          <option value="">Select an option</option>
                        )}
                        {options.map((option) => (
                          <option key={option} value={option}>
                            {option || "Select an option"}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        required={!optional}
                        type={type}
                        pattern={type === "text" ? ".*\\S.*" : undefined}
                        name={index}
                        defaultValue={
                          record?.values[index] ?? defaults?.[index] ?? ""
                        }
                      />
                    )}
                  </label>
                );
              })
            )}
            {error && (
              <p role="alert" className="form-error">
                {error}
              </p>
            )}
          </div>
          <footer className="dialog-footer">
            <button
              type="button"
              className="button secondary"
              onClick={requestClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`button ${deleting ? "danger" : "primary"}`}
            >
              {statusChange
                ? "Confirm"
                : adjusting
                  ? "Post reversal"
                  : deleting
                    ? "Delete"
                    : "Save changes"}
            </button>
          </footer>
        </form>
      </dialog>
      {pending && (
        <ConfirmFormAction
          title={confirmationCopy[0]}
          message={confirmationCopy[1]}
          action={confirmationCopy[2]}
          destructive={pending.type === "discard"}
          onCancel={() => setPending(null)}
          onConfirm={confirmPending}
        />
      )}
    </>
  );
}
