import { useState } from "react";
import Select from "react-select";

// Define the type for the option
interface Option {
  value: string;
  label: string;
  isDisabled?: boolean;
}

const options: Option[] = [
  { value: "chocolate", label: "Chocolate" },
  { value: "strawberry", label: "Strawberry", isDisabled: true },
  { value: "vanilla", label: "Vanilla" },
];

const Disabling = () => {
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);

  return (
    <div>
      <Select
        defaultValue={selectedOption}
        onChange={setSelectedOption}
        options={options}
        styles={{
          control: (base) => ({
            ...base,
            lineHeight: "40px",
            color: "#7e7e7e",
            paddingLeft: "15px",
          }),
        }}
      />
    </div>
  );
};

export default Disabling;
