interface newType {
  filterValue: string;
  setFilter: (value: string) => void;
}

interface propType {
  column: newType;
}

export const ColumnFilter = ({ column }: propType) => {
  const { filterValue, setFilter } = column;
  return (
    <div>
      <input
        className="form-control input-search"
        value={filterValue || ""}
        onChange={(e) => setFilter(e.target.value)}
      />
    </div>
  );
};
