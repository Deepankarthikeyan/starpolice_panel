import { Component } from "react";
import { Bar } from "react-chartjs-2";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

type BarChart1Props = object;

type BarChart1State = object;

class BarChart1 extends Component<BarChart1Props, BarChart1State> {
  render() {
    const data: ChartData<"bar"> = {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
      datasets: [
        {
          label: "My First dataset",
          data: [65, 59, 80, 81, 56, 55, 40],
          borderColor: "rgba(77,68,181, 1)",
          borderWidth: 0,
          backgroundColor: "rgba(77,68,181, 1)",
          barThickness: 40,
        },
      ],
    };

    const options: ChartOptions<"bar"> = {
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          display: false,
          ticks: {
            // beginAtZero: true,
            color: "#fff",
          },
        },
        x: {
          display: false,
          // barPercentage: 0.5,
          ticks: {
            color: "#fff",
          },
        },
      },
      maintainAspectRatio: false,
    };

    return <Bar data={data} height={150} options={options} />;
  }
}

export default BarChart1;
