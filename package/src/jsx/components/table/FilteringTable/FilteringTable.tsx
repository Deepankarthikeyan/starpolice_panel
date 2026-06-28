/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useMemo } from "react";
import {
  useTable,
  useGlobalFilter,
  useFilters,
  usePagination,
  TableInstance,
  UsePaginationInstanceProps,
  UsePaginationState,
  UseGlobalFiltersInstanceProps,
  UseGlobalFiltersState,
} from "react-table";
import MOCK_DATA from "./MOCK_DATA_2.json";
import { COLUMNS } from "./Columns";
import { GlobalFilter } from "./GlobalFilter";
import "./filtering.css";

interface Data {
  [key: string]: string | number; // Adjust types based on your data structure
}

export const FilteringTable: React.FC = () => {
  const columns = useMemo(() => COLUMNS, []);
  const data = useMemo(() => MOCK_DATA as Data[], []);

  // @ts-expect-error
  const tableInstance: TableInstance<Data> &
    UsePaginationInstanceProps<Data> &
    UsePaginationState<Data> &
    UseGlobalFiltersInstanceProps<Data> &
    UseGlobalFiltersState<Data> = useTable(
    {
      // @ts-expect-error
      columns,
      data,
      // @ts-expect-error
      initialState: { pageIndex: 0 },
    },
    useFilters,
    useGlobalFilter,
    usePagination
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    state,
    page,
    pageCount,
    pageOptions,
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    gotoPage,
    setGlobalFilter,
  } = tableInstance;

  const { globalFilter, pageIndex } = state as UsePaginationState<Data> &
    UseGlobalFiltersState<Data>;

  return (
    <div className="card">
      <div className="card-header">
        <h4 className="card-title">Table Filtering</h4>
      </div>
      <div className="card-body">
        <div className="table-responsive">
          <GlobalFilter filter={globalFilter} setFilter={setGlobalFilter} />
          <table {...getTableProps()} className="table dataTable display">
            <thead>
              {headerGroups.map((headerGroup) => (
                <tr {...headerGroup.getHeaderGroupProps()} key={headerGroup.id}>
                  {headerGroup.headers.map((column) => (
                    <th {...column.getHeaderProps()} key={column.id}>
                      {column.render("Header")}
                      {/* @ts-expect-error */}
                      {column?.canFilter ? column.render("Filter") : null}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()}>
              {page.map((row) => {
                prepareRow(row);
                return (
                  <tr {...row.getRowProps()} key={row.id}>
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
          <div className="d-flex justify-content-between">
            <span>
              Page{" "}
              <strong>
                {pageIndex + 1} of {pageOptions.length}
              </strong>
            </span>
            <span className="table-index">
              Go to page:{" "}
              <input
                type="number"
                defaultValue={pageIndex + 1}
                onChange={(e) => {
                  const pageNumber = e.target.value
                    ? Number(e.target.value) - 1
                    : 0;
                  gotoPage(pageNumber);
                }}
              />
            </span>
          </div>
          <div className="text-center mb-3">
            <div className="filter-pagination mt-3">
              <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
                {"<<"}
              </button>
              <button
                onClick={() => previousPage()}
                disabled={!canPreviousPage}
              >
                Previous
              </button>
              <button onClick={() => nextPage()} disabled={!canNextPage}>
                Next
              </button>
              <button
                onClick={() => gotoPage(pageCount - 1)}
                disabled={!canNextPage}
              >
                {">>"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilteringTable;
