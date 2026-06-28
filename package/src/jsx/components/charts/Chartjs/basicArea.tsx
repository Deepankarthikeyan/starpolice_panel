import { Component } from "react";
import { Line } from "react-chartjs-2";
import { ChartData, ChartOptions } from "chart.js";

type BasicAreaProps = object;

type BasicAreaState = object;

const data: ChartData<"line"> = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
  datasets: [
    {
      label: "My First dataset",
      data: [25, 20, 60, 41, 66, 45, 80],
      borderColor: "rgba(77,68,181,1)",
      borderWidth: 1,
      backgroundColor: "rgba(77,68,181,0.5)",
      pointBackgroundColor: "rgba(77,68,181,1)",
      tension: 0.4,
      fill: true,
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
      min: 0,
      max: 100,
      ticks: {
        // beginAtZero: true,
        color: "#fff",
        stepSize: 20,
        padding: 10,
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

class BasicArea extends Component<BasicAreaProps, BasicAreaState> {
  render() {
    return <Line data={data} options={options} height={150} />;
  }
}

export default BasicArea;
