import React, { useMemo } from 'react';
import ReactApexChart from 'react-apexcharts';


const TwoLineMixedChart = ({ name, searchInput, niftyData, sensexData, dataGraph }) => {

  const niftyPlotData = useMemo(() => {
    return niftyData?.lineData?.map(([x, y]) => ({
      x: parseInt(x),
      y: parseFloat(y),
    })) || [];
  }, [niftyData]);

  const sensexPlotData = useMemo(() => {
    return sensexData?.lineData?.map(([x, y]) => ({
      x: parseInt(x),
      y: parseFloat(y),
    })) || [];
  }, [sensexData]);

  const dafaultylastPrice = niftyData?.lineData?.length > 0 ? niftyData?.lineData?.[niftyData?.lineData?.length - 1].x : 0;
  const changelastPrice = sensexData?.lineData?.length > 0 ? sensexData?.lineData?.[sensexData?.lineData?.length - 1].x : 0;
  const lastPrice = niftyData?.lineData?.length > 0 ? niftyData?.lineData[niftyData?.lineData?.length - 1]?.y : 0;

  const series = useMemo(() => [
    {
      name: name,
      data: niftyPlotData || [],
    },
    {
      name: searchInput,
      data: sensexPlotData || [],
    },
  ], [niftyPlotData, sensexPlotData]);


  const options = useMemo(() => ({
    chart: {
      id: 'mixed-chart',
      toolbar: {
        show: false,
      },
    },
    legend: {
      position: 'top',
      horizontalAlign: 'left',
      fontSize: '25px',
      fontWeight: 'bold'
    },
    xaxis: {
      type: "datetime",
      tickAmount:  dataGraph?.graphType === "thisweek" ? 3 : dataGraph?.graphType === "week" ? 5 : undefined,
      labels: {
        show: true,
        formatter: function (value) {
          let ts = new Date(value);
          const graphType = dataGraph?.graphType;

          const options = {
            timeZone: "Asia/Kolkata",
          };

          return graphType === "week" || graphType === "thisweek"
            ? ts.toLocaleDateString("en-US", { weekday: "short", ...options })
            : graphType === "month1" ||
              graphType === "thismonth" ||
              graphType === "month3" ||
              graphType === "month6" ||
              graphType === "month12" ||
              graphType === "thisyear"
              ? ts.toLocaleDateString("en-US", {
                day: "numeric",
                month: "short",
                ...options,
              })
              : graphType === "year5" || graphType === "year10" || graphType === "dateToDate"
                ? ts.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric", ...options })
                : ts.toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "numeric",
                  ...options,
                })
        },
        style: {
          fontWeight: "bold",
          fontSize: "17px",
        },
      },
      offsetX: "30",
    },
    yaxis: [
      {
        labels: {
          show: true,
          style: {
            fontSize: '14px',
            fontWeight: 'bold',
          },
        },
        opposite: false,
      },
      {
        labels: {
          show: true,
          style: {
            fontSize: '14px',
            fontWeight: 'bold',
          },
        },
        opposite: true,
      },
    ],
    grid: {
      show: false,
    },
    stroke: {
      curve: 'straight',
      width: 2,
    },
    annotations: {
      points: [
        {
          x: niftyData?.lineData?.length > 0 ? niftyData?.lineData?.[niftyData?.lineData?.length - 1][0] : 0,
          y: niftyData?.lineData?.length > 0 ? niftyData?.lineData?.[niftyData?.lineData?.length - 1][1] : 0,
          marker: {
            size: 4,
            fillColor: "#0000FF",
            strokeWidth: -1,
          },
          label: {
            text: lastPrice?.toFixed(2),
            style: {
              color: "#000000",
              fontSize: "15px",
              fontWeight: "bold",
            },
            offsetX: -25,
            offsetY: 30,
            borderWidth: 0,
          },
        },
        {
          x: sensexData?.lineData?.length > 0 ? sensexData?.lineData?.[sensexData?.lineData?.length - 1][0] : 0,
          y: sensexData?.lineData?.length > 0 ? sensexData?.lineData?.[sensexData?.lineData?.length - 1][1] : 0,
          marker: {
            size: 4,
            fillColor: "#0000FF",
            strokeWidth: -1,
          },
          label: {
            text: lastPrice?.toFixed(2),
            style: {
              color: "#000000",
              fontSize: "15px",
              fontWeight: "bold",
            },
            offsetX: -25,
            offsetY: 30,
            borderWidth: 0,
          },
        }
      ],
    }
  }), [niftyData, sensexData, changelastPrice, dafaultylastPrice]);


  return (
    <div style={{ marginTop: '50px' }}>
      <ReactApexChart options={options} series={series} type="line" height={350} />
    </div>
  );
};

export default TwoLineMixedChart;

