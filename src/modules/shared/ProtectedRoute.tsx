import React from "react";
import { Navigate, useLocation } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { Spinner, Center } from "@chakra-ui/react";

interface ProtectedRouteProps {
    allowedRoles?: string[]; // e.g. ["admin", "Super Admin", "State Admin"]
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    allowedRoles,
    children,
}) => {
    const { isAuthenticated, hasAnyRole, loading } = useAuth();
    const location = useLocation();

    // ⏳ Show loading state while checking authentication
    if (loading) {
        return (
            <Center h="100vh">
                <Spinner size="xl" color="accent.500" />
            </Center>
        );
    }

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