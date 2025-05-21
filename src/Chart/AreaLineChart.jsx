import React from "react";
import ReactApexChart from "react-apexcharts";

const TwoLineChart = (props) => {
  const { OiGraph, strikePrice } = props;
  const graphOiData = OiGraph || {};
  const lineData = graphOiData?.lineData || [];

  const callData = lineData?.map((item) => parseInt(item[0]));
  const putData = lineData?.map((item) => parseInt(item[1]));
  const timeLabels = lineData?.map((item) => parseInt(item[2]));

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
    colors: ["#F54040", "#0F9D22", "#000000"],
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
      name: "Call",
      data: callData,
    },
    {
      name: "Put",
      data: putData,
    },
    {
      name: `PCR : (${strikePrice})`,
      data: [],
    },
  ];

  return (
    <div>
      <ReactApexChart options={options} series={series} height={350} />
    </div>
  );
};

export default TwoLineChart;
