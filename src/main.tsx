import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import "./i18n";
import { App } from "./App.tsx";
import { Provider } from "./provider.tsx";
import "@/styles/globals.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Provider>
        <App />
      </Provider>
    </BrowserRouter>
  </StrictMode>,
);
