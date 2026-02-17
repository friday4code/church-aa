// src/utils/roleHierarchy.ts

import { getRoleNames } from "./role.utils";
import type { Role } from "@/types/users.type";

export type RoleType = "Super Admin" | "State Admin" | "Region Admin" | "District Admin" | "Group Admin" | "Viewer" | "admin";

export const ROLE_HIERARCHY: Record<RoleType, number> = {
  "Super Admin": 6,
  "admin": 5,
  "State Admin": 4,
  "Region Admin": 3,
  "Group Admin": 2,
  "District Admin": 1,
  "Viewer": 0,
};

// Helper to convert any role input to RoleType
export const toRoleType = (role: any): RoleType => {
  if (!role) return 'Viewer';
  
  // If it's a Role object with name property
  if (typeof role === 'object' && role !== null && 'name' in role) {
    const roleName = role.name;
    // Check if it's a valid RoleType
    if (isValidRoleType(roleName)) {
      return roleName as RoleType;
    }
    // Handle variations
    if (roleName.toLowerCase().includes('super admin')) return 'Super Admin';
    if (roleName.toLowerCase().includes('state admin')) return 'State Admin';
    if (roleName.toLowerCase().includes('region admin')) return 'Region Admin';
    if (roleName.toLowerCase().includes('district admin')) return 'District Admin';
    if (roleName.toLowerCase().includes('group admin')) return 'Group Admin';
    if (roleName.toLowerCase().includes('viewer')) return 'Viewer';
    if (roleName.toLowerCase() === 'admin') return 'admin';
  }
  
  // If it's already a string
  const roleStr = String(role);
  if (isValidRoleType(roleStr)) {
    return roleStr as RoleType;
  }
  
  // Try to match by lowercase
  const lowerRole = roleStr.toLowerCase();
  if (lowerRole.includes('super admin')) return 'Super Admin';
  if (lowerRole.includes('state admin')) return 'State Admin';
  if (lowerRole.includes('region admin')) return 'Region Admin';
  if (lowerRole.includes('district admin')) return 'District Admin';
  if (lowerRole.includes('group admin')) return 'Group Admin';
  if (lowerRole.includes('viewer')) return 'Viewer';
  if (lowerRole === 'admin') return 'admin';
  
  return 'Viewer';
};

// Check if a string is a valid RoleType
export const isValidRoleType = (role: string): boolean => {
  return Object.keys(ROLE_HIERARCHY).includes(role);
};

// Convert array of mixed roles to RoleType[]
export const toRoleTypes = (roles: any[] | undefined | null): RoleType[] => {
  if (!roles || !Array.isArray(roles)) return [];
  
  // First try to get string names using getRoleNames if available
  try {
    const roleNames = getRoleNames(roles);
    return roleNames.map(toRoleType).filter(Boolean) as RoleType[];
  } catch {
    // Fallback: process each role directly
    return roles.map(toRoleType).filter(Boolean) as RoleType[];
  }
};

export const getRoleLevel = (role: RoleType): number => {
  return ROLE_HIERARCHY[role] ?? -1;
};

export const getRoleLevelFromAny = (role: any): number => {
  return getRoleLevel(toRoleType(role));
};

export const isRoleAboveOrEqual = (userRole: RoleType, targetRole: RoleType): boolean => {
  return getRoleLevel(userRole) >= getRoleLevel(targetRole);
};

export const isRoleAboveOrEqualAny = (userRole: any, targetRole: any): boolean => {
  return isRoleAboveOrEqual(toRoleType(userRole), toRoleType(targetRole));
};

export const isRoleBelow = (userRole: RoleType, targetRole: RoleType): boolean => {
  return getRoleLevel(userRole) < getRoleLevel(targetRole);
};

export const getHighestRole = (roles: RoleType[]): RoleType => {
  if (roles.length === 0) return 'Viewer';

  return roles.reduce((highest, current) => {
    return getRoleLevel(current) > getRoleLevel(highest) ? current : highest;
  });
};

export const getHighestRoleFromAny = (roles: any[]): RoleType => {
  return getHighestRole(toRoleTypes(roles));
};

export interface RoleVisibilityConfig {
  showState: boolean;
  showRegion: boolean;
  showDistrict: boolean;
  showGroup: boolean;
  showOldGroup: boolean;
}

// Original function - maintains backward compatibility
export const getRoleBasedVisibility = (userRoles: RoleType[]): RoleVisibilityConfig => {
  const highestRole = getHighestRole(userRoles);

  if (!highestRole) {
    return {
      showState: true,
      showRegion: true,
      showDistrict: true,
      showGroup: true,
      showOldGroup: true,
    };
  }

  // Super Admin and admin can see everything
  if (highestRole === "Super Admin" || highestRole === "admin") {
    return {
      showState: true,
      showRegion: true,
      showDistrict: true,
      showGroup: true,
      showOldGroup: true,
    };
  }

  // State Admin can only see Region, District, Group, OldGroup (State is hidden)
  if (highestRole === "State Admin") {
    return {
      showState: false,
      showRegion: true,
      showOldGroup: true,
      showGroup: true,
      showDistrict: true,
    };
  }

  // Region Admin can only see District, Group, OldGroup (State and Region are hidden)
  if (highestRole === "Region Admin") {
    return {
      showState: false,
      showRegion: false,
      showOldGroup: true,
      showGroup: true,
      showDistrict: true,
    };
  }

  // District Admin can only see Group (State, Region, District, OldGroup are hidden)
  if (highestRole === "District Admin") {
    return {
      showState: false,
      showRegion: false,
      showOldGroup: false,
      showGroup: true,
      showDistrict: false,
    };
  }

  // Group Admin can only see Group (all above are hidden)
  if (highestRole === "Group Admin") {
    return {
      showState: false,
      showRegion: false,
      showOldGroup: false,
      showGroup: true,
      showDistrict: false,
    };
  }

  // Viewer can see everything (read-only context)
  return {
    showState: true,
    showRegion: true,
    showOldGroup: true,
    showGroup: true,
    showDistrict: true,
  };
};

// New overloaded function that accepts any role type
export const getRoleBasedVisibilityFromAny = (roles: any[] | undefined | null): RoleVisibilityConfig => {
  const roleTypes = toRoleTypes(roles);
  return getRoleBasedVisibility(roleTypes);
};













// export type RoleType = "Super Admin" | "State Admin" | "Region Admin" | "District Admin" | "Group Admin" | "Viewer" | "admin";

// export const ROLE_HIERARCHY: Record<RoleType, number> = {
//   "Super Admin": 6,
//   "admin": 5,
//   "State Admin": 4,
//   "Region Admin": 3,
//   "Group Admin": 2,
//   "District Admin": 1,
//   "Viewer": 0,
// };

// export const getRoleLevel = (role: RoleType): number => {
//   return ROLE_HIERARCHY[role] ?? -1;
// };

// export const isRoleAboveOrEqual = (userRole: RoleType, targetRole: RoleType): boolean => {
//   return getRoleLevel(userRole) >= getRoleLevel(targetRole);
// };

// export const isRoleBelow = (userRole: RoleType, targetRole: RoleType): boolean => {
//   return getRoleLevel(userRole) < getRoleLevel(targetRole);
// };

// export const getHighestRole = (roles: RoleType[]): RoleType => {
//   if (roles.length === 0) return 'Viewer';

//   return roles.reduce((highest, current) => {
//     return getRoleLevel(current) > getRoleLevel(highest) ? current : highest;
//   });
// };

// export interface RoleVisibilityConfig {
//   showState: boolean;
//   showRegion: boolean;
//   showDistrict: boolean;
//   showGroup: boolean;
//   showOldGroup: boolean;
// }

// export const getRoleBasedVisibility = (userRoles: RoleType[]): RoleVisibilityConfig => {
//   const highestRole = getHighestRole(userRoles);

//   if (!highestRole) {
//     return {
//       showState: true,
//       showRegion: true,
//       showDistrict: true,
//       showGroup: true,
//       showOldGroup: true,
//     };
//   }

//   // Super Admin and admin can see everything
//   if (highestRole === "Super Admin" || highestRole === "admin") {
//     return {
//       showState: true,
//       showRegion: true,
//       showDistrict: true,
//       showGroup: true,
//       showOldGroup: true,
//     };
//   }

//   // State Admin can only see Region, District, Group, OldGroup (State is hidden)
//   if (highestRole === "State Admin") {
//     return {
//       showState: false,
//       showRegion: true,
//       showOldGroup: true,
//       showGroup: true,
//       showDistrict: true,
//     };
//   }

//   // Region Admin can only see District, Group, OldGroup (State and Region are hidden)
//   if (highestRole === "Region Admin") {
//     return {
//       showState: false,
//       showRegion: false,
//       showOldGroup: true,
//       showGroup: true,
//       showDistrict: true,
//     };
//   }

//   // District Admin can only see Group, OldGroup (State, Region, District are hidden)
//   if (highestRole === "District Admin") {
//     return {
//       showState: false,
//       showRegion: false,
//       showOldGroup: false,
//       showGroup: false,
//       showDistrict: false,
//     };
//   }

//   // Group Admin can only see Group, OldGroup (all above are hidden)
//   if (highestRole === "Group Admin") {
//     return {
//       showState: false,
//       showRegion: false,
//       showOldGroup: false,
//       showGroup: false,
//       showDistrict: true,
//     };
//   }

//   // Viewer can see everything (read-only context)
//   return {
//     showState: true,
//     showRegion: true,
//     showOldGroup: true,
//     showGroup: true,
//     showDistrict: true,
//   };
// };