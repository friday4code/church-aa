// components/dashboard/AttendanceDashboard.tsx
"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router"
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
    Link,
    Spinner,
    Alert,
} from "@chakra-ui/react"
import { Cell, Label, Pie, PieChart, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { Calendar, Profile2User, TrendUp, ArrowRight, ChartSquare, UserOctagon } from "iconsax-reactjs"
import { ENV } from "@/config/env"
import { calculateTotals, mapServiceTypeToInternal } from "@/utils/attendance.utils"
import { useAttendance } from "../../hooks/useAttendance"

// Define service types locally since we're not using the store
export type ServiceType = 'sunday-worship' | 'house-caring' | 'search-scriptures' | 'thursday-revival' | 'monday-bible'

export const SERVICE_TYPES: Record<ServiceType, { name: string; apiValue: string }> = {
    'sunday-worship': { name: 'Sunday Worship', apiValue: 'Sunday Service' },
    'house-caring': { name: 'House Caring', apiValue: 'House Caring' },
    'search-scriptures': { name: 'Search Scriptures', apiValue: 'Search Scriptures' },
    'thursday-revival': { name: 'Thursday Revival', apiValue: 'Thursday Revival' },
    'monday-bible': { name: 'Monday Bible', apiValue: 'Monday Bible' }
}

export const AttendanceDashboard: React.FC = () => {
    return (
        <>
            <title>Attendance Dashboard | {ENV.APP_NAME}</title>
            <meta
                name="description"
                content="Church Attendance System Dashboard"
            />
            <Content />
        </>
    )
}

export default AttendanceDashboard

const Content = () => {
    const navigate = useNavigate()
    const { data: attendanceData, isLoading, error } = useAttendance()

    const [stats, setStats] = useState({
        totalRecords: 0,
        totalAttendance: 0,
        averageAttendance: 0,
        servicesWithData: 0,
        recentActivity: 0
    })

    const [serviceStats, setServiceStats] = useState<Record<ServiceType, {
        name: string;
        records: number;
        totalAttendance: number;
        averageAttendance: number;
        lastUpdated: Date | null;
    }>>({} as any)

    const [monthlyData, setMonthlyData] = useState<Array<{
        month: string;
        sundayWorship: number;
        houseCaring: number;
        searchScriptures: number;
        thursdayRevival: number;
        mondayBible: number;
        total: number;
    }>>([])

    const [serviceDistribution, setServiceDistribution] = useState<Array<{
        name: string;
        value: number;
        color: string;
        serviceType: ServiceType;
    }>>([])

    // Get attendances by service type without using store
    const getAttendancesByServiceType = (serviceType: ServiceType) => {
        if (!attendanceData) return []
        const serviceConfig = SERVICE_TYPES[serviceType]
        return attendanceData.filter(att => att.service_type === serviceConfig.apiValue)
    }

    // Get unique service types with data
    const getServiceTypesWithData = () => {
        if (!attendanceData) return []
        return Object.keys(SERVICE_TYPES).filter(serviceType => {
            const serviceConfig = SERVICE_TYPES[serviceType as ServiceType]
            return attendanceData.some(att => att.service_type === serviceConfig.apiValue)
        })
    }

    useEffect(() => {
        if (!attendanceData) return

        // Calculate overall statistics
        const totalRecords = attendanceData.length
        const allTotals = calculateTotals(attendanceData)
        const totalAttendance = allTotals.total
        const averageAttendance = totalRecords > 0 ? Math.round(totalAttendance / totalRecords) : 0

        // Get unique service types with data
        const serviceTypesWithData = getServiceTypesWithData()

        // Calculate last 7 days activity
        const oneWeekAgo = new Date()
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
        const recentActivity = attendanceData.filter(att =>
            new Date(att.created_at) > oneWeekAgo
        ).length

        setStats({
            totalRecords,
            totalAttendance,
            averageAttendance,
            servicesWithData: serviceTypesWithData.length,
            recentActivity
        })

        // Calculate statistics per service type
        const serviceStatsData: Record<ServiceType, any> = {} as any

        Object.entries(SERVICE_TYPES).forEach(([serviceType, config]) => {
            const serviceAttendances = getAttendancesByServiceType(serviceType as ServiceType)
            const serviceTotals = calculateTotals(serviceAttendances)

            serviceStatsData[serviceType as ServiceType] = {
                name: config.name,
                records: serviceAttendances.length,
                totalAttendance: serviceTotals.total,
                averageAttendance: serviceAttendances.length > 0 ? Math.round(serviceTotals.total / serviceAttendances.length) : 0,
                lastUpdated: serviceAttendances.length > 0
                    ? new Date(Math.max(...serviceAttendances.map(a => new Date(a.updated_at).getTime())))
                    : null
            }
        })

        setServiceStats(serviceStatsData)

        // Prepare service distribution data for pie chart
        const distributionData = Object.entries(serviceStatsData).map(([serviceType, data]) => ({
            name: data.name,
            value: data.records,
            color: getServiceColor(serviceType as ServiceType),
            serviceType: serviceType as ServiceType
        })).filter(item => item.value > 0)

        setServiceDistribution(distributionData)

        // Prepare monthly attendance data for bar chart
        const monthlyAttendance = calculateMonthlyAttendance(attendanceData)
        setMonthlyData(monthlyAttendance)

    }, [attendanceData])

    // Helper function to get color for each service type
    const getServiceColor = (serviceType: ServiceType): string => {
        const colorMap: Record<ServiceType, string> = {
            'sunday-worship': 'blue.solid',
            'house-caring': 'green.solid',
            'search-scriptures': 'purple.solid',
            'thursday-revival': 'orange.solid',
            'monday-bible': 'red.solid'
        }
        return colorMap[serviceType] || 'gray.solid'
    }

    // Calculate monthly attendance data using raw API data
    const calculateMonthlyAttendance = (attendances: any[]) => {
        const monthlyData: Record<string, any> = {}
        const currentYear = new Date().getFullYear()

        attendances.forEach(attendance => {
            if (attendance.year === currentYear) {
                const monthKey = `${attendance.year}-${attendance.month}`
                if (!monthlyData[monthKey]) {
                    monthlyData[monthKey] = {
                        month: attendance.month,
                        sundayWorship: 0,
                        houseCaring: 0,
                        searchScriptures: 0,
                        thursdayRevival: 0,
                        mondayBible: 0,
                        total: 0
                    }
                }

                const serviceTotal = attendance.men + attendance.women + attendance.youth_boys +
                    attendance.youth_girls + attendance.children_boys + attendance.children_girls

                monthlyData[monthKey].total += serviceTotal

                // Map API service type to internal service type for grouping
                const internalServiceType = mapServiceTypeToInternal(attendance.service_type)

                switch (internalServiceType) {
                    case 'sunday-worship':
                        monthlyData[monthKey].sundayWorship += serviceTotal
                        break
                    case 'house-caring':
                        monthlyData[monthKey].houseCaring += serviceTotal
                        break
                    case 'search-scriptures':
                        monthlyData[monthKey].searchScriptures += serviceTotal
                        break
                    case 'thursday-revival':
                        monthlyData[monthKey].thursdayRevival += serviceTotal
                        break
                    case 'monday-bible':
                        monthlyData[monthKey].mondayBible += serviceTotal
                        break
                }
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
        description,
        trend
    }: {
        title: string
        value: number | string
        icon: any
        color: string
        description?: string
        trend?: number
    }) => (
        <Card.Root
            border="1px"
            borderColor="gray.200"
            rounded="xl"
            p="6"
            transition="all 0.2s"
            _hover={{
                transform: 'translateY(-2px)',
                shadow: 'lg',
                borderColor: color
            }}
        >
            <Card.Body p="0">
                <Flex justify="space-between" align="start">
                    <VStack align="start" gap="2">
                        <Text fontSize="sm" color="bg.inverted" fontWeight="medium">
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
                        bg={`${color}.50`}
                        _dark={{ bg: `${color}/20`, color: `${color}.50` }}
                        rounded="lg"
                        color={color}
                    >
                        <Icon size="14" />
                    </Box>
                </Flex>
                {/* <Flex justify="space-between" align="center" mt="4">
                    <Link
                        href={link}
                        fontSize="sm"
                        color={color}
                        fontWeight="medium"
                        onClick={(e) => {
                            e.preventDefault()
                            navigate(link)
                        }}
                    >
                        View details
                    </Link>
                    <ArrowRight size="16" color="currentColor" />
                </Flex> */}
            </Card.Body>
        </Card.Root>
    )

    // Service Distribution Donut Chart
    const ServiceDistributionChart = () => {
        const totalRecords = serviceDistribution.reduce((sum, item) => sum + item.value, 0)

        const colorMap: Record<string, string> = {
            "blue.solid": "#3182CE",
            "green.solid": "#38A169",
            "purple.solid": "#805AD5",
            "orange.solid": "#DD6B20",
            "red.solid": "#E53E3E",
        }

        return (
            <Box boxSize="200px" mx="auto">
                <ResponsiveContainer width={200} height={200}>
                    <PieChart>
                        <Tooltip cursor={false} animationDuration={100} />
                        <Pie innerRadius={60} outerRadius={80} isAnimationActive={true} animationDuration={500} data={serviceDistribution} dataKey="value" nameKey="name">
                            <Label content={({ viewBox }: { viewBox: { cx: number; cy: number } }) => {
                                const { cx = 0, cy = 0 } = viewBox || {}
                                return (
                                    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fill="#4A5568">
                                        <tspan fontSize="18" fontWeight="600">{totalRecords.toLocaleString()}</tspan>
                                        <tspan x={cx} dy="20" fontSize="12" fill="#718096">total records</tspan>
                                    </text>
                                )
                            }} />
                            {serviceDistribution.map((item) => (
                                <Cell key={item.serviceType} fill={colorMap[item.color] || item.color} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
            </Box>
        )
    }

    // Monthly Attendance Bar Chart
    const MonthlyAttendanceChart = () => {
        return (
            <Box width="100%" height="300px">
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
                            formatter={(value) => [value.toLocaleString(), 'Attendance']}
                            labelFormatter={(label) => `Month: ${label}`}
                        />
                        <Legend />
                        <Bar
                            dataKey="sundayWorship"
                            name="Sunday Worship"
                            fill="#3182CE"
                            radius={[2, 2, 0, 0]}
                        />
                        <Bar
                            dataKey="houseCaring"
                            name="House Caring"
                            fill="#38A169"
                            radius={[2, 2, 0, 0]}
                        />
                        <Bar
                            dataKey="searchScriptures"
                            name="Search Scriptures"
                            fill="#805AD5"
                            radius={[2, 2, 0, 0]}
                        />
                        <Bar
                            dataKey="thursdayRevival"
                            name="Thursday Revival"
                            fill="#DD6B20"
                            radius={[2, 2, 0, 0]}
                        />
                        <Bar
                            dataKey="mondayBible"
                            name="Monday Bible"
                            fill="#E53E3E"
                            radius={[2, 2, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </Box>
        )
    }

    // Loading state
    if (isLoading) {
        return (
            <Flex justify="center" align="center" height="400px">
                <VStack gap="4">
                    <Spinner size="xl" color="blue.500" />
                    <Text>Loading attendance data...</Text>
                </VStack>
            </Flex>
        )
    }

    // Error state
    if (error) {
        return (
            <Alert.Root status="error" variant="subtle" rounded="lg">
                <Alert.Content>
                    <VStack align="start" gap="2">
                        <Text fontWeight="bold">Error loading attendance data</Text>
                        <Text>Please try again later.</Text>
                    </VStack>
                </Alert.Content>
            </Alert.Root>
        )
    }

    // No data state
    if (!attendanceData || attendanceData.length === 0) {
        return (
            <>
            <VStack gap="8" align="stretch">
                <Flex justify="space-between" align="center">
                    <VStack align="start" gap="1">
                        <Heading size="3xl">Attendance Dashboard</Heading>
                        <Text color="gray.600" fontSize="lg">
                            Overview of all church service attendance
                        </Text>
                    </VStack>
                </Flex>

                <Alert.Root status="info" variant="subtle" rounded="lg">
                    <VStack align="start" gap="2">
                        <Text fontWeight="bold">No attendance data available</Text>
                        <Text>Start by adding your first attendance record.</Text>
                    </VStack>
                </Alert.Root>
            </VStack>

                {/* Quick Actions */}
                <Card.Root border="1px" borderColor="gray.200" rounded="xl">
                    <Card.Header pb="4">
                        <Heading size="lg">Quick Actions</Heading>
                    </Card.Header>
                    <Card.Body pt="0">
                        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="4">
                            {Object.entries(SERVICE_TYPES).map(([serviceType, config]) => (
                                <Card.Root
                                    key={serviceType}
                                    variant="outline"
                                    cursor="pointer"
                                    transition="all 0.2s"
                                    _hover={{
                                        bg: `${getServiceColor(serviceType as ServiceType).replace('.solid', '')}.50`,
                                        borderColor: `${getServiceColor(serviceType as ServiceType).replace('.solid', '')}.200`,
                                        _dark: {
                                            bg: `${getServiceColor(serviceType as ServiceType).replace('.solid', '')}/10`,
                                            borderColor: `${getServiceColor(serviceType as ServiceType).replace('.solid', '')}`,

                                        }
                                    }}
                                    onClick={() => navigate(`/admin/attendance/${serviceType}`)}
                                >
                                    <Card.Body>
                                        <HStack justify="space-between">
                                            <VStack align="start" gap="1">
                                                <Text fontWeight="medium">{config.name}</Text>
                                                <Text fontSize="sm" color="gray.600">
                                                    Manage attendance records
                                                </Text>
                                            </VStack>
                                            <ArrowRight size="20" color={getServiceColor(serviceType as ServiceType).replace('.solid', '')} />
                                        </HStack>
                                    </Card.Body>
                                </Card.Root>
                            ))}
                        </SimpleGrid>
                    </Card.Body>
                </Card.Root>
            </>
        )
    }

    return (
        <VStack gap="8" align="stretch">
            {/* Header */}
            <Flex justify="space-between" align="center">
                <VStack align="start" gap="1">
                    <Heading size="3xl">Attendance Dashboard</Heading>
                    <Text color="gray.600" fontSize="lg">
                        Overview of all church service attendance
                    </Text>
                </VStack>
            </Flex>

            {/* Overall Statistics Cards */}
            <SimpleGrid columns={{ base: 1, md: 2, lg: 5 }} gap="6">
                <StatCard
                    title="Total Records"
                    value={stats.totalRecords}
                    icon={Calendar}
                    color="blue"
                    description="All attendance records"
                />

                <StatCard
                    title="Total Attendance"
                    value={stats.totalAttendance}
                    icon={Profile2User}
                    color="green"
                    description="Combined attendance count"
                />

                <StatCard
                    title="Avg. per Service"
                    value={stats.averageAttendance}
                    icon={TrendUp}
                    color="purple"
                    description="Average attendance per record"
                />

                <StatCard
                    title="Active Services"
                    value={stats.servicesWithData}
                    icon={ChartSquare}
                    color="orange"
                    description="Services with attendance data"
                />

                <StatCard
                    title="Recent Activity"
                    value={stats.recentActivity}
                    icon={UserOctagon}
                    color="red"
                    description="Records added last 7 days"
                />
            </SimpleGrid>


            {/* Quick Actions */}
            <Card.Root border="1px" borderColor="gray.200" rounded="xl">
                <Card.Header pb="4">
                    <Heading size="lg">Quick Actions</Heading>
                </Card.Header>
                <Card.Body pt="0">
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="4">
                        {Object.entries(SERVICE_TYPES).map(([serviceType, config]) => (
                            <Card.Root
                                key={serviceType}
                                variant="outline"
                                cursor="pointer"
                                transition="all 0.2s"
                                _hover={{
                                    bg: `${getServiceColor(serviceType as ServiceType).replace('.solid', '')}.50`,
                                    borderColor: `${getServiceColor(serviceType as ServiceType).replace('.solid', '')}.200`,
                                    _dark:{
                                        bg: `${getServiceColor(serviceType as ServiceType).replace('.solid', '')}/10`,
                                        borderColor: `${getServiceColor(serviceType as ServiceType).replace('.solid', '')}`,

                                    }
                                }}
                                onClick={() => navigate(`/admin/attendance/${serviceType}`)}
                            >
                                <Card.Body>
                                    <HStack justify="space-between">
                                        <VStack align="start" gap="1">
                                            <Text fontWeight="medium">{config.name}</Text>
                                            <Text fontSize="sm" color="gray.600">
                                                Manage attendance records
                                            </Text>
                                        </VStack>
                                        <ArrowRight size="20" color={getServiceColor(serviceType as ServiceType).replace('.solid', '')} />
                                    </HStack>
                                </Card.Body>
                            </Card.Root>
                        ))}
                    </SimpleGrid>
                </Card.Body>
            </Card.Root>


            {/* Charts Section */}
            <SimpleGrid columns={{ base: 1, lg: 2 }} gap="8">
                {/* Service Distribution Chart */}
                <Card.Root  border="1px" borderColor="gray.200" rounded="xl">
                    <Card.Header pb="4">
                        <Flex justify="space-between" align="center">
                            <VStack align="start" gap="1">
                                <Heading size="lg">Service Distribution</Heading>
                                <Text color="gray.600">
                                    Records by service type
                                </Text>
                            </VStack>
                            <Badge colorPalette="blue" variant="subtle" fontSize="sm">
                                All Time
                            </Badge>
                        </Flex>
                    </Card.Header>

                    <Card.Body pt="0">
                        <SimpleGrid columns={{ base: 1, md: 2 }} gap="8" alignItems="center">
                            {/* Donut Chart */}
                            <Box display="flex" justifyContent="center" alignItems="center">
                                <ServiceDistributionChart />
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
                                bg="bg"
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
                                            <Text fontSize="lg" fontWeight="bold" >
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
                                            <Text fontSize="lg" fontWeight="bold">
                                                {serviceDistribution.length}
                                            </Text>
                                        </VStack>
                                    </SimpleGrid>
                                </Box>
                            </VStack>
                        </SimpleGrid>
                    </Card.Body>
                </Card.Root>

                {/* Monthly Attendance Trend */}
                <Card.Root border="1px" borderColor="gray.200" rounded="xl">
                    <Card.Header pb="4">
                        <Flex justify="space-between" align="center">
                            <VStack align="start" gap="1">
                                <Heading size="lg">Monthly Attendance</Heading>
                                <Text color="gray.600">
                                    Current year attendance trend
                                </Text>
                            </VStack>
                            <Badge colorPalette="green" variant="subtle" fontSize="sm">
                                {new Date().getFullYear()}
                            </Badge>
                        </Flex>
                    </Card.Header>

                    <Card.Body pt="0">
                        <MonthlyAttendanceChart />
                    </Card.Body>
                </Card.Root>
            </SimpleGrid>

            {/* Service Type Breakdown */}
            <Card.Root border="1px" borderColor="gray.200" rounded="xl">
                <Card.Header pb="4">
                    <Heading size="lg">Service Type Breakdown</Heading>
                    <Text color="gray.600" mt="1">
                        Detailed statistics for each service type
                    </Text>
                </Card.Header>
                <Card.Body pt="0">
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="6">
                        {Object.entries(SERVICE_TYPES).map(([serviceType, config]) => {
                            const stats = serviceStats[serviceType as ServiceType]
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
                                    onClick={() => navigate(`/admin/attendance/${serviceType}`)}
                                >
                                    <Card.Body>
                                        <VStack align="start" gap="3">
                                            <Flex justify="space-between" align="center" w="full">
                                                <Text fontWeight="bold" fontSize="lg">
                                                    {config.name}
                                                </Text>
                                                <Badge
                                                    colorPalette={getServiceColor(serviceType as ServiceType).replace('.solid', '') as any}
                                                    variant="subtle"
                                                >
                                                    {stats.records} records
                                                </Badge>
                                            </Flex>

                                            <SimpleGrid columns={2} gap="4" w="full">
                                                <VStack align="start" gap="1">
                                                    <Text fontSize="xs" color="gray.500">
                                                        Total Attendance
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

                                            {stats.lastUpdated && (
                                                <Text fontSize="xs" color="gray.500">
                                                    Last updated: {stats.lastUpdated.toLocaleDateString()}
                                                </Text>
                                            )}

                                            <Flex justify="space-between" align="center" w="full" mt="2">
                                                <Link
                                                    href={`/admin/attendance/${serviceType}`}
                                                    fontSize="sm"
                                                    color={getServiceColor(serviceType as ServiceType).replace('.solid', '')}
                                                    fontWeight="medium"
                                                    onClick={(e) => {
                                                        e.preventDefault()
                                                        navigate(`/admin/attendance/${serviceType}`)
                                                    }}
                                                >
                                                    View service
                                                </Link>
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