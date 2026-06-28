import { Component } from "react";
import { Line } from "react-chartjs-2";
import "chart.js/auto";

type LineChart1Props = {
  height?: number;
};

type LineChart1State = object;

class LineChart1 extends Component<LineChart1Props, LineChart1State> {
  render() {
    const data = {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
      datasets: [
        {
          label: "My First dataset",
          data: [25, 20, 50, 41, 55, 45, 70],
          borderColor: "rgba(77,68,181,1)",
          borderWidth: 2,
          backgroundColor: "rgba(77,68,181, 0)",
          tension: 0.4,
        },
      ],
    };

    const options = {
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          display: false,
          min: 0,
          max: 100,
          ticks: {
            beginAtZero: true,
            padding: 0,
            color: "#fff",
          },
        },
        x: {
          display: false,
          ticks: {
            padding: 0,
            color: "#fff",
          },
        },
      },
      maintainAspectRatio: false,
    };

    return (
      <Line data={data} options={options} height={this.props.height || 150} />
    );
  }
}

export default LineChart1;
