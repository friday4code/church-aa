"use client"

import { useState, useEffect, useMemo, useCallback, memo, useRef, useTransition } from "react"
import { VStack, SimpleGrid, Heading, Text, Card, Button, Spinner, Center, Box } from "@chakra-ui/react"
import { Profile2User, UserOctagon, Calendar, TrendUp, ChartSquare } from "iconsax-reactjs"
import { useAttendance } from "@/modules/admin/hooks/useAttendance"
import { useStates } from "@/modules/admin/hooks/useState"
import { useRegions } from "@/modules/admin/hooks/useRegion"
import { useGroups } from "@/modules/admin/hooks/useGroup"
import { useOldGroups } from "@/modules/admin/hooks/useOldGroup"
import { useDistricts } from "@/modules/admin/hooks/useDistrict"
import { useYouthAttendance } from "@/modules/admin/hooks/useYouthAttendance"
import ReportsHeader from "./ReportsHeader"
import StatCard from "./StatCard"
import StateAttendanceReport from "./StateAttendanceReport"
import RegionAttendanceReport from "./RegionAttendanceReport"
import GroupAttendanceReport from "./GroupAttendanceReport"
import YouthAttendanceReport from "./YouthAttendanceReport"
import type { ReportFormValues } from "./ReportFilters"
import { exportStateReportToExcel, transformApiToStore } from "@/utils/report.utils"
import { filterAttendanceRecords } from "@/utils/reportProcessing.utils"
import { useAuth } from "@/hooks/useAuth"
import { toaster } from "@/components/ui/toaster"

// ----------------------------------------------------------------------
// 1. STRICT MEMOIZATION
// ----------------------------------------------------------------------
// We wrap these outside the component to guarantee referential identity across renders.
const MemoStateAttendanceReport = memo(StateAttendanceReport)
const MemoRegionAttendanceReport = memo(RegionAttendanceReport)
const MemoGroupAttendanceReport = memo(GroupAttendanceReport)
const MemoYouthAttendanceReport = memo(YouthAttendanceReport)

// ----------------------------------------------------------------------
// 2. HELPER: Stable Callback Hook
// ----------------------------------------------------------------------
// This ensures 'handleDownload' NEVER changes identity, preventing child re-renders.
function useStableCallback<T extends (...args: any[]) => any>(callback: T): T {
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
    const { districts = [] } = useDistricts()
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
        let sundayService = 0
        let houseCaring = 0

        for (let i = 0; i < attendances.length; i++) {
            const att = attendances[i]
            const sum = (att.men || 0) + (att.women || 0) +
                (att.youth_boys || 0) + (att.youth_girls || 0) +
                (att.children_boys || 0) + (att.children_girls || 0)
            totalAttendance += sum
            if (att.service_type === "Sunday Service") sundayService++
            else if (att.service_type === "House Caring") houseCaring++
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

        return {
            totalAttendance,
            totalYouth: totalWeeklyYouth + totalRevivalYouth,
            totalWeeklyYouth,
            totalRevivalYouth,
            averageAttendance: attendances.length > 0 ? Math.round(totalAttendance / attendances.length) : 0,
            growthRate: 12.5,
        }
    }, [attendances, youthWeeklyAttendances, youthRevivalAttendances])

    // ----------------------------------------------------------------------
    // 5. COLLECTIONS (Maps & Lists)
    // ----------------------------------------------------------------------
    // Create fast lookup maps once
    const maps = useMemo(() => ({
        state: new Map(states.map(s => [s.id, s])),
        region: new Map(regions.map(r => [r.id, r])),
        group: new Map(groups.map(g => [g.id, g]))
    }), [states, regions, groups])

    const sortLabel = (a: { label: string }, b: { label: string }) => a.label.localeCompare(b.label)

    // Base collections
    const collections = useMemo(() => ({
        states: states.map(s => ({ label: s.name || s.stateName, value: s.name || s.stateName })).sort(sortLabel),
        regions: regions.map(r => ({ label: r.name || r.regionName, value: r.name || r.regionName })).sort(sortLabel),
        groups: groups.map(g => ({ label: g.name || g.groupName, value: g.name || g.groupName })).sort(sortLabel),
        oldGroups: oldGroups.map(g => ({ label: g.name || g.groupName, value: g.name || g.groupName })).sort(sortLabel),
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
        let g = collections.groups
        let og = collections.oldGroups

        if (!hasRole('Super Admin')) {
            const sid = authUser?.state_id
            const rid = authUser?.region_id
            const gid = (authUser as any)?.group_id
            const did = authUser?.district_id

            // Filter States
            if (sid) {
                const name = maps.state.get(sid)?.name || maps.state.get(sid)?.stateName
                if (name) s = [{ label: name, value: name }]
            }

            // Filter Regions
            if (rid) {
                const name = maps.region.get(rid)?.name || maps.region.get(rid)?.regionName
                if (name) r = [{ label: name, value: name }]
            } else if (sid) {
                r = regions
                    .filter(item => Number(item.state_id) === Number(sid))
                    .map(item => ({ label: item.name || item.regionName, value: item.name || item.regionName }))
                    .sort(sortLabel)
            }

            // Filter Groups
            if (gid) {
                const name = maps.group.get(gid)?.name || maps.group.get(gid)?.groupName
                if (name) g = [{ label: name, value: name }]
            } else if (rid) {
                // Determine region string for fallback
                const rName = maps.region.get(rid)?.name?.toLowerCase()
                g = groups
                    .filter(item => {
                        if (item.region_id != null) return Number(item.region_id) === Number(rid)
                        return String(item.region).toLowerCase() === String(rName)
                    })
                    .map(item => ({ label: item.name || item.groupName, value: item.name || item.groupName }))
                    .sort(sortLabel)
            } else if (did) {
                g = groups
                    .filter(item => Number(item.district_id) === Number(did))
                    .map(item => ({ label: item.name || item.groupName, value: item.name || item.groupName }))
                    .sort(sortLabel)
            }

            // Filter Old Groups
            if (sid || rid) {
                og = oldGroups.filter(item => {
                    const byState = sid ? Number(item.state_id) === Number(sid) : true
                    const byRegion = rid ? Number(item.region_id) === Number(rid) : true
                    return byState && byRegion
                }).map(item => ({ label: item.name || item.groupName, value: item.name || item.groupName }))
                    .sort(sortLabel)
            }
        }

        return { s, r, g, og }
    }, [hasRole, authUser, collections, regions, groups, oldGroups, maps])

    // ----------------------------------------------------------------------
    // 6. UI STATE MANAGEMENT (The Fix for Freezing)
    // ----------------------------------------------------------------------
    const [selectedTab, setSelectedTab] = useState<string>("state")
    const [deferredTab, setDeferredTab] = useState<string>("state")
    const [isTransitioning, startTransition] = useTransition()
    const [isReportGenerating, setIsReportGenerating] = useState(false)

    // Handle Tab Click - Updates UI immediately, defers heavy content
    const handleTabChange = (val: string) => {
        setSelectedTab(val) // Update buttons instantly
        startTransition(() => {
            setDeferredTab(val) // Update heavy content in background
        })
    }

    const allowedReportTypes = useMemo(() => {
        if (hasRole('Super Admin')) return ['state', 'region', 'group', 'youth']
        if (hasRole('State Admin')) return ['region', 'group', 'youth']
        if (hasRole('Region Admin')) return ['region', 'group', 'youth']
        if (hasRole('District Admin')) return ['group']
        if (hasRole('Group Admin')) return ['group']
        return []
    }, [hasRole])

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
            let filtered = attendances
            const filterCriteria: any = {}
            let stateName = 'AKWA IBOM'

            // --- Simplified Filter Logic Implementation ---
            // (Reusing your logic but ensuring safe access)
            if (deferredTab === 'region' && !hasRole('Super Admin')) filterCriteria.region_id = authUser?.region_id
            if (deferredTab === 'group' && !hasRole('Super Admin')) {
                filterCriteria.group_id = (authUser as any)?.group_id
                if ((authUser as any)?.old_group_id) filterCriteria.old_group_id = (authUser as any)?.old_group_id
            }

            if (data.state) {
                const sObj = Array.from(maps.state.values()).find(s => (s.name || s.stateName) === data.state)
                if (sObj) { filterCriteria.state_id = sObj.id; stateName = sObj.name || sObj.stateName || stateName }
            }
            if (data.region) {
                const rObj = Array.from(maps.region.values()).find(r => (r.name || r.regionName) === data.region)
                if (rObj) filterCriteria.region_id = rObj.id
            }
            if (data.group) {
                const gObj = Array.from(maps.group.values()).find(g => (g.name || g.groupName) === data.group)
                if (gObj) filterCriteria.group_id = gObj.id
            }
            if (data.oldGroup) {
                const ogObj = oldGroups.find(g => (g.name || g.groupName) === data.oldGroup)
                if (ogObj) filterCriteria.old_group_id = ogObj.id
            }
            if (data.year) filterCriteria.year = parseInt(data.year, 10)
            if (data.month) {
                const mIdx = parseInt(data.month, 10)
                if (mIdx >= 1) filterCriteria.month = collections.months[mIdx - 1].label
            } else if (data.fromMonth && data.toMonth) {
                const fIdx = parseInt(data.fromMonth, 10)
                const tIdx = parseInt(data.toMonth, 10)
                if (fIdx >= 1 && tIdx >= 1) {
                    filterCriteria.monthRange = { from: collections.months[fIdx - 1].label, to: collections.months[tIdx - 1].label, months: collections.months.map(m => m.label) }
                }
            }

            filtered = await filterAttendanceRecords(filtered, filterCriteria)
            const toExport = filtered.map(transformApiToStore)
            exportStateReportToExcel(toExport, regions, stateName)

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

            <SimpleGrid columns={{ base: 1, md: 2, lg: 6 }} gap="2">
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
                        {['state', 'region', 'group', 'youth'].map((type) => {
                            const isActive = selectedTab === type
                            const isDisabled = !allowedReportTypes.includes(type)
                            return (
                                <Button
                                    key={type}
                                    variant={isActive ? "solid" : "outline"}
                                    bg={isActive ? "accent" : "transparent"}
                                    color={isActive ? "white" : "fg"}
                                    borderColor={!isActive ? "border" : "transparent"}
                                    _hover={{ bg: isActive ? "accent.emphasized" : "bg.subtle" }}
                                    onClick={() => !isDisabled && handleTabChange(type)}
                                    disabled={isDisabled}
                                    opacity={isDisabled ? 0.5 : 1}
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
        </VStack>
    )
}

export default ReportsContent
