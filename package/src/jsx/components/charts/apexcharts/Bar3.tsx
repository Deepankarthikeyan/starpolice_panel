import React from "react";
import ReactApexChart from "react-apexcharts";

const ApexBar3: React.FC = () => {
  const series: ApexAxisChartSeries = [
    {
      name: "Income",
      data: [420, 550, 850, 220, 650, 250, 350],
    },
    {
      name: "Expenses",
      data: [170, 850, 101, 90, 250, 200, 300],
    },
  ];

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: "bar",
      height: 350,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "100%",
        // endingShape: "rounded",
      },
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      show: false,
      fontSize: "12px",
      fontWeight: 300,
      labels: {
        colors: "#787878",
      },
      position: "bottom",
      horizontalAlign: "center",
      markers: {
        strokeWidth: 0,
        fillColors: ["var(--primary)", "var(--secondary)"],
        offsetX: 0,
        offsetY: 0,
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: "#fff",
          fontSize: "14px",
          fontFamily: "Poppins",
          fontWeight: 100,
        },
      },
    },
    grid: {
      borderColor: "#ffffff1a",
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    xaxis: {
      categories: ["06", "07", "08", "09", "10", "11", "12"],
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    fill: {
      colors: ["var(--primary)", "var(--secondary)"],
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: function (val: number) {
          return "$ " + val + " thousands";
        },
      },
    },
  };

  return (
    <div id="chart" className="line-chart-style bar-chart">
      <ReactApexChart
        options={options}
        series={series}
        type="bar"
        height={350}
      />
    </div>
  );
};

export default ApexBar3;
