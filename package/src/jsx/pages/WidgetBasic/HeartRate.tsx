import { Component } from "react";
import { Bar } from "react-chartjs-2";
import { ChartData, ChartOptions } from "chart.js"; // Import Chart.js types

class HeartRate extends Component {
  render() {
    // Properly type the data and options
    const data: ChartData<"bar"> = {
      labels: [
        73, 53, 50, 67, 3, 56, 19, 59, 37, 32, 40, 26, 71, 19, 4, 53, 55, 31,
        37,
      ],
      datasets: [
        {
          label: "My First dataset",
          data: [
            73, 53, 50, 67, 3, 56, 19, 59, 37, 32, 40, 26, 71, 19, 4, 53, 55,
            31, 37, 67, 10, 21,
          ],
          borderColor: "#2258bf",
          borderWidth: 0, // Use a number for borderWidth
          backgroundColor: "#2258bf",
        },
      ],
    };

    const options: ChartOptions<"bar"> = {
      plugins: {
        legend: {
          display: false, // Should be an object with `display` key
        },
      },
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          display: false,
          ticks: {
            // beginAtZero: true,
            display: false,
            // max: 100,
            // min: 0,
            stepSize: 7,
          },
          grid: {
            display: false,
            // drawBorder: false,
          },
        },
        x: {
          display: false,
          grid: {
            display: false,
            // drawBorder: false,
          },
          ticks: {
            display: false,
          },
        },
      },
    };

    return (
      <div style={{ height: 100 }}>
        <Bar data={data} height={100} options={options} />
      </div>
    );
  }
}

export default HeartRate;
