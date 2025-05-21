import React from "react";
import ApexChart from "../Chart/ApexChart";
import { Container } from "@mui/material";
// import TwoLineMixedChart from "../Chart/TwoLineChart";

const Chart = (props) => {
  const { token } = props;
  return (
    <>
      <Container>
        <section className="chart">
          <div className="chat-item">
            <ApexChart token={token} />
            {/* <TwoLineMixedChart /> */}
          </div>
        </section>
      </Container>
    </>
  );
};

export default Chart;
