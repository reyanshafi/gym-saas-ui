import { useRef, useState } from "react";
import { parseCsv } from "../_data/csv";

export default function ImportMembers({ fields, onImport }) {
  const input = useRef(null);
  const [message, setMessage] = useState("");
  async function importFile(event) {
    const file = event.currentTarget.files[0];
    event.currentTarget.value = "";
    if (!file) return;
    try {
      const [headers, ...rows] = parseCsv(await file.text());
      const indexes = fields.map(
        ({ label }) =>
          headers?.findIndex(
            (header) => header.toLowerCase() === label.toLowerCase(),
          ) ?? -1,
      );
      if (!rows.length || indexes.slice(0, 4).includes(-1))
        throw new Error(
          "Include the Member, Membership, Branch, and Status CSV columns.",
        );
      const incoming = rows.map((row) =>
        indexes.map((index) => row[index] ?? ""),
      );
      if (
        incoming.some(
          (row) =>
            row.slice(0, 4).some((value) => !value) ||
            !fields[3].options.includes(row[3]),
        )
      )
        throw new Error(
          "Each row needs valid Member, Membership, Branch, and Status values.",
        );
      onImport(incoming);
      setMessage(`Imported ${incoming.length} members.`);
    } catch (error) {
      setMessage(error.message);
    }
  }
  return (
    <>
      <button
        className="button secondary"
        type="button"
        onClick={() => input.current.click()}
      >
        Import CSV
      </button>
      <input
        type="file"
        hidden
        ref={input}
        accept=".csv,text/csv"
        onChange={importFile}
        aria-label="Member CSV"
      />
      <span role="status">{message}</span>
    </>
  );
}
