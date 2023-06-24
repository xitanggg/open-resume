import { cx } from "lib/cx";

export const Table = ({
  table,
  title,
  className,
  trClassNames = [],
  tdClassNames = [],
}: {
  table: React.ReactNode[][];
  title?: string;
  className?: string;
  trClassNames?: string[];
  tdClassNames?: string[];
}) => {
  const tableHeader = table[0];
  const tableBody = table.slice(1);
  return (
    <table
      className={cx("w-full divide-y border text-sm text-gray-900", className)}
    >
      <thead className="divide-y bg-gray-50 text-left align-top">
        {title && (
          <tr className="divide-x bg-gray-50">
            <th
              className="px-2 py-1.5 font-bold"
              scope="colSpan"
              colSpan={tableHeader.length}
            >
              {title}
            </th>
          </tr>
        )}
        <tr className="divide-x bg-gray-50">
          {tableHeader.map((item, idx) => (
            <th className="px-2 py-1.5 font-semibold" scope="col" key={idx}>
              {item}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y text-left align-top">
        {tableBody.map((row, rowIdx) => (
          <tr className={cx("divide-x", trClassNames[rowIdx])} key={rowIdx}>
            {row.map((item, colIdx) => (
              <td
                className={cx("px-2 py-1.5", tdClassNames[colIdx])}
                key={colIdx}
              >
                {item}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
