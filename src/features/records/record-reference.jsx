import { portals } from "@/data/catalog/portals";
import { useRecords } from "@/data/records/use-records";

export default function RecordReference({
  portal,
  relation,
  field,
  name,
  value,
  onChange,
  optional,
  selectedMember,
}) {
  const [, title, , headings, sampleRows] =
    portals[portal].sections[relation.section];
  const { records } = useRecords(portal, relation.section, sampleRows);
  const statusIndex = headings.indexOf("Status");
  const options = new Map();
  if (relation.extra) options.set(relation.extra, relation.extra);
  for (const { id, values } of records) {
    if (["Archived", "Inactive", "Disabled"].includes(values[statusIndex]))
      continue;
    if (relation.byMember) {
      if (selectedMember && values[0] === selectedMember) {
        options.set(
          id,
          [values[1], values[2], values[3]].filter(Boolean).join(" · "),
        );
      }
    } else if (values[0]) options.set(values[0], values[0]);
  }
  const hasChoices = options.size > 0;
  if (value && !options.has(value))
    options.set(value, value + " (saved value)");

  return (
    <>
      <select
        aria-label={field}
        name={name}
        required={!optional}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">
          {relation.byMember && !selectedMember
            ? "Select a member first"
            : "Select " + field.toLowerCase()}
        </option>
        {[...options].map(([key, label]) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </select>
      {!hasChoices && !value && (!relation.byMember || selectedMember) && (
        <small className="record-reference-help">
          No available records in {title}.
        </small>
      )}
    </>
  );
}
