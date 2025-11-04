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
import { Chart, useChart } from "@chakra-ui/charts"
import { Cell, Label, Pie, PieChart, Tooltip } from "recharts"
import {Profile2User, ProfileTick, Shield, TrendUp, ArrowRight } from "iconsax-reactjs"
import { ENV } from "@/config/env"
import { useUserRightsStore } from "../../stores/userRights.store"
import { useUsersStore } from "../../stores/users.store"


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

const Content = () => {
    const navigate = useNavigate()
    const { users } = useUsersStore()
    const { userRights } = useUserRightsStore()
    
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalUserRights: 0,
        superAdmins: 0,
        groupAdmins: 0,
        activeUsers: 0
    })

    const [chartData, setChartData] = useState<Array<{ name: string; value: number; color: string }>>([])

    useEffect(() => {
        // Calculate statistics
        const totalUsers = users.length
        const totalUserRights = userRights.length
        
        const accessLevelCounts = userRights.reduce((acc, right) => {
            acc[right.accessLevel] = (acc[right.accessLevel] || 0) + 1
            return acc
        }, {} as Record<string, number>)

        setStats({
            totalUsers,
            totalUserRights,
            superAdmins: accessLevelCounts['super_admin'] || 0,
            groupAdmins: accessLevelCounts['group_admin'] || 0,
            activeUsers: users.filter(user => 
                userRights.some(right => right.userId === user.id)
            ).length
        })

        // Prepare chart data
        const chartData = [
            {
                name: 'Super Admins',
                value: accessLevelCounts['super_admin'] || 0,
                color: 'blue.solid'
            },
            {
                name: 'Group Admins',
                value: accessLevelCounts['group_admin'] || 0,
                color: 'green.solid'
            },
            {
                name: 'District Admins',
                value: accessLevelCounts['district_admin'] || 0,
                color: 'orange.solid'
            },
            {
                name: 'Region Admins',
                value: accessLevelCounts['region_admin'] || 0,
                color: 'purple.solid'
            },
            {
                name: 'State Admins',
                value: accessLevelCounts['state_admin'] || 0,
                color: 'red.solid'
            },
            {
                name: 'No Rights',
                value: totalUsers - (accessLevelCounts['super_admin'] || 0) - (accessLevelCounts['group_admin'] || 0) - 
                      (accessLevelCounts['district_admin'] || 0) - (accessLevelCounts['region_admin'] || 0) - 
                      (accessLevelCounts['state_admin'] || 0),
                color: 'gray.solid'
            }
        ].filter(item => item.value > 0)

        setChartData(chartData)
    }, [users, userRights])

    const StatCard = ({ 
        title, 
        value, 
        icon: Icon, 
        color, 
        link, 
        description 
    }: { 
        title: string
        value: number
        icon: any
        color: string
        link: string
        description?: string
    }) => (
        <Card.Root 
            bg="white" 
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
                            {value}
                        </Heading>
                        {description && (
                            <Text fontSize="xs" color="gray.500">
                                {description}
                            </Text>
                        )}
                    </VStack>
                    <Box
                        p="3"
                        bg={`${color}.50`}
                        rounded="lg"
                        color={color}
                    >
                        <Icon size="24" />
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
    const UserRightsDonutChart = () => {
        const chart = useChart({
            data: chartData,
        })

        const totalUsersWithRights = chartData
            .filter(item => item.name !== 'No Rights')
            .reduce((sum, item) => sum + item.value, 0)

        return (
            <Chart.Root boxSize="200px" chart={chart} mx="auto">
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
                                    title={totalUsersWithRights.toLocaleString()}
                                    description="with rights"
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

    return (
        <VStack gap="8" align="stretch">
            {/* Header */}
            <Flex justify="space-between" align="center">
                <VStack align="start" gap="1">
                    <Heading size="3xl">Dashboard</Heading>
                    <Text color="gray.600" fontSize="lg">
                        Welcome to your Church Attendance System
                    </Text>
                </VStack>
            </Flex>

            {/* Statistics Cards */}
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap="6">
                <StatCard
                    title="Total Users"
                    value={stats.totalUsers}
                    icon={Profile2User}
                    color="blue"
                    link="/admin/users/all"
                    description="Registered users in system"
                />
                
                <StatCard
                    title="User Rights"
                    value={stats.totalUserRights}
                    icon={ProfileTick}
                    color="green"
                    link="/admin/users/rights"
                    description="Access rights configured"
                />
                
                <StatCard
                    title="Super Admins"
                    value={stats.superAdmins}
                    icon={Shield}
                    color="purple"
                    link="/admin/users/rights"
                    description="Full system access"
                />
                
                <StatCard
                    title="Active Users"
                    value={stats.activeUsers}
                    icon={TrendUp}
                    color="orange"
                    link="/admin/users/all"
                    description="Users with assigned rights"
                />
            </SimpleGrid>

            {/* Chart Section */}
            <Card.Root bg="white" border="1px" borderColor="gray.200" rounded="xl">
                <Card.Header pb="4">
                    <Flex justify="space-between" align="center">
                        <VStack align="start" gap="1">
                            <Heading size="lg">User Access Distribution</Heading>
                            <Text color="gray.600">
                                Distribution of access levels among users
                            </Text>
                        </VStack>
                        <Badge colorPalette="blue" variant="subtle" fontSize="sm">
                            Real-time
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
                                {chartData.map((item, index) => (
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
                                bg="gray.50" 
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

            {/* Quick Actions */}
            <Card.Root bg="white" border="1px" borderColor="gray.200" rounded="xl">
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
                                bg: 'blue.50',
                                borderColor: 'blue.200'
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
                                    <ArrowRight size="20" color="blue" />
                                </HStack>
                            </Card.Body>
                        </Card.Root>

                        <Card.Root 
                            variant="outline" 
                            cursor="pointer"
                            transition="all 0.2s"
                            _hover={{ 
                                bg: 'green.50',
                                borderColor: 'green.200'
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
                                    <ArrowRight size="20" color="green" />
                                </HStack>
                            </Card.Body>
                        </Card.Root>
                    </SimpleGrid>
                </Card.Body>
            </Card.Root>
        </VStack>
    )
}