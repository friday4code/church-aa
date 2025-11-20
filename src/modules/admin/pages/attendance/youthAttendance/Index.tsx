// components/dashboard/YouthAttendanceDashboard.tsx
"use client"

import { useState, useEffect, useMemo } from "react"
import { Link, useNavigate } from "react-router"
import {
    Box,
    Heading,
    HStack,
    VStack,
    Card,
    Flex,
    Text,
    SimpleGrid,
    Badge,
} from "@chakra-ui/react"
import { Chart, useChart } from "@chakra-ui/charts"
import { Cell, Label, Pie, PieChart, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { Calendar, Profile2User, TrendUp, ArrowRight, ChartSquare, UserOctagon } from "iconsax-reactjs"
import { ENV } from "@/config/env"
import { useYouthAttendance } from "@/modules/admin/hooks/useYouthAttendance"
import type { YouthAttendance } from "@/types/youthAttendance.type"

export const YouthAttendanceDashboard: React.FC = () => {
    return (
        <>
            <title>Youth Attendance Dashboard | {ENV.APP_NAME}</title>
            <meta
                name="description"
                content="Youth Ministry Attendance Dashboard"
            />
            <Content />
        </>
    )
}

export default YouthAttendanceDashboard

// Types for youth attendance data
type YouthAttendanceType = 'youth-attendance' | 'youth-weekly' | 'youth-revival'

interface YouthServiceStats {
    name: string;
    records: number;
    totalAttendance: number;
    averageAttendance: number;
    lastUpdated: Date | null;
    totalMale: number;
    totalFemale: number;
}

const YOUTH_SERVICE_TYPES = {
    'youth-attendance': {
        name: 'Youth Attendance',
        color: 'blue.solid',
        route: 'attendance'
    },
    'youth-weekly': {
        name: 'Youth Weekly Attendance',
        color: 'green.solid',
        route: 'weekly_attendance'
    },
    'youth-revival': {
        name: 'Youth Revival Attendance',
        color: 'purple.solid',
        route: 'revival_attendance'
    }
} as const

const Content = () => {
    const navigate = useNavigate()

    // Get all youth attendance data from API
    const { data: weeklyData, isLoading: isLoadingWeekly } = useYouthAttendance({ attendance_type: 'weekly' })
    const { data: revivalData, isLoading: isLoadingRevival } = useYouthAttendance({ attendance_type: 'revival' })

    const youthWeeklyAttendances: YouthAttendance[] = useMemo(() => weeklyData?.data ?? [], [weeklyData])
    const youthRevivalAttendances: YouthAttendance[] = useMemo(() => revivalData?.data ?? [], [revivalData])
    const youthAttendance: YouthAttendance[] = useMemo(() => [], [])

    const [stats, setStats] = useState({
        totalRecords: 0,
        totalYouthAttendance: 0,
        averageYouthAttendance: 0,
        activeServices: 0,
        recentActivity: 0
    })

    const [serviceStats, setServiceStats] = useState<Record<YouthAttendanceType, YouthServiceStats>>({
        'youth-attendance': {
            name: 'Youth Attendance',
            records: 0,
            totalAttendance: 0,
            averageAttendance: 0,
            lastUpdated: null,
            totalMale: 0,
            totalFemale: 0
        },
        'youth-weekly': {
            name: 'Youth Weekly Attendance',
            records: 0,
            totalAttendance: 0,
            averageAttendance: 0,
            lastUpdated: null,
            totalMale: 0,
            totalFemale: 0
        },
        'youth-revival': {
            name: 'Youth Revival Attendance',
            records: 0,
            totalAttendance: 0,
            averageAttendance: 0,
            lastUpdated: null,
            totalMale: 0,
            totalFemale: 0
        }
    })

    const [monthlyData, setMonthlyData] = useState<Array<{
        month: string;
        youthAttendance: number;
        youthWeekly: number;
        youthRevival: number;
        total: number;
    }>>([])

    const [serviceDistribution, setServiceDistribution] = useState<Array<{
        name: string;
        value: number;
        color: string;
        serviceType: YouthAttendanceType;
    }>>([])

    useEffect(() => {
        // Calculate overall youth statistics across all services
        const allYouthRecords = [
            ...youthAttendance,
            ...youthWeeklyAttendances,
            ...youthRevivalAttendances
        ]

        const totalRecords = allYouthRecords.length
        const totalYouthAttendance = calculateTotalYouthAttendance()
        const averageYouthAttendance = totalRecords > 0 ? Math.round(totalYouthAttendance / totalRecords) : 0

        // Count services with data
        const activeServices = Object.keys(YOUTH_SERVICE_TYPES).filter(serviceType => {
            const stats = getServiceStats(serviceType as YouthAttendanceType)
            return stats.records > 0
        }).length

        // Calculate last 7 days activity
        const oneWeekAgo = new Date()
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
        const recentActivity = allYouthRecords.filter(record => {
            if (!record.createdAt) return false
            const createdAt = typeof record.createdAt === 'string' || record.createdAt instanceof Date
                ? new Date(record.createdAt)
                : null
            return createdAt && createdAt > oneWeekAgo
        }).length

        setStats({
            totalRecords,
            totalYouthAttendance,
            averageYouthAttendance,
            activeServices,
            recentActivity
        })

        // Calculate statistics per service type
        const serviceStatsData = {
            'youth-attendance': getServiceStats('youth-attendance'),
            'youth-weekly': getServiceStats('youth-weekly'),
            'youth-revival': getServiceStats('youth-revival')
        }

        setServiceStats(serviceStatsData)

        // Prepare service distribution data for pie chart
        const distributionData = Object.entries(serviceStatsData)
            .map(([serviceType, data]) => ({
                name: data.name,
                value: data.records,
                color: YOUTH_SERVICE_TYPES[serviceType as YouthAttendanceType].color,
                serviceType: serviceType as YouthAttendanceType
            }))
            .filter(item => item.value > 0)

        setServiceDistribution(distributionData)

        // Prepare monthly youth attendance data for bar chart
        const monthlyYouthAttendance = calculateMonthlyYouthAttendance()
        setMonthlyData(monthlyYouthAttendance)

    }, [youthWeeklyAttendances, youthRevivalAttendances, isLoadingWeekly, isLoadingRevival])

    // Helper function to calculate service-specific statistics
    const getServiceStats = (serviceType: YouthAttendanceType): YouthServiceStats => {
        switch (serviceType) {
            case 'youth-attendance':
                // This type appears to be deprecated or merged with weekly/revival
                return {
                    name: 'Youth Attendance',
                    records: 0,
                    totalAttendance: 0,
                    averageAttendance: 0,
                    lastUpdated: null,
                    totalMale: 0,
                    totalFemale: 0
                }

            case 'youth-weekly':
                const weeklyRecords = youthWeeklyAttendances.length
                const weeklyTotal = youthWeeklyAttendances.reduce((sum, att) =>
                    sum + att.member_boys + att.visitor_boys + att.member_girls + att.visitor_girls, 0)
                const weeklyMale = youthWeeklyAttendances.reduce((sum, att) => sum + att.member_boys + att.visitor_boys, 0)
                const weeklyFemale = youthWeeklyAttendances.reduce((sum, att) => sum + att.member_girls + att.visitor_girls, 0)
                const weeklyLastUpdated = youthWeeklyAttendances.length > 0
                    ? new Date(Math.max(...youthWeeklyAttendances.map(a => new Date(a.updatedAt || a.createdAt || Date.now()).getTime())))
                    : null

                return {
                    name: 'Youth Weekly Attendance',
                    records: weeklyRecords,
                    totalAttendance: weeklyTotal,
                    averageAttendance: weeklyRecords > 0 ? Math.round(weeklyTotal / weeklyRecords) : 0,
                    lastUpdated: weeklyLastUpdated,
                    totalMale: weeklyMale,
                    totalFemale: weeklyFemale
                }

            case 'youth-revival':
                const revivalRecords = youthRevivalAttendances.length
                const revivalTotal = youthRevivalAttendances.reduce((sum, att) => sum + att.male + att.female, 0)
                const revivalMale = youthRevivalAttendances.reduce((sum, att) => sum + att.male, 0)
                const revivalFemale = youthRevivalAttendances.reduce((sum, att) => sum + att.female, 0)
                const revivalLastUpdated = youthRevivalAttendances.length > 0
                    ? new Date(Math.max(...youthRevivalAttendances.map(a => new Date(a.updatedAt || a.createdAt || Date.now()).getTime())))
                    : null

                return {
                    name: 'Youth Revival Attendance',
                    records: revivalRecords,
                    totalAttendance: revivalTotal,
                    averageAttendance: revivalRecords > 0 ? Math.round(revivalTotal / revivalRecords) : 0,
                    lastUpdated: revivalLastUpdated,
                    totalMale: revivalMale,
                    totalFemale: revivalFemale
                }
        }
    }

    // Calculate total youth attendance across all services
    const calculateTotalYouthAttendance = (): number => {
        const youthAttTotal = 0 // This type appears deprecated
        const weeklyTotal = youthWeeklyAttendances.reduce((sum, att) =>
            sum + att.member_boys + att.visitor_boys + att.member_girls + att.visitor_girls, 0)
        const revivalTotal = youthRevivalAttendances.reduce((sum, att) => sum + att.male + att.female, 0)

        return youthAttTotal + weeklyTotal + revivalTotal
    }

    // Calculate monthly youth attendance data
    const calculateMonthlyYouthAttendance = () => {
        const monthlyData: Record<string, any> = {}
        const currentYear = new Date().getFullYear()

        // Process Youth Weekly Attendance
        youthWeeklyAttendances.forEach(attendance => {
            if (attendance.year && attendance.year === currentYear) {
                const monthKey = `${attendance.year}-${attendance.month}`
                if (!monthlyData[monthKey]) {
                    monthlyData[monthKey] = {
                        month: attendance.month,
                        youthAttendance: 0,
                        youthWeekly: 0,
                        youthRevival: 0,
                        total: 0
                    }
                }
                const weeklyTotal = attendance.member_boys + attendance.visitor_boys +
                    attendance.member_girls + attendance.visitor_girls
                monthlyData[monthKey].youthWeekly += weeklyTotal
                monthlyData[monthKey].total += weeklyTotal
            }
        })

        // Process Youth Revival Attendance
        youthRevivalAttendances.forEach(attendance => {
            if (attendance.year && attendance.year === currentYear) {
                const monthKey = `${attendance.year}-${attendance.month}`
                if (!monthlyData[monthKey]) {
                    monthlyData[monthKey] = {
                        month: attendance.month,
                        youthAttendance: 0,
                        youthWeekly: 0,
                        youthRevival: 0,
                        total: 0
                    }
                }
                monthlyData[monthKey].youthRevival += attendance.male + attendance.female
                monthlyData[monthKey].total += attendance.male + attendance.female
            }
        })

        return Object.values(monthlyData).sort((a, b) => {
            const months = ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December']
            return months.indexOf(a.month) - months.indexOf(b.month)
        })
    }

    const StatCard = ({
        title,
        value,
        icon: Icon,
        color,
        link,
        description,
        trend
    }: {
        title: string
        value: number | string
        icon: any
        color: string
        link: string
        description?: string
        trend?: number
    }) => (
        <Card.Root
            bg="bg"
            border="1px"
            borderColor="gray.200"
            rounded="xl"
            p="6"
            cursor="pointer"
            transition="all 0.2s"
            _hover={{
                transform: 'translateY(-2px)',
                shadow: 'lg',
                borderColor: color
            }}
            onClick={() => navigate(link)}
        >
            <Card.Body p="0">
                <Flex justify="space-between" align="start">
                    <VStack align="start" gap="2">
                        <Text fontSize="sm" color="fg" fontWeight="medium">
                            {title}
                        </Text>
                        <Heading size="2xl" color={color}>
                            {typeof value === 'number' ? value.toLocaleString() : value}
                        </Heading>
                        {description && (
                            <Text fontSize="xs" color="gray.500">
                                {description}
                            </Text>
                        )}
                        {trend !== undefined && (
                            <Badge
                                colorPalette={trend >= 0 ? 'green' : 'red'}
                                variant="subtle"
                                fontSize="xs"
                            >
                                {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% from last month
                            </Badge>
                        )}
                    </VStack>
                    <Box
                        p="3"
                        bg={`${color}/5`}
                        rounded="lg"
                        color={color}
                    >
                        <Icon size="24" />
                    </Box>
                </Flex>
            </Card.Body>
        </Card.Root>
    )

    // Youth Service Distribution Donut Chart
    const YouthServiceDistributionChart = () => {
        const chart = useChart({
            data: serviceDistribution,
        })

        const totalRecords = serviceDistribution.reduce((sum, item) => sum + item.value, 0)

        return (
            <Chart.Root bg="bg" boxSize="200px" chart={chart} mx="auto">
                <PieChart>
                    <Tooltip
                        cursor={false}
                        animationDuration={100}
                        content={<Chart.Tooltip hideLabel />}
                    />
                    <Pie
                        innerRadius={60}
                        outerRadius={80}
                        isAnimationActive={true}
                        animationDuration={500}
                        data={chart.data}
                        dataKey={chart.key("value")}
                        nameKey="name"
                    >
                        <Label
                            content={({ viewBox }) => (
                                <Chart.RadialText
                                    viewBox={viewBox}
                                    title={totalRecords.toLocaleString()}
                                    description="youth records"
                                />
                            )}
                        />
                        {chart.data.map((item) => (
                            <Cell key={item.color} fill={chart.color(item.color)} />
                        ))}
                    </Pie>
                </PieChart>
            </Chart.Root>
        )
    }

    // Monthly Youth Attendance Bar Chart
    const MonthlyYouthAttendanceChart = () => {
        return (
            <Box bg="bg" width="100%" height="300px">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                            dataKey="month"
                            fontSize={12}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                        />
                        <YAxis fontSize={12} />
                        <Tooltip
                            formatter={(value) => [value.toLocaleString(), 'Youth Attendance']}
                            labelFormatter={(label) => `Month: ${label}`}
                        />
                        <Legend />
                        <Bar
                            dataKey="youthAttendance"
                            name="Youth Attendance"
                            fill="#3182CE"
                            radius={[2, 2, 0, 0]}
                        />
                        <Bar
                            dataKey="youthWeekly"
                            name="Youth Weekly"
                            fill="#38A169"
                            radius={[2, 2, 0, 0]}
                        />
                        <Bar
                            dataKey="youthRevival"
                            name="Youth Revival"
                            fill="#805AD5"
                            radius={[2, 2, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </Box>
        )
    }

    return (
        <VStack gap="8" align="stretch">
            {/* Header */}
            <Flex justify="space-between" align="center">
                <VStack align="start" gap="1">
                    <Heading size="3xl">Youth Attendance Dashboard</Heading>
                    <Text color="gray.600" fontSize="lg">
                        Overview of youth ministry attendance across all services
                    </Text>
                </VStack>
            </Flex>

            {/* Youth Statistics Cards */}
            <SimpleGrid columns={{ base: 1, md: 2, lg: 5 }} gap="6">
                <StatCard
                    title="Youth Records"
                    value={stats.totalRecords}
                    icon={Calendar}
                    color="blue"
                    link="/admin/youth_ministry/attendance"
                    description="All youth attendance records"
                />

                <StatCard
                    title="Total Youth"
                    value={stats.totalYouthAttendance}
                    icon={Profile2User}
                    color="green"
                    link="/admin/youth_ministry/attendance"
                    description="Combined youth attendance"
                />

                <StatCard
                    title="Avg. per Service"
                    value={stats.averageYouthAttendance}
                    icon={TrendUp}
                    color="purple"
                    link="/admin/youth_ministry/attendance"
                    description="Average youth per record"
                />

                <StatCard
                    title="Active Services"
                    value={stats.activeServices}
                    icon={ChartSquare}
                    color="orange"
                    link="/admin/youth_ministry/attendance"
                    description="Youth services with data"
                />

                <StatCard
                    title="Recent Activity"
                    value={stats.recentActivity}
                    icon={UserOctagon}
                    color="red"
                    link="/admin/youth_ministry/attendance"
                    description="Youth records last 7 days"
                />
            </SimpleGrid>


            {/* Quick Actions for Youth */}
            <Card.Root bg="bg" border="1px" borderColor="gray.200" rounded="xl">
                <Card.Header pb="4">
                    <Heading size="lg">Youth Quick Actions</Heading>
                </Card.Header>
                <Card.Body pt="0">
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="4">
                        {Object.entries(YOUTH_SERVICE_TYPES).map(([serviceType, config]) => (
                            <Link key={serviceType} to={`/admin/youth_ministry/${config.route}`}>
                                <Card.Root
                                    bg="bg"
                                    variant="outline"
                                    cursor="pointer"
                                    transition="all 0.2s"
                                    _hover={{
                                        bg: `${config.color.replace('.solid', '')}/5`,
                                        borderColor: `${config.color.replace('.solid', '')}/50`
                                    }}
                                >
                                    <Card.Body>
                                        <HStack justify="space-between">
                                            <VStack align="start" gap="1">
                                                <Text fontWeight="medium">{config.name}</Text>
                                                <Text fontSize="sm" color="gray.600">
                                                    Manage youth attendance records
                                                </Text>
                                            </VStack>
                                            <ArrowRight size="20" color={config.color.replace('.solid', '')} />
                                        </HStack>
                                    </Card.Body>
                                </Card.Root>
                            </Link>
                        ))}
                    </SimpleGrid>
                </Card.Body>
            </Card.Root>






            {/* Charts Section */}
            <SimpleGrid columns={{ base: 1, lg: 2 }} gap="8" bg="bg" rounded="xl">
                {/* Youth Service Distribution Chart */}
                <Card.Root bg="bg" border="1px" borderColor="gray.200" rounded="xl">
                    <Card.Header pb="4">
                        <Flex justify="space-between" align="center">
                            <VStack align="start" gap="1">
                                <Heading size="lg">Youth Service Distribution</Heading>
                                <Text color="gray.600">
                                    Records by youth service type
                                </Text>
                            </VStack>
                            <Badge colorPalette="blue" variant="subtle" fontSize="sm">
                                All Time
                            </Badge>
                        </Flex>
                    </Card.Header>

                    <Card.Body pt="0" bg="bg" rounded='xl'>
                        <SimpleGrid columns={{ base: 1, md: 2 }} gap="8" alignItems="center">
                            {/* Donut Chart */}
                            <Box display="flex" justifyContent="center" alignItems="center">
                                <YouthServiceDistributionChart />
                            </Box>

                            {/* Chart Legend */}
                            <VStack align="start" gap="4">
                                <Text fontSize="lg" fontWeight="medium" color="gray.700">
                                    Service Breakdown
                                </Text>

                                <VStack align="start" gap="3" w="full">
                                    {serviceDistribution.map((item) => (
                                        <Flex key={item.name} justify="space-between" align="center" w="full">
                                            <HStack gap="3">
                                                <Box
                                                    w="3"
                                                    h="3"
                                                    rounded="full"
                                                    bg={item.color.replace('.solid', '.500')}
                                                />
                                                <Text fontSize="sm" color="gray.700">
                                                    {item.name}
                                                </Text>
                                            </HStack>
                                            <Badge
                                                variant="subtle"
                                                colorPalette={item.color.replace('.solid', '') as any}
                                            >
                                                {item.value}
                                            </Badge>
                                        </Flex>
                                    ))}
                                </VStack>

                                {/* Summary Stats */}
                                <Box
                                    bg="bg.subtle"
                                    rounded="lg"
                                    p="4"
                                    w="full"
                                    border="1px"
                                    borderColor="gray.200"
                                >
                                    <SimpleGrid columns={2} gap="4">
                                        <VStack align="start" gap="1">
                                            <Text fontSize="xs" color="gray.500">
                                                Most Records
                                            </Text>
                                            <Text fontSize="lg" fontWeight="bold" color="gray.800">
                                                {serviceDistribution.length > 0
                                                    ? serviceDistribution.reduce((max, item) =>
                                                        item.value > max.value ? item : max
                                                    ).name
                                                    : 'N/A'
                                                }
                                            </Text>
                                        </VStack>
                                        <VStack align="start" gap="1">
                                            <Text fontSize="xs" color="gray.500">
                                                Total Services
                                            </Text>
                                            <Text fontSize="lg" fontWeight="bold" color="gray.800">
                                                {serviceDistribution.length}
                                            </Text>
                                        </VStack>
                                    </SimpleGrid>
                                </Box>
                            </VStack>
                        </SimpleGrid>
                    </Card.Body>
                </Card.Root>

                {/* Monthly Youth Attendance Trend */}
                <Card.Root bg="bg" border="1px" borderColor="gray.200" rounded="xl">
                    <Card.Header pb="4">
                        <Flex justify="space-between" align="center">
                            <VStack align="start" gap="1">
                                <Heading size="lg">Monthly Youth Attendance</Heading>
                                <Text color="gray.600">
                                    Current year youth attendance trend
                                </Text>
                            </VStack>
                            <Badge colorPalette="green" variant="subtle" fontSize="sm">
                                {new Date().getFullYear()}
                            </Badge>
                        </Flex>
                    </Card.Header>

                    <Card.Body pt="0">
                        <MonthlyYouthAttendanceChart />
                    </Card.Body>
                </Card.Root>
            </SimpleGrid>

            {/* Youth Service Type Breakdown */}
            <Card.Root bg="bg" border="1px" borderColor="gray.200" rounded="xl">
                <Card.Header pb="4">
                    <Heading size="lg">Youth Service Type Breakdown</Heading>
                    <Text color="gray.600" mt="1">
                        Detailed statistics for each youth service type
                    </Text>
                </Card.Header>
                <Card.Body pt="0">
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="6">
                        {Object.entries(YOUTH_SERVICE_TYPES).map(([serviceType, config]) => {
                            const stats = serviceStats[serviceType as YouthAttendanceType]
                            if (!stats || stats.records === 0) return null

                            return (
                                <Card.Root
                                    key={serviceType}
                                    variant="outline"
                                    cursor="pointer"
                                    transition="all 0.2s"
                                    _hover={{
                                        transform: 'translateY(-2px)',
                                        shadow: 'md'
                                    }}
                                    onClick={() => navigate(`/admin/youth_ministry/${config.route}`)}
                                >
                                    <Card.Body>
                                        <VStack align="start" gap="3">
                                            <Flex justify="space-between" align="center" w="full">
                                                <Text fontWeight="bold" fontSize="lg">
                                                    {config.name}
                                                </Text>
                                                <Badge
                                                    colorPalette={config.color.replace('.solid', '') as any}
                                                    variant="subtle"
                                                >
                                                    {stats.records} records
                                                </Badge>
                                            </Flex>

                                            <SimpleGrid columns={2} gap="4" w="full">
                                                <VStack align="start" gap="1">
                                                    <Text fontSize="xs" color="gray.500">
                                                        Total Youth
                                                    </Text>
                                                    <Text fontSize="lg" fontWeight="bold">
                                                        {stats.totalAttendance.toLocaleString()}
                                                    </Text>
                                                </VStack>
                                                <VStack align="start" gap="1">
                                                    <Text fontSize="xs" color="gray.500">
                                                        Average
                                                    </Text>
                                                    <Text fontSize="lg" fontWeight="bold">
                                                        {stats.averageAttendance}
                                                    </Text>
                                                </VStack>
                                            </SimpleGrid>

                                            <SimpleGrid columns={2} gap="4" w="full">
                                                <VStack align="start" gap="1">
                                                    <Text fontSize="xs" color="gray.500">
                                                        Male
                                                    </Text>
                                                    <Text fontSize="sm" fontWeight="medium">
                                                        {stats.totalMale.toLocaleString()}
                                                    </Text>
                                                </VStack>
                                                <VStack align="start" gap="1">
                                                    <Text fontSize="xs" color="gray.500">
                                                        Female
                                                    </Text>
                                                    <Text fontSize="sm" fontWeight="medium">
                                                        {stats.totalFemale.toLocaleString()}
                                                    </Text>
                                                </VStack>
                                            </SimpleGrid>

                                            {stats.lastUpdated && (
                                                <Text fontSize="xs" color="gray.500">
                                                    Last updated: {stats.lastUpdated.toLocaleDateString()}
                                                </Text>
                                            )}

                                            <Flex justify="space-between" align="center" w="full" mt="2">
                                                <Box
                                                    asChild
                                                    fontSize="sm"
                                                    color={config.color.replace('.solid', '')}
                                                    fontWeight="medium"
                                                >
                                                    <Link to={config.route}>
                                                        View details
                                                    </Link>
                                                </Box>
                                                <ArrowRight size="16" color="currentColor" />
                                            </Flex>
                                        </VStack>
                                    </Card.Body>
                                </Card.Root>
                            )
                        })}
                    </SimpleGrid>
                </Card.Body>
            </Card.Root>


        </VStack>
    )
}