export default function ReportBreakdown({ title, caption, rows, chronological }) {
  const visibleRows = chronological
    ? rows.slice(-12)
    : [...rows].sort((a, b) => Math.abs(b.value) - Math.abs(a.value)).slice(0, 8);
  const scale = Math.max(1, ...visibleRows.map(({ value }) => Math.abs(value)));
  const hasNegative = visibleRows.some(({ value }) => value < 0);

  return (
    <section className="panel finance-breakdown" aria-label={title + " chart"}>
      <header className="panel-header">
        <div>
          <h2>{title}</h2>
          {caption && <p>{caption}</p>}
          {rows.length > visibleRows.length && (
            <p>{chronological ? "Latest" : "Top"} {visibleRows.length} of {rows.length} rows</p>
          )}
        </div>
      </header>
      {visibleRows.length ? (
        <ul className="finance-bars" data-signed={hasNegative || undefined}>
          {visibleRows.map(({ key, value, label }) => (
            <li key={key}>
              <div className="finance-bar-label"><span>{key}</span><strong>{label}</strong></div>
              <span className="finance-bar-track" aria-hidden="true">
                <span data-negative={value < 0 || undefined} style={{ width: Math.abs(value) / scale * (hasNegative ? 50 : 100) + "%" }} />
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="finance-chart-empty">No records match these filters.</p>
      )}
    </section>
  );
}
