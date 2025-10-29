import { Routes, Route } from "react-router";
import PublicRoutes from "./PublicRoutes";
// import AdminRoutes from "./AdminRoutes";
// import StudentRoutes from "./StudentRoutes";
// import ApplicantRoutes from "./ApplicantRoutes";
// import LecturerRoutes from "./LecturerRoutes";
// import ApplicantRoutes from "./ApplicantRoutes";
// import BursarRoutes from "./BursarRoutes";
// import AdmissionsRoutes from "./AdmissionsRoutes";
// import HeadOfDepartmentRoutes from "./HeadOfDepartmentRoutes";
// import SystemAdminRoutes from "./SystemAdminRoutes";
// import TenantAdminRoutes from "./TenantAdminRoutes";
// import SuperAdminRoutes from "./SuperAdminRoutes";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/*" element={<PublicRoutes />} />

      {/* Student routes */}
      {/* <Route path="/student/*" element={<StudentRoutes />} /> */}

      {/* Lecturer routes */}
      {/* <Route path="/lecturer/*" element={<LecturerRoutes />} /> */}

      {/* Head of Department routes */}
      {/* <Route path="/hod/*" element={<HeadOfDepartmentRoutes />} /> */}

      {/* Admissions routes */}
      {/* <Route path="/admissions/*" element={<AdmissionsRoutes />} /> */}

      {/* Bursar routes */}
      {/* <Route path="/bursar/*" element={<BursarRoutes />} /> */}

      {/* Admin routes (general admin access) */}
      {/* <Route path="/admin/*" element={<AdminRoutes />} /> */}

      {/* System Administrator routes */}
      {/* <Route path="/system-admin/*" element={<SystemAdminRoutes />} /> */}

      {/* Tenant Administrator routes */}
      {/* <Route path="/tenant-admin/*" element={<TenantAdminRoutes />} /> */}

      {/* Super Administrator routes (highest level) */}
      {/* <Route path="/super-admin/*" element={<SuperAdminRoutes />} /> */}
    </Routes>
  );
}