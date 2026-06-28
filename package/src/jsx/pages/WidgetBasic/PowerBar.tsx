import { Component } from "react";
import { Bar } from "react-chartjs-2";
import { ChartData, ChartOptions } from "chart.js"; // Import Chart.js types

class PowerBar extends Component {
  render() {
    const data: ChartData<"bar"> = {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
      datasets: [
        {
          label: "My First dataset",
          data: [65, 59, 80, 81, 56, 55, 40],
          borderColor: "rgba(255, 255, 255, .8)",
          borderWidth: 0, // Ensure this is a number
          backgroundColor: "rgba(255, 255, 255, .8)",
          hoverBackgroundColor: "rgba(255, 255, 255, .8)",
          barThickness: 40,
        },
      ],
    };

    const options: ChartOptions<"bar"> = {
      plugins: {
        legend: {
          display: false, // Set to false to hide the legend
        },
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
      <div style={{ height: 140 }}>
        <Bar data={data} height={140} options={options} />
      </div>
    );
  }
}

export default PowerBar;
