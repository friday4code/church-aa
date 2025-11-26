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

export const getRoleLevel = (role: RoleType): number => {
  return ROLE_HIERARCHY[role] ?? -1;
};

export const isRoleAboveOrEqual = (userRole: RoleType, targetRole: RoleType): boolean => {
  return getRoleLevel(userRole) >= getRoleLevel(targetRole);
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

export interface RoleVisibilityConfig {
  showState: boolean;
  showRegion: boolean;
  showDistrict: boolean;
  showGroup: boolean;
  showOldGroup: boolean;
}

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

  // District Admin can only see Group, OldGroup (State, Region, District are hidden)
  if (highestRole === "District Admin") {
    return {
      showState: false,
      showRegion: false,
      showOldGroup: false,
      showGroup: false,
      showDistrict: false,
    };
  }

  // Group Admin can only see Group, OldGroup (all above are hidden)
  if (highestRole === "Group Admin") {
    return {
      showState: false,
      showRegion: false,
      showOldGroup: false,
      showGroup: false,
      showDistrict: true,
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