import React from "react";
import ReactApexChart from "react-apexcharts";

const ThreeLineChart = (props) => {
  const { breakEven } = props;
  const breakEvenGraph = breakEven || {};
  const lineData = breakEvenGraph?.lineData || [];

  const callBreakE = lineData?.map((item) => parseInt(item[0]));
  const putBreakEven = lineData?.map((item) => parseInt(item[1]));
  const stoptPrice = lineData?.map((item) => parseInt(item[2]));
  const timeLabels = lineData?.map((item) => parseInt(item[3]));

  const options = {
    chart: {
      type: "line",
      zoom: {
        enabled: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      curve: "straight",
    },
    labels: timeLabels,
    xaxis: {
      type: "datetime",
      labels: {
        formatter: function (value) {
          const options = {
            timeZone: "Asia/Kolkata",
          };
          const date = new Date(value);
          return date.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "numeric",
            ...options,
          });
        },
      },
    },
    noData: {
      text: "No Data",
      align: "center",
      verticalAlign: "middle",
    },
  };

  const series = [
    {
      name: "Call Break Even",
      data: callBreakE,
    },
    {
      name: "Put Break Even",
      data: putBreakEven,
    },
    {
      name: "Spot Price",
      data: stoptPrice,
    },
  ];

  return (
    <ReactApexChart
      options={options}
      series={series}
      type="line"
      height={350}
    />
  );
};

export default ThreeLineChart;
