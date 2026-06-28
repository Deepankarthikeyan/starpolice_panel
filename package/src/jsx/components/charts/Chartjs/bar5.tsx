import { Component } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

// Register required Chart.js components
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

class BarChart5 extends Component {
  render() {
    const data = {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
      datasets: [
        {
          label: "My First dataset",
          data: [65, 59, 80, 81, 56, 55, 40],
          borderColor: "rgba(0, 0, 0, 0.25)",
          borderWidth: 0,
          backgroundColor: "rgba(77,68,181, 0.5)",
          hoverBackgroundColor: "rgba(77,68,181, 0.5)",
          barThickness: 40,
        },
      ],
    };

    const options = {
      plugins: {
        legend: {
          display: false, // Hide legend
        },
      },
      scales: {
        y: {
          display: false, // Hide y-axis
          ticks: {
            beginAtZero: true,
            color: "#fff", // Change text color
          },
        },
        x: {
          display: false, // Hide x-axis
          ticks: {
            color: "#fff", // Change text color
          },
          barPercentage: 0.5,
        },
      },
      maintainAspectRatio: false, // Optional for responsive charts
    };

    return (
      <div style={{ height: "150px" }}>
        <Bar data={data} options={options} />
      </div>
    );
  }
}

export default BarChart5;
