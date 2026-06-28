import React from "react";
import { Pie } from "react-chartjs-2";
import { ChartData, ChartOptions } from "chart.js";

const TotalStudent: React.FC = () => {
  const data: ChartData<"pie"> = {
    datasets: [
      {
        data: [37, 17, 44],
        borderWidth: 0,
        backgroundColor: ["#7099ED", "#B3CCFF", "#9DBDFF"],
        hoverBackgroundColor: ["#7099ED", "#B3CCFF", "#9DBDFF"],
      },
    ],
    labels: ["Group 1", "Group 2", "Group 3"],
  };

  const options: ChartOptions<"pie"> = {
    plugins: {
      legend: {
        display: false,
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <div style={{ height: 100 }}>
      <Pie data={data} height={100} options={options} />
    </div>
  );
};

export default TotalStudent;
