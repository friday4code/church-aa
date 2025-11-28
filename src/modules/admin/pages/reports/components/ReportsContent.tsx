"use client"

import { useState, useEffect, useMemo, useCallback, memo, useRef, useTransition } from "react"
import { VStack, SimpleGrid, Heading, Text, Card, Button, Spinner, Center, Box } from "@chakra-ui/react"
import { Profile2User, UserOctagon, Calendar, TrendUp, ChartSquare } from "iconsax-reactjs"
import { useAttendance } from "@/modules/admin/hooks/useAttendance"
import { useStates } from "@/modules/admin/hooks/useState"
import { useRegions } from "@/modules/admin/hooks/useRegion"
import { useGroups } from "@/modules/admin/hooks/useGroup"
import { useOldGroups } from "@/modules/admin/hooks/useOldGroup"
import { useYouthAttendance } from "@/modules/admin/hooks/useYouthAttendance"
import ReportsHeader from "./ReportsHeader"
import StatCard from "./StatCard"
import StateAttendanceReport from "./StateAttendanceReport"
import RegionAttendanceReport from "./RegionAttendanceReport"
import GroupAttendanceReport from "./GroupAttendanceReport"
import OldGroupAttendanceReport from "./OldGroupAttendanceReport"
import DistrictAttendanceReport from "./DistrictAttendanceReport"
import YouthAttendanceReport from "./YouthAttendanceReport"
import type { ReportFormValues } from "./ReportFilters"
import { buildStateReportSheet, buildRegionReportSheet, buildOldGroupReportSheet, buildDistrictReportSheet, buildGroupReportSheet, exportSheet, getReportFileName, buildYouthMonthlyReportSheet } from "./exporters"
import { filterAttendanceRecords } from "@/utils/reportProcessing.utils"
import type { AttendanceRecord } from "@/types/attendance.type"
import type { OldGroup } from "@/types/oldGroups.type"
import type { Region } from "@/types/regions.type"
import { getRegionsByStateName, getOldGroupsByRegion } from "./regionFilters"
import { adminApi } from "@/api/admin.api"
import { useAuth } from "@/hooks/useAuth"
// role type import not required here; 'hasRole' covers verification
import type { User } from "@/types/users.type"
import { Toaster, toaster } from "@/components/ui/toaster"
import type { Group } from "@/types/groups.type"

// ----------------------------------------------------------------------
// 1. STRICT MEMOIZATION
// ----------------------------------------------------------------------
// We wrap these outside the component to guarantee referential identity across renders.
const MemoStateAttendanceReport = memo(StateAttendanceReport)
const MemoRegionAttendanceReport = memo(RegionAttendanceReport)
const MemoGroupAttendanceReport = memo(GroupAttendanceReport)
const MemoOldGroupAttendanceReport = memo(OldGroupAttendanceReport)
const MemoDistrictAttendanceReport = memo(DistrictAttendanceReport)
const MemoYouthAttendanceReport = memo(YouthAttendanceReport)

// ----------------------------------------------------------------------
// 2. HELPER: Stable Callback Hook
// ----------------------------------------------------------------------
// This ensures 'handleDownload' NEVER changes identity, preventing child re-renders.
function useStableCallback<T extends (...args: unknown[]) => unknown>(callback: T): T {
    const callbackRef = useRef(callback)

    // Update ref on every render so it always has the latest closure scope
    useEffect(() => {
        callbackRef.current = callback
    })

    // Return a stable function that calls the ref
    return useCallback(((...args) => {
        return callbackRef.current(...args)
    }) as T, [])
}

export const ReportsContent = () => {
    // ----------------------------------------------------------------------
    // 3. DATA FETCHING
    // ----------------------------------------------------------------------
    const { data: attendanceData, isLoading: isLoadingAttendance } = useAttendance()
    const { states = [], isLoading: isLoadingStates } = useStates()
    const { regions = [], isLoading: isLoadingRegions } = useRegions()
    const { groups = [], isLoading: isLoadingGroups } = useGroups()
    const { oldGroups = [], isLoading: isLoadingOldGroups } = useOldGroups()
    // districts not required here; remove to avoid unused var lint
    const { data: weeklyResp, isLoading: isLoadingWeekly } = useYouthAttendance({ attendance_type: 'weekly' })
    const { data: revivalResp, isLoading: isLoadingRevival } = useYouthAttendance({ attendance_type: 'revival' })
    const { user: authUser, hasRole } = useAuth()

    // ----------------------------------------------------------------------
    // 4. DATA PROCESSING (Optimized)
    // ----------------------------------------------------------------------
    const attendances = useMemo(() => attendanceData ?? [], [attendanceData])
    const youthWeeklyAttendances = useMemo(() => weeklyResp?.data ?? [], [weeklyResp])
    const youthRevivalAttendances = useMemo(() => revivalResp?.data ?? [], [revivalResp])

    // Stats Calculation (Single Pass)
    const dashboardData = useMemo(() => {
        let totalAttendance = 0

        for (let i = 0; i < attendances.length; i++) {
            const att = attendances[i]
            const sum = (att.men || 0) + (att.women || 0) +
                (att.youth_boys || 0) + (att.youth_girls || 0) +
                (att.children_boys || 0) + (att.children_girls || 0)
            totalAttendance += sum
            // service-type counts removed; not used in output
        }

        let totalWeeklyYouth = 0
        for (const att of youthWeeklyAttendances) {
            totalWeeklyYouth += (att.member_boys || 0) + (att.visitor_boys || 0) +
                (att.member_girls || 0) + (att.visitor_girls || 0)
        }

        let totalRevivalYouth = 0
        for (const att of youthRevivalAttendances) {
            totalRevivalYouth += (att.male || 0) + (att.female || 0)
        }

        const monthOrder = ['January','February','March','April','May','June','July','August','September','October','November','December']
        const monthIndex = (m: string) => {
            const i = monthOrder.indexOf(m)
            return i === -1 ? 0 : i + 1
        }
        const monthlyTotals: Record<string, number> = {}
        for (const w of youthWeeklyAttendances) {
            const key = `${w.year}-${w.month}`
            const val = (w.member_boys || 0) + (w.member_girls || 0) + (w.visitor_boys || 0) + (w.visitor_girls || 0)
            monthlyTotals[key] = (monthlyTotals[key] || 0) + val
        }
        const keys = Object.keys(monthlyTotals).sort((a, b) => {
            const [ay, am] = a.split('-'); const [by, bm] = b.split('-')
            const ai = parseInt(ay, 10); const bi = parseInt(by, 10)
            if (ai !== bi) return ai - bi
            return monthIndex(am) - monthIndex(bm)
        })
        const latestKey = keys[keys.length - 1]
        const prevKey = keys[keys.length - 2]
        const currentVal = latestKey ? monthlyTotals[latestKey] : 0
        const prevVal = prevKey ? monthlyTotals[prevKey] : 0
        let growthRate = 0
        if (prevVal > 0) {
            growthRate = ((currentVal - prevVal) / prevVal) * 100
        } else if (prevVal === 0) {
            growthRate = currentVal > 0 ? 100 : 0
        }
        return {
            totalAttendance,
            totalYouth: totalWeeklyYouth + totalRevivalYouth,
            totalWeeklyYouth,
            totalRevivalYouth,
            averageAttendance: attendances.length > 0 ? Math.round(totalAttendance / attendances.length) : 0,
            growthRate: Number.isFinite(growthRate) ? Math.round(growthRate * 10) / 10 : 0,
        }
    }, [attendances, youthWeeklyAttendances, youthRevivalAttendances])




    // ----------------------------------------------------------------------
    // 5. COLLECTIONS (Maps & Lists)
    // ----------------------------------------------------------------------
    // Create fast lookup maps once
    const maps = useMemo(() => ({
        state: new Map<number, (typeof states)[number]>(states.map(s => [s.id, s])),
        region: new Map<number, (typeof regions)[number]>(regions.map(r => [r.id, r])),
        group: new Map<number, (typeof groups)[number]>(groups.map(g => [g.id, g]))
    }), [states, regions, groups])

    const sortLabel = (a: { label: string }, b: { label: string }) => a.label.localeCompare(b.label)

    // Base collections
    const collections = useMemo(() => ({
        states: states.map(s => ({ label: s.name || s.stateName, value: s.id.toString() })).sort(sortLabel),
        regions: regions.map(r => ({ label: r.name || r.regionName, value: r.id.toString() })).sort(sortLabel),
        groups: groups.map(g => ({ label: g.name || g.groupName, value: g.id.toString() })).sort(sortLabel),
        oldGroups: oldGroups.map(g => ({ label: g.name || g.groupName, value: g.id.toString() })).sort(sortLabel),
        years: Array.from({ length: 10 }, (_, i) => {
            const year = new Date().getFullYear() - i
            return { label: year.toString(), value: year.toString() }
        }),
        months: [
            { label: "January", value: "1" }, { label: "February", value: "2" },
            { label: "March", value: "3" }, { label: "April", value: "4" },
            { label: "May", value: "5" }, { label: "June", value: "6" },
            { label: "July", value: "7" }, { label: "August", value: "8" },
            { label: "September", value: "9" }, { label: "October", value: "10" },
            { label: "November", value: "11" }, { label: "December", value: "12" },
        ]
    }), [states, regions, groups, oldGroups])

    // Scoped Collections (Fast Filtering)
    const scopedCollections = useMemo(() => {
        // Default to base collections
        let s = collections.states
        let r = collections.regions
        let og = collections.oldGroups
        let g = collections.groups

        if (!hasRole('Super Admin')) {
            const authUserTyped = authUser as User | null
            const sid = authUserTyped?.state_id ?? undefined
            const rid = authUserTyped?.region_id ?? undefined
            const gid = authUserTyped?.group_id ?? undefined
            const did = authUserTyped?.district_id ?? undefined

            // Filter States
            if (sid) {
                const state = maps.state.get(sid)
                if (state) s = [{ label: state.name, value: String(state.id) }]
            }

            // Filter Regions
            if (rid) {
                const region = maps.region.get(rid)
                if (region) r = [{ label: region.name, value: String(region.id) }]
            } else if (sid) {
                r = regions
                    .filter(item => Number(item.state_id) === Number(sid))
                    .map(item => ({ label: item.name || item.regionName, value: item.id.toString() }))
                    .sort(sortLabel)
            }

            // Filter Groups
            if (gid) {
                const group = maps.group.get(gid);
                if (group) g = [{ label: group.name, value: String(group.id) }]
            } else if (rid) {
                // Determine region string for fallback
                const rName = maps.region.get(rid)?.name?.toLowerCase()
                g = groups
                    .filter(item => {
                        if (item.region_id != null) return Number(item.region_id) === Number(rid)
                        return String(item.region).toLowerCase() === String(rName)
                    })
                    .map(item => ({ label: item.name || item.groupName, value: item.id.toString() }))
                    .sort(sortLabel)
            } else if (did) {
                g = groups
                    .filter(item => Number(item.district_id) === Number(did))
                    .map(item => ({ label: item.name || item.groupName, value: item.id.toString() }))
                    .sort(sortLabel)
            }

            // Filter Old Groups
            if (sid || rid) {
                og = oldGroups.filter(item => {
                    const byState = sid ? Number(item.state_id) === Number(sid) : true
                    const byRegion = rid ? Number(item.region_id) === Number(rid) : true
                    return byState && byRegion
                }).map(item => ({ label: item.name || item.groupName, value: item.id.toString() }))
                    .sort(sortLabel)
            }
        }

        return { s, r, g, og }
    }, [hasRole, authUser, collections, regions, groups, oldGroups, maps])

    // ----------------------------------------------------------------------
    // 6. UI STATE MANAGEMENT (The Fix for Freezing)
    // ----------------------------------------------------------------------
    type ReportType = 'state' | 'region' | 'oldGroup' | 'group' | 'district' | 'youth'
    const memoizedReportTypes = useMemo<ReportType[]>(() => ['state', 'region', 'oldGroup', 'group', 'district', 'youth'], [])
    const [selectedTab, setSelectedTab] = useState<ReportType>('state')
    const [deferredTab, setDeferredTab] = useState<ReportType>('state')
    const [isTransitioning, startTransition] = useTransition()
    const [isReportGenerating, setIsReportGenerating] = useState(false)

    // Handle Tab Click - Updates UI immediately, defers heavy content
    const handleTabChange = (val: ReportType) => {
        setSelectedTab(val) // Update buttons instantly
        startTransition(() => {
            setDeferredTab(val) // Update heavy content in background
        })
    }

    const allowedReportTypes = useMemo<ReportType[]>(() => {
        if (hasRole('Super Admin')) return memoizedReportTypes
        if (hasRole('State Admin')) return ['state', 'region', 'oldGroup', 'group', 'district']
        if (hasRole('Region Admin')) return ['region', 'oldGroup', 'group', 'district']
        if (hasRole('Old Group Admin')) return ['oldGroup', 'group', 'district']
        if (hasRole('Group Admin')) return ['group', 'district']
        if (hasRole('District Admin')) return ['district']
        return []
    }, [hasRole, memoizedReportTypes])

    useEffect(() => {
        if (!allowedReportTypes.includes(selectedTab)) {
            const next = allowedReportTypes[0] ?? 'youth'
            setSelectedTab(next)
            setDeferredTab(next)
        }
    }, [allowedReportTypes, selectedTab])

    // ----------------------------------------------------------------------
    // 7. DOWNLOAD HANDLER (Stable Identity)
    // ----------------------------------------------------------------------
    // This function reference will NEVER change, so child components won't re-render 
    // when 'attendances' or 'authUser' changes, unless clicked.
    const handleDownloadReport = useStableCallback(async (data: ReportFormValues) => {
        setIsReportGenerating(true)
        try {
            // Permission check
            if (!allowedReportTypes.includes(deferredTab)) {
                toaster.error({ description: 'Permission denied for this report type', closable: true })
                return
            }

            // Release UI thread
            await new Promise(resolve => setTimeout(resolve, 50))

            // Logic here is same as before, just using the stable 'deferredTab' and 'attendances'
            // We access data via closure which useStableCallback keeps fresh
            let filtered: AttendanceRecord[] = attendances as AttendanceRecord[]
            const filterCriteria: {
                stateId?: number
                regionId?: number
                districtId?: number
                groupId?: number
                oldGroupId?: number
                year?: number
                monthRange?: { from: number; to: number }
            } = {}
            let stateName = 'AKWA IBOM'

            // --- Simplified Filter Logic Implementation ---
            // (Reusing your logic but ensuring safe access)
            if (deferredTab === 'region' && !hasRole('Super Admin')) filterCriteria.regionId = authUser?.region_id ?? undefined
            if (deferredTab === 'group' && !hasRole('Super Admin')) {
                const u = authUser as User | null
                filterCriteria.groupId = u?.group_id ?? undefined
                if (u?.old_group_id != null) filterCriteria.oldGroupId = u.old_group_id
            }

            if (data.state) {
                const sObj = Array.from(maps.state.values()).find(s => (s.id || s.stateName) === Number(data.state))

                if (sObj) { filterCriteria.stateId = sObj.id; stateName = sObj.name || sObj.stateName || stateName }
            }
            if (data.region) {
                const rObj = Array.from(maps.region.values()).find(r => (r.id || r.regionName) === Number(data.region))
                if (rObj) filterCriteria.regionId = rObj.id
            }
            if (data.group) {
                const gObj = Array.from(maps.group.values()).find(g => (g.id || g.groupName) === Number(data.group))
                if (gObj) filterCriteria.groupId = gObj.id
            }
            if (data.district) {
                const dId = parseInt(data.district, 10)
                if (!Number.isNaN(dId)) filterCriteria.districtId = dId
            }
            if (data.oldGroup) {
                const ogObj = oldGroups.find(g => (g.id || g.groupName) === Number(data.oldGroup))
                if (ogObj) filterCriteria.oldGroupId = ogObj.id
            }
            if (data.year) filterCriteria.year = parseInt(data.year, 10)
            if (data.month) {
                const mIdx = parseInt(data.month, 10)
                if (mIdx >= 1) filterCriteria.monthRange = { from: mIdx, to: mIdx }
            } else if (data.fromMonth && data.toMonth) {
                const fIdx = parseInt(data.fromMonth, 10)
                const tIdx = parseInt(data.toMonth, 10)
                if (fIdx >= 1 && tIdx >= 1) {
                    filterCriteria.monthRange = { from: fIdx, to: tIdx }
                }
            }

            filtered = await filterAttendanceRecords(filtered, filterCriteria)

            if (deferredTab === 'state') {
                if (!filterCriteria.stateId) {
                    toaster.error({ description: 'Select a state', closable: true })
                    return
                }
                const stateRegions = getRegionsByStateName(stateName, regions as unknown as Region[])
                const spec = data.month ? { single: collections.months[parseInt(data.month, 10) - 1].label } : (data.fromMonth && data.toMonth ? { range: { from: parseInt(data.fromMonth, 10), to: parseInt(data.toMonth, 10) } } : { months: [] })
                const sheet = buildStateReportSheet(filtered, (stateRegions as Region[]).sort((a, b) => a.name.localeCompare(b.name)), stateName, filterCriteria.year ?? new Date().getFullYear(), spec)
                exportSheet(sheet, getReportFileName('state'), 'State Report')
            } else if (deferredTab === 'region') {
                if (!filterCriteria.regionId) {
                    toaster.error({ description: 'Select a region', closable: true })
                    return
                }
                const rObj = regions.find(r => Number(r.id) === Number(filterCriteria.regionId))
                const rName = rObj?.name || 'Region'
                const spec = data.month ? { single: collections.months[parseInt(data.month, 10) - 1].label } : (data.fromMonth && data.toMonth ? { range: { from: parseInt(data.fromMonth, 10), to: parseInt(data.toMonth, 10) } } : { months: [] })
                let sourceOldGroups: OldGroup[] = oldGroups as OldGroup[]
                const apiOldGroups = await adminApi.getOldGroupsByRegionId(Number(filterCriteria.regionId))
                if (apiOldGroups && apiOldGroups.length) {
                    const names = new Set(apiOldGroups.map(x => x.name))
                    sourceOldGroups = (oldGroups as OldGroup[]).filter(og => names.has(og.name)).sort((a, b) => a.name.localeCompare(b.name))
                }

                const filteredOldGroups = getOldGroupsByRegion(rName, sourceOldGroups)

                const sheet = buildRegionReportSheet(filtered, filteredOldGroups, rName, filterCriteria.year ?? new Date().getFullYear(), spec, Number(filterCriteria.regionId))
                exportSheet(sheet, getReportFileName('region'), 'Region Report')
            } else if (deferredTab === 'oldGroup') {
                if (!filterCriteria.oldGroupId) {
                    toaster.error({ description: 'Select an old group', closable: true })
                    return
                }
                const ogObj = oldGroups.find(g => Number(g.id) === Number(filterCriteria.oldGroupId))
                const ogName = ogObj?.name || 'Old Group'
                const spec = data.month ? { single: collections.months[parseInt(data.month, 10) - 1].label } : (data.fromMonth && data.toMonth ? { range: { from: parseInt(data.fromMonth, 10), to: parseInt(data.toMonth, 10) } } : { months: [] })
                const groups = await adminApi.getGroupsByOldGroupId(Number(filterCriteria.oldGroupId));
                const sheet = buildOldGroupReportSheet(filtered, (groups as Group[]).sort((a, b) => a.name.localeCompare(b.name)), ogName, filterCriteria.year ?? new Date().getFullYear(), spec, Number(filterCriteria.oldGroupId))
                exportSheet(sheet, getReportFileName('oldGroup'), 'Old Group Report')
            } else if (deferredTab === 'group') {
                if (!filterCriteria.groupId) {
                    toaster.error({ description: 'Select a group', closable: true })
                    return
                }
                const gObj = groups.find(g => Number(g.id) === Number(filterCriteria.groupId))
                const gName = gObj?.name || 'Group'
                const spec = data.month ? { single: collections.months[parseInt(data.month, 10) - 1].label } : (data.fromMonth && data.toMonth ? { range: { from: parseInt(data.fromMonth, 10), to: parseInt(data.toMonth, 10) } } : { months: [] })
                let districts: Array<{ id: number; name: string; group_id?: number }> = []
                try {
                    const apiDistricts = await adminApi.getDistrictsByGroupId(Number(filterCriteria.groupId))
                    districts = (apiDistricts || []).map(d => ({ id: d.id, name: d.name, group_id: Number(filterCriteria.groupId) }))
                    console.log("download:districts:api", districts)
                } catch (err) {
                    console.warn("download:districts:fallback", err)
                    const ids = Array.from(new Set(filtered.filter(x => x.group_id === Number(filterCriteria.groupId)).map(x => x.district_id).filter(Boolean))) as number[]
                    districts = ids.map(id => ({ id, name: `District ${id}`, group_id: Number(filterCriteria.groupId) }))
                    console.log("download:districts:derived", districts)
                }
                const hasData = filtered.some(x => x.group_id === Number(filterCriteria.groupId))
                if (!hasData || districts.length === 0) {
                    toaster.error({ description: 'No attendance data or districts for selected group', closable: true })
                    return
                }
                console.log("download:build:start", { groupId: filterCriteria.groupId, spec, year: filterCriteria.year })
                const sheet = buildGroupReportSheet(filtered, (districts as Array<{ id: number; name: string; group_id?: number }>).sort((a, b) => a.name.localeCompare(b.name)), gName, filterCriteria.year ?? new Date().getFullYear(), spec, Number(filterCriteria.groupId))
                exportSheet(sheet, getReportFileName('group'), 'Group Report')
                console.log("download:build:done")
            } else if (deferredTab === 'district') {
                const selectedDistrictId = filterCriteria.districtId
                if (selectedDistrictId == null) {
                    toaster.error({ description: 'Select a district', closable: true })
                    return
                }
                const dObjs = await adminApi.getDistrictsByGroupId(Number(filterCriteria.groupId)) || []
                const dObj = dObjs.find(g => g.id === Number(selectedDistrictId))
                const dName = dObj?.name || `District ${selectedDistrictId}`
                const spec = data.month ? { single: collections.months[parseInt(data.month, 10) - 1].label } : (data.fromMonth && data.toMonth ? { range: { from: parseInt(data.fromMonth, 10), to: parseInt(data.toMonth, 10) } } : { months: [] })
                const hasData = filtered.some(x => x.group_id === Number(filterCriteria.groupId) && x.district_id === selectedDistrictId)
                if (!hasData) {
                    toaster.error({ description: 'No attendance data for selected district/group', closable: true })
                    return
                }
                const districts: Array<{ id: number; name: string; group_id?: number }> = [{ id: selectedDistrictId, name: dName, group_id: Number(filterCriteria.groupId) }]
                const sheet = buildDistrictReportSheet(filtered, (districts as Array<{ id: number; name: string; group_id?: number }>).sort((a, b) => a.name.localeCompare(b.name)), dName, filterCriteria.year ?? new Date().getFullYear(), spec, Number(filterCriteria.groupId))
                exportSheet(sheet, getReportFileName('district'), 'District Report')
            } else if (deferredTab === 'youth') {
                if (!hasRole('Super Admin')) {
                    toaster.error({ description: 'Only Super Admin can generate youth reports', closable: true })
                    return
                }
                const yr = data.year ? parseInt(data.year, 10) : new Date().getFullYear()
                const mIdx = data.month ? parseInt(data.month, 10) : new Date().getMonth() + 1
                const mLabel = collections.months[mIdx - 1]?.label ?? 'January'
                const rid = data.region ? parseInt(data.region, 10) : (authUser as User | null)?.region_id ?? undefined
                const filteredWeekly = youthWeeklyAttendances.filter(a => a.year === yr && a.month === mLabel && (!rid || a.region_id === rid))
                const rName = rid ? (regions.find(r => r.id === rid)?.name || 'Region') : 'Region'
                const sheet = buildYouthMonthlyReportSheet(filteredWeekly as any, rName, mLabel, yr, (groups as Group[]).map(g => ({ id: g.id, name: g.name })))
                exportSheet(sheet, getReportFileName('youth'), 'Youth Monthly Report')
            } else {
                toaster.error({ description: 'Unsupported report type', closable: true })
            }

        } catch (error) {
            console.error(error)
            toaster.error({ description: 'Failed to generate report', closable: true })
        } finally {
            setIsReportGenerating(false)
        }
    })

    // ----------------------------------------------------------------------
    // 8. RENDERER
    // ----------------------------------------------------------------------

    // Check loading states
    const isGlobalLoading = isLoadingAttendance || isLoadingStates
    const isSpecificLoading = (
        (deferredTab === 'region' && isLoadingRegions) ||
        (deferredTab === 'group' && (isLoadingRegions || isLoadingGroups || isLoadingOldGroups)) ||
        (deferredTab === 'youth' && (isLoadingWeekly || isLoadingRevival))
    )

    // Memoize the content to prevent re-renders when parent state (like stats) updates
    const ReportComponent = useMemo(() => {
        // If we are transitioning tabs, show spinner or old content (Chakra's Fade could be used here)
        // Ideally we keep showing old content until new one is ready (Concurrent React)
        // But for clarity, we'll return the specific component based on 'deferredTab'

        const commonProps = {
            yearsCollection: collections.years,
            monthsCollection: collections.months,
            onDownload: handleDownloadReport,
            isLoading: isReportGenerating || isGlobalLoading || isSpecificLoading
        }

        switch (deferredTab) {
            case "state":
                return <MemoStateAttendanceReport
                    {...commonProps}
                    statesCollection={scopedCollections.s}
                />
            case "region":
                return <MemoRegionAttendanceReport
                    {...commonProps}
                    statesCollection={scopedCollections.s}
                    regionsCollection={scopedCollections.r}
                />
            case "group":
                return <MemoGroupAttendanceReport
                    {...commonProps} // Group report doesn't use months usually, but passing is fine if ignored
                    statesCollection={scopedCollections.s}
                    regionsCollection={scopedCollections.r}
                    groupsCollection={scopedCollections.g}
                    oldGroupsCollection={scopedCollections.og}
                />
            case "oldGroup":
                return <MemoOldGroupAttendanceReport
                    {...commonProps}
                    statesCollection={scopedCollections.s}
                    regionsCollection={scopedCollections.r}
                    oldGroupsCollection={scopedCollections.og}
                />
            case "district":
                return <MemoDistrictAttendanceReport
                    {...commonProps}
                    statesCollection={scopedCollections.s}
                    regionsCollection={scopedCollections.r}
                    groupsCollection={scopedCollections.g}
                />
            case "youth":
                return <MemoYouthAttendanceReport
                    {...commonProps}
                    statesCollection={scopedCollections.s}
                    regionsCollection={scopedCollections.r}
                />
            default:
                return null
        }
    }, [deferredTab, scopedCollections, collections, handleDownloadReport, isReportGenerating, isGlobalLoading, isSpecificLoading])

    return (
        <VStack gap="8" align="stretch">
            <ReportsHeader />

            <SimpleGrid columns={{ base: 2, sm: 2, md: 2, lg: 6 }} gap={{ base: 3, md: 2 }}>
                <StatCard title="Total Attendance" value={dashboardData.totalAttendance} icon={Profile2User} color="blue" description="All services" trend={dashboardData.growthRate} />
                <StatCard title="Youth Attendance" value={dashboardData.totalYouth} icon={UserOctagon} color="green" description="YHSF members" />
                <StatCard title="Weekly Youth" value={dashboardData.totalWeeklyYouth} icon={Calendar} color="purple" description="Weekly programs" />
                <StatCard title="Revival Youth" value={dashboardData.totalRevivalYouth} icon={TrendUp} color="orange" description="Revival meetings" />
                <StatCard title="Avg. Attendance" value={dashboardData.averageAttendance} icon={ChartSquare} color="red" description="Per service" />
                <StatCard title="Growth Rate" value={`${dashboardData.growthRate}%`} icon={TrendUp} color="green" description="This month" />
            </SimpleGrid>

            <Card.Root bg="bg" border="1px" borderColor={{ base: "gray.200", _dark: "gray.700" }} rounded="xl">
                <Card.Header>
                    <Heading size="lg">Generate Reports</Heading>
                    <Text color="gray.500" mt={1}>Select report type and configure parameters</Text>
                </Card.Header>
                <Card.Body>
                    <SimpleGrid columns={{ base: 2, md: 4 }} gap="4" mb="6">
                        {allowedReportTypes.map((type) => {
                            const isActive = selectedTab === type
                            return (
                                <Button
                                    key={type}
                                    variant={isActive ? "solid" : "outline"}
                                    bg={isActive ? "accent" : "transparent"}
                                    color={isActive ? "white" : "fg"}
                                    borderColor={!isActive ? "border" : "transparent"}
                                    _hover={{ bg: isActive ? "accent.emphasized" : "bg.subtle" }}
                                    onClick={() => handleTabChange(type)}
                                    rounded="xl"
                                    textTransform="capitalize"
                                >
                                    {type} Report
                                </Button>
                            )
                        })}
                    </SimpleGrid>

                    {/* 
                       The heavy component is rendered here. 
                       'isTransitioning' is true while React calculates the new ReportComponent in the background.
                       We show a Spinner if the transition takes too long, or if data is loading.
                    */}
                    <Box minH="300px" position="relative">
                        {isTransitioning || isGlobalLoading ? (
                            <Center h="300px">
                                <VStack>
                                    <Spinner size="xl" color="accent" />
                                    <Text>Loading report configuration...</Text>
                                </VStack>
                            </Center>
                        ) : (
                            ReportComponent
                        )}
                    </Box>
                </Card.Body>
            </Card.Root>

            <Toaster />
        </VStack>
    )
}

export default ReportsContent
// Exact, case-sensitive state-name matcher for regions
