import React from "react";
import { Navigate, useLocation } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { Spinner, Center } from "@chakra-ui/react";

interface ProtectedRouteProps {
    allowedRoles?: string[]; // e.g. ["admin", "Super Admin", "State Admin"]
    children: React.ReactNode;
}

// Route access configuration based on role hierarchy
const getRouteAccess = (pathname: string): {
    requiresSuperAdmin?: boolean;
    requiresStateAdmin?: boolean;
    requiresRegionAdmin?: boolean;
    requiresGroupAdmin?: boolean;
    requiresDistrictAdmin?: boolean;
    blockedForRoles?: string[];
} => {
    const path = pathname.toLowerCase();

    // States route - only Super Admin and State Admin
    if (path.includes('/admin/states')) {
        return {
            blockedForRoles: ['State Admin', 'Region Admin', 'Group Admin', 'District Admin', 'Viewer']
        };
    }

    // Regions route - blocked for Group Admin, District Admin, Viewer
    if (path.includes('/admin/regions')) {
        return {
            blockedForRoles: ['Region Admin', 'Group Admin', 'District Admin', 'Viewer']
        };
    }

    // Groups route - blocked for District Admin, Viewer
    if (path.includes('/admin/groups')) {
        return {
            blockedForRoles: ['Group Admin', 'District Admin', 'Viewer']
        };
    }

    // Districts route - accessible to all admins except Viewer
    if (path.includes('/admin/districts')) {
        return {
            blockedForRoles: ['District Admin', 'Viewer']
        };
    }

    // Old Groups route - blocked for District Admin
    if (path.includes('/admin/old_groups') || path.includes('/admin/old-groups')) {
        return {
            blockedForRoles: ['Oldgroup Admin', 'Group Admin', 'District Admin', 'Viewer']
        };
    }

    // Old Groups route - blocked for District Admin
    if (path.includes('/admin/attendance-logs') || path.includes('/admin/attendance-logs')) {
        return {
            blockedForRoles: ['State Admin', 'Region Admin', 'Oldgroup Admin', 'Group Admin', 'District Admin', 'Viewer']
        };
    }
    
    // users route - blocked for District Admin
    if (path.includes('/admin/users') || path.includes('/admin/users')) {
        return {
            blockedForRoles: ['State Admin', 'Region Admin', 'Oldgroup Admin', 'Group Admin', 'District Admin', 'Viewer']
        };
    }

    // Users route - accessible to all roles (no restrictions)
    // Removed restrictions to allow all admins to access users

    // Default: allow access (will be filtered by allowedRoles if specified)
    return {};
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    allowedRoles,
    children,
}) => {
    const { isAuthenticated, hasAnyRole, hasRole, loading } = useAuth();
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

    // 🛡️ Check route-specific access based on role hierarchy
    const routeAccess = getRouteAccess(location.pathname);

    // Check if user's role is blocked for this route
    if (routeAccess.blockedForRoles) {
        const userHasBlockedRole = routeAccess.blockedForRoles.some(role => hasRole(role));

        // Super Admin can access everything
        if (hasRole('Super Admin')) {
            // Super Admin bypasses all restrictions
        } else if (userHasBlockedRole) {
            // User has a blocked role and is not Super Admin
            return <Navigate to="/unauthorized" replace />;
        }
    }

    // ✅ Render protected content
    return <>{children}</>;
};

export default ProtectedRoute;