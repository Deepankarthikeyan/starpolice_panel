import { Component } from "react";
import { Bar } from "react-chartjs-2";
import { ChartData, ChartOptions } from "chart.js"; // Import Chart.js types

class BloodPressure extends Component {
  render() {
    // Properly type the data and options
    const data: ChartData<"bar"> = {
      labels: [33, 22, 68, 54, 8, 30, 74, 7, 36, 5, 41, 19, 43, 29, 38],
      datasets: [
        {
          label: "My First dataset",
          data: [33, 22, 68, 54, 8, 30, 74, 7, 36, 5, 41, 19, 43, 29, 38],
          borderColor: "#709fba",
          borderWidth: 0, // Use a number for borderWidth
          backgroundColor: "#709fba",
          barThickness: 12,
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
          // barPercentage: 0.6,
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

export default BloodPressure;
