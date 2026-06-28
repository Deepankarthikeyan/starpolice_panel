import { Component } from "react";
import { Line } from "react-chartjs-2";
import { ChartData, ChartOptions } from "chart.js"; // Import Chart.js types

class AllSell2 extends Component {
  render() {
    // Properly type the data and options
    const data: ChartData<"line"> = {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
      datasets: [
        {
          label: "My First dataset",
          data: [25, 60, 30, 71, 26, 85, 50],
          borderColor: "#2780d4",
          borderWidth: 2, // Use a number for borderWidth
          backgroundColor: "transparent",
          pointBackgroundColor: "#2780d4",
          pointRadius: 0,
          tension: 0.4,
        },
      ],
    };

    const options: ChartOptions<"line"> = {
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
          max: 100,
          min: 0,
          ticks: {
            // beginAtZero: true,
            stepSize: 20,
            padding: 0,
            display: false,
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
            display: false,
          },
          grid: {
            display: false,
            // drawBorder: false,
          },
        },
      },
    };

    return (
      <div style={{ height: 150 }}>
        <Line data={data} options={options} height={150} />
      </div>
    );
  }
}

export default AllSell2;
