import { Component } from "react";
import { Bar } from "react-chartjs-2";
import { ChartOptions } from "chart.js"; // Import Chart.js types

interface VisitorActivityProps {
  dataActive: number;
  width?: number;
  height?: number;
}

class VisitorActivity extends Component<VisitorActivityProps> {
  static defaultProps = {
    width: 433,
    height: 251,
  };

  render() {
    const activityData: number[][] = [
      [35, 18, 25, 35, 40, 20, 30, 25, 22, 20, 45, 35],
      [50, 35, 25, 45, 40, 50, 60, 80, 25, 50, 34, 35],
      [25, 35, 60, 45, 40, 70, 30, 80, 65, 70, 60, 25],
      [25, 88, 25, 50, 70, 70, 60, 70, 50, 60, 50, 70],
    ];

    const data = {
      labels: [
        "01",
        "02",
        "03",
        "04",
        "05",
        "06",
        "07",
        "08",
        "09",
        "10",
        "11",
        "12",
      ],
      datasets: [
        {
          label: "Visitor Activity",
          data: activityData[this.props.dataActive],
          borderColor: "rgba(77,68,181,1)",
          borderWidth: 0,
          backgroundColor: "rgba(77,68,181,1)",
        },
      ],
    };

    // Type the options using ChartOptions
    const options: ChartOptions<"bar"> = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          titleColor: "#888",
          bodyColor: "#555",
          titleFont: {
            size: 12,
          },
          bodyFont: {
            size: 15,
          },
          backgroundColor: "rgba(256,256,256,0.95)",
          displayColors: true,
          padding: {
            x: 10,
            y: 7,
          },
          borderColor: "rgba(220, 220, 220, 0.9)",
          borderWidth: 2,
          caretSize: 6,
          caretPadding: 10,
        },
      },
      scales: {
        y: {
          grid: {
            color: "rgba(89, 59, 219,0.1)",
          },
          ticks: {
            color: "#999",
          },
        },
        x: {
          grid: {
            display: false,
          },
          ticks: {
            stepSize: 5,
            color: "#999",
          },
        },
      },
      interaction: {
        mode: "index",
        intersect: false,
      },
    };

    return (
      <div style={{ minHeight: "290px" }}>
        <Bar
          data={data}
          width={this.props.width} // Default width handled via defaultProps
          height={this.props.height} // Default height handled via defaultProps
          options={options}
        />
      </div>
    );
  }
}

export default VisitorActivity;
