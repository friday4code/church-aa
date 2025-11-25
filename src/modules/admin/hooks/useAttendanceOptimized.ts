// hooks/useAttendanceOptimized.ts
import { adminApi } from "@/api/admin.api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { AttendanceRecord } from "@/types/attendance.type";
import { useCallback, useMemo } from "react";

export interface AttendanceFilters {
  state_id?: number;
  region_id?: number;
  district_id?: number;
  group_id?: number;
  year?: number;
  month?: string;
  limit?: number;
  offset?: number;
}

export interface AttendanceResponse {
  data: AttendanceRecord[];
  total: number;
  hasMore: boolean;
}

// Optimized attendance hook with pagination and caching
export const useAttendanceOptimized = (filters?: AttendanceFilters) => {
  const queryClient = useQueryClient();
  
  const queryKey = useMemo(() => {
    const baseKey = ['attendance', 'optimized'];
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          baseKey.push(`${key}:${value}`);
        }
      });
    }
    return baseKey;
  }, [filters]);

  const { data, isLoading, error, refetch } = useQuery<AttendanceResponse>({
    queryKey,
    queryFn: async () => {
      // Simulate pagination if filters provided
      const allData = await adminApi.getAttendance();
      
      let filteredData = allData;
      
      if (filters) {
        filteredData = allData.filter(record => {
          if (filters.state_id && record.state_id !== filters.state_id) return false;
          if (filters.region_id && record.region_id !== filters.region_id) return false;
          if (filters.district_id && record.district_id !== filters.district_id) return false;
          if (filters.group_id && record.group_id !== filters.group_id) return false;
          if (filters.year && record.year !== filters.year) return false;
          if (filters.month && record.month !== filters.month) return false;
          return true;
        });
      }
      
      const total = filteredData.length;
      const offset = filters?.offset || 0;
      const limit = filters?.limit || total;
      
      const paginatedData = filteredData.slice(offset, offset + limit);
      
      return {
        data: paginatedData,
        total,
        hasMore: offset + limit < total
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 1,
    retryDelay: 1000,
  });

  // Prefetch next page
  const prefetchNextPage = useCallback(() => {
    if (data?.hasMore && filters) {
      const nextOffset = (filters.offset || 0) + (filters.limit || 50);
      queryClient.prefetchQuery({
        queryKey: [...queryKey, 'offset', nextOffset],
        queryFn: () => adminApi.getAttendance(),
        staleTime: 5 * 60 * 1000,
      });
    }
  }, [data?.hasMore, filters, queryClient, queryKey]);

  return {
    data: data?.data || [],
    total: data?.total || 0,
    hasMore: data?.hasMore || false,
    isLoading,
    error,
    refetch,
    prefetchNextPage
  };
};

// Hook for getting attendance by ID with caching
export const useAttendanceByIdOptimized = (id: number) => {
  return useQuery<AttendanceRecord>({
    queryKey: ['attendance', 'by-id', id],
    queryFn: () => adminApi.getAttendanceById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes for individual records
    gcTime: 15 * 60 * 1000, // 15 minutes
    retry: 2,
    retryDelay: 500,
  });
};

// Hook for hierarchical data with optimized caching
export const useHierarchyDataOptimized = () => {
  const { data: states = [], isLoading: statesLoading } = useQuery({
    queryKey: ['states', 'optimized'],
    queryFn: adminApi.getStates,
    staleTime: 30 * 60 * 1000, // 30 minutes - states don't change often
    gcTime: 60 * 60 * 1000, // 1 hour
    retry: 2,
  });

  const { data: regions = [], isLoading: regionsLoading } = useQuery({
    queryKey: ['regions', 'optimized'],
    queryFn: adminApi.getRegions,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    retry: 2,
  });

  const { data: districts = [], isLoading: districtsLoading } = useQuery({
    queryKey: ['districts', 'optimized'],
    queryFn: adminApi.getDistricts,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    retry: 2,
  });

  const { data: groups = [], isLoading: groupsLoading } = useQuery({
    queryKey: ['groups', 'optimized'],
    queryFn: adminApi.getGroups,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    retry: 2,
  });

  const { data: oldGroups = [], isLoading: oldGroupsLoading } = useQuery({
    queryKey: ['oldGroups', 'optimized'],
    queryFn: adminApi.getOldGroups,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    retry: 2,
  });

  return {
    states: states || [],
    regions: regions || [],
    districts: districts || [],
    groups: groups || [],
    oldGroups: oldGroups || [],
    isLoading: statesLoading || regionsLoading || districtsLoading || groupsLoading || oldGroupsLoading
  };
};