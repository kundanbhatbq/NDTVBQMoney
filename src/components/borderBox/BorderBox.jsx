import React from "react";
import "./index.scss";

const BorderBox = ({ children, className }) => {
  return <div className={`${className} borderbox`}>{children}</div>;
};

export default BorderBox;
