import { Routes, Route } from "react-router";
// import Dashboard from "@/modules/admin/pages/Dashboard";
// import Applications from "@/modules/admin/pages/Applications";
// import ApplicationDetails from "@/modules/admin/pages/ApplicationDetails";
import ProtectedRoute from "@/modules/shared/ProtectedRoute";
// import Dashboard from "@/modules/admin/pages/Dashboard";
// import AdminLayout from "@/modules/admin/layouts/AdminLayout";

export default function AdminRoutes() {
  return (
    <ProtectedRoute allowedRoles={["Admin", "Super_Admin"]}>
      <Routes>
        {/* <Route element={<AdminLayout />}> */}
          {/* <Route path="/dashboard" element={<Dashboard />} /> */}
        {/* </Route> */}
        {/* <Route path="/admin/applications" element={<Applications />} />
        <Route path="/admin/applications/:id" element={<ApplicationDetails />} /> */}
      </Routes>
    </ProtectedRoute>
  );
}
