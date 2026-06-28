import React from "react";
import Nouislider from "nouislider-react";
import "nouislider/distribute/nouislider.css";

// Define the color options
const COLORS = ["red", "green", "blue"];
const colors = [0, 0, 0];

// Define the state interface
interface ColorpickerState {
  color: string;
  textValue: string | null;
  percent: number | null;
  value: number;
  disabled: boolean;
  range: {
    min: number;
    max: number;
  };
}

class Colorpicker extends React.Component<object, ColorpickerState> {
  state: ColorpickerState = {
    color: "rgb(127, 127, 127)",
    textValue: null,
    percent: null,
    value: 0,
    disabled: false,
    range: {
      min: 0,
      max: 100,
    },
  };

  // Define the type for the value passed by onUpdate (expected as an array of numbers)
  onUpdate = (index: number) => (value: [number]) => {
    colors[index] = value[0]; // Update the colors array with the new value
    this.setState({ color: `rgb(${colors.join(",")})` }); // Update the color in state
  };

  render() {
    const { color } = this.state;
    return (
      <div className="slider" id="colorpicker">
        {COLORS.map((item, index) => (
          <Nouislider
            key={item}
            id={item}
            start={127}
            connect={[true, false]}
            orientation="vertical"
            range={{
              min: 0,
              max: 255,
            }}
            onUpdate={() => this.onUpdate(index)}
          />
        ))}
        <div id="result" style={{ background: color, color }} />
      </div>
    );
  }
}

export default Colorpicker;
