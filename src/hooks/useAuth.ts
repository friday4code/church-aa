import { useMe } from "./useMe";
import { useAuthStore } from "@/store/auth.store";
import type { Role } from "@/types/users.type";

// Helper to safely get role names regardless of format
const getRoleNames = (roles: any[] | undefined): string[] => {
  if (!roles) return [];
  return roles.map(role => {
    // If it's a Role object with name property
    if (typeof role === 'object' && role !== null && 'name' in role) {
      return role.name;
    }
    // If it's already a string
    return String(role);
  });
};

// Helper to check if a role exists (works with both formats)
const hasRoleName = (roles: any[] | undefined, roleName: string): boolean => {
  if (!roles) return false;
  return roles.some(role => {
    if (typeof role === 'object' && role !== null && 'name' in role) {
      return role.name === roleName;
    }
    return role === roleName;
  });
};

export const useAuth = () => {
  const { user, loading, error, refetch } = useMe();
  const { tokens, setAuth, logout, isAuthenticated} = useAuthStore();

  const getRoles = () => {
    return getRoleNames(user?.roles);
  };

  const isUser = () => {
    const roleNames = getRoleNames(user?.roles);
    return !roleNames.includes('admin') && !roleNames.includes('Super Admin') &&
      !roleNames.includes('State Admin') && !roleNames.includes('Region Admin') &&
      !roleNames.includes('District Admin') && !roleNames.includes('Group Admin');
  };

  const isAdmin = () => {
    const roleNames = getRoleNames(user?.roles);
    return roleNames.includes('admin') || roleNames.includes('Super Admin') ||
      roleNames.includes('State Admin') || roleNames.includes('Region Admin') ||
      roleNames.includes('District Admin') || roleNames.includes('Group Admin');
  };

  const hasRole = (roleName: string) => {
    return hasRoleName(user?.roles, roleName);
  };

  const hasAnyRole = (roleNames: string[]) => {
    const userRoleNames = getRoleNames(user?.roles);
    return userRoleNames.some(role => roleNames.includes(role));
  };

  const hasAccessLevel = (accessLevel: string) => {
    return user?.access_level === accessLevel;
  };

  const getAccessLevel = () => {
    return user?.access_level || 'user';
  };

  return {
    user,
    tokens,
    loading,
    error,
    refetch,
    setAuth,
    logout,
    isAuthenticated,
    getRoles,
    isUser,
    isAdmin,
    hasRole,
    hasAnyRole,
    hasAccessLevel,
    getAccessLevel,
  };
};







// import { useMe } from "./useMe";
// import { useAuthStore } from "@/store/auth.store";

// export const useAuth = () => {
//   const { user, loading, error, refetch } = useMe();
//   const { tokens, setAuth, logout, isAuthenticated} = useAuthStore();

//   const getRoles = () => {
//     return user?.roles || [];
//   };

//   const isUser = () => {
//     const roles = user?.roles || [];
//     return !roles.includes('admin') && !roles.includes('Super Admin') &&
//       !roles.includes('State Admin') && !roles.includes('Region Admin') &&
//       !roles.includes('District Admin') && !roles.includes('Group Admin');
//   };

//   const isAdmin = () => {
//     const roles = user?.roles || [];
//     return roles.includes('admin') || roles.includes('Super Admin') ||
//       roles.includes('State Admin') || roles.includes('Region Admin') ||
//       roles.includes('District Admin') || roles.includes('Group Admin');
//   };

//   const hasRole = (roleName: string) => {
//     const roles = user?.roles || [];
//     return roles.includes(roleName as any);
//   };

//   const hasAnyRole = (roleNames: string[]) => {
//     const userRoles = user?.roles || [];
//     return userRoles.some(role => roleNames.includes(role));
//   };

//   const hasAccessLevel = (accessLevel: string) => {
//     return user?.access_level === accessLevel;
//   };

//   const getAccessLevel = () => {
//     return user?.access_level || 'user';
//   };

//   return {
//     user,
//     tokens,
//     loading,
//     error,
//     refetch,
//     setAuth,
//     logout,
//     isAuthenticated,
//     getRoles,
//     isUser,
//     isAdmin,
//     hasRole,
//     hasAnyRole,
//     hasAccessLevel,
//     getAccessLevel,
//   };
// };
