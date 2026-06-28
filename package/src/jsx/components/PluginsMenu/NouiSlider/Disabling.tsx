import React from "react";
import Nouislider from "nouislider-react";
import "nouislider/distribute/nouislider.css";

// Define the state interface
interface DisablingState {
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

class Disabling extends React.Component<object, DisablingState> {
  state: DisablingState = {
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

  // Method to toggle the disabled state
  changeDisabled = (): void => {
    this.setState((prevState) => ({ disabled: !prevState.disabled }));
  };

  render() {
    const { disabled } = this.state;
    return (
      <div className="slider" id="Disabling">
        <Nouislider
          disabled={disabled}
          start={40}
          range={{
            min: 0,
            max: 100,
          }}
        />
        <label>
          <input
            className="me-1"
            type="checkbox"
            id="checkbox1"
            onClick={this.changeDisabled}
          />
          Disable slider
        </label>
      </div>
    );
  }
}

export default Disabling;
