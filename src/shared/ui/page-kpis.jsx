export default function PageKpis({ items, label = "Page summary" }) {
  if (!items?.length) return null;
  return (
    <dl className="panel page-kpis" aria-label={label}>
      {items.map(([name, value, detail]) => (
        <div key={name}>
          <dt>{name}</dt>
          <dd>{value}</dd>
          {detail && <small>{detail}</small>}
        </div>
      ))}
    </dl>
  );
}
