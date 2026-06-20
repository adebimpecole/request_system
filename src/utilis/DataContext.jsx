// DataContext.js
import React, { createContext, useState } from "react";

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [secretData, setSecretData] = useState("your_secret_data_here");
  const [book, setbook] = useState("");

  return (
    <DataContext.Provider value={{ secretData, setSecretData, book, setbook }}>
      {children}
    </DataContext.Provider>
  );
};
