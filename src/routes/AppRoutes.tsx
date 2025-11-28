import { Routes, Route } from "react-router";
import PublicRoutes from "./PublicRoutes";
import AdminRoutes from "./AdminRoutes";
import ProtectedRoute from "@/modules/shared/ProtectedRoute";
import Index from "@/modules/shared/Index";
import Unauthorized from "@/modules/shared/pages/Unauthorized";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Index />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/*" element={<PublicRoutes />} />
      <Route path="/admin/*" element={
        <ProtectedRoute>
          <AdminRoutes />
        </ProtectedRoute>
      } />
    </Routes>
  );
}
