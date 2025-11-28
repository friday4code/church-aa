// components/dashboard/IndexPage.tsx
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
} from "@chakra-ui/react"
import { Cell, Label, Pie, PieChart, Tooltip } from "recharts"
import { Profile2User, Shield, TrendUp, ArrowRight } from "iconsax-reactjs"
import { ENV } from "@/config/env"
import { useUsers } from "../../hooks/useUser"


// Define types for the component props and state
interface DashboardStats {
    totalUsers: number
    superAdmins: number
    groupAdmins: number
    districtAdmins: number
    regionAdmins: number
    stateAdmins: number
    activeUsers: number
}

interface ChartDataItem {
    name: string
    value: number
    color: string
}

interface StatCardProps {
    title: string
    value: number
    icon: React.ReactNode
    color: string
    link: string
    description?: string
}

export const Index: React.FC = () => {
    return (
        <>
            <title>Dashboard | {ENV.APP_NAME}</title>
            <meta
                name="description"
                content="Church Attendance System Dashboard"
            />
            <Content />
        </>
    )
}

export default Index

const Content: React.FC = () => {
    const navigate = useNavigate()
    const { data, isLoading: usersLoading, error: usersError } = useUsers()
    const users = data?.users || [];
    console.log(users)

    const [stats, setStats] = useState<DashboardStats>({
        totalUsers: 0,
        superAdmins: 0,
        groupAdmins: 0,
        districtAdmins: 0,
        regionAdmins: 0,
        stateAdmins: 0,
        activeUsers: 0
    })

    const [chartData, setChartData] = useState<ChartDataItem[]>([])

    // Helper function to map access_level string to admin type
    const getAdminTypeFromAccessLevel = (accessLevel: string): string | null => {
        if (!accessLevel) return null

        const level = accessLevel.toLowerCase().trim()

        // Check for exact snake_case format first
        if (level === 'super_admin' || level === 'group_admin' ||
            level === 'district_admin' || level === 'region_admin' ||
            level === 'state_admin') {
            return level
        }

        // Map descriptive access_level strings to admin types
        // Check for super admin patterns first (most specific)
        if (level.includes('global') || level.includes('all states') ||
            (level.includes('super') && level.includes('admin'))) {
            return 'super_admin'
        }
        // Check for group admin
        if (level.includes('group') && level.includes('admin')) {
            return 'group_admin'
        }
        // Check for district admin
        if (level.includes('district') && level.includes('admin')) {
            return 'district_admin'
        }
        // Check for region admin (but not "regional" which might be different)
        if (level.includes('region') && level.includes('admin')) {
            return 'region_admin'
        }
        // Check for state admin (but not "all states" which is already handled above)
        if (level.includes('state') && level.includes('admin') && !level.includes('all states')) {
            return 'state_admin'
        }

        return null
    }

    useEffect(() => {
        if (usersLoading) return

        // Calculate statistics
        const totalUsers = users?.length || 0

        const adminTypeCounts = (users || []).reduce((acc, user) => {
            if (user.access_level) {
                const adminType = getAdminTypeFromAccessLevel(user.access_level)
                if (adminType) {
                    acc[adminType] = (acc[adminType] || 0) + 1
                }
            }
            return acc
        }, {} as Record<string, number>)

        const superAdmins = adminTypeCounts['super_admin'] || 0
        const groupAdmins = adminTypeCounts['group_admin'] || 0
        const districtAdmins = adminTypeCounts['district_admin'] || 0
        const regionAdmins = adminTypeCounts['region_admin'] || 0
        const stateAdmins = adminTypeCounts['state_admin'] || 0

        const activeUsers = (users || []).filter(user => user.access_level).length

        setStats({
            totalUsers,
            superAdmins,
            groupAdmins,
            districtAdmins,
            regionAdmins,
            stateAdmins,
            activeUsers
        })

        // Prepare chart data
        const chartData = [
            {
                name: 'Super Admins',
                value: superAdmins,
                color: 'blue.solid'
            },
            {
                name: 'Group Admins',
                value: groupAdmins,
                color: 'green.solid'
            },
            {
                name: 'District Admins',
                value: districtAdmins,
                color: 'orange.solid'
            },
            {
                name: 'Region Admins',
                value: regionAdmins,
                color: 'purple.solid'
            },
            {
                name: 'State Admins',
                value: stateAdmins,
                color: 'red.solid'
            },
            {
                name: 'No Rights',
                value: totalUsers - (superAdmins + groupAdmins + districtAdmins + regionAdmins + stateAdmins),
                color: 'gray.solid'
            }
        ].filter(item => item.value > 0)

        setChartData(chartData)
    }, [users, usersLoading])

    const StatCard: React.FC<StatCardProps> = ({
        title,
        value,
        icon,
        color,
        link,
        description
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
                        <Text fontSize="sm" color="gray.600" fontWeight="medium">
                            {title}
                        </Text>
                        <Heading size="2xl" color={color}>
                            {usersLoading ? "-" : value}
                        </Heading>
                        {description && (
                            <Text fontSize="xs" color="gray.500">
                                {description}
                            </Text>
                        )}
                    </VStack>
                    <Box
                        p="3"
                        bg={`${color}/10`}
                        rounded="lg"
                        color={color}
                    >
                        {icon}
                    </Box>
                </Flex>
                <Flex justify="space-between" align="center" mt="4">
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
                        View all
                    </Link>
                    <ArrowRight size="16" color="currentColor" />
                </Flex>
            </Card.Body>
        </Card.Root>
    )

    // Donut Chart Component using Recharts
    const UserRightsDonutChart: React.FC = () => {
        const totalUsersWithRights = chartData
            .filter(item => item.name !== 'No Rights')
            .reduce((sum, item) => sum + item.value, 0)

        if (usersLoading) {
            return (
                <Box boxSize="200px" display="flex" alignItems="center" justifyContent="center">
                    <Text color="gray.500">Loading chart...</Text>
                </Box>
            )
        }

        const colorMap: Record<string, string> = {
            "blue.solid": "#3182CE",
            "green.solid": "#38A169",
            "purple.solid": "#805AD5",
            "orange.solid": "#DD6B20",
            "red.solid": "#E53E3E",
            "gray.solid": "#A0AEC0",
        }

        return (
            <Box boxSize="200px" mx="auto">
                <PieChart>
                    <Tooltip cursor={false} animationDuration={100} />
                    <Pie innerRadius={60} outerRadius={80} isAnimationActive={true} animationDuration={500} data={chartData} dataKey="value" nameKey="name">
                        <Label content={({ viewBox }: { viewBox: { cx: number; cy: number } }) => {
                            const { cx, cy } = viewBox
                            return (
                                <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fill="#4A5568">
                                    <tspan fontSize="18" fontWeight="600">{totalUsersWithRights.toLocaleString()}</tspan>
                                    <tspan x={cx} dy="20" fontSize="12" fill="#718096">with rights</tspan>
                                </text>
                            )
                        }} />
                        {chartData.map((item) => (
                            <Cell key={item.name} fill={colorMap[item.color] || item.color} />
                        ))}
                    </Pie>
                </PieChart>
            </Box>
        )
    }

    // Show loading state
    if (usersLoading) {
        return (
            <VStack gap="8" align="stretch">
                <Flex justify="space-between" align="center">
                    <VStack align="start" gap="1">
                        <Heading size="3xl">Dashboard</Heading>
                        <Text color="gray.600" fontSize="lg">
                            Loading dashboard data...
                        </Text>
                    </VStack>
                </Flex>
                <SimpleGrid columns={{ base: 2, sm: 2, md: 2, lg: 4 }} gap={{ base: 3, md: 6 }}>
                    {[1, 2, 3, 4].map((item) => (
                        <Card.Root key={item} bg="white" border="1px" borderColor="gray.200" rounded="xl" p="6">
                            <Card.Body p="0">
                                <Flex justify="space-between" align="start">
                                    <VStack align="start" gap="2">
                                        <Text fontSize="sm" color="gray.600" fontWeight="medium">
                                            Loading...
                                        </Text>
                                        <Heading size="2xl" color="gray.300">
                                            -
                                        </Heading>
                                    </VStack>
                                    <Box p="3" bg="gray.100" rounded="lg" color="gray.300">
                                        <Box boxSize="24" />
                                    </Box>
                                </Flex>
                            </Card.Body>
                        </Card.Root>
                    ))}
                </SimpleGrid>
            </VStack>
        )
    }

    // Show error state
    if (usersError) {
        return (
            <VStack gap="8" align="stretch">
                <Flex justify="space-between" align="center">
                    <VStack align="start" gap="1">
                        <Heading size="3xl">Users Stats</Heading>
                        <Text color="red.600" fontSize="lg">
                            Error loading dashboard data
                        </Text>
                    </VStack>
                </Flex>
            </VStack>
        )
    }

    return (
        <VStack gap="8" align="stretch">
            {/* Header */}
            <Flex justify="space-between" align="center">
                <VStack align="start" gap="1">
                    <Heading size="3xl">Users Stats</Heading>
                    <Text color="gray.600" fontSize="lg">
                        Welcome to your Church Attendance System
                    </Text>
                </VStack>
            </Flex>

            {/* Quick Actions */}
            <Card.Root bg="bg" border="1px" borderColor="gray.200" rounded="xl">
                <Card.Header pb="4">
                    <Heading size="lg">Quick Actions</Heading>
                </Card.Header>
                <Card.Body pt="0">
                    <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
                        <Card.Root
                            variant="outline"
                            cursor="pointer"
                            transition="all 0.2s"
                            _hover={{
                                bg: 'blue/10',
                                borderColor: 'blue/20'
                            }}
                            onClick={() => navigate('/admin/users/all')}
                        >
                            <Card.Body>
                                <HStack justify="space-between">
                                    <VStack align="start" gap="1">
                                        <Text fontWeight="medium">Manage Users</Text>
                                        <Text fontSize="sm" color="gray.600">
                                            Add, edit, or remove users
                                        </Text>
                                    </VStack>
                                    <ArrowRight variant="Bulk" size="20" color="blue" />
                                </HStack>
                            </Card.Body>
                        </Card.Root>

                        {/* <Card.Root
                            variant="outline"
                            cursor="pointer"
                            transition="all 0.2s"
                            _hover={{
                                bg: 'green/10',
                                borderColor: 'green/20'
                            }}
                            onClick={() => navigate('/admin/users/rights')}
                        >
                            <Card.Body>
                                <HStack justify="space-between">
                                    <VStack align="start" gap="1">
                                        <Text fontWeight="medium">Manage Rights</Text>
                                        <Text fontSize="sm" color="gray.600">
                                            Configure user access levels
                                        </Text>
                                    </VStack>
                                    <ArrowRight size="20" variant="Bulk" color="green" />
                                </HStack>
                            </Card.Body>
                        </Card.Root> */}
                    </SimpleGrid>
                </Card.Body>
            </Card.Root>


            {/* Statistics Cards */}
            <SimpleGrid columns={{ base: 2, sm: 2, md: 2, lg: 4 }} gap={{ base: 3, md: 6 }}>
                <StatCard
                    title="Total Users"
                    value={stats.totalUsers}
                    icon={<Profile2User variant="Bulk" size="24" />}
                    color="blue"
                    link="/admin/users/all"
                    description="Registered users in system"
                />

                <StatCard
                    title="Super Admins"
                    value={stats.superAdmins}
                    icon={<Shield variant="Bulk" size="24" />}
                    color="purple"
                    link="/admin/users/rights"
                    description="Full system access"
                />

                <StatCard
                    title="Active Users"
                    value={stats.activeUsers}
                    icon={<TrendUp variant="Bulk" size="24" />}
                    color="orange"
                    link="/admin/users/all"
                    description="Users with assigned rights"
                />
            </SimpleGrid>

            {/* Chart Section */}
            <Card.Root bg="bg" border="1px" borderColor="gray.200" rounded="xl">
                <Card.Header pb="4">
                    <Flex justify="space-between" align="center">
                        <VStack align="start" gap="1">
                            <Heading size="lg">User Access Distribution</Heading>
                            <Text color="gray.600">
                                Distribution of access levels among users
                            </Text>
                        </VStack>
                        <Badge colorPalette="blue" variant="subtle" fontSize="sm">
                            Live Data
                        </Badge>
                    </Flex>
                </Card.Header>

                <Card.Body pt="0">
                    <SimpleGrid columns={{ base: 1, lg: 2 }} gap="8" alignItems="center">
                        {/* Donut Chart */}
                        <Box display="flex" justifyContent="center" alignItems="center">
                            <UserRightsDonutChart />
                        </Box>

                        {/* Chart Legend */}
                        <VStack align="start" gap="4">
                            <Text fontSize="lg" fontWeight="medium" color="gray.700">
                                Access Level Breakdown
                            </Text>

                            <VStack align="start" gap="3" w="full">
                                {chartData.map((item) => (
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
                                            Users with Rights
                                        </Text>
                                        <Text fontSize="lg" fontWeight="bold" color="gray.800">
                                            {stats.activeUsers}
                                        </Text>
                                    </VStack>
                                    <VStack align="start" gap="1">
                                        <Text fontSize="xs" color="gray.500">
                                            Without Rights
                                        </Text>
                                        <Text fontSize="lg" fontWeight="bold" color="gray.800">
                                            {stats.totalUsers - stats.activeUsers}
                                        </Text>
                                    </VStack>
                                </SimpleGrid>
                            </Box>
                        </VStack>
                    </SimpleGrid>
                </Card.Body>
            </Card.Root>


        </VStack>
    )
}