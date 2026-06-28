import { Component } from "react";
import { Bar } from "react-chartjs-2";
import { ChartData, ChartOptions } from "chart.js"; // Import Chart.js types

class NewStudent extends Component {
  render() {
    const data: ChartData<"bar"> = {
      labels: [33, 22, 68, 54, 8, 30, 74, 7, 36, 5, 41, 19, 43],
      datasets: [
        {
          label: "My First dataset",
          data: [33, 22, 68, 54, 8, 30, 74, 7, 36, 5, 41, 19, 43],
          borderColor: "#FFCE78",
          borderWidth: 0, // Ensure this is a number
          backgroundColor: "#FFCE78",
          barThickness: 10,
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
      <div style={{ height: 150 }}>
        <Bar data={data} height={150} options={options} />
      </div>
    );
  }
}

export default NewStudent;
