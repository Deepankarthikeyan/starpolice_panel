import React from "react";
import { Pie } from "react-chartjs-2";
import { ChartOptions, ChartData } from "chart.js";

type PieChartProps = {
  color1?: string;
  color2?: string;
  color3?: string;
  color4?: string;
  height?: number;
};

const PieChart: React.FC<PieChartProps> = ({
  color1,
  color2,
  color3,
  color4,
  height,
}) => {
  const data: ChartData<"pie", number[], unknown> = {
    datasets: [
      {
        data: [45, 25, 20, 10],
        borderWidth: 0,
        backgroundColor: [
          color1 || "rgba(77,68,181,1)",
          color2 || "rgba(77,68,181,0.7)",
          color3 || "rgba(77,68,181,0.5)",
          color4 || "rgba(0, 0, 0, 0.07)",
        ],
        hoverBackgroundColor: [
          color1 || "rgba(77,68,181,1)",
          color2 || "rgba(77,68,181,0.7)",
          color3 || "rgba(77,68,181,0.5)",
          color4 || "rgba(0, 0, 0, 0.07)",
        ],
      },
    ],
    labels: ["one", "two", "three"],
  };

  const options: ChartOptions<"pie"> = {
    plugins: {
      legend: {
        display: false,
      },
      // responsive: true,
    },
    maintainAspectRatio: false,
  };

  return <Pie data={data} height={height || 200} options={options} />;
};

export default PieChart;
