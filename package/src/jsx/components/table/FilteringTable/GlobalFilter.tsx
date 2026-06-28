interface PropType {
  filter: string | undefined;
  setFilter: (value: string) => void;
}

export const GlobalFilter: React.FC<PropType> = ({ filter, setFilter }) => {
  return (
    <div>
      Search:{" "}
      <input
        className="ml-2 input-search form-control"
        value={filter || ""}
        onChange={(e) => setFilter(e.target.value)}
        style={{ width: "20%" }}
      />
    </div>
  );
};
