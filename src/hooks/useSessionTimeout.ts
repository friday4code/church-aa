import { useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useNavigate } from 'react-router';
import { toaster } from '@/components/ui/toaster';

interface UseSessionTimeoutOptions {
  timeoutMinutes?: number;
  warningMinutes?: number;
  enabled?: boolean;
}

export const useSessionTimeout = ({
  timeoutMinutes = 30, // 30 minutes of inactivity
  warningMinutes = 5,  // Show warning 5 minutes before timeout
  enabled = true
}: UseSessionTimeoutOptions = {}) => {
  const { logout, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  const resetTimer = useCallback(() => {
    // Clear existing timers
    const timers = (window as any).__sessionTimers || [];
    timers.forEach((timer: NodeJS.Timeout) => clearTimeout(timer));
    
    if (!isAuthenticated() || !enabled) {
      return;
    }

    const newTimers: NodeJS.Timeout[] = [];
    
    // Set warning timer
    const warningTime = (timeoutMinutes - warningMinutes) * 60 * 1000;
    const warningTimer = setTimeout(() => {
      toaster.warning({
        title: "Session Warning",
        description: `Your session will expire in ${warningMinutes} minutes due to inactivity.`,
        duration: 10000, // 10 seconds
        closable: true
      });
    }, warningTime);
    newTimers.push(warningTimer);

    // Set logout timer
    const logoutTime = timeoutMinutes * 60 * 1000;
    const logoutTimer = setTimeout(() => {
      toaster.error({
        title: "Session Expired",
        description: "Your session has expired due to inactivity. Please login again.",
        duration: 5000,
        closable: true
      });
      handleLogout();
    }, logoutTime);
    newTimers.push(logoutTimer);

    // Store timers globally
    (window as any).__sessionTimers = newTimers;
  }, [isAuthenticated, enabled, timeoutMinutes, warningMinutes, handleLogout]);

  useEffect(() => {
    if (!isAuthenticated() || !enabled) {
      // Clear timers if not authenticated
      const timers = (window as any).__sessionTimers || [];
      timers.forEach((timer: NodeJS.Timeout) => clearTimeout(timer));
      return;
    }

    // Set up activity listeners
    const activityEvents = [
      'mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'
    ];

    const handleActivity = () => {
      resetTimer();
    };

    // Add event listeners
    activityEvents.forEach(event => {
      window.addEventListener(event, handleActivity, true);
    });

    // Initialize timer
    resetTimer();

    // Cleanup
    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleActivity, true);
      });
      
      const timers = (window as any).__sessionTimers || [];
      timers.forEach((timer: NodeJS.Timeout) => clearTimeout(timer));
    };
  }, [isAuthenticated, enabled, resetTimer]);

  return {
    resetTimer
  };
};
