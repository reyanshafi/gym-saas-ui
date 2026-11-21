export default function Records({ headings, records, actions }) {
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            {headings.map((heading) => (
              <th key={heading} scope="col">
                {heading}
              </th>
            ))}
            {actions && (
              <th className="actions-cell" scope="col">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.id}>
              {(record.displayValues ?? record.values)
                .slice(0, headings.length)
                .map((value, index) => (
                  <td key={headings[index]}>
                    {headings[index] === "Status" ? (
                      <span
                        className={`status ${value.toLowerCase().replaceAll(" ", "-")}`}
                      >
                        {value}
                      </span>
                    ) : (
                      value
                    )}
                  </td>
                ))}
              {actions && <td className="actions-cell">{actions(record)}</td>}
            </tr>
          ))}
          {!records.length && (
            <tr>
              <td
                className="empty-row"
                colSpan={headings.length + Number(Boolean(actions))}
              >
                No matching records.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
