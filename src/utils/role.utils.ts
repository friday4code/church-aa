// src/utils/role.utils.ts

import type { Role } from "@/types/users.type";

// Type guard to check if a value is a Role object
export const isRoleObject = (role: any): role is Role => {
    return role && typeof role === 'object' && 'id' in role && 'name' in role;
};

// Safely get role name from any role type
export const getRoleName = (role: any): string => {
    if (!role) return '';
    if (isRoleObject(role)) return role.name;
    return String(role);
};

// Safely get role names from an array of mixed role types
export const getRoleNames = (roles: any[] | undefined | null): string[] => {
    if (!roles || !Array.isArray(roles)) return [];
    return roles.map(getRoleName);
};

// Check if a role exists (by name) in a mixed array
export const hasRole = (roles: any[] | undefined | null, roleName: string): boolean => {
    if (!roles || !Array.isArray(roles)) return false;
    return roles.some(role => {
        const name = getRoleName(role);
        return name.toLowerCase() === roleName.toLowerCase();
    });
};

// Check if any of the specified roles exist
export const hasAnyRole = (roles: any[] | undefined | null, roleNames: string[]): boolean => {
    if (!roles || !Array.isArray(roles)) return false;
    return roleNames.some(roleName => hasRole(roles, roleName));
};

// Convert role objects to strings for display
export const rolesToString = (roles: any[] | undefined | null): string => {
    return getRoleNames(roles).join(', ');
};

// Type assertion helper for components that expect string roles
export const asStringRoles = (roles: any[] | undefined | null): string[] => {
    return getRoleNames(roles);
};