import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";
import { StudyProvider } from "./contexts/StudyContext";

import "./index.css";

const rootElement =
  document.getElementById("root");

if (!rootElement) {
  throw new Error(
    "O elemento root não foi encontrado.",
  );
}

createRoot(rootElement).render(
  <StrictMode>
    <StudyProvider>
      <App />
    </StudyProvider>
  </StrictMode>,
);