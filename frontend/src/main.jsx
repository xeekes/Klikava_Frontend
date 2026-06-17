/**
 * SPA Entry Point: Mounts the App at #root inside StrictMode and includes global styles.
 */
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/fonts.scss";
import "./styles/index.scss";
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
