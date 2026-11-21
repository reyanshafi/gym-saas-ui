export function downloadCsv(filename, headings, rows) {
  const escape = (value) => {
    const text = String(value ?? "");
    const safe =
      /^\s*[=+@-]/.test(text) && !/^-\d+(\.\d+)?$/.test(text)
        ? "'" + text
        : text;
    return '"' + safe.replaceAll('"', '""') + '"';
  };
  const csv = [headings, ...rows]
    .map((row) => row.map(escape).join(","))
    .join("\r\n");
  const url = URL.createObjectURL(
    new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function parseCsv(text) {
  const source = text.replace(/^\uFEFF/, "");
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < source.length; index++) {
    const char = source[index];
    if (char === '"' && (quoted || !field)) {
      if (quoted && source[index + 1] === '"') {
        field += '"';
        index++;
      } else quoted = !quoted;
    } else if (!quoted && char === ",") {
      row.push(field.trim());
      field = "";
    } else if (!quoted && /[\r\n]/.test(char)) {
      row.push(field.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      field = "";
    } else field += char;
  }
  if (quoted) throw new Error("A quoted CSV field is incomplete.");
  row.push(field.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}
