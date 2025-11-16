import React from "react";
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
    ArrowRight2,
    Shield,
    Building,
    Briefcase,
    Activity,
    UserOctagon,
    TickCircle
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
import type { AttendanceRecord } from "@/types/attendance.type";
import type { Region } from "@/types/regions.type";
import { useAttendance } from "../../hooks/useAttendance";
import { useDistricts } from "../../hooks/useDistrict";
import { useGroups } from "../../hooks/useGroup";
import { useOldGroups } from "../../hooks/useOldGroup";
import { useRegions } from "../../hooks/useRegion";
import { useUsers } from "../../hooks/useUser";
import { useStates } from "../../hooks/useState";
import { useAuth } from "@/hooks/useAuth";


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
    const { hasRole } = useAuth();

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

    // Calculate total attendance for a record
    const getTotalAttendance = (record: AttendanceRecord) => {
        return (record.men || 0) + (record.women || 0) + 
               (record.youth_boys || 0) + (record.youth_girls || 0) + 
               (record.children_boys || 0) + (record.children_girls || 0);
    };

    // Transform attendance data for monthly trend chart
    const attendanceChartData = React.useMemo(() => {
        if (!attendance || attendance.length === 0) return [];

        const monthlyData: Record<string, number> = {};
        
        attendance.forEach((record: AttendanceRecord) => {
            const monthKey = record.month || 'Unknown';
            const total = getTotalAttendance(record);
            
            if (monthlyData[monthKey]) {
                monthlyData[monthKey] += total;
            } else {
                monthlyData[monthKey] = total;
            }
        });

        // Convert to array and sort by month name
        const monthOrder = ['January', 'February', 'March', 'April', 'May', 'June', 
                           'July', 'August', 'September', 'October', 'November', 'December'];
        
        return Object.entries(monthlyData)
            .map(([month, attendance]) => ({ month, attendance }))
            .sort((a, b) => {
                const aIndex = monthOrder.indexOf(a.month);
                const bIndex = monthOrder.indexOf(b.month);
                return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
            });
    }, [attendance]);

    // Transform attendance data for regional distribution chart
    const regionalDistribution = React.useMemo(() => {
        if (!attendance || attendance.length === 0 || !regions) return [];

        const regionData: Record<number, number> = {};
        
        attendance.forEach((record: AttendanceRecord) => {
            const regionId = record.region_id;
            const total = getTotalAttendance(record);
            
            if (regionData[regionId]) {
                regionData[regionId] += total;
            } else {
                regionData[regionId] = total;
            }
        });

        // Map region IDs to region codes and get top 5
        return Object.entries(regionData)
            .map(([regionId, value]) => {
                const region = regions.find((r: Region) => r.id === parseInt(regionId));
                return {
                    name: region?.code || `Region ${regionId}`,
                    value
                };
            })
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);
    }, [attendance, regions]);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

    // Determine which stats to show based on user role
    const getVisibleStats = React.useCallback((label: string): boolean => {
        // Super Admin sees everything
        if (hasRole('Super Admin')) {
            return true;
        }

        // State Admin sees: states, regions, groups, old groups, districts, attendance, 
        // viewers, state admins, region admins, district admins, group admins
        if (hasRole('State Admin')) {
            const visibleForStateAdmin = [
                'Total States',
                'Total Regions',
                'Total Groups',
                'Total Old Groups',
                'Total Districts',
                'Total Youth Attendance',
                'Total Viewers',
                'Total State Admins',
                'Total Region Admins',
                'Total District Admins',
                'Total Group Admins'
            ];
            return visibleForStateAdmin.includes(label);
        }

        // Region Admin sees: groups, old groups, districts, attendance, 
        // viewers, region admins, district admins, group admins
        if (hasRole('Region Admin')) {
            const visibleForRegionAdmin = [
                'Total Groups',
                'Total Old Groups',
                'Total Districts',
                'Total Youth Attendance',
                'Total Viewers',
                'Total Region Admins',
                'Total District Admins',
                'Total Group Admins'
            ];
            return visibleForRegionAdmin.includes(label);
        }

        // Group Admin sees: groups, old groups, districts, attendance, 
        // viewers, region admins, district admins, group admins
        if (hasRole('Group Admin')) {
            const visibleForGroupAdmin = [
                'Total Groups',
                'Total Old Groups',
                'Total Districts',
                'Total Youth Attendance',
                'Total Viewers',
                'Total Region Admins',
                'Total District Admins',
                'Total Group Admins'
            ];
            return visibleForGroupAdmin.includes(label);
        }

        // District Admin - if needed, add similar logic
        if (hasRole('District Admin')) {
            const visibleForDistrictAdmin = [
                'Total Groups',
                'Total Old Groups',
                'Total Districts',
                'Total Youth Attendance',
                'Total Viewers',
                'Total District Admins',
                'Total Group Admins'
            ];
            return visibleForDistrictAdmin.includes(label);
        }

        // Viewer - minimal access (if any)
        if (hasRole('Viewer')) {
            return false; // Or define what viewers can see
        }

        // Default: no access
        return false;
    }, [hasRole]);

    // Stats data with real API data
    const allStatsData = [
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
            label: "Total Super Admins",
            value: users?.filter((user: any) => user.roles?.includes('Super Admin'))?.length || 0,
            icon: <User variant="Bulk" size="24" />,
            color: "cyan",
            description: "Super administrators",
            path: "/admin/users"
        },
        {
            label: "Total Admins",
            value: users?.filter((user: any) => user.roles?.includes('admin'))?.length || 0,
            icon: <Shield variant="Bulk" size="24" />,
            color: "blue",
            description: "System administrators",
            path: "/admin/users"
        },
        {
            label: "Total State Admins",
            value: users?.filter((user: any) => user.roles?.includes('State Admin'))?.length || 0,
            icon: <Building variant="Bulk" size="24" />,
            color: "pink",
            description: "State administrators",
            path: "/admin/users"
        },
        {
            label: "Total Region Admins",
            value: users?.filter((user: any) => user.roles?.includes('Region Admin'))?.length || 0,
            icon: <Briefcase variant="Bulk" size="24" />,
            color: "orange",
            description: "Region administrators",
            path: "/admin/users"
        },
        {
            label: "Total District Admins",
            value: users?.filter((user: any) => user.roles?.includes('District Admin'))?.length || 0,
            icon: <Activity variant="Bulk" size="24" />,
            color: "gray",
            description: "District administrators",
            path: "/admin/users"
        },
        {
            label: "Total Group Admins",
            value: users?.filter((user: any) => user.roles?.includes('Group Admin'))?.length || 0,
            icon: <UserOctagon variant="Bulk" size="24" />,
            color: "cyan",
            description: "Group administrators",
            path: "/admin/users"
        },
        {
            label: "Total Viewers",
            value: users?.filter((user: any) => user.roles?.includes('Viewer'))?.length || 0,
            icon: <TickCircle variant="Bulk" size="24" />,
            color: "gray",
            description: "View-only users",
            path: "/admin/users"
        }
    ];

    // Filter stats based on user role
    const statsData = React.useMemo(() => {
        return allStatsData.filter(stat => getVisibleStats(stat.label));
    }, [allStatsData, getVisibleStats]);

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
                    {Array.from({ length: 14 }).map((_, index) => (
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
                        bg="bg"
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
                                        bg={`${stat.color}/10`}
                                        color={`${stat.color}`}
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
            {attendanceChartData.length > 0 && (
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
                                        type="monotone"
                                        dataKey="attendance"
                                        stroke="#0088FE"
                                        strokeWidth={2}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card.Root>

                    {/* Regional Distribution */}
                    {regionalDistribution.length > 0 && (
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
                    )}
                </SimpleGrid>
            )}

            {/* Monthly Overview Bar Chart */}
            {attendanceChartData.length > 0 && (
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
            )}
        </Box>
    );
};

export default Dashboard;