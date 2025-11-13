"use client"

import { useState, useEffect } from "react"
import { VStack, SimpleGrid, Heading, Text, Card, Button } from "@chakra-ui/react"
import { Profile2User, UserOctagon, Calendar, TrendUp, ChartSquare } from "iconsax-reactjs"
import { useAttendanceStore } from "../../../stores/attendance.store"
import { useDistrictsStore } from "../../../stores/districts.store"
import { useGroupsStore } from "../../../stores/group.store"
import { useOldGroupsStore } from "../../../stores/oldgroups.store"
import { useRegionsStore } from "../../../stores/region.store"
import { useStatesStore } from "../../../stores/states.store"
import { useYouthRevivalAttendanceStore } from "../../../stores/youthMinistry/revival.store"
import { useYouthAttendanceStore } from "../../../stores/youthMinistry/youthAttendance.store"
import { useYouthWeeklyStore } from "../../../stores/youthMinistry/youthWeekly.store"
import ReportsHeader from "./ReportsHeader"
import StatCard from "./StatCard"
import ServiceDistributionCard from "./ServiceDistributionCard"
import MonthlyTrendCard from "./MonthlyTrendCard"
import StateAttendanceReport from "./StateAttendanceReport"
import RegionAttendanceReport from "./RegionAttendanceReport"
import GroupAttendanceReport from "./GroupAttendanceReport"
import YouthAttendanceReport from "./YouthAttendanceReport"
import QuickExportActions from "./QuickExportActions"
import type { ReportFormValues } from "./ReportFilters"

export const ReportsContent = () => {
    // All stores
    const { attendances } = useAttendanceStore()
    const { youthAttendance } = useYouthAttendanceStore()
    const { attendances: youthWeeklyAttendances } = useYouthWeeklyStore()
    const { youthRevivalAttendances } = useYouthRevivalAttendanceStore()
    const { states } = useStatesStore()
    const { regions } = useRegionsStore()
    const { groups } = useGroupsStore()
    const { oldGroups } = useOldGroupsStore()
    const { districts } = useDistrictsStore()

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
    const [serviceDistribution, setServiceDistribution] = useState<any[]>([])
    const [monthlyTrend, setMonthlyTrend] = useState<any[]>([])

    // Create collections for Combobox components - Sorted in ASC order
    const statesCollection = states
        .map((state: any) => ({
            label: state.name || state.stateName,
            value: state.id || state.stateName,
        }))
        .sort((a, b) => a.label.localeCompare(b.label))

    const regionsCollection = regions
        .map((region: any) => ({
            label: region.name || region.regionName,
            value: region.id || region.regionName,
        }))
        .sort((a, b) => a.label.localeCompare(b.label))

    const groupsCollection = groups
        .map((group: any) => ({
            label: group.name || group.groupName,
            value: group.id || group.groupName,
        }))
        .sort((a, b) => a.label.localeCompare(b.label))

    const oldGroupsCollection = oldGroups
        .map((group: any) => ({
            label: group.name || group.groupName,
            value: group.id || group.groupName,
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

    useEffect(() => {
        calculateStats()
        prepareChartData()
    }, [attendances, youthAttendance, youthWeeklyAttendances, youthRevivalAttendances])

    const calculateStats = () => {
        const totalAttendance = attendances.reduce((sum, att: any) =>
            sum + (att.men || 0) + (att.women || 0) + (att.youth_boys || 0) + (att.youth_girls || 0) + (att.children_boys || 0) + (att.children_girls || 0), 0
        )

        const totalYouth = youthAttendance.reduce((sum, att: any) => sum + (att.yhsf_male || 0) + (att.yhsf_female || 0), 0)
        const totalWeeklyYouth = youthWeeklyAttendances.reduce((sum, att: any) =>
            sum + (att.members_boys || 0) + (att.visitors_boys || 0) + (att.members_girls || 0) + (att.visitors_girls || 0), 0
        )
        const totalRevivalYouth = youthRevivalAttendances.reduce((sum, att: any) => sum + (att.male || 0) + (att.female || 0), 0)

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
    }

    const prepareChartData = () => {
        const serviceData = [
            { name: "Sunday Worship", value: attendances.filter((a: any) => a.service_type === "sunday-worship").length, color: "blue.solid" },
            { name: "House Caring", value: attendances.filter((a: any) => a.service_type === "house-caring").length, color: "green.solid" },
            { name: "Youth Attendance", value: youthAttendance.length, color: "purple.solid" },
            { name: "Youth Weekly", value: youthWeeklyAttendances.length, color: "orange.solid" },
            { name: "Youth Revival", value: youthRevivalAttendances.length, color: "red.solid" },
        ].filter((item) => item.value > 0)

        setServiceDistribution(serviceData)

        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        const currentMonth = new Date().getMonth()
        const monthlyData: { month: string; attendance: number; youth: number }[] = []

        for (let i = 5; i >= 0; i--) {
            const monthIndex = (currentMonth - i + 12) % 12
            const monthName = months[monthIndex]

            const monthAttendances = attendances.filter((att: any) =>
                att.month?.toLowerCase().includes(monthName.toLowerCase())
            )

            const monthTotal = monthAttendances.reduce((sum, att: any) =>
                sum + (att.men || 0) + (att.women || 0) + (att.youth_boys || 0) + (att.youth_girls || 0) + (att.children_boys || 0) + (att.children_girls || 0), 0
            )

            monthlyData.push({
                month: monthName,
                attendance: monthTotal,
                youth: Math.round(monthTotal * 0.3),
            })
        }

        setMonthlyTrend(monthlyData)
    }

    const handleDownloadReport = (data: ReportFormValues) => {
        setIsLoading(true)
        try {
            console.log("Downloading report with filters:", data)
            // Implement download logic here
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
                        statesCollection={statesCollection}
                        yearsCollection={yearsCollection}
                        monthsCollection={monthsCollection}
                        onDownload={handleDownloadReport}
                        isLoading={isLoading}
                    />
                )
            case "region":
                return (
                    <RegionAttendanceReport
                        statesCollection={statesCollection}
                        regionsCollection={regionsCollection}
                        yearsCollection={yearsCollection}
                        monthsCollection={monthsCollection}
                        onDownload={handleDownloadReport}
                        isLoading={isLoading}
                    />
                )
            case "group":
                return (
                    <GroupAttendanceReport
                        statesCollection={statesCollection}
                        regionsCollection={regionsCollection}
                        groupsCollection={groupsCollection}
                        oldGroupsCollection={oldGroupsCollection}
                        yearsCollection={yearsCollection}
                        onDownload={handleDownloadReport}
                        isLoading={isLoading}
                    />
                )
            case "youth":
                return (
                    <YouthAttendanceReport
                        statesCollection={statesCollection}
                        regionsCollection={regionsCollection}
                        yearsCollection={yearsCollection}
                        monthsCollection={monthsCollection}
                        onDownload={handleDownloadReport}
                        isLoading={isLoading}
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
            <SimpleGrid columns={{ base: 1, md: 2, lg: 6 }} gap="6">
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

            {/* Charts Section */}
            <SimpleGrid columns={{ base: 1, lg: 2 }} gap="8">
                <ServiceDistributionCard data={serviceDistribution} />
                <MonthlyTrendCard data={monthlyTrend} />
            </SimpleGrid>

            {/* Report Generation Section */}
            <Card.Root
                bg={{ base: "white", _dark: "gray.800" }}
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
                            bg={selectedReport === "state" ? "accent.100" : "transparent"}
                            color={selectedReport === "state" ? "white" : { base: "gray.700", _dark: "gray.300" }}
                            borderColor={!selectedReport.includes("state") ? { base: "gray.300", _dark: "gray.600" } : "transparent"}
                            _hover={{
                                bg: selectedReport === "state" ? "accent.200" : { base: "gray.100", _dark: "gray.700" },
                            }}
                            onClick={() => setSelectedReport("state")}
                            rounded="xl"
                        >
                            State Report
                        </Button>
                        <Button
                            variant={selectedReport === "region" ? "solid" : "outline"}
                            bg={selectedReport === "region" ? "accent.100" : "transparent"}
                            color={selectedReport === "region" ? "white" : { base: "gray.700", _dark: "gray.300" }}
                            borderColor={!selectedReport.includes("region") ? { base: "gray.300", _dark: "gray.600" } : "transparent"}
                            _hover={{
                                bg: selectedReport === "region" ? "accent.200" : { base: "gray.100", _dark: "gray.700" },
                            }}
                            onClick={() => setSelectedReport("region")}
                            rounded="xl"
                        >
                            Region Report
                        </Button>
                        <Button
                            variant={selectedReport === "group" ? "solid" : "outline"}
                            bg={selectedReport === "group" ? "accent.100" : "transparent"}
                            color={selectedReport === "group" ? "white" : { base: "gray.700", _dark: "gray.300" }}
                            borderColor={!selectedReport.includes("group") ? { base: "gray.300", _dark: "gray.600" } : "transparent"}
                            _hover={{
                                bg: selectedReport === "group" ? "accent.200" : { base: "gray.100", _dark: "gray.700" },
                            }}
                            onClick={() => setSelectedReport("group")}
                            rounded="xl"
                        >
                            Group Report
                        </Button>
                        <Button
                            variant={selectedReport === "youth" ? "solid" : "outline"}
                            bg={selectedReport === "youth" ? "accent.100" : "transparent"}
                            color={selectedReport === "youth" ? "white" : { base: "gray.700", _dark: "gray.300" }}
                            borderColor={!selectedReport.includes("youth") ? { base: "gray.300", _dark: "gray.600" } : "transparent"}
                            _hover={{
                                bg: selectedReport === "youth" ? "accent.200" : { base: "gray.100", _dark: "gray.700" },
                            }}
                            onClick={() => setSelectedReport("youth")}
                            rounded="xl"
                        >
                            Youth Report
                        </Button>
                    </SimpleGrid>

                    {/* Dynamic Report Component */}
                    {renderReportComponent()}
                </Card.Body>
            </Card.Root>

            {/* Quick Export Actions */}
            <QuickExportActions
                attendances={attendances}
                districts={districts}
            />
        </VStack>
    )
}

export default ReportsContent
