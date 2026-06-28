import Select, { components, GroupBase, GroupProps } from "react-select";
import { colourOptions, groupedOptions } from "./data";
import { JSX } from "react/jsx-runtime";

const groupStyles = {
  border: `2px dotted ${colourOptions[2].color}`,
  borderRadius: "5px",
  background: "#f2fcff",
};

const Group = (props: JSX.IntrinsicAttributes & GroupProps<unknown, boolean, GroupBase<unknown>>) => (
  <div style={groupStyles}>
    <components.Group {...props} />
  </div>
);

export default function customGroup() {
  return (
    <Select
      defaultValue={colourOptions[1]}
      options={groupedOptions}
      components={{ Group }}
    />
  );
}
