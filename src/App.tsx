import { Route, Routes } from "react-router-dom";

import { CalibrationGasPage } from "@/pages/calibrationgas";
import { DilutionPage } from "@/pages/dilution";

export function App() {
  return (
    <Routes>
      <Route element={<DilutionPage />} path="/" />
      <Route element={<CalibrationGasPage />} path="/calibrationgas" />
    </Routes>
  );
}
