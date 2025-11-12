import ErrorFallback from "@/components/ErrorFallback";
import { ENV } from "@/config/env";
import { useQueryErrorResetBoundary } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";
import {
    Grid,
    Stat,
    Card,
    Heading,
    Box,
    HStack,
    Text,
    Skeleton,
    SimpleGrid
} from "@chakra-ui/react"
import {
    Location,
    Map,
    Box1,
    Layer,
    Map1,
    Profile2User,
    User,
    ArrowRight2
} from "iconsax-reactjs"
import { useNavigate } from "react-router";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line
} from 'recharts';
import { toaster } from "@/components/ui/toaster";
import { useAttendance } from "../../hooks/useAttendance";
import { useDistricts } from "../../hooks/useDistrict";
import { useGroups } from "../../hooks/useGroup";
import { useOldGroups } from "../../hooks/useOldGroup";
import { useRegions } from "../../hooks/useRegion";
import { useUsers } from "../../hooks/useUser";
import type { Region } from "@/types/regions.type";
import { useStates } from "../../hooks/useState";


const Dashboard: React.FC = () => {
    const { reset } = useQueryErrorResetBoundary();

    return (
        <>
            <title>Dashboard | {ENV.APP_NAME}</title>
            <meta
                name="description"
                content="track your dashboard"
            />
            <ErrorBoundary
                onReset={reset}
                fallbackRender={({ resetErrorBoundary, error }) => (
                    <ErrorFallback {...{ resetErrorBoundary, error }} />
                )}
            >
                <Content />
            </ErrorBoundary>
        </>
    );
};

const Content = () => {
    const navigate = useNavigate();

    // Use custom hooks
    const { data: users, isLoading: usersLoading, error: usersError } = useUsers();
    const { states, isLoading: statesLoading, error: statesError } = useStates();
    const { regions, isLoading: regionsLoading, error: regionsError } = useRegions();
    const { districts, isLoading: districtsLoading, error: districtsError } = useDistricts();
    const { groups, isLoading: groupsLoading, error: groupsError } = useGroups();
    const { oldGroups, isLoading: oldGroupsLoading, error: oldGroupsError } = useOldGroups();
    const { data: attendance, isLoading: attendanceLoading, error: attendanceError } = useAttendance();

    // Handle errors with toasts
    const showErrorToast = (message: string) => {
        toaster.create({
            description: message,
            type: "error",
            closable: true,
        });
    };

    if (usersError) showErrorToast("Failed to load users");
    if (statesError) showErrorToast("Failed to load states");
    if (regionsError) showErrorToast("Failed to load regions");
    if (districtsError) showErrorToast("Failed to load districts");
    if (groupsError) showErrorToast("Failed to load groups");
    if (oldGroupsError) showErrorToast("Failed to load old groups");
    if (attendanceError) showErrorToast("Failed to load attendance");

    // Stats data with real API data
    const statsData = [
        {
            label: "Total States",
            value: states?.length || 0,
            icon: <Location variant="Bulk" size="24" />,
            color: "blue",
            description: "Active states",
            path: "/admin/states"
        },
        {
            label: "Total Regions",
            value: regions?.length || 0,
            icon: <Map variant="Bulk" size="24" />,
            color: "green",
            description: "Across all states",
            path: "/admin/regions"
        },
        {
            label: "Total Old Groups",
            value: oldGroups?.length || 0,
            icon: <Box1 variant="Bulk" size="24" />,
            color: "purple",
            description: "Legacy groups",
            path: "/admin/old-groups"
        },
        {
            label: "Total Groups",
            value: groups?.length || 0,
            icon: <Layer variant="Bulk" size="24" />,
            color: "orange",
            description: "Active groups",
            path: "/admin/groups"
        },
        {
            label: "Total Districts",
            value: districts?.length || 0,
            icon: <Map1 variant="Bulk" size="24" />,
            color: "red",
            description: "Organized districts",
            path: "/admin/districts"
        },
        {
            label: "Total Youth Attendance",
            value: attendance?.length || 0,
            icon: <Profile2User variant="Bulk" size="24" />,
            color: "teal",
            description: "Recent attendance",
            path: "/admin/attendance"
        },
        {
            label: "Total Administrators",
            value: users?.filter((user: any) => user.roles?.includes('admin'))?.length || 0,
            icon: <User variant="Bulk" size="24" />,
            color: "cyan",
            description: "System administrators",
            path: "/admin/users"
        }
    ];

    // Chart data - attendance by month (mock data for demonstration)
    const attendanceChartData = [
        { month: 'Jan', attendance: 45 },
        { month: 'Feb', attendance: 52 },
        { month: 'Mar', attendance: 48 },
        { month: 'Apr', attendance: 60 },
        { month: 'May', attendance: 55 },
        { month: 'Jun', attendance: 65 },
    ];

    // Regional distribution data
    const regionalDistribution = regions?.slice(0, 5).map((region: Region) => ({
        name: region.code,
        value: Math.floor(Math.random() * 50) + 10 // Mock data for groups per region
    })) || [];

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

    const handleCardClick = (path: string) => {
        navigate(path);
    };

    const isLoading = usersLoading || statesLoading || regionsLoading ||
        districtsLoading || groupsLoading || oldGroupsLoading || attendanceLoading;

    if (isLoading) {
        return (
            <Box>
                <Heading size="3xl" mb="6" color="bg.inverted">
                    Dashboard
                </Heading>
                <Grid
                    templateColumns={{
                        base: "repeat(1, 1fr)",
                        md: "repeat(2, 1fr)",
                        lg: "repeat(3, 1fr)",
                        xl: "repeat(4, 1fr)"
                    }}
                    gap="5"
                >
                    {Array.from({ length: 7 }).map((_, index) => (
                        <Skeleton key={index} height="120px" borderRadius="xl" />
                    ))}
                </Grid>
            </Box>
        );
    }

    return (
        <Box>
            <Heading size="3xl" mb="6" color="bg.inverted">
                Dashboard
            </Heading>

            {/* Stats Cards */}
            <Grid
                templateColumns={{
                    base: "repeat(1, 1fr)",
                    md: "repeat(2, 1fr)",
                    lg: "repeat(3, 1fr)",
                    xl: "repeat(4, 1fr)"
                }}
                gap="5"
                mb="8"
            >
                {statsData.map((stat, index) => (
                    <Card.Root
                        key={index}
                        height="full"
                        variant="outline"
                        rounded="xl"
                        bg="bg.subtle"
                        _hover={{
                            transform: "translateY(-2px)",
                            shadow: "md",
                            cursor: "pointer",
                            borderColor: `${stat.color}.200`
                        }}
                        transition="all 0.2s"
                        onClick={() => handleCardClick(stat.path)}
                    >
                        <Card.Body>
                            <HStack justify="space-between" align="flex-start">
                                <Stat.Root>
                                    <Stat.ValueText
                                        fontSize="2xl"
                                        fontWeight="bold"
                                    // color="gray.800"
                                    >
                                        {stat.value}
                                    </Stat.ValueText>
                                    <Stat.Label
                                        fontSize="sm"
                                        // color="gray.600"
                                        mt="1"
                                    >
                                        {stat.label}
                                    </Stat.Label>
                                    <Text fontSize="xs" mt="1">
                                        {stat.description}
                                    </Text>
                                </Stat.Root>

                                <HStack>
                                    <Box
                                        p="2"
                                        borderRadius="md"
                                        bg={`${stat.color}.50`}
                                        color={`${stat.color}.600`}
                                        flexShrink={0}
                                    >
                                        {stat.icon}
                                    </Box>
                                    <ArrowRight2 size="16" color="gray.400" />
                                </HStack>
                            </HStack>
                        </Card.Body>
                    </Card.Root>
                ))}
            </Grid>

            {/* Charts Section */}
            <SimpleGrid columns={{ base: 1, lg: 2 }} gap="6" mb="8">
                {/* Attendance Trend Chart */}
                <Card.Root variant="outline" rounded="xl">
                    <Card.Header>
                        <Heading size="md">Attendance Trend</Heading>
                    </Card.Header>
                    <Card.Body>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={attendanceChartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip labelStyle={{ color: "black" }} />
                                <Line
                                    type="basis"
                                    dataKey="attendance"
                                    stroke="#0088FE"
                                    strokeWidth={2}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card.Body>
                </Card.Root>

                {/* Regional Distribution */}
                <Card.Root variant="outline" rounded="xl">
                    <Card.Header>
                        <Heading size="md">Regional Distribution</Heading>
                    </Card.Header>
                    <Card.Body>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={regionalDistribution}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} (${((percent as number) * 100).toFixed(0)}%)`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {regionalDistribution.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip labelStyle={{ color: "black" }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </Card.Body>
                </Card.Root>
            </SimpleGrid>

            {/* Recent Activity Bar Chart */}
            <Card.Root variant="outline" rounded="xl">
                <Card.Header>
                    <Heading size="md">Monthly Overview</Heading>
                </Card.Header>
                <Card.Body>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={attendanceChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip labelStyle={{ color: "black" }} />
                            <Bar dataKey="attendance" fill="#00C49F" />
                        </BarChart>
                    </ResponsiveContainer>
                </Card.Body>
            </Card.Root>
        </Box>
    );
};

export default Dashboard;