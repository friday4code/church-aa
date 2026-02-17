import type { AttendanceRecord } from "@/types/attendance.type"

type Role = "admin" | "Super Admin" | "State Admin" | "Region Admin" | "District Admin" | "Group Admin" | "Viewer"

export interface AuthShape {
  state_id?: number | null
  region_id?: number | null
  district_id?: number | null
  group_id?: number | null
  roles?: Role[]
}

export const getAllowedReportTypes = (roles: Role[]) => {
  if (roles.includes("Super Admin")) return ["state", "region", "group", "youth"] as const
  if (roles.includes("State Admin")) return ["state", "region", "group", "youth"] as const
  if (roles.includes("Region Admin")) return ["region", "group", "youth"] as const
  if (roles.includes("District Admin")) return ["group"] as const
  if (roles.includes("Group Admin")) return ["group"] as const
  return [] as const
}

export const restrictAttendanceByScope = (records: AttendanceRecord[], auth: AuthShape): AttendanceRecord[] => {
  const roles = auth.roles || []
  if (roles.includes("Super Admin")) return records
  if (roles.includes("State Admin") && auth.state_id) {
    return records.filter(a => a.state_id === auth.state_id)
  }
  if (roles.includes("Region Admin") && auth.region_id) {
    return records.filter(a => a.region_id === auth.region_id)
  }
  if (roles.includes("District Admin") && auth.district_id) {
    return records.filter(a => a.district_id === auth.district_id)
  }
  if (roles.includes("Group Admin") && auth.group_id) {
    return records.filter(a => a.group_id === auth.group_id)
  }
  return []
}