/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useMemo } from "react";
import { useTable, useSortBy, TableInstance, Column } from "react-table";
import MOCK_DATA from "./MOCK_DATA_3.json";
import { COLUMNS } from "./Columns";

// Define the type of data in the table. You should adjust this based on the structure of your data.
interface Data {
  [key: string]: string | number; // Adjust this according to the actual data structure.
}

export const SortingTable: React.FC = () => {
  // Using useMemo to memoize columns and data
  const columns = useMemo<Column<Data>[]>(() => COLUMNS, []);
  const data = useMemo<Data[]>(() => MOCK_DATA, []);

  // Define TableInstance with the correct types
  const tableInstance: TableInstance<Data> = useTable(
    {
      columns,
      data,
    },
    useSortBy
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    tableInstance;

  return (
    <>
      <div className="card">
        <div className="card-header">
          <h4 className="card-title">Table Sorting</h4>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <div className="dataTables_wrapper">
              <table {...getTableProps()} className="table dataTable display">
                <thead>
                  {headerGroups.map((headerGroup) => (
                    <tr
                      {...headerGroup.getHeaderGroupProps()}
                      key={headerGroup.id}
                    >
                      {headerGroup.headers.map((column) => {
                        return (
                          <th
                            {...column.getHeaderProps(
                              // @ts-ignore
                              column.getSortByToggleProps()
                            )}
                            key={column.id}
                          >
                            {column.render("Header")}
                            <span className="ml-1">
                              {/* @ts-ignore */}
                              {column?.isSorted ? (
                                // @ts-expect-error
                                column?.isSortedDesc ? (
                                  <i
                                    className="fa fa-arrow-down ms-2 fs-14"
                                    style={{ opacity: "0.7" }}
                                  />
                                ) : (
                                  <i
                                    className="fa fa-arrow-up ms-2 fs-14"
                                    style={{ opacity: "0.7" }}
                                  />
                                )
                              ) : (
                                <i
                                  className="fa fa-sort ms-2 fs-14"
                                  style={{ opacity: "0.3" }}
                                />
                              )}
                            </span>
                          </th>
                        );
                      })}
                    </tr>
                  ))}
                </thead>
                <tbody {...getTableBodyProps()}>
                  {rows.map((row) => {
                    prepareRow(row);
                    return (
                      <tr {...row.getRowProps()} key={row.id || row.index}>
                        {row.cells.map((cell) => (
                          <td {...cell.getCellProps()} key={cell.column.id}>
                            {cell.render("Cell")}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SortingTable;
