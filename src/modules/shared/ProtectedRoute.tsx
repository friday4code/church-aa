import React from "react";
import { Navigate, useLocation } from "react-router";
import { useAuthStore } from "@/store/auth.store";

interface ProtectedRouteProps {
    allowedRoles?: string[]; // e.g. ["student", "super_admin"]
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    allowedRoles,
    children,
}) => {
    const { getRoles, isAuthenticated } = useAuthStore();
    const location = useLocation();

    const userRoles = getRoles()?.map((r) => r.code.toLowerCase()) || [];

    // 🚫 Redirect unauthenticated users
    if (!isAuthenticated()) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 🔐 Check role access if allowedRoles is specified
    if (allowedRoles && allowedRoles.length > 0) {
        const hasAccess = allowedRoles.some((role) =>
            userRoles.includes(role.toLowerCase())
        );

        if (!hasAccess) {
            return <Navigate to="/unauthorized" replace />;
        }
    }

    // ✅ Render protected content
    return <>{children}</>;
};

export default ProtectedRoute;
