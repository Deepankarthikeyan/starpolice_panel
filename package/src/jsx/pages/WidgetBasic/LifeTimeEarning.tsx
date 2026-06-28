import { Component } from "react";
import { Bar } from "react-chartjs-2";
import { ChartData, ChartOptions } from "chart.js"; // Import Chart.js types

interface LifeTimeEarningProps {
  height?: number; // Optional prop for height
}

class LifeTimeEarning extends Component<LifeTimeEarningProps> {
  render() {
    const data: ChartData<"bar"> = {
      labels: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      datasets: [
        {
          label: "My First dataset",
          data: [65, 59, 80, 81, 56, 55, 40, 88, 45, 95, 54, 76],
          borderColor: "#FF2C53",
          borderWidth: 0, // Ensure this is a number
          backgroundColor: "#FF2C53",
          barThickness: 12,
        },
      ],
    };

    const options: ChartOptions<"bar"> = {
      plugins: {
        legend: {
          display: false, // Legend is hidden
        },
        // responsive: true,
      },
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          display: false,
          ticks: {
            display: false,
            stepSize: 10,
          },
          grid: {
            display: false,
          },
        },
        x: {
          display: false,
          grid: {
            display: false,
          },
          ticks: {
            display: false,
          },
        },
      },
    };

    return (
      <>
        <Bar data={data} height={this.props.height || 100} options={options} />
      </>
    );
  }
}

export default LifeTimeEarning;
