import { Routes, Route } from "react-router";
// import Dashboard from "@/modules/admin/pages/Dashboard";
// import Applications from "@/modules/admin/pages/Applications";
// import ApplicationDetails from "@/modules/admin/pages/ApplicationDetails";
import ProtectedRoute from "@/modules/shared/ProtectedRoute";
import AdminLayout from "@/modules/admin/layouts/AdminLayout";
// import Dashboard from "@/modules/admin/pages/Dashboard";
// import AdminLayout from "@/modules/admin/layouts/AdminLayout";

export default function AdminRoutes() {
  return (
    <ProtectedRoute allowedRoles={["Admin"]}>
      <Routes>
        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<p>hellow</p>} />
        </Route>
      </Routes>
    </ProtectedRoute>
  );
}
