import { Component } from "react";
import { Line } from "react-chartjs-2";
import { ChartData, ChartOptions } from "chart.js"; // Import Chart.js types

class WeeklySales2 extends Component {
  render() {
    // Properly type the data and options
    const data: ChartData<"line"> = {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
      datasets: [
        {
          label: "My First dataset",
          data: [25, 60, 30, 71, 26, 85, 50],
          borderColor: "rgba(108,75,174, 1)",
          borderWidth: 2, // Use a number for width
          backgroundColor: "rgba(108,75,174, 0.3)", // Use a semi-transparent color for fill
          pointBackgroundColor: "rgba(108, 75, 174, 1)",
          pointRadius: 0,
          tension: 0.3,
          fill: true,
        },
      ],
    };

    const options: ChartOptions<"line"> = {
      plugins: {
        legend: {
          display: false, // Should be an object with `display` key
        },
        tooltip: {
          intersect: false,
          mode: "nearest",
          padding: 10,
        },
      },
      maintainAspectRatio: false,
      scales: {
        y: {
          display: false,
          ticks: {
            // beginAtZero: true,
            // max: 100,
            // min: 0,
            stepSize: 20,
            padding: 0,
          },
          grid: {
            // drawBorder: false,
            display: false,
          },
        },
        x: {
          display: false,
          ticks: {
            padding: 0,
            // beginAtZero: true,
          },
          grid: {
            display: false,
            // drawBorder: false,
          },
        },
      },
    };

    return (
      <div style={{ height: 300 }}>
        <Line data={data} options={options} height={300} />
      </div>
    );
  }
}

export default WeeklySales2;
