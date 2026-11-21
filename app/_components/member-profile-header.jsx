import { useState } from "react";
import Link from "next/link";
import {
  CalendarPlus,
  Mail,
  MessageSquare,
  Pencil,
  Phone,
  X,
} from "lucide-react";

export default function MemberProfileHeader({
  titleId,
  record,
  fields,
  onClose,
  onEdit,
}) {
  const [brokenPhoto, setBrokenPhoto] = useState(false);
  const name = record.values[0];
  const value = (label) =>
    record.values[fields.findIndex((field) => field.label === label)];
  const photo = value("Photo URL");
  const phone = value("Phone");
  const email = value("Email");
  const dial = phone?.replace(/[^\d+]/g, "");
  const messageHref =
    email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      ? "mailto:" + encodeURIComponent(email).replace("%40", "@")
      : dial && /^\+?\d+$/.test(dial)
        ? "sms:" + dial
        : null;
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  const status = value("Status");

  return (
    <>
      <header className="member-profile-header">
        <span className="member-photo" aria-hidden="true">
          {!brokenPhoto && photo && /^https?:\/\//i.test(photo) ? (
            <img
              src={photo}
              alt=""
              referrerPolicy="no-referrer"
              onError={() => setBrokenPhoto(true)}
            />
          ) : (
            initials
          )}
        </span>
        <div className="member-profile-identity">
          <p className="profile-label">Member profile</p>
          <h2 id={titleId}>{name}</h2>
          <p className="member-profile-phone">
            <Phone size={14} aria-hidden="true" />
            {phone || "No phone on file"}
          </p>
        </div>
        <button
          type="button"
          className="icon-button member-profile-close"
          aria-label="Close details"
          onClick={onClose}
        >
          <X size={19} />
        </button>
      </header>
      <div className="member-summary">
        <div>
          <small>Membership plan</small>
          <strong>{value("Membership") || "Unassigned"}</strong>
        </div>
        <div>
          <small>Branch</small>
          <strong>{value("Branch") || "Unassigned"}</strong>
        </div>
        <div>
          <small>Status</small>
          <strong
            className={`status ${status?.toLowerCase().replaceAll(" ", "-") ?? ""}`}
          >
            {status || "Unknown"}
          </strong>
        </div>
      </div>
      <section className="member-profile-actions" aria-label="Member actions">
        <Link
          className="button primary"
          href={`/gym/renewals?add=1&member=${encodeURIComponent(record.id)}`}
        >
          <CalendarPlus size={17} /> Record renewal
        </Link>
        {messageHref ? (
          <a className="button secondary" href={messageHref}>
            <MessageSquare size={17} /> Draft message
          </a>
        ) : (
          <button
            type="button"
            className="button secondary"
            disabled
            title="Add a phone number or email to draft a message"
          >
            <Mail size={17} /> Draft message
          </button>
        )}
        <button type="button" className="button secondary" onClick={onEdit}>
          <Pencil size={16} /> Edit profile
        </button>
      </section>
    </>
  );
}
