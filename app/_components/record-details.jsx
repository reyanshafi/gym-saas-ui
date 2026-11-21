"use client";

import { useEffect, useId, useRef, useSyncExternalStore } from "react";
import { X } from "lucide-react";
import { portals } from "../_data/portals";
import { useRecords } from "../_data/use-records";
import MemberProfileHeader from "./member-profile-header";
import Records from "./records";

const desktopQuery = "(min-width: 1100px)";

function subscribeDesktop(callback) {
  const query = window.matchMedia(desktopQuery);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

function isDesktop() {
  return window.matchMedia(desktopQuery).matches;
}

export default function RecordDetails({
  docked = false,
  portal,
  label,
  record,
  fields,
  related,
  nameIsUnique,
  onClose,
  onEdit,
}) {
  const dialog = useRef(null);
  const desktop = useSyncExternalStore(
    subscribeDesktop,
    isDesktop,
    () => false,
  );
  const inline = docked && desktop;
  const titleId = useId();
  const name = record.values[0];

  useEffect(() => {
    if (inline) return;
    const element = dialog.current;
    element.showModal();
    return () => element.close();
  }, [inline]);

  const content = (
    <>
      {docked ? (
        <MemberProfileHeader
          key={record.id}
          titleId={titleId}
          fields={fields}
          record={record}
          onClose={onClose}
          onEdit={onEdit}
        />
      ) : (
        <header className="dialog-header">
          <div>
            <p className="profile-label">{label} details</p>
            <h2 id={titleId}>{name}</h2>
          </div>
          <button
            type="button"
            className="icon-button"
            aria-label="Close details"
            onClick={onClose}
          >
            <X size={19} />
          </button>
        </header>
      )}
      <div className="dialog-body">
        {docked && (
          <h3 className="member-info-heading">Personal information</h3>
        )}
        <dl className="profile-fields">
          {fields.slice(1).map(({ label: field }, index) =>
            docked &&
            ["Membership", "Branch", "Status", "Phone", "Photo URL"].includes(
              field,
            ) ? null : (
              <div key={field}>
                <dt>{field}</dt>
                <dd>{record.values[index + 1] || "Not provided"}</dd>
              </div>
            ),
          )}
        </dl>
        {nameIsUnique ? (
          related.map(({ key, nameColumn }) => (
            <RelatedRecords
              key={key}
              portal={portal}
              sectionKey={key}
              name={name}
              nameColumn={nameColumn}
            />
          ))
        ) : (
          <p className="profile-label">
            Related activity is unavailable because multiple records share this
            name.
          </p>
        )}
      </div>
      <footer className="dialog-footer">
        <button type="button" className="button secondary" onClick={onClose}>
          Close
        </button>
      </footer>
    </>
  );

  if (inline) {
    return (
      <aside
        className="panel member-detail-panel"
        aria-labelledby={titleId}
        onKeyDown={(event) => {
          if (event.key === "Escape") onClose();
        }}
      >
        {content}
      </aside>
    );
  }

  return (
    <dialog
      ref={dialog}
      className={
        docked
          ? "record-dialog profile-dialog member-detail-drawer"
          : "record-dialog profile-dialog"
      }
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      {content}
    </dialog>
  );
}

function RelatedRecords({ portal, sectionKey, name, nameColumn }) {
  const [, title, , headings, sampleRows] =
    portals[portal].sections[sectionKey];
  const { records } = useRecords(portal, sectionKey, sampleRows);
  const matches = records.filter(({ values }) => values[nameColumn] === name);
  const columns = headings.filter((_, index) => index !== nameColumn);

  return (
    <section className="profile-activity">
      <h3>{title}</h3>
      {matches.length ? (
        <Records
          headings={columns}
          records={matches.map((record) => ({
            ...record,
            values: headings.flatMap((_, index) =>
              index === nameColumn ? [] : [record.values[index] ?? ""],
            ),
          }))}
        />
      ) : (
        <p>No related records.</p>
      )}
    </section>
  );
}
