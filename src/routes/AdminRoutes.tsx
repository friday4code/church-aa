import { Routes, Route } from "react-router";
// import Dashboard from "@/modules/admin/pages/Dashboard";
// import Applications from "@/modules/admin/pages/Applications";
// import ApplicationDetails from "@/modules/admin/pages/ApplicationDetails";
import ProtectedRoute from "@/modules/shared/ProtectedRoute";
import AdminLayout from "@/modules/admin/layouts/AdminLayout";
import { Dashboard } from "@/modules/admin/pages/Dashboard";
// import Dashboard from "@/modules/admin/pages/Dashboard";
// import AdminLayout from "@/modules/admin/layouts/AdminLayout";

export default function AdminRoutes() {
  return (
    <ProtectedRoute allowedRoles={["Admin"]}>
      <Routes>
        <Route element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </ProtectedRoute >
  );
}
