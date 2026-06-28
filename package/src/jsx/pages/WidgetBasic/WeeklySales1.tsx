import { Component } from "react";
import { Line } from "react-chartjs-2";
import { ChartData, ChartOptions } from "chart.js"; // Import Chart.js types

class WeeklySales1 extends Component {
  render() {
    const data: ChartData<"line"> = {
      labels: ["January", "February", "March", "April", "May", "June"],
      datasets: [
        {
          label: "Sales Stats",
          backgroundColor: "rgba(139, 177, 199, .6)",
          borderColor: "#709fba",
          pointBackgroundColor: "#709fba",
          pointBorderColor: "#709fba",
          pointHoverBackgroundColor: "#709fba",
          pointHoverBorderColor: "#709fba",
          fill: true,
          data: [0, 18, 14, 20, 16, 26],
        },
      ],
    };

    const options: ChartOptions<"line"> = {
      plugins: {
        title: {
          display: false, // Set to false to hide the title
        },
        tooltip: {
          // Updated from tooltips to tooltip
          intersect: false,
          mode: "nearest",
          padding: 5,
        },
        legend: {
          display: false, // Set to false to hide the legend
        },
      },
      responsive: true,
      maintainAspectRatio: false,
      hover: {
        mode: "index",
      },
      scales: {
        x: {
          display: false,
          grid: {
            display: false,
          },
          title: {
            // Updated from scaleLabel to title
            display: true,
            text: "Month",
          },
          // ticks: {
          //   max: 30,
          //   min: 0,
          // },
        },
        y: {
          display: false,
          grid: {
            display: false,
          },
          title: {
            // Updated from scaleLabel to title
            display: true,
            text: "Value",
          },
          // ticks: {
          //   beginAtZero: true,
          // },
        },
      },
      elements: {
        line: {
          tension: 0.15,
        },
        point: {
          radius: 2,
          borderWidth: 1,
        },
      },
      layout: {
        padding: {
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
        },
      },
    };

    return (
      <div style={{ height: 290 }}>
        <Line data={data} options={options} height={290} />
      </div>
    );
  }
}

export default WeeklySales1;
