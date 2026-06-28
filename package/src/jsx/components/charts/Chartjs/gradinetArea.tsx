import { Component } from "react";
import { Line } from "react-chartjs-2";
import { ChartData, ChartOptions } from "chart.js";

type GradientAreaProps = object;

type GradientAreaState = object;

const data: ChartData<"line"> = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
  datasets: [
    {
      label: "My First dataset",
      data: [25, 20, 60, 41, 66, 45, 80],
      borderColor: "rgba(77,68,181,1)",
      borderWidth: 3,
      backgroundColor: "rgba(77,68,181, 0.1)",
      fill: true,
      tension: 0.4,
    },
  ],
};

const options: ChartOptions<"line"> = {
  plugins: {
    legend: {
      display: false,
    },
  },
  scales: {
    y: {
      max: 100,
      min: 0,
      ticks: {
        // beginAtZero: true,
        stepSize: 20,
        color: "#fff",
        padding: 5,
      },
    },
    x: {
      ticks: {
        color: "#fff",
        padding: 5,
      },
    },
  },
};

class GradientArea extends Component<GradientAreaProps, GradientAreaState> {
  render() {
    return (
      <>
        <Line data={data} options={options} height={150} />
      </>
    );
  }
}

export default GradientArea;
