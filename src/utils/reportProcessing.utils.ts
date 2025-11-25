/**
 * Optimized report data processing utilities
 */

import { batchProcess, measurePerformance } from './performance.utils'
import type { AttendanceRecord } from '@/types/attendance.type'

/**
 * Efficiently filter attendance records with optimizations
 */
export async function filterAttendanceRecords(
  records: AttendanceRecord[],
  filters: {
    stateId?: number
    regionId?: number
    districtId?: number
    groupId?: number
    oldGroupId?: number
    year?: number
    monthRange?: { from: number; to: number }
  },
  onProgress?: (processed: number, total: number) => void
): Promise<AttendanceRecord[]> {
  return measurePerformance('filterAttendanceRecords', () => {
    let filtered = records

    // Apply filters in order of selectivity (most restrictive first)
    if (filters.year !== undefined) {
      filtered = filtered.filter(record => record.year === filters.year)
    }

    if (filters.stateId !== undefined) {
      filtered = filtered.filter(record => record.state_id === filters.stateId)
    }

    if (filters.regionId !== undefined) {
      filtered = filtered.filter(record => record.region_id === filters.regionId)
    }

    if (filters.districtId !== undefined) {
      filtered = filtered.filter(record => record.district_id === filters.districtId)
    }

    if (filters.groupId !== undefined) {
      filtered = filtered.filter(record => record.group_id === filters.groupId)
    }

    if (filters.oldGroupId !== undefined) {
      filtered = filtered.filter(record => record.old_group_id === filters.oldGroupId)
    }

    if (filters.monthRange) {
      const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ]
      filtered = filtered.filter(record => {
        const monthIndex = months.indexOf(record.month) + 1
        return monthIndex >= filters.monthRange!.from && monthIndex <= filters.monthRange!.to
      })
    }

    return filtered
  })
}

/**
 * Calculate attendance statistics efficiently
 */
export function calculateAttendanceStats(records: AttendanceRecord[]) {
  return measurePerformance('calculateAttendanceStats', () => {
    let totalAttendance = 0
    let totalMen = 0
    let totalWomen = 0
    let totalYouthBoys = 0
    let totalYouthGirls = 0
    let totalChildrenBoys = 0
    let totalChildrenGirls = 0

    for (let i = 0; i < records.length; i++) {
      const record = records[i]
      const attendance = (record.men || 0) + (record.women || 0) + 
                       (record.youth_boys || 0) + (record.youth_girls || 0) + 
                       (record.children_boys || 0) + (record.children_girls || 0)
      
      totalAttendance += attendance
      totalMen += record.men || 0
      totalWomen += record.women || 0
      totalYouthBoys += record.youth_boys || 0
      totalYouthGirls += record.youth_girls || 0
      totalChildrenBoys += record.children_boys || 0
      totalChildrenGirls += record.children_girls || 0
    }

    return {
      totalAttendance,
      totalMen,
      totalWomen,
      totalYouthBoys,
      totalYouthGirls,
      totalChildrenBoys,
      totalChildrenGirls,
      averageAttendance: records.length > 0 ? Math.round(totalAttendance / records.length) : 0,
      recordCount: records.length
    }
  })
}

/**
 * Process large datasets in chunks to prevent UI blocking
 */
export async function processLargeDataset<T, R>(
  items: T[],
  processor: (items: T[]) => R,
  options: {
    chunkSize?: number
    onProgress?: (processed: number, total: number) => void
    onChunkComplete?: (chunkResult: R, chunkIndex: number) => void
  } = {}
): Promise<R[]> {
  const {
    chunkSize = 1000,
    onProgress,
    onChunkComplete
  } = options

  const results: R[] = []
  const totalChunks = Math.ceil(items.length / chunkSize)

  for (let i = 0; i < totalChunks; i++) {
    const start = i * chunkSize
    const end = Math.min(start + chunkSize, items.length)
    const chunk = items.slice(start, end)
    
    const chunkResult = processor(chunk)
    results.push(chunkResult)
    
    if (onChunkComplete) {
      onChunkComplete(chunkResult, i)
    }
    
    if (onProgress) {
      onProgress(end, items.length)
    }
    
    // Yield to event loop every 10 chunks to prevent blocking
    if (i % 10 === 0) {
      await new Promise(resolve => setTimeout(resolve, 0))
    }
  }

  return results
}

/**
 * Create indexed data structures for faster lookups
 */
export function createAttendanceIndex(records: AttendanceRecord[]) {
  return measurePerformance('createAttendanceIndex', () => {
    const byState = new Map<number, AttendanceRecord[]>()
    const byRegion = new Map<number, AttendanceRecord[]>()
    const byDistrict = new Map<number, AttendanceRecord[]>()
    const byGroup = new Map<number, AttendanceRecord[]>()
    const byYear = new Map<number, AttendanceRecord[]>()

    for (const record of records) {
      // Group by state
      if (!byState.has(record.state_id)) {
        byState.set(record.state_id, [])
      }
      byState.get(record.state_id)!.push(record)

      // Group by region
      if (!byRegion.has(record.region_id)) {
        byRegion.set(record.region_id, [])
      }
      byRegion.get(record.region_id)!.push(record)

      // Group by district
      if (record.district_id && !byDistrict.has(record.district_id)) {
        byDistrict.set(record.district_id, [])
      }
      if (record.district_id) {
        byDistrict.get(record.district_id)!.push(record)
      }

      // Group by group
      if (!byGroup.has(record.group_id)) {
        byGroup.set(record.group_id, [])
      }
      byGroup.get(record.group_id)!.push(record)

      // Group by year
      if (!byYear.has(record.year)) {
        byYear.set(record.year, [])
      }
      byYear.get(record.year)!.push(record)
    }

    return { byState, byRegion, byDistrict, byGroup, byYear }
  })
}

/**
 * Memory-efficient data structure for large datasets
 */
export class AttendanceDataStore {
  private records: AttendanceRecord[]
  private index: ReturnType<typeof createAttendanceIndex>

  constructor(records: AttendanceRecord[]) {
    this.records = records
    this.index = createAttendanceIndex(records)
  }

  getRecords(): AttendanceRecord[] {
    return this.records
  }

  getByState(stateId: number): AttendanceRecord[] {
    return this.index.byState.get(stateId) || []
  }

  getByRegion(regionId: number): AttendanceRecord[] {
    return this.index.byRegion.get(regionId) || []
  }

  getByDistrict(districtId: number): AttendanceRecord[] {
    return this.index.byDistrict.get(districtId) || []
  }

  getByGroup(groupId: number): AttendanceRecord[] {
    return this.index.byGroup.get(groupId) || []
  }

  getByYear(year: number): AttendanceRecord[] {
    return this.index.byYear.get(year) || []
  }

  updateRecords(newRecords: AttendanceRecord[]) {
    this.records = newRecords
    this.index = createAttendanceIndex(newRecords)
  }
}