import React from "react";
import Chart from "react-apexcharts";

const ColumnChart = (props) => {
  const {
    title,
    strikePrice,
    changeOIC,
    changeOIP,
    openInterestC,
    openInterestP,
  } = props;

  const options = {
    chart: {
      type: "bar",
      height: 350,
    },
    xaxis: {
      categories: strikePrice,
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
        endingShape: "rounded",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    fill: {
      opacity: 1,
    },
    colors: ["#F54040", "#0F9D22"],
    noData: {
      text: "No Data",
      align: "center",
      verticalAlign: "middle",
    },
  };

  const series = [
    {
      name: title === "Open Interest Change" ? "CALL OI CHANGE" : "CALL OI ",
      data: title === "Open Interest Change" ? changeOIC : openInterestC,
    },
    {
      name: title === "Open Interest Change" ? "PUT OI CHANGE" : "PUT OI ",
      data: title === "Open Interest Change" ? changeOIP : openInterestP,
    },
  ];

  return (
    <div>
      <Chart options={options} series={series} type="bar" height={350} />
    </div>
  );
};

export default ColumnChart;
