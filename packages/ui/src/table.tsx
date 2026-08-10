import type { ReactNode } from 'react';

export function Table({ head, children }: { head: ReactNode[]; children: ReactNode }) {
  return (
    <div className="tly-table-wrap">
      <table className="tly-table">
        <thead>
          <tr>
            {head.map((h, i) => (
              <th key={i}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
