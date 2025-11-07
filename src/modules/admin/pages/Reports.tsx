// components/dashboard/ReportsDashboard.tsx
"use client"

import { useState, useEffect } from "react"
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
    Button,
    Field,
    Portal,
    Combobox,
    useFilter,
    useListCollection,
    Grid,
    GridItem,
} from "@chakra-ui/react"
import { Chart, useChart } from "@chakra-ui/charts"
import { Cell, Label, Pie, PieChart, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, LineChart, Line } from "recharts"
import { Calendar, Profile2User, TrendUp, ArrowRight, ChartSquare, UserOctagon, DocumentDownload } from "iconsax-reactjs"
import { ENV } from "@/config/env"
import { useAttendanceStore } from "../stores/attendance.store"
import { useDistrictsStore } from "../stores/districts.store"
import { useGroupsStore } from "../stores/group.store"
import { useOldGroupsStore } from "../stores/oldgroups.store"
import { useRegionsStore } from "../stores/region.store"
import { useStatesStore } from "../stores/states.store"
import { useYouthRevivalAttendanceStore } from "../stores/youthMinistry/revival.store"
import { useYouthAttendanceStore } from "../stores/youthMinistry/youthAttendance.store"
import { useYouthWeeklyStore } from "../stores/youthMinistry/youthWeekly.store"
import { Controller, useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { z } from "zod"

// Form Schema
const reportFormSchema = z.object({
    state: z.string().optional(),
    region: z.string().optional(),
    group: z.string().optional(),
    oldGroup: z.string().optional(),
    district: z.string().optional(),
    year: z.string().optional(),
    month: z.string().optional(),
    fromMonth: z.string().optional(),
    toMonth: z.string().optional(),
})

type ReportFormValues = z.infer<typeof reportFormSchema>

export const ReportsDashboard: React.FC = () => {
    return (
        <>
            <title>Reports Dashboard | {ENV.APP_NAME}</title>
            <meta
                name="description"
                content="Church Attendance Reports Dashboard"
            />
            <Content />
        </>
    )
}

export default ReportsDashboard

const Content = () => {
    const navigate = useNavigate()

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

    const [selectedReport, setSelectedReport] = useState<string>('overview')

    // Form handling
    const {
        control,
        handleSubmit,
        watch,
        formState: { errors }
    } = useForm<ReportFormValues>({
        resolver: standardSchemaResolver(reportFormSchema),
        defaultValues: {
            year: new Date().getFullYear().toString(),
        }
    })

    const [stats, setStats] = useState({
        totalAttendance: 0,
        totalYouth: 0,
        totalWeeklyYouth: 0,
        totalRevivalYouth: 0,
        averageAttendance: 0,
        growthRate: 0
    })

    const [chartData, setChartData] = useState<any[]>([])
    const [serviceDistribution, setServiceDistribution] = useState<any[]>([])
    const [monthlyTrend, setMonthlyTrend] = useState<any[]>([])

    // Create collections for Combobox components - Sorted in ASC order
    const statesCollection = states
        .map(state => ({
            label: state.stateName,
            value: state.stateName
        }))
        .sort((a, b) => a.label.localeCompare(b.label))

    const regionsCollection = regions
        .map(region => ({
            label: region.regionName,
            value: region.regionName
        }))
        .sort((a, b) => a.label.localeCompare(b.label))

    const groupsCollection = groups
        .map(group => ({
            label: group.groupName,
            value: group.groupName
        }))
        .sort((a, b) => a.label.localeCompare(b.label))

    const oldGroupsCollection = oldGroups
        .map(group => ({
            label: group.groupName,
            value: group.groupName
        }))
        .sort((a, b) => a.label.localeCompare(b.label))

    const districtsCollection = districts
        .map(district => ({
            label: district.districtName,
            value: district.districtName
        }))
        .sort((a, b) => a.label.localeCompare(b.label))

    const yearsCollection = [2025, 2024, 2023]
        .map(year => ({
            label: year.toString(),
            value: year.toString()
        }))
        .sort((a, b) => b.label.localeCompare(a.label)) // Sort years in descending order

    const monthsCollection = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ].map(month => ({
        label: month,
        value: month
    }))
    // Months are already in chronological order

    useEffect(() => {
        calculateStats()
        prepareChartData()
    }, [attendances, youthAttendance, youthWeeklyAttendances, youthRevivalAttendances])

    const calculateStats = () => {
        // Calculate total attendance across all services
        const totalAttendance = attendances.reduce((sum, att) =>
            sum + att.men + att.women + att.youthBoys + att.youthGirls + att.childrenBoys + att.childrenGirls, 0
        )

        // Calculate youth statistics
        const totalYouth = youthAttendance.reduce((sum, att) => sum + att.yhsfMale + att.yhsfFemale, 0)
        const totalWeeklyYouth = youthWeeklyAttendances.reduce((sum, att) =>
            sum + att.membersBoys + att.visitorsBoys + att.membersGirls + att.visitorsGirls, 0
        )
        const totalRevivalYouth = youthRevivalAttendances.reduce((sum, att) => sum + att.male + att.female, 0)

        // Calculate average and growth (simplified)
        const averageAttendance = attendances.length > 0 ? Math.round(totalAttendance / attendances.length) : 0
        const growthRate = 12.5 // This would be calculated based on previous period

        setStats({
            totalAttendance,
            totalYouth,
            totalWeeklyYouth,
            totalRevivalYouth,
            averageAttendance,
            growthRate
        })
    }

    const prepareChartData = () => {
        // Service distribution data
        const serviceData = [
            { name: 'Sunday Worship', value: attendances.filter(a => a.serviceType === 'sunday-worship').length, color: 'blue.solid' },
            { name: 'House Caring', value: attendances.filter(a => a.serviceType === 'house-caring').length, color: 'green.solid' },
            { name: 'Youth Attendance', value: youthAttendance.length, color: 'purple.solid' },
            { name: 'Youth Weekly', value: youthWeeklyAttendances.length, color: 'orange.solid' },
            { name: 'Youth Revival', value: youthRevivalAttendances.length, color: 'red.solid' },
        ].filter(item => item.value > 0)

        setServiceDistribution(serviceData)

        // Monthly trend data (last 6 months)
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        const currentMonth = new Date().getMonth()
        const monthlyData: { month: string, attendance: number, youth: number }[] = []

        for (let i = 5; i >= 0; i--) {
            const monthIndex = (currentMonth - i + 12) % 12
            const monthName = months[monthIndex]

            const monthAttendances = attendances.filter(att =>
                att.month.toLowerCase().includes(monthName.toLowerCase())
            )

            const monthTotal = monthAttendances.reduce((sum, att) =>
                sum + att.men + att.women + att.youthBoys + att.youthGirls + att.childrenBoys + att.childrenGirls, 0
            )

            const d: { month: string, attendance: number, youth: number } = {
                month: monthName,
                attendance: monthTotal,
                youth: Math.round(monthTotal * 0.3) // Simplified calculation
            };

            monthlyData.push(d)
        }

        setMonthlyTrend(monthlyData)
        setChartData(monthlyData)
    }

    const handleDownloadReport = (data: ReportFormValues) => {
        console.log('Downloading report with filters:', data)
        // Implement download logic here
        // You can use your existing export utilities
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
            bg="white"
            border="1px"
            borderColor="gray.200"
            rounded="xl"
            p="6"
        >
            <Card.Body p="0">
                <Flex justify="space-between" align="start">
                    <VStack align="start" gap="2">
                        <Text fontSize="sm" color="gray.600" fontWeight="medium">
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
                                {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
                            </Badge>
                        )}
                    </VStack>
                    <Box
                        p="3"
                        bg={`${color}.50`}
                        rounded="xl"
                        color={color}
                    >
                        <Icon size="24" />
                    </Box>
                </Flex>
            </Card.Body>
        </Card.Root>
    )

    // Service Distribution Donut Chart
    const ServiceDistributionChart = () => {
        const chart = useChart({
            data: serviceDistribution,
        })

        const totalRecords = serviceDistribution.reduce((sum, item) => sum + item.value, 0)

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
                                    title={totalRecords.toLocaleString()}
                                    description="total records"
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

    // Monthly Trend Line Chart
    const MonthlyTrendChart = () => {
        return (
            <Box width="100%" height="300px">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="month" fontSize={12} />
                        <YAxis fontSize={12} />
                        <Tooltip
                            formatter={(value) => [value.toLocaleString(), 'Attendance']}
                        />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="attendance"
                            name="Total Attendance"
                            stroke="#3182CE"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="youth"
                            name="Youth"
                            stroke="#38A169"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </Box>
        )
    }

    // Custom Combobox Field Component
    const CustomComboboxField = ({
        name,
        label,
        items,
        placeholder,
        required = false
    }: {
        name: keyof ReportFormValues
        label: string
        items: Array<{ label: string; value: string }>
        placeholder: string
        required?: boolean
    }) => {
        const { contains } = useFilter({ sensitivity: "base" })
        const { collection, filter } = useListCollection({
            initialItems: items,
            filter: contains,
        })

        return (
            <Field.Root invalid={!!errors[name]} width="full">
                <Field.Label>
                    {label}
                    {required && <span style={{ color: 'red' }}>*</span>}
                </Field.Label>
                <Controller
                    control={control}
                    name={name}
                    render={({ field }) => (
                        <Combobox.Root
                            collection={collection}
                            openOnClick
                            onInputValueChange={(e) => filter(e.inputValue)}
                            value={field.value ? [field.value] : []}
                            onValueChange={(e) => field.onChange(e.value[0])}
                            name={field.name}
                            onInteractOutside={() => field.onBlur()}
                        >
                            <Combobox.Control>
                                <Combobox.Input
                                    placeholder={placeholder}
                                    rounded="xl"
                                />
                                <Combobox.IndicatorGroup>
                                    <Combobox.ClearTrigger />
                                    <Combobox.Trigger />
                                </Combobox.IndicatorGroup>
                            </Combobox.Control>
                            <Portal>
                                <Combobox.Positioner>
                                    <Combobox.Content>
                                        <Combobox.Empty>No items found</Combobox.Empty>
                                        {collection.items.map((item) => (
                                            <Combobox.Item item={item} key={item.value}>
                                                {item.label}
                                                <Combobox.ItemIndicator />
                                            </Combobox.Item>
                                        ))}
                                    </Combobox.Content>
                                </Combobox.Positioner>
                            </Portal>
                        </Combobox.Root>
                    )}
                />
                <Field.ErrorText>{errors[name]?.message}</Field.ErrorText>
            </Field.Root>
        )
    }

    // Report Generation Components
    const StateAttendanceReport = () => (
        <Card.Root bg="white" border="1px" borderColor="gray.200" rounded="xl">
            <Card.Header>
                <Heading size="lg">State Attendance Report</Heading>
                <Text color="gray.600">Generate state-level attendance reports</Text>
            </Card.Header>
            <Card.Body>
                <form onSubmit={handleSubmit(handleDownloadReport)}>
                    <Grid templateColumns="repeat(4, 1fr)" gap="4">
                        <GridItem>
                            <CustomComboboxField
                                name="state"
                                label="State"
                                items={statesCollection}
                                placeholder="Type to search state"
                                required
                            />
                        </GridItem>
                        <GridItem>
                            <CustomComboboxField
                                name="year"
                                label="Year"
                                items={yearsCollection}
                                placeholder="Type to search year"
                                required
                            />
                        </GridItem>
                        <GridItem>
                            <CustomComboboxField
                                name="fromMonth"
                                label="From Month"
                                items={monthsCollection}
                                placeholder="Type to search month"
                                required
                            />
                        </GridItem>
                        <GridItem>
                            <CustomComboboxField
                                name="toMonth"
                                label="To Month"
                                items={monthsCollection}
                                placeholder="Type to search month"
                                required
                            />
                        </GridItem>
                    </Grid>
                    <Flex justify="end" mt="4">
                        <Button type="submit" colorPalette="blue" rounded="xl">
                            <DocumentDownload size="20" />
                            Download Report
                        </Button>
                    </Flex>
                </form>
            </Card.Body>
        </Card.Root>
    )

    const RegionAttendanceReport = () => (
        <Card.Root bg="white" border="1px" borderColor="gray.200" rounded="xl">
            <Card.Header>
                <Heading size="lg">Region Attendance Report</Heading>
                <Text color="gray.600">Generate region-level attendance reports</Text>
            </Card.Header>
            <Card.Body>
                <form onSubmit={handleSubmit(handleDownloadReport)}>
                    <Grid templateColumns="repeat(5, 1fr)" gap="4">
                        <GridItem>
                            <CustomComboboxField
                                name="state"
                                label="State"
                                items={statesCollection}
                                placeholder="Type to search state"
                                required
                            />
                        </GridItem>
                        <GridItem>
                            <CustomComboboxField
                                name="region"
                                label="Region"
                                items={regionsCollection}
                                placeholder="Type to search region"
                                required
                            />
                        </GridItem>
                        <GridItem>
                            <CustomComboboxField
                                name="year"
                                label="Year"
                                items={yearsCollection}
                                placeholder="Type to search year"
                                required
                            />
                        </GridItem>
                        <GridItem>
                            <CustomComboboxField
                                name="fromMonth"
                                label="From Month"
                                items={monthsCollection}
                                placeholder="Type to search month"
                                required
                            />
                        </GridItem>
                        <GridItem>
                            <CustomComboboxField
                                name="toMonth"
                                label="To Month"
                                items={monthsCollection}
                                placeholder="Type to search month"
                                required
                            />
                        </GridItem>
                    </Grid>
                    <Flex justify="end" mt="4">
                        <Button type="submit" colorPalette="blue" rounded="xl">
                            <DocumentDownload size="20" />
                            Download Report
                        </Button>
                    </Flex>
                </form>
            </Card.Body>
        </Card.Root>
    )

    const GroupAttendanceReport = () => (
        <Card.Root bg="white" border="1px" borderColor="gray.200" rounded="xl">
            <Card.Header>
                <Heading size="lg">Group Attendance Report</Heading>
                <Text color="gray.600">Generate group-level attendance reports</Text>
            </Card.Header>
            <Card.Body>
                <form onSubmit={handleSubmit(handleDownloadReport)}>
                    <Grid templateColumns="repeat(5, 1fr)" gap="4">
                        <GridItem>
                            <CustomComboboxField
                                name="state"
                                label="State"
                                items={statesCollection}
                                placeholder="Type to search state"
                                required
                            />
                        </GridItem>
                        <GridItem>
                            <CustomComboboxField
                                name="region"
                                label="Region"
                                items={regionsCollection}
                                placeholder="Type to search region"
                                required
                            />
                        </GridItem>
                        <GridItem>
                            <CustomComboboxField
                                name="oldGroup"
                                label="Old Group"
                                items={oldGroupsCollection}
                                placeholder="Type to search old group"
                            />
                        </GridItem>
                        <GridItem>
                            <CustomComboboxField
                                name="group"
                                label="Group"
                                items={groupsCollection}
                                placeholder="Type to search group"
                                required
                            />
                        </GridItem>
                        <GridItem>
                            <CustomComboboxField
                                name="year"
                                label="Year"
                                items={yearsCollection}
                                placeholder="Type to search year"
                                required
                            />
                        </GridItem>
                    </Grid>
                    <Flex justify="end" mt="4">
                        <Button type="submit" colorPalette="blue" rounded="xl">
                            <DocumentDownload size="20" />
                            Download Report
                        </Button>
                    </Flex>
                </form>
            </Card.Body>
        </Card.Root>
    )

    const YouthAttendanceReport = () => (
        <Card.Root bg="white" border="1px" borderColor="gray.200" rounded="xl">
            <Card.Header>
                <Heading size="lg">Youth Attendance Report</Heading>
                <Text color="gray.600">Generate youth ministry attendance reports</Text>
            </Card.Header>
            <Card.Body>
                <form onSubmit={handleSubmit(handleDownloadReport)}>
                    <Grid templateColumns="repeat(4, 1fr)" gap="4">
                        <GridItem>
                            <CustomComboboxField
                                name="state"
                                label="State"
                                items={statesCollection}
                                placeholder="Type to search state"
                                required
                            />
                        </GridItem>
                        <GridItem>
                            <CustomComboboxField
                                name="region"
                                label="Region"
                                items={regionsCollection}
                                placeholder="Type to search region"
                                required
                            />
                        </GridItem>
                        <GridItem>
                            <CustomComboboxField
                                name="year"
                                label="Year"
                                items={yearsCollection}
                                placeholder="Type to search year"
                                required
                            />
                        </GridItem>
                        <GridItem>
                            <CustomComboboxField
                                name="month"
                                label="Month"
                                items={monthsCollection}
                                placeholder="Type to search month"
                                required
                            />
                        </GridItem>
                    </Grid>
                    <Flex justify="end" mt="4">
                        <Button type="submit" colorPalette="blue" rounded="xl">
                            <DocumentDownload size="20" />
                            Download Report
                        </Button>
                    </Flex>
                </form>
            </Card.Body>
        </Card.Root>
    )

    const renderReportComponent = () => {
        switch (selectedReport) {
            case 'state':
                return <StateAttendanceReport />
            case 'region':
                return <RegionAttendanceReport />
            case 'group':
                return <GroupAttendanceReport />
            case 'youth':
                return <YouthAttendanceReport />
            default:
                return null
        }
    }

    return (
        <VStack gap="8" align="stretch">
            {/* Header */}
            <Flex justify="space-between" align="center">
                <VStack align="start" gap="1">
                    <Heading size="3xl">Reports Dashboard</Heading>
                    <Text color="gray.600" fontSize="lg">
                        Generate comprehensive attendance reports and analytics
                    </Text>
                </VStack>
            </Flex>

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
                {/* Service Distribution */}
                <Card.Root bg="white" border="1px" borderColor="gray.200" rounded="xl">
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
                            <Box display="flex" justifyContent="center" alignItems="center">
                                <ServiceDistributionChart />
                            </Box>

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
                            </VStack>
                        </SimpleGrid>
                    </Card.Body>
                </Card.Root>

                {/* Monthly Trend */}
                <Card.Root bg="white" border="1px" borderColor="gray.200" rounded="xl">
                    <Card.Header pb="4">
                        <Flex justify="space-between" align="center">
                            <VStack align="start" gap="1">
                                <Heading size="lg">Monthly Trend</Heading>
                                <Text color="gray.600">
                                    Attendance trends over time
                                </Text>
                            </VStack>
                            <Badge colorPalette="green" variant="subtle" fontSize="sm">
                                Last 6 Months
                            </Badge>
                        </Flex>
                    </Card.Header>

                    <Card.Body pt="0">
                        <MonthlyTrendChart />
                    </Card.Body>
                </Card.Root>
            </SimpleGrid>

            {/* Report Generation Section */}
            <Card.Root bg="white" border="1px" borderColor="gray.200" rounded="xl">
                <Card.Header>
                    <Heading size="lg">Generate Reports</Heading>
                    <Text color="gray.600">
                        Select report type and configure parameters
                    </Text>
                </Card.Header>
                <Card.Body>
                    {/* Report Type Selection */}
                    <SimpleGrid columns={{ base: 2, md: 4 }} gap="4" mb="6">
                        <Button
                            variant={selectedReport === 'state' ? 'solid' : 'outline'}
                            colorPalette="blue"
                            onClick={() => setSelectedReport('state')}
                            rounded="xl"
                        >
                            State Report
                        </Button>
                        <Button
                            variant={selectedReport === 'region' ? 'solid' : 'outline'}
                            colorPalette="green"
                            onClick={() => setSelectedReport('region')}
                            rounded="xl"
                        >
                            Region Report
                        </Button>
                        <Button
                            variant={selectedReport === 'group' ? 'solid' : 'outline'}
                            colorPalette="purple"
                            onClick={() => setSelectedReport('group')}
                            rounded="xl"
                        >
                            Group Report
                        </Button>
                        <Button
                            variant={selectedReport === 'youth' ? 'solid' : 'outline'}
                            colorPalette="orange"
                            onClick={() => setSelectedReport('youth')}
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
            <Card.Root bg="white" border="1px" borderColor="gray.200" rounded="xl">
                <Card.Header>
                    <Heading size="lg">Quick Export</Heading>
                </Card.Header>
                <Card.Body>
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap="4">
                        <Button
                            variant="outline"
                            onClick={() => {/* Export logic */ }}
                            rounded="xl"
                        >
                            <DocumentDownload size="20" />
                            Export All Data
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => {/* Export logic */ }}
                            rounded="xl"
                        >
                            <DocumentDownload size="20" />
                            Export Youth Data
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => {/* Export logic */ }}
                            rounded="xl"
                        >
                            <DocumentDownload size="20" />
                            Export Weekly Data
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => {/* Export logic */ }}
                            rounded="xl"
                        >
                            <DocumentDownload size="20" />
                            Export Revival Data
                        </Button>
                    </SimpleGrid>
                </Card.Body>
            </Card.Root>
        </VStack>
    )
}