import { useMe } from "./useMe";
import { useAuthStore } from "@/store/auth.store";

export const useAuth = () => {
  const { user, loading, error, refetch } = useMe();
  const { tokens, setAuth, logout, isAuthenticated} = useAuthStore();

  const getRoles = () => {
    return user?.roles || [];
  };

  const isUser = () => {
    const roles = user?.roles || [];
    return !roles.includes('admin') && !roles.includes('Super Admin') &&
      !roles.includes('State Admin') && !roles.includes('Region Admin') &&
      !roles.includes('District Admin') && !roles.includes('Group Admin');
  };

  const isAdmin = () => {
    const roles = user?.roles || [];
    return roles.includes('admin') || roles.includes('Super Admin') ||
      roles.includes('State Admin') || roles.includes('Region Admin') ||
      roles.includes('District Admin') || roles.includes('Group Admin');
  };

  const hasRole = (roleName: string) => {
    const roles = user?.roles || [];
    return roles.includes(roleName as any);
  };

  const hasAnyRole = (roleNames: string[]) => {
    const userRoles = user?.roles || [];
    return userRoles.some(role => roleNames.includes(role));
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
