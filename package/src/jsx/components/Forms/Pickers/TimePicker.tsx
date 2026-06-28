import { useState } from "react";
import TimePicker from "react-time-picker";

import "react-time-picker/dist/TimePicker.css";
import "react-clock/dist/Clock.css";

// TimePicker component where value is a string in HH:mm format
function TimePickerComponent() {
  const [value, onChange] = useState<string>("10:00"); // Use string type for value

  return (
    <div>
      <TimePicker onChange={() => onChange} value={value} />
    </div>
  );
}

// CurrentTimePicker component with correct value type (string)
function CurrentTimePicker() {
  const [value2, onChange2] = useState<string>("10:00"); // Set as string type

  return (
    <>
      <TimePicker onChange={() => onChange2} value={value2} />
    </>
  );
}

export { CurrentTimePicker };
export default TimePickerComponent;
