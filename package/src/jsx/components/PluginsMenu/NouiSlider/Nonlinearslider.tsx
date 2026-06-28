import React from "react";
import Nouislider from "nouislider-react";
import "nouislider/distribute/nouislider.css";

// Define the state interface
interface NonlinerSliderState {
  color: string;
  textValue: string | null;
  percent: string | null;
  value: number;
  disabled: boolean;
  range: {
    min: number;
    max: number;
  };
}

class NonlinerSlider extends React.Component<object, NonlinerSliderState> {
  state: NonlinerSliderState = {
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

  // Typing the parameters for the onSlide event handler
  onSlide = (value: [number], percent: [number]): void => {
    this.setState({
      textValue: value[0].toFixed(2),
      percent: percent[0].toFixed(2),
    });
  };

  render() {
    const { textValue, percent } = this.state;
    return (
      <div className="slider" id="NonlinerSlider">
        <Nouislider
          connect
          start={[20, 80]}
          behaviour="tap"
          range={{
            min: [0],
            max: [100],
          }}
          onSlide={() => this.onSlide}
        />
        {textValue && percent ? (
          <div>
            {textValue} {percent}
          </div>
        ) : (
          <div>
            {20.0} {80.0}
          </div>
        )}
      </div>
    );
  }
}

export default NonlinerSlider;
