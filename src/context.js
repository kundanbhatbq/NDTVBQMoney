import React, { createContext, useContext, useState } from "react";

const SelectedStockContext = createContext();

export const useSelectedStock = () => useContext(SelectedStockContext);

export const SelectedStockProvider = ({ children }) => {
  const [selectedStock, setSelectedStock] = useState(null);
  const [stockName, SetStockName] = useState("All INDI");

  const setSelected = (stock) => {
    setSelectedStock(stock);
  };

  const setStockName = (stock) => {
    SetStockName(stock);
  };

  return (
    <div>
      <SelectedStockContext.Provider value={{ selectedStock, setSelected, stockName, setStockName }}>
        {children}
      </SelectedStockContext.Provider>
    </div>
  );
};
