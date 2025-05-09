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

const OptimizerPage = lazy(() =>
  import("@/pages/optimizer").then((module) => ({
    default: module.OptimizerPage,
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
      <Route
        element={
          <Suspense fallback={<SiteLoading />}>
            <OptimizerPage />
          </Suspense>
        }
        path="/optimizer"
      />
    </Routes>
  );
}
