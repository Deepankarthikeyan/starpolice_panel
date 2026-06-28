import { Component } from "react";
import {
  Chart as ChartJS,
  RadialLinearScale,
  ArcElement,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from "chart.js";
import { PolarArea } from "react-chartjs-2";

ChartJS.register(RadialLinearScale, ArcElement, Tooltip, Legend);

type PolarChartProps = object;

type PolarChartState = object;

const data: ChartData<"polarArea"> = {
  labels: ["Label 1", "Label 2", "Label 3", "Label 4", "Label 5"],
  datasets: [
    {
      data: [15, 18, 9, 6, 19],
      borderWidth: 0,
      backgroundColor: [
        "rgba(235, 129, 83,1)",
        "rgba(112, 159, 186, 1)",
        "rgba(238, 60, 60, 1)",
        "rgba(54, 147, 255, 1)",
        "rgba(77,68,181,1)",
      ],
    },
  ],
};

const options: ChartOptions<"polarArea"> = {
  plugins: {
    //  responsive: true,
  },
  maintainAspectRatio: false,
};

class PolarChart extends Component<PolarChartProps, PolarChartState> {
  render() {
    return <PolarArea data={data} options={options} height={150} />;
  }
}

export default PolarChart;
