import { Component } from "react";
import { Line } from "react-chartjs-2";
import { ChartData, ChartOptions } from "chart.js"; // Import Chart.js types

class TopProducts1 extends Component {
  render() {
    const data: ChartData<"line"> = {
      labels: [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ],
      datasets: [
        {
          label: "Sales Stats",
          backgroundColor: "#2780d4",
          borderColor: "#2780d4",
          pointBackgroundColor: "#2780d4",
          pointBorderColor: "#2780d4",
          pointHoverBackgroundColor: "#2780d4",
          pointHoverBorderColor: "#2780d4",
          fill: true,
          data: [
            20, 10, 18, 15, 32, 18, 15, 22, 8, 6, 12, 13, 10, 18, 14, 24, 16,
            12, 19, 21, 16, 14, 24, 21, 13, 15, 27, 29, 21, 11, 14, 19, 21, 17,
          ],
        },
      ],
    };

    const options: ChartOptions<"line"> = {
      plugins: {
        title: {
          display: false,
        },
        tooltip: {
          // Updated from tooltips to tooltip
          intersect: false,
          mode: "nearest",
          padding: 10,
        },
        legend: {
          display: false,
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
          top: 5,
          bottom: 0,
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

export default TopProducts1;
