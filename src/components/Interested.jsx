import React from "react";
import InterestedTable from "./interestedTable/InterestedTable";
import Header from "./Header/Header";

const Interested = () => {
  return (
    <>
      <Header />
      <section className="interested" style={{ padding: "5px 10px" }}>
        <div className="interestedTable">
          <InterestedTable />
        </div>
      </section>
    </>
  );
};

export default Interested;
