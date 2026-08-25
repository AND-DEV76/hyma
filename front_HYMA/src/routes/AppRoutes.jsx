import { Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import LoginPage from "../features/auth/pages/LoginPage";
import ReceptionPage from "../features/reception/pages/ReceptionPage";

export default function AppRoutes() {
  return (
    <Routes>

      <Route
        path="/"
        element={<Home />}
      />

      <Route
        path="/login"
        element={<LoginPage />}
      />

      <Route
        path="/recepcion"
        element={<ReceptionPage />}
      />

    </Routes>
  );
}