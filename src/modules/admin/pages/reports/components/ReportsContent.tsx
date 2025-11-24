"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { VStack, SimpleGrid, Heading, Text, Card, Button } from "@chakra-ui/react"
import { Profile2User, UserOctagon, Calendar, TrendUp, ChartSquare } from "iconsax-reactjs"
import { useAttendance } from "@/modules/admin/hooks/useAttendance"
import { useStates } from "@/modules/admin/hooks/useState"
import { useRegions } from "@/modules/admin/hooks/useRegion"
import { useGroups } from "@/modules/admin/hooks/useGroup"
import { useOldGroups } from "@/modules/admin/hooks/useOldGroup"
import { useDistricts } from "@/modules/admin/hooks/useDistrict"
import { useYouthAttendance } from "@/modules/admin/hooks/useYouthAttendance"
import type { AttendanceRecord } from "@/types/attendance.type"
import type { YouthAttendance } from "@/types/youthAttendance.type"
import ReportsHeader from "./ReportsHeader"
import StatCard from "./StatCard"
import ServiceDistributionCard from "./ServiceDistributionCard"
import MonthlyTrendCard from "./MonthlyTrendCard"
import StateAttendanceReport from "./StateAttendanceReport"
import RegionAttendanceReport from "./RegionAttendanceReport"
import GroupAttendanceReport from "./GroupAttendanceReport"
import YouthAttendanceReport from "./YouthAttendanceReport"

import type { ReportFormValues } from "./ReportFilters"
import { exportStateReportToExcel, transformApiToStore } from "@/utils/report.utils"
import { useAuth } from "@/hooks/useAuth"
import { toaster } from "@/components/ui/toaster"

export const ReportsContent = () => {
    const { data: attendanceData = [], isLoading: isLoadingAttendance } = useAttendance()
    const { states = [], isLoading: isLoadingStates } = useStates()
    const { regions = [], isLoading: isLoadingRegions } = useRegions()
    const { groups = [], isLoading: isLoadingGroups } = useGroups()
    const { oldGroups = [], isLoading: isLoadingOldGroups } = useOldGroups()
    const { districts = [] } = useDistricts()
    const { data: weeklyResp, isLoading: isLoadingWeekly } = useYouthAttendance({ attendance_type: 'weekly' })
    const { data: revivalResp, isLoading: isLoadingRevival } = useYouthAttendance({ attendance_type: 'revival' })
    const { user: authUser, hasRole } = useAuth()

    const attendances: AttendanceRecord[] = attendanceData
    const youthWeeklyAttendances: YouthAttendance[] = useMemo(() => weeklyResp?.data ?? [], [weeklyResp])
    const youthRevivalAttendances: YouthAttendance[] = useMemo(() => revivalResp?.data ?? [], [revivalResp])

    const [selectedReport, setSelectedReport] = useState<string>("state")
    const [isLoading, setIsLoading] = useState(false)
    const [stats, setStats] = useState({
        totalAttendance: 0,
        totalYouth: 0,
        totalWeeklyYouth: 0,
        totalRevivalYouth: 0,
        averageAttendance: 0,
        growthRate: 0,
    })
    const serviceDistribution = useMemo(() => {
        const data = [
            { name: "Sunday Worship", value: attendances.filter((a) => a.service_type === "Sunday Service").length, color: "blue.solid" },
            { name: "House Caring", value: attendances.filter((a) => a.service_type === "House Caring").length, color: "green.solid" },
            { name: "Youth Attendance", value: (youthWeeklyAttendances.length + youthRevivalAttendances.length), color: "purple.solid" },
            { name: "Youth Weekly", value: youthWeeklyAttendances.length, color: "orange.solid" },
            { name: "Youth Revival", value: youthRevivalAttendances.length, color: "red.solid" },
        ].filter((item) => item.value > 0)
        return data
    }, [attendances, youthWeeklyAttendances, youthRevivalAttendances])

    const monthlyTrend = useMemo(() => {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        const currentMonth = new Date().getMonth()
        const monthlyData: { month: string; attendance: number; youth: number }[] = []

        for (let i = 5; i >= 0; i--) {
            const monthIndex = (currentMonth - i + 12) % 12
            const monthName = months[monthIndex]

            const monthAttendances = attendances.filter((att) => {
                const monthAbbrev = (att.month || '').slice(0, 3).toLowerCase()
                return monthAbbrev === monthName.toLowerCase()
            })

            const monthTotal = monthAttendances.reduce((sum, att) =>
                sum + (att.men || 0) + (att.women || 0) + (att.youth_boys || 0) + (att.youth_girls || 0) + (att.children_boys || 0) + (att.children_girls || 0), 0
            )

            monthlyData.push({
                month: monthName,
                attendance: monthTotal,
                youth: Math.round(monthTotal * 0.3),
            })
        }

        return monthlyData
    }, [attendances])

    // Create collections for Combobox components - Sorted in ASC order
    const statesCollection = states
        .map((state) => ({
            label: state.name || state.stateName,
            value: state.name || state.stateName,
        }))
        .sort((a, b) => a.label.localeCompare(b.label))

    const regionsCollection = regions
        .map((region) => ({
            label: region.name || region.regionName,
            value: region.name || region.regionName,
        }))
        .sort((a, b) => a.label.localeCompare(b.label))

    const groupsCollection = groups
        .map((group) => ({
            label: group.name || group.groupName,
            value: group.name || group.groupName,
        }))
        .sort((a, b) => a.label.localeCompare(b.label))

    const oldGroupsCollection = oldGroups
        .map((group) => ({
            label: group.name || group.groupName,
            value: group.name || group.groupName,
        }))
        .sort((a, b) => a.label.localeCompare(b.label))

    const yearsCollection = Array.from({ length: 10 }, (_, i) => {
        const year = new Date().getFullYear() - i
        return { label: year.toString(), value: year.toString() }
    }).sort((a, b) => b.label.localeCompare(a.label))

    const monthsCollection = [
        { label: "January", value: "1" },
        { label: "February", value: "2" },
        { label: "March", value: "3" },
        { label: "April", value: "4" },
        { label: "May", value: "5" },
        { label: "June", value: "6" },
        { label: "July", value: "7" },
        { label: "August", value: "8" },
        { label: "September", value: "9" },
        { label: "October", value: "10" },
        { label: "November", value: "11" },
        { label: "December", value: "12" },
    ]

    const allowedReportTypes = useMemo(() => {
        if (hasRole('Super Admin')) return ['state', 'region', 'group', 'youth'] as const
        if (hasRole('State Admin')) return ['state', 'region', 'group', 'youth'] as const
        if (hasRole('Region Admin')) return ['region', 'group', 'youth'] as const
        if (hasRole('District Admin')) return ['group'] as const
        if (hasRole('Group Admin')) return ['group'] as const
        return [] as const
    }, [hasRole])

    const restrictByScope = useCallback((records: AttendanceRecord[]): AttendanceRecord[] => {
        if (hasRole('Super Admin')) return records
        if (hasRole('State Admin') && authUser?.state_id) {
            return records.filter(a => a.state_id === authUser.state_id)
        }
        if (hasRole('Region Admin') && authUser?.region_id) {
            return records.filter(a => a.region_id === authUser.region_id)
        }
        if (hasRole('District Admin') && authUser?.district_id) {
            return records.filter(a => a.district_id === authUser.district_id)
        }
        const gId = (authUser as any)?.group_id as number | undefined
        if (hasRole('Group Admin') && gId) {
            return records.filter(a => a.group_id === gId)
        }
        return []
    }, [hasRole, authUser])

    const isReportTypeAllowed = useCallback((type: string) => {
        return (allowedReportTypes as readonly string[]).includes(type)
    }, [allowedReportTypes])

    const scopedStatesCollection = useMemo(() => {
        if (hasRole('Super Admin')) return statesCollection
        const sid = authUser?.state_id ?? 0
        if (sid) {
            const s = states.find(x => x.id === sid)
            if (s) {
                const label = s.name || (s as { stateName?: string }).stateName || ''
                return label ? [{ label, value: label }] : []
            }
        }
        return statesCollection
    }, [statesCollection, hasRole, authUser, states])

    const scopedRegionsCollection = useMemo(() => {
        if (hasRole('Super Admin')) return regionsCollection
        const rid = authUser?.region_id ?? 0
        const sid = authUser?.state_id ?? 0
        if (rid) {
            const r = regions.find(x => x.id === rid)
            if (r) {
                const label = r.name || (r as { regionName?: string }).regionName || ''
                return label ? [{ label, value: label }] : []
            }
        }
        if (sid) {
            const filtered = regions.filter(r => (r as any).state_id != null ? Number((r as any).state_id) === Number(sid) : true)
            return filtered.map(r => ({ label: r.name || (r as { regionName?: string }).regionName, value: r.name || (r as { regionName?: string }).regionName })).sort((a, b) => a.label.localeCompare(b.label))
        }
        return regionsCollection
    }, [regionsCollection, hasRole, authUser, regions])

    const scopedOldGroupsCollection = useMemo(() => {
        if (hasRole('Super Admin')) return oldGroupsCollection
        const sid = authUser?.state_id ?? 0
        const rid = authUser?.region_id ?? 0
        const filtered = oldGroups.filter(og => {
            const byState = sid ? ((og as any).state_id != null ? Number((og as any).state_id) === Number(sid) : true) : true
            const byRegion = rid ? ((og as any).region_id != null ? Number((og as any).region_id) === Number(rid) : true) : true
            return byState && byRegion
        })
        return filtered.map(g => ({ label: g.name || (g as { groupName?: string }).groupName, value: g.name || (g as { groupName?: string }).groupName })).sort((a, b) => a.label.localeCompare(b.label))
    }, [oldGroupsCollection, hasRole, authUser, oldGroups])

    const scopedGroupsCollection = useMemo(() => {
        if (hasRole('Super Admin')) return groupsCollection
        const gid = (authUser as any)?.group_id as number | undefined
        const rid = authUser?.region_id ?? 0
        const did = authUser?.district_id ?? 0
        if (gid) {
            const g = groups.find(x => x.id === gid)
            if (g) {
                const label = g.name || (g as { groupName?: string }).groupName || ''
                return label ? [{ label, value: label }] : []
            }
        }
        if (rid) {
            const filtered = groups.filter(g => (g as any).region_id != null ? Number((g as any).region_id) === Number(rid) : (g as any).region ? String((g as any).region).toLowerCase() === String(regions.find(r => r.id === rid)?.name || '').toLowerCase() : false)
            return filtered.map(g => ({ label: g.name || (g as { groupName?: string }).groupName, value: g.name || (g as { groupName?: string }).groupName })).sort((a, b) => a.label.localeCompare(b.label))
        }
        if (did) {
            const filtered = groups.filter(g => (g as any).district_id != null ? Number((g as any).district_id) === Number(did) : true)
            return filtered.map(g => ({ label: g.name || (g as { groupName?: string }).groupName, value: g.name || (g as { groupName?: string }).groupName })).sort((a, b) => a.label.localeCompare(b.label))
        }
        return groupsCollection
    }, [groupsCollection, hasRole, authUser, groups, regions])

    useEffect(() => {
        const totalAttendance = attendances.reduce((sum, att) =>
            sum + (att.men || 0) + (att.women || 0) + (att.youth_boys || 0) + (att.youth_girls || 0) + (att.children_boys || 0) + (att.children_girls || 0), 0
        )

        const totalWeeklyYouth = youthWeeklyAttendances.reduce((sum: number, att) =>
            sum + (att.member_boys || 0) + (att.visitor_boys || 0) + (att.member_girls || 0) + (att.visitor_girls || 0), 0
        )
        const totalRevivalYouth = youthRevivalAttendances.reduce((sum: number, att) => sum + (att.male || 0) + (att.female || 0), 0)
        const totalYouth = totalWeeklyYouth + totalRevivalYouth

        const averageAttendance = attendances.length > 0 ? Math.round(totalAttendance / attendances.length) : 0
        const growthRate = 12.5

        setStats({
            totalAttendance,
            totalYouth,
            totalWeeklyYouth,
            totalRevivalYouth,
            averageAttendance,
            growthRate,
        })
    }, [attendances, youthWeeklyAttendances, youthRevivalAttendances])

    // const calculateStats = () => {
    //     const totalAttendance = attendances.reduce((sum, att) =>
    //         sum + (att.men || 0) + (att.women || 0) + (att.youth_boys || 0) + (att.youth_girls || 0) + (att.children_boys || 0) + (att.children_girls || 0), 0
    //     )

    //     const totalWeeklyYouth = youthWeeklyAttendances.reduce((sum: number, att) =>
    //         sum + (att.member_boys || 0) + (att.visitor_boys || 0) + (att.member_girls || 0) + (att.visitor_girls || 0), 0
    //     )
    //     const totalRevivalYouth = youthRevivalAttendances.reduce((sum: number, att) => sum + (att.male || 0) + (att.female || 0), 0)
    //     const totalYouth = totalWeeklyYouth + totalRevivalYouth

    //     const averageAttendance = attendances.length > 0 ? Math.round(totalAttendance / attendances.length) : 0
    //     const growthRate = 12.5

    //     setStats({
    //         totalAttendance,
    //         totalYouth,
    //         totalWeeklyYouth,
    //         totalRevivalYouth,
    //         averageAttendance,
    //         growthRate,
    //     })
    // }

    // Removed prepareChartData state updates; using memoized derived data above

    const handleDownloadReport = (data: ReportFormValues) => {
        setIsLoading(true)
        try {
            if (!isReportTypeAllowed(selectedReport)) {
                toaster.error({ description: 'You do not have permission to generate this report type.', closable: true })
                console.warn(`Permission denied: report type ${selectedReport}`)
                return
            }

            const months = [
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December",
            ]

            let filtered = restrictByScope(attendances)
            let stateName = 'AKWA IBOM'

            if (data.state) {
                const stateObj = states.find((s) => (s.name || (s as { stateName?: string }).stateName) === data.state || String(s.id) === data.state)
                if (stateObj) {
                    if (hasRole('State Admin') && authUser?.state_id && stateObj.id !== authUser.state_id) {
                        toaster.error({ description: 'You can only download reports for your state.', closable: true })
                        console.warn('Permission denied: state filter outside scope')
                        return
                    }
                    filtered = filtered.filter((att) => att.state_id === stateObj.id)
                    stateName = (stateObj.name || (stateObj as { stateName?: string }).stateName || stateName)
                }
            }

            if (data.region) {
                const regionObj = regions.find((r) => (r.name || (r as { regionName?: string }).regionName) === data.region || String(r.id) === data.region)
                if (regionObj) {
                    if (hasRole('Region Admin') && authUser?.region_id && regionObj.id !== authUser.region_id) {
                        toaster.error({ description: 'You can only download reports for your region.', closable: true })
                        console.warn('Permission denied: region filter outside scope')
                        return
                    }
                    filtered = filtered.filter((att) => att.region_id === regionObj.id)
                }
            }

            if (data.district) {
                const districtObj = districts.find((d) => d.name === data.district || String(d.id) === data.district)
                if (districtObj) {
                    if (hasRole('District Admin') && authUser?.district_id && districtObj.id !== authUser.district_id) {
                        toaster.error({ description: 'You can only download reports for your district.', closable: true })
                        console.warn('Permission denied: district filter outside scope')
                        return
                    }
                    filtered = filtered.filter((att) => att.district_id === districtObj.id)
                }
            }

            if (data.group) {
                const groupObj = groups.find((g) => (g.name || (g as { groupName?: string }).groupName) === data.group || String(g.id) === data.group)
                if (groupObj) {
                    const authGroupId = (authUser as any)?.group_id as number | undefined
                    if (hasRole('Group Admin') && authGroupId && groupObj.id !== authGroupId) {
                        toaster.error({ description: 'You can only download reports for your group.', closable: true })
                        console.warn('Permission denied: group filter outside scope')
                        return
                    }
                    filtered = filtered.filter((att) => att.group_id === groupObj.id)
                }
            }

            if (data.oldGroup) {
                const oldGroupObj = oldGroups.find((g) => (g.name || (g as { groupName?: string }).groupName) === data.oldGroup || String(g.id) === data.oldGroup)
                if (oldGroupObj) {
                    filtered = filtered.filter((att) => (att.old_group_id || 0) === oldGroupObj.id)
                }
            }

            if (data.year) {
                const yearNum = parseInt(data.year, 10)
                if (!Number.isNaN(yearNum)) {
                    filtered = filtered.filter((att) => att.year === yearNum)
                }
            }

            if (data.month) {
                const monthIndex = parseInt(data.month, 10)
                if (!Number.isNaN(monthIndex) && monthIndex >= 1 && monthIndex <= 12) {
                    const monthName = months[monthIndex - 1]
                    filtered = filtered.filter((att) => att.month === monthName)
                }
            } else if (data.fromMonth && data.toMonth) {
                const fromIndex = parseInt(data.fromMonth, 10)
                const toIndex = parseInt(data.toMonth, 10)
                if (
                    !Number.isNaN(fromIndex) &&
                    !Number.isNaN(toIndex) &&
                    fromIndex >= 1 &&
                    toIndex <= 12 &&
                    fromIndex <= toIndex
                ) {
                    filtered = filtered.filter((att) => {
                        const idx = months.indexOf(att.month) + 1
                        return idx >= fromIndex && idx <= toIndex
                    })
                }
            }

            const toExport = filtered.map(transformApiToStore)
            exportStateReportToExcel(toExport, regions, stateName)
        } catch (error) {
            console.error("Failed to download report:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const renderReportComponent = () => {
        switch (selectedReport) {
            case "state":
                return (
                    <StateAttendanceReport
                        statesCollection={scopedStatesCollection}
                        yearsCollection={yearsCollection}
                        monthsCollection={monthsCollection}
                        onDownload={handleDownloadReport}
                        isLoading={isLoading || isLoadingAttendance || isLoadingStates}
                    />
                )
            case "region":
                return (
                    <RegionAttendanceReport
                        statesCollection={scopedStatesCollection}
                        regionsCollection={scopedRegionsCollection}
                        yearsCollection={yearsCollection}
                        monthsCollection={monthsCollection}
                        onDownload={handleDownloadReport}
                        isLoading={isLoading || isLoadingAttendance || isLoadingStates || isLoadingRegions}
                    />
                )
            case "group":
                return (
                    <GroupAttendanceReport
                        statesCollection={scopedStatesCollection}
                        regionsCollection={scopedRegionsCollection}
                        groupsCollection={scopedGroupsCollection}
                        oldGroupsCollection={scopedOldGroupsCollection}
                        yearsCollection={yearsCollection}
                        onDownload={handleDownloadReport}
                        isLoading={isLoading || isLoadingAttendance || isLoadingStates || isLoadingRegions || isLoadingGroups || isLoadingOldGroups}
                    />
                )
            case "youth":
                return (
                    <YouthAttendanceReport
                        statesCollection={scopedStatesCollection}
                        regionsCollection={scopedRegionsCollection}
                        yearsCollection={yearsCollection}
                        monthsCollection={monthsCollection}
                        onDownload={handleDownloadReport}
                        isLoading={isLoading || isLoadingWeekly || isLoadingRevival || isLoadingStates || isLoadingRegions}
                    />
                )
            default:
                return null
        }
    }

    return (
        <VStack gap="8" align="stretch">
            <ReportsHeader />

            {/* Quick Stats */}
            <SimpleGrid columns={{ base: 1, md: 2, lg: 6 }} gap="2">
                <StatCard
                    title="Total Attendance"
                    value={stats.totalAttendance}
                    icon={Profile2User}
                    color="blue"
                    description="All services combined"
                    trend={stats.growthRate}
                />

                <StatCard
                    title="Youth Attendance"
                    value={stats.totalYouth}
                    icon={UserOctagon}
                    color="green"
                    description="YHSF members"
                />

                <StatCard
                    title="Weekly Youth"
                    value={stats.totalWeeklyYouth}
                    icon={Calendar}
                    color="purple"
                    description="Weekly programs"
                />

                <StatCard
                    title="Revival Youth"
                    value={stats.totalRevivalYouth}
                    icon={TrendUp}
                    color="orange"
                    description="Revival meetings"
                />

                <StatCard
                    title="Avg. Attendance"
                    value={stats.averageAttendance}
                    icon={ChartSquare}
                    color="red"
                    description="Per service"
                />

                <StatCard
                    title="Growth Rate"
                    value={`${stats.growthRate}%`}
                    icon={TrendUp}
                    color="green"
                    description="This month"
                />
            </SimpleGrid>


            {/* Report Generation Section */}
            <Card.Root
                bg="bg"
                border="1px"
                borderColor={{ base: "gray.200", _dark: "gray.700" }}
                rounded="xl"
            >
                <Card.Header>
                    <Heading
                        size="lg"
                        color={{ base: "gray.900", _dark: "white" }}
                    >
                        Generate Reports
                    </Heading>
                    <Text
                        color={{ base: "gray.600", _dark: "gray.400" }}
                        mt={1}
                    >
                        Select report type and configure parameters
                    </Text>
                </Card.Header>
                <Card.Body>
                    {/* Report Type Selection */}
                    <SimpleGrid columns={{ base: 2, md: 4 }} gap="4" mb="6">
                        <Button
                            variant={selectedReport === "state" ? "solid" : "outline"}
                            bg={selectedReport === "state" ? "accent" : "transparent"}
                            color={selectedReport === "state" ? "white" : { base: "gray.700", _dark: "gray.300" }}
                            borderColor={!selectedReport.includes("state") ? { base: "gray.300", _dark: "gray.600" } : "transparent"}
                            _hover={{
                                bg: selectedReport === "state" ? "accent.emphasized" : "bg.subtle",
                            }}
                            onClick={() => {
                                if (!isReportTypeAllowed('state')) {
                                    toaster.error({ description: 'You do not have permission to access State reports.', closable: true })
                                    console.warn('Permission denied: navigate state report')
                                    return
                                }
                                setSelectedReport("state")
                            }}
                            disabled={!isReportTypeAllowed('state')}
                            rounded="xl"
                        >
                            State Report
                        </Button>
                        <Button
                            variant={selectedReport === "region" ? "solid" : "outline"}
                            bg={selectedReport === "region" ? "accent" : "transparent"}
                            color={selectedReport === "region" ? "white" : { base: "gray.700", _dark: "gray.300" }}
                            borderColor={!selectedReport.includes("region") ? { base: "gray.300", _dark: "gray.600" } : "transparent"}
                            _hover={{
                                bg: selectedReport === "region" ? "accent.emphasized" : "bg.subtle",
                            }}
                            onClick={() => {
                                if (!isReportTypeAllowed('region')) {
                                    toaster.error({ description: 'You do not have permission to access Region reports.', closable: true })
                                    console.warn('Permission denied: navigate region report')
                                    return
                                }
                                setSelectedReport("region")
                            }}
                            disabled={!isReportTypeAllowed('region')}
                            rounded="xl"
                        >
                            Region Report
                        </Button>
                        <Button
                            variant={selectedReport === "group" ? "solid" : "outline"}
                            bg={selectedReport === "group" ? "accent" : "transparent"}
                            color={selectedReport === "group" ? "white" : { base: "gray.700", _dark: "gray.300" }}
                            borderColor={!selectedReport.includes("group") ? { base: "gray.300", _dark: "gray.600" } : "transparent"}
                            _hover={{
                                bg: selectedReport === "group" ? "accent.emphasized" : "bg.subtle",
                            }}
                            onClick={() => {
                                if (!isReportTypeAllowed('group')) {
                                    toaster.error({ description: 'You do not have permission to access Group reports.', closable: true })
                                    console.warn('Permission denied: navigate group report')
                                    return
                                }
                                setSelectedReport("group")
                            }}
                            disabled={!isReportTypeAllowed('group')}
                            rounded="xl"
                        >
                            Group Report
                        </Button>
                        <Button
                            variant={selectedReport === "youth" ? "solid" : "outline"}
                            bg={selectedReport === "youth" ? "accent" : "transparent"}
                            color={selectedReport === "youth" ? "white" : { base: "gray.700", _dark: "gray.300" }}
                            borderColor={!selectedReport.includes("youth") ? { base: "gray.300", _dark: "gray.600" } : "transparent"}
                            _hover={{
                                bg: selectedReport === "youth" ? "accent.emphasized" : "bg.subtle",
                            }}
                            onClick={() => {
                                if (!isReportTypeAllowed('youth')) {
                                    toaster.error({ description: 'You do not have permission to access Youth reports.', closable: true })
                                    console.warn('Permission denied: navigate youth report')
                                    return
                                }
                                setSelectedReport("youth")
                            }}
                            disabled={!isReportTypeAllowed('youth')}
                            rounded="xl"
                        >
                            Youth Report
                        </Button>
                    </SimpleGrid>

                    {/* Dynamic Report Component */}
                    {renderReportComponent()}
                </Card.Body>
            </Card.Root>


            {/* Charts Section */}
            {/* <SimpleGrid columns={{ base: 1, lg: 2 }} gap="8">
                <ServiceDistributionCard data={serviceDistribution} />
                <MonthlyTrendCard data={monthlyTrend} />
            </SimpleGrid> */}


            {/* Quick Export Actions */}
            {/* <QuickExportActions
                attendances={attendances}
                districts={districts as District[]}
            /> */}
        </VStack>
    )
}

export default ReportsContent
