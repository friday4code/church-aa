import { Routes, Route } from "react-router";
import PublicRoutes from "./PublicRoutes";
import AdminRoutes from "./AdminRoutes";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/*" element={<PublicRoutes />} />
      <Route path="/admin/*" element={<AdminRoutes />} />
    </Routes>
  );
}