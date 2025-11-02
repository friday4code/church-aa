import { Routes, Route } from "react-router";
import ProtectedRoute from "@/modules/shared/ProtectedRoute";
import AdminLayout from "@/modules/admin/layouts/AdminLayout";
import { Dashboard } from "@/modules/admin/pages/Dashboard";
import States from "@/modules/admin/pages/States";
import Regions from "@/modules/admin/pages/Regions";


export default function AdminRoutes() {
  return (
    <ProtectedRoute allowedRoles={["Admin"]}>
      <Routes>
        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/states" element={<States />} />
          <Route path="/regions" element={<Regions />} />
        </Route>
      </Routes>
    </ProtectedRoute >
  );
}
