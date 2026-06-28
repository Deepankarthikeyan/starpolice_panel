import React from "react";
import Nouislider from "nouislider-react";
import "nouislider/distribute/nouislider.css";

// Define the state interface
interface ClickAblePipsState {
  color: string;
  textValue: string | null;
  percent: number | null;
  value: number;
  disabled: boolean;
  range: {
    min: number;
    max: number;
  };
  skippingValue?: number; // Optional skipping value
}

class ClickAblePips extends React.Component<object, ClickAblePipsState> {
  state: ClickAblePipsState = {
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

  // Typing the onSkipSlide event handler
  onSkipSlide = (value: [number]): void => {
    this.setState({
      skippingValue: value[0], // Update skippingValue with the value from the slider
    });
  };

  render() {
    return (
      <div className="slider" id="ClickAblePips">
        <Nouislider
          start={[1000]} // Initial value for the slider
          pips={{ mode: "count", values: 5 }} // Pips configuration
          clickablePips // Allow pips to be clickable
          range={{
            min: 0,
            max: 1000,
          }}
          onSlide={() => this.onSkipSlide} // Add onSlide handler if needed
        />
      </div>
    );
  }
}

export default ClickAblePips;
