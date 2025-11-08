import { Routes, Route } from "react-router";
import PublicRoutes from "./PublicRoutes";
import AdminRoutes from "./AdminRoutes";
import ProtectedRoute from "@/modules/shared/ProtectedRoute";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/*" element={<PublicRoutes />} />
      <Route path="/admin/*" element={
        <ProtectedRoute>
          <AdminRoutes />
        </ProtectedRoute>
      } />
    </Routes>
  );
}