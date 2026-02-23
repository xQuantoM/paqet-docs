interface ConfigTableProps {
  headers: string[];
  rows: string[][];
}

export function ConfigTable({ headers, rows }: ConfigTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="min-w-full">
        <thead>
          <tr className="bg-surface border-b border-border">
            {headers.map((header, i) => (
              <th
                key={i}
                className="px-4 py-3 text-left text-sm font-semibold text-text-muted"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className="border-b border-border last:border-b-0 hover:bg-surface/50 transition-colors"
            >
              {row.map((cell, j) => (
                <td
                  key={j}
                  className="px-4 py-3 text-sm text-text"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
