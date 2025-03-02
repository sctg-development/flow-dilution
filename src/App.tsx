import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";

// Importez correctement les composants avec une déstructuration pour gérer les exports par défaut
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
          <Suspense fallback={<div>Page is Loading...</div>}>
            <DilutionPage />
          </Suspense>
        }
        path="/"
      />
      <Route
        element={
          <Suspense fallback={<div>Page is Loading...</div>}>
            <CalibrationGasPage />
          </Suspense>
        }
        path="/calibrationgas"
      />
    </Routes>
  );
}
