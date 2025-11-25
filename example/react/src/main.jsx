import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

const container = document.getElementById("cv-root");

if (!container) {
  throw new Error("Missing #cv-root element");
}

ReactDOM.createRoot(container).render(<App mountNode={container} />);
