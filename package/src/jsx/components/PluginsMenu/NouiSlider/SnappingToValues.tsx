import React from "react";
import Nouislider from "nouislider-react";
import "nouislider/distribute/nouislider.css";

// Define the state interface
interface SnappingTOValuesState {
  color: string;
  textValue: string | null;
  percent: number | null;
  value: number;
  disabled: boolean;
  range: {
    min: number;
    max: number;
  };
  skippingValue?: number; // Optional field for the skipping value
}

class SnappingTOValues extends React.Component<object, SnappingTOValuesState> {
  state: SnappingTOValuesState = {
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

  // Typing the parameters of onSkipSlide
  onSkipSlide = (value: [number]): void => {
    this.setState({
      skippingValue: value[0], // Value is an array with the first element being the number
    });
  };

  render() {
    return (
      <div className="slider" id="SnappingTOValues">
        <Nouislider
          start={2000}
          snap
          range={{
            min: [2000],
            "10%": 3000,
            "20%": 4000,
            "30%": 5000,
            "50%": 6000,
            "60%": 7000,
            "70%": 8000,
            "90%": 9000,
            max: [10000],
          }}
          onSlide={() => this.onSkipSlide}
        />
        {this.state.skippingValue ? (
          <div> {Math.floor(this.state.skippingValue)}.00</div>
        ) : (
          <div> 2000.00</div>
        )}
      </div>
    );
  }
}

export default SnappingTOValues;
