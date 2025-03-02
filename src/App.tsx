import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";

import { SiteLoading } from "./components/site-loading.tsx";

const DilutionPage = lazy(() =>
  import("@/pages/dilution").then((module) => ({
    default: module.DilutionPage,
  })),
);

const CalibrationGasPage = lazy(() =>
  import("@/pages/calibrationgas").then((module) => ({
    default: module.CalibrationGasPage,
  })),
);

export function App() {
  return (
    <Routes>
      <Route
        element={
          <Suspense fallback={<SiteLoading />}>
            <DilutionPage />
          </Suspense>
        }
        path="/"
      />
      <Route
        element={
          <Suspense fallback={<SiteLoading />}>
            <CalibrationGasPage />
          </Suspense>
        }
        path="/calibrationgas"
      />
    </Routes>
  );
}
