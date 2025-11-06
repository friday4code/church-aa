import { Routes, Route } from "react-router";
import ProtectedRoute from "@/modules/shared/ProtectedRoute";
import AdminLayout from "@/modules/admin/layouts/AdminLayout";
import { Dashboard } from "@/modules/admin/pages/Dashboard";
import States from "@/modules/admin/pages/States";
import Regions from "@/modules/admin/pages/Regions";
import OldGroups from "@/modules/admin/pages/OldGroups";
import Groups from "@/modules/admin/pages/Group";
import Districts from "@/modules/admin/pages/Districts";
import Users from "@/modules/admin/pages/users/Users";
import UserRights from "@/modules/admin/pages/users/UserRights";
import Index from "@/modules/admin/pages/users/Index";
import AttendanceType from "@/modules/admin/components/AttendanceType";
import AttendanceDashboard from "@/modules/admin/pages/attendance/Index";
import YouthAttendanceDashboard from "@/modules/admin/pages/attendance/youthAttendance/Index";
import YouthAttendancePage from "@/modules/admin/pages/attendance/youthAttendance/YouthAttendance";
import YouthRevivalAttendancePage from "@/modules/admin/pages/attendance/youthAttendance/YouthRevivalAttendance";
import YouthWeeklyAttendancePage from "@/modules/admin/pages/attendance/youthAttendance/YouthWeeklyAttendance";


export default function AdminRoutes() {
  return (
    <ProtectedRoute allowedRoles={["Admin"]}>
      <Routes>
        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/states" element={<States />} />
          <Route path="/regions" element={<Regions />} />
          <Route path="/old_groups" element={<OldGroups />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/districts" element={<Districts />} />

          {/* users */}
          <Route path="/users">
            <Route element={<Index />} index />
            <Route path="all" element={<Users />} />
            <Route path="rights" element={<UserRights />} />
          </Route>

          {/* Attendance */}
          <Route path="/attendance">
            <Route element={<AttendanceDashboard />} index />
            <Route path=":type" element={<AttendanceType />} />
          </Route>

          <Route path="/youth_ministry">
            <Route element={<YouthAttendanceDashboard />} index />
            <Route path="attendance" element={<YouthAttendancePage />} />
            <Route path="weekly_attendance" element={<YouthWeeklyAttendancePage />} />
            <Route path="revival_attendance" element={<YouthRevivalAttendancePage />} />
          </Route>
        </Route>
      </Routes>
    </ProtectedRoute >
  );
}
