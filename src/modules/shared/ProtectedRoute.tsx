import React from "react";
import { Navigate, useLocation } from "react-router";
import { useAuthStore } from "@/store/auth.store";

interface ProtectedRouteProps {
    allowedRoles?: string[]; // e.g. ["admin", "user"]
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    allowedRoles,
    children,
}) => {
    const { isAuthenticated, hasAnyRole } = useAuthStore();
    const location = useLocation();

    // 🚫 Redirect unauthenticated users
    if (!isAuthenticated()) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 🔐 Check role access if allowedRoles is specified
    if (allowedRoles && allowedRoles.length > 0) {
        const hasAccess = hasAnyRole(allowedRoles);

        if (!hasAccess) {
            return <Navigate to="/unauthorized" replace />;
        }
    }

    // ✅ Render protected content
    return <>{children}</>;
};

export default ProtectedRoute;