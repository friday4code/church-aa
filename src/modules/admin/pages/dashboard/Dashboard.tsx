import React, { useMemo } from "react";
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
import { useMe } from "@/hooks/useMe";
import { Tooltip as CTooltip } from "@/components/ui/tooltip";
import { adminApi } from "@/api/admin.api";


const Dashboard: React.FC = () => {
    const { reset } = useQueryErrorResetBoundary();
    const title = useMemo(() => `Dashboard | ${ENV.APP_NAME}`, [ENV.APP_NAME]);
    return (
        <>
            <title>{title}</title>  
            <meta
                name="description"
                content="track your dashboard now"
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
    const { user } = useMe();

    // Use custom hooks
    const { data, isLoading: usersLoading, error: usersError } = useUsers();
    const { states, isLoading: statesLoading, error: statesError } = useStates();
    const { regions, isLoading: regionsLoading, error: regionsError } = useRegions();
    const { districts, isLoading: districtsLoading, error: districtsError } = useDistricts();
    const { groups, isLoading: groupsLoading, error: groupsError } = useGroups();
    const { oldGroups, isLoading: oldGroupsLoading, error: oldGroupsError } = useOldGroups();
    const { data: attendance, isLoading: attendanceLoading, error: attendanceError } = useAttendance();

    const users = data?.users || [];
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
                // 'Total Viewers',
                'Total State Admins',
                'Total Region Admins',
                'Total Group Admins',
                'Total District Admins',
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
                // 'Total Viewers',
                'Total Region Admins',
                'Total Group Admins',
                'Total District Admins',
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
                // 'Total Viewers',
                // 'Total Region Admins',
                'Total Group Admins',
                'Total District Admins',
            ];
            return visibleForGroupAdmin.includes(label);
        }

        // District Admin - if needed, add similar logic
        if (hasRole('District Admin')) {
            const visibleForDistrictAdmin = [
                // 'Total Groups',
                // 'Total Old Groups',
                'Total Districts',
                'Total Youth Attendance',
                // 'Total Viewers',
                'Total District Admins',
                // 'Total Group Admins'
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

    // Permission map
    const requiredRolesByPath: Record<string, string[]> = {
        "/admin/states": ["Super Admin", "State Admin"],
        "/admin/regions": ["Super Admin", "State Admin", "Region Admin"],
        "/admin/old-groups": ["Super Admin", "State Admin", "Region Admin", "Group Admin"],
        "/admin/groups": ["Super Admin", "State Admin", "Region Admin", "Group Admin"],
        "/admin/districts": ["Super Admin", "State Admin", "Region Admin", "Group Admin", "District Admin"],
        "/admin/attendance": ["Super Admin", "State Admin", "Region Admin", "Group Admin", "District Admin"],
        "/admin/users": ["Super Admin", "admin"],
    }

    const canAccessPath = (path: string) => {
        const req = requiredRolesByPath[path] || []
        if (req.length === 0) return false
        for (const r of req) {
            if (hasRole(r)) return true
        }
        return false
    }

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

    const statsData = React.useMemo(() => {
        return allStatsData.map(stat => ({
            ...stat,
            restricted: !canAccessPath(stat.path),
            requiredPermission: (requiredRolesByPath[stat.path] || []).join(', ')
        }))
    }, [allStatsData]);

    const handleCardClick = (path: string, label: string, required: string) => {
        if (canAccessPath(path)) {
            navigate(path)
        } else {
            const payload = {
                timestamp: new Date().toISOString(),
                user_id: user?.id ?? null,
                action: `navigate:${path}:${label}`,
                required_permission: required,
            }
            adminApi.logSecurityAudit(payload)
            toaster.create({ description: `Access Restricted: Requires ${required}`, type: 'error', closable: true })
        }
    };

    type StatItem = {
        label: string
        value: number
        icon: React.ReactNode
        color: string
        description: string
        path: string
        loading?: boolean
        error?: string | null
        restricted?: boolean
        requiredPermission?: string
    }

    const StatCard = React.memo(({ item, onClick }: { item: StatItem, onClick: (path: string, label: string, required: string) => void }) => {
        const card = (
            <Card.Root
                height="full"
                variant="outline"
                rounded="xl"
                bg="bg"
                opacity={item.restricted ? 0.6 : 1}
                _hover={item.restricted ? {} : {
                    transform: "translateY(-2px)",
                    shadow: "md",
                    cursor: "pointer",
                    borderColor: `${item.color}.200`
                }}
                transition="all 0.2s"
                onClick={() => onClick(item.path, item.label, item.requiredPermission || '')}
            >
                <Card.Body>
                    <HStack justify="start" align="flex-start">
                        <Stat.Root>
                            {item.loading ? (
                                <>
                                    <Skeleton height="28px" width="64px" rounded="md" />
                                    {/* <Skeleton height="30px" width="110px" mt="4" rounded="md" /> */}
                                    <Stat.Label fontSize="sm" mt="1">{item.label}</Stat.Label>
                                    <Text fontSize="xs" mt="1">{item.description}</Text>
                                    {/* <Skeleton height="26px" width="120px" mt="6" rounded="md" /> */}
                                </>
                            ) : item.error ? (
                                <>
                                    <Stat.ValueText fontSize="md" fontWeight="bold" color="red.500">Error</Stat.ValueText>
                                    <Text fontSize="xs" mt="1" color="red.500">{item.error}</Text>
                                </>
                            ) : (
                                <>
                                    <Stat.ValueText fontSize="2xl" fontWeight="bold">{item.value}</Stat.ValueText>
                                    <Stat.Label fontSize="sm" mt="1">{item.label}</Stat.Label>
                                    <Text fontSize="xs" mt="1">{item.description}</Text>
                                </>
                            )}
                        </Stat.Root>

                        <HStack cursor={item.restricted ? 'not-allowed' : 'pointer'}>
                            <Box p="2" borderRadius="md" bg={`${item.color}/10`} color={`${item.color}`} flexShrink={0}>
                                {item.icon}
                            </Box>
                            <ArrowRight2 size="16" color="gray.400" />
                        </HStack>
                    </HStack>
                </Card.Body>
            </Card.Root>
        )
        if (item.restricted) {
            return (
                <CTooltip content={`Access Restricted: Requires ${item.requiredPermission}`}> {card} </CTooltip>
            )
        }
        return card
    })

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
                {statsData.map((stat, index) => {
                    const loadingMap: Record<string, boolean> = {
                        "Total States": !!statesLoading,
                        "Total Regions": !!regionsLoading,
                        "Total Old Groups": !!oldGroupsLoading,
                        "Total Groups": !!groupsLoading,
                        "Total Districts": !!districtsLoading,
                        "Total Youth Attendance": !!attendanceLoading,
                        "Total Super Admins": !!usersLoading,
                        "Total Admins": !!usersLoading,
                        "Total State Admins": !!usersLoading,
                        "Total Region Admins": !!usersLoading,
                        "Total District Admins": !!usersLoading,
                        "Total Group Admins": !!usersLoading,
                    }
                    const errorMap: Record<string, string | null> = {
                        "Total States": statesError ? "Failed to load states" : null,
                        "Total Regions": regionsError ? "Failed to load regions" : null,
                        "Total Old Groups": oldGroupsError ? "Failed to load old groups" : null,
                        "Total Groups": groupsError ? "Failed to load groups" : null,
                        "Total Districts": districtsError ? "Failed to load districts" : null,
                        "Total Youth Attendance": attendanceError ? "Failed to load attendance" : null,
                        "Total Super Admins": usersError ? "Failed to load users" : null,
                        "Total Admins": usersError ? "Failed to load users" : null,
                        "Total State Admins": usersError ? "Failed to load users" : null,
                        "Total Region Admins": usersError ? "Failed to load users" : null,
                        "Total District Admins": usersError ? "Failed to load users" : null,
                        "Total Group Admins": usersError ? "Failed to load users" : null,
                    }
                    const item: StatItem = { ...stat, loading: loadingMap[stat.label] || false, error: errorMap[stat.label] || null }
                    return <StatCard key={index} item={item} onClick={handleCardClick} />
                })}
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
