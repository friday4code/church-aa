/**
 * @fileoverview Admin Routes Configuration
 *
 * This module defines the complete routing structure for the admin section of the church application.
 * It provides protected routes that are only accessible to users with "Admin" role permissions.
 *
 * The routing structure includes:
 * - Dashboard and overview pages
 * - Geographic management (States, Regions, Districts)
 * - Group management (Groups, Old Groups)
 * - User management and permissions
 * - Attendance tracking systems
 * - Youth ministry management
 * - Profile and reporting features
 *
 * All routes are wrapped in a ProtectedRoute component to ensure proper authentication
 * and authorization before accessing admin functionality.
 *
 * @author Church AA Development Team
 * @version 1.0.0
 * @since 2024
 */

import { Suspense, lazy } from "react"
import AttendanceType from "@/modules/admin/components/AttendanceType";
import AdminLayout from "@/modules/admin/layouts/AdminLayout";
import AttendanceDashboard from "@/modules/admin/pages/attendance/Index";
import YouthAttendanceDashboard from "@/modules/admin/pages/attendance/youthAttendance/Index";
import YouthAttendancePage from "@/modules/admin/pages/attendance/youthAttendance/YouthAttendance";
// Lazy-loaded youth attendance pages (code-split)
const YouthWeeklyAttendancePage = lazy(() => import("@/modules/admin/pages/attendance/youthAttendance/WeeklyPage"))
const YouthRevivalAttendancePage = lazy(() => import("@/modules/admin/pages/attendance/youthAttendance/RevivalPage"))
import Dashboard from "@/modules/admin/pages/dashboard/Dashboard";
import Districts from "@/modules/admin/pages/districts/Districts";
import Groups from "@/modules/admin/pages/groups/Group";
import OldGroups from "@/modules/admin/pages/oldGroups/OldGroups";
import AdminProfilePage from "@/modules/admin/pages/profile/Profile";
import Regions from "@/modules/admin/pages/regions/Regions";
import ReportsDashboard from "@/modules/admin/pages/reports/Reports";
import States from "@/modules/admin/pages/states/States";
import Index from "@/modules/admin/pages/users/Index";
import UserRights from "@/modules/admin/pages/users/UserRights";
import Users from "@/modules/admin/pages/users/Users";
import ProtectedRoute from "@/modules/shared/ProtectedRoute";
import { Route, Routes } from "react-router";

/**
 * AdminRoutes Component
 *
 * Defines the complete routing structure for the admin section of the application.
 * This component creates a protected routing system that ensures only authenticated
 * users with admin roles (admin, Super Admin, State Admin, Region Admin, District Admin, Group Admin) can access the admin functionality.
 *
 * Route Structure:
 * - All routes are nested under AdminLayout for consistent UI structure
 * - Uses React Router v6 nested routing patterns
 * - Implements role-based access control via ProtectedRoute wrapper
 *
 * Protected Routes Include:
 * - /dashboard - Main admin dashboard with overview metrics
 * - /states - State management and configuration
 * - /regions - Regional organization management
 * - /old_groups - Legacy group data management
 * - /groups - Current group management
 * - /districts - District-level organization
 * - /users/* - User management subsystem (nested routes)
 * - /attendance/* - Attendance tracking system (with dynamic type parameter)
 * - /youth_ministry/* - Youth ministry management subsystem
 * - /reports - Report generation and analytics
 * - /profile - Admin profile management
 *
 * @returns {JSX.Element} The complete admin routing structure wrapped in protection
 *
 * @example
 * // Usage in main app routing
 * <Route path="admin/*" element={<AdminRoutes />} />
 *
 * @see {@link ProtectedRoute} for authentication and authorization logic
 * @see {@link AdminLayout} for the shared admin UI layout structure
 */
export default function AdminRoutes() {
  return (
    // ProtectedRoute Wrapper:
    // - Restricts access to users with admin roles (admin, Super Admin, State Admin, Region Admin, District Admin, Group Admin)
    // - Automatically redirects unauthenticated users to login
    // - Redirects unauthorized users to unauthorized page
    // - Preserves location state for post-login redirection
    <ProtectedRoute allowedRoles={["admin", "Super Admin", "State Admin", "Region Admin", "District Admin", "Group Admin"]}>
      <Routes>
        {/* AdminLayout Wrapper:
            - Provides consistent admin UI structure (sidebar, header, etc.)
            - All nested routes inherit this layout
            - Implements outlet pattern for child route rendering */}
        <Route element={<AdminLayout />}>
          {/* Core Admin Pages - Direct route mappings */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="states" element={<States />} />
          <Route path="regions" element={<Regions />} />
          <Route path="old_groups" element={<OldGroups />} />
          <Route path="groups" element={<Groups />} />
          <Route path="districts" element={<Districts />} />

          {/* User Management Subsystem:
              - /users (index) - User management dashboard
              - /users/all - Complete user listing and management
              - /users/rights - User permissions and role management
              
              Uses nested routing pattern for organized user management features */}
          <Route path="users">
            <Route element={<Index />} index />
            <Route path="all" element={<Users />} />
            <Route path="rights" element={<UserRights />} />
          </Route>

          {/* Attendance Management System:
              - /attendance (index) - Attendance dashboard and overview
              - /attendance/:type - Dynamic attendance type handler
              
              The :type parameter allows for different attendance categories
              (e.g., sunday-service, bible-study, special-events) */}
          <Route path="attendance">
            <Route element={<AttendanceDashboard />} index />
            <Route path=":type" element={<AttendanceType />} />
          </Route>

          {/* Youth Ministry Management Subsystem:
              - /youth_ministry (index) - Youth ministry dashboard
              - /youth_ministry/attendance - General youth attendance
              - /youth_ministry/weekly_attendance - Weekly service attendance
              - /youth_ministry/revival_attendance - Revival meeting attendance
              
              Specialized routing for youth ministry with multiple attendance types */}
          <Route path="youth_ministry">
            <Route element={<YouthAttendanceDashboard />} index />
            <Route path="attendance" element={<YouthAttendancePage />} />
            <Route path="weekly_attendance" element={
              <Suspense fallback={<div>Loading...</div>}>
                <YouthWeeklyAttendancePage />
              </Suspense>
            } />
            <Route path="revival_attendance" element={
              <Suspense fallback={<div>Loading...</div>}>
                <YouthRevivalAttendancePage />
              </Suspense>
            } />
          </Route>

          {/* Reports and Analytics:
              - Provides report generation and data analytics functionality
              - Currently uses AdminProfilePage component (may need refactoring) */}
          <Route path="reports" element={<ReportsDashboard />} />

          {/* Admin Profile Management:
              - Personal profile settings and preferences
              - Admin-specific configuration options */}
          <Route path="profile" element={<AdminProfilePage />} />

        </Route>
      </Routes>
    </ProtectedRoute>
  );
}
