'use client';

import React from "react"

import ErrorFallback from "@/components/ErrorFallback";
import { ENV } from "@/config/env";
import { useQuery, useQueryErrorResetBoundary } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";
import { adminApi } from "@/api/admin.api";
import type { AttendanceMonitoring } from "@/types/attendance-monitoring.type";
import { VStack, Card, Heading, Text, IconButton, HStack, Button, Box, Grid, Spinner, Tabs } from "@chakra-ui/react";
import { ArrowLeft3 } from "iconsax-reactjs";
import { useMemo, useCallback, useState } from "react";
import { useNavigate } from "react-router";
import Reminder from "./components/Reminder";
import { useAuth } from "@/hooks/useAuth";
import { getCurrentMonthInfo } from "@/lib/calendar-utils";
import { generateDefaultersPDF, type DefaulterItem } from "@/lib/pdf-generator";
import DefaultersTable from "./components/DefaultersTable";

const AttendanceMonitoringPage: React.FC = () => {
    const { reset } = useQueryErrorResetBoundary();

    return (
        <>
            <title>Attendance Monitoring | {ENV.APP_NAME}</title>
            <meta
                name="description"
                content="Manage districts data"
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

export default AttendanceMonitoringPage;

const Content = () => {
    const { hasRole } = useAuth()
    const navigate = useNavigate()
    const { month, year } = getCurrentMonthInfo()
    const [isDownloading, setIsDownloading] = useState(false)
    const [activeTab, setActiveTab] = useState("0") // Changed to string for Tabs.Root
    const [reportType, setReportType] = useState<'defaulters' | 'full'>('defaulters')

    
    const { data, isLoading } = useQuery<AttendanceMonitoring>({
        queryKey: ["attendance-monitoring"],
        queryFn: adminApi.getAttendanceMonitoring,
        staleTime: 5 * 60 * 1000,
    });

    const monitoringData = data?.data; // This is the AttendanceMonitoringData object

// Collect ALL items for PDF generation (including green)
// Collect ALL items for PDF generation (including green)
const allDefaulters = useMemo(() => {
    if (!monitoringData) return []
    
    const defaulters: DefaulterItem[] = []
    
    const addItems = (items: any[], level: 'State' | 'Region' | 'District' | 'Group' | 'Old Group') => {
        items.forEach(item => {
            // Create the base defaulter item
            const defaulterItem: DefaulterItem = {
                id: item.id,
                name: item.name,
                level,
                status: item.status,
                lastFilledWeek: item.last_filled_week,
                weeksOwed: item.last_filled_week === 0 ? 4 : Math.max(0, 4 - item.last_filled_week),
            };
            
            // Add group information for districts
            if (level === 'District') {
                defaulterItem.groupName = item.group;
                defaulterItem.groupId = item.group_id;
            }
            
            defaulters.push(defaulterItem);
        })
    }
    
    // Only include districts
    addItems(monitoringData.districts ?? [], 'District')
    
    // console.log('Defaulters with group info:', defaulters); // Debug log
    return defaulters
}, [monitoringData])

// const allDefaulters = useMemo(() => {
//     if (!monitoringData) return []
    
//     const defaulters: DefaulterItem[] = []
    
//     const addItems = (items: any[], level: 'State' | 'Region' | 'District' | 'Group' | 'Old Group') => {
//         items.forEach(item => {
//             defaulters.push({
//                 id: item.id,
//                 name: item.name,
//                 level,
//                 status: item.status,
//                 lastFilledWeek: item.last_filled_week,
//                 weeksOwed: item.last_filled_week === 0 ? 4 : Math.max(0, 4 - item.last_filled_week),
//                 // Add group information
//                 groupName: item.group,
//                 groupId: item.group_id
//             })
//         })
//     }
    
//     // Only include districts
//     addItems(monitoringData.districts ?? [], 'District')
    
//     return defaulters
// }, [monitoringData])

// Keep a separate variable for ONLY defaulters (non-green) for UI counts if needed
const nonGreenCount = useMemo(() => {
    return allDefaulters.filter(d => d.status !== 'green').length
}, [allDefaulters])

 const defaultersCount = useMemo(() => {
        return allDefaulters.filter(d => d.status !== 'green').length
    }, [allDefaulters])

    // Calculate full count (all districts)
    const fullCount = useMemo(() => {
        return allDefaulters.length
    }, [allDefaulters])

    // Calculate summary statistics - ONLY for districts
const summary = useMemo(() => {
    if (!monitoringData) return { total: 0, submitted: 0, pending: 0 }
    
    const districts = monitoringData.districts ?? [];
    
    const pending = districts.filter(i => i.status === 'red' || i.status === 'orange' || i.status === 'yellow').length;
    const submitted = districts.filter(i => i.status === 'green').length;
    
    return {
        total: districts.length,
        submitted,
        pending,
    }
}, [monitoringData])

    // Group items by status and hierarchy
    const groupedItems = useMemo(() => {
        if (!monitoringData) {
            return {
                red: { states: [], regions: [], districts: [], groups: [], old_groups: [] },
                orange: { states: [], regions: [], districts: [], groups: [], old_groups: [] },
                yellow: { states: [], regions: [], districts: [], groups: [], old_groups: [] },
                green: { states: [], regions: [], districts: [], groups: [], old_groups: [] },
            }
        }
        
        return {
            red: {
                states: (monitoringData.states ?? []).filter((i) => i.status === 'red'),
                regions: (monitoringData.regions ?? []).filter((i) => i.status === 'red'),
                districts: (monitoringData.districts ?? []).filter((i) => i.status === 'red'),
                groups: (monitoringData.groups ?? []).filter((i) => i.status === 'red'),
                old_groups: (monitoringData.old_groups ?? []).filter((i) => i.status === 'red'),
            },
            orange: {
                states: (monitoringData.states ?? []).filter((i) => i.status === 'orange'),
                regions: (monitoringData.regions ?? []).filter((i) => i.status === 'orange'),
                districts: (monitoringData.districts ?? []).filter((i) => i.status === 'orange'),
                groups: (monitoringData.groups ?? []).filter((i) => i.status === 'orange'),
                old_groups: (monitoringData.old_groups ?? []).filter((i) => i.status === 'orange'),
            },
            yellow: {
                states: (monitoringData.states ?? []).filter((i) => i.status === 'yellow'),
                regions: (monitoringData.regions ?? []).filter((i) => i.status === 'yellow'),
                districts: (monitoringData.districts ?? []).filter((i) => i.status === 'yellow'),
                groups: (monitoringData.groups ?? []).filter((i) => i.status === 'yellow'),
                old_groups: (monitoringData.old_groups ?? []).filter((i) => i.status === 'yellow'),
            },
            green: {
                states: (monitoringData.states ?? []).filter((i) => i.status === 'green'),
                regions: (monitoringData.regions ?? []).filter((i) => i.status === 'green'),
                districts: (monitoringData.districts ?? []).filter((i) => i.status === 'green'),
                groups: (monitoringData.groups ?? []).filter((i) => i.status === 'green'),
                old_groups: (monitoringData.old_groups ?? []).filter((i) => i.status === 'green'),
            },
        }
    }, [monitoringData])


    const handleDownloadPDF = useCallback(() => {
        setIsDownloading(true)
        try {
            const dataToExport = reportType === 'defaulters' 
                ? allDefaulters.filter(d => d.status !== 'green')
                : allDefaulters
            
            generateDefaultersPDF(dataToExport)
        } catch (error) {
            console.error('Error generating PDF:', error)
        } finally {
            setIsDownloading(false)
        }
    }, [allDefaulters, reportType])

    // Check if user can view categories
    const canView = useCallback((hierarchy: string) => {
        if (hasRole('Super Admin')) return true
        if (hierarchy === 'State') return hasRole('Super Admin')
        if (hierarchy === 'Region') return hasRole('Super Admin') || hasRole('State Admin')
        if (hierarchy === 'District') return hasRole('Super Admin') || hasRole('State Admin') || hasRole('Region Admin') || hasRole('Group Admin')
        if (hierarchy === 'Group') return hasRole('Super Admin') || hasRole('State Admin') || hasRole('Region Admin')
        if (hierarchy === 'Old Group') return hasRole('Super Admin') || hasRole('State Admin') || hasRole('Region Admin')
        return false
    }, [hasRole])

     // Debug - log the actual data structure
    // console.log("Backend response:", data)
    // console.log("Monitoring data:", monitoringData)
    // console.log("Summary:", summary)
    // console.log("Grouped items:", groupedItems)

    return (
        <VStack gap="8" align="stretch" pb="8">
            {/* Header - Always visible */}
            <HStack justify="space-between" align="start">
                <VStack align="start" gap="2">
                    <HStack gap="3">
                        <IconButton
                            aria-label="Go back"
                            variant="outline"
                            rounded="xl"
                            onClick={() => navigate(-1)}
                            size="lg"
                        >
                            <ArrowLeft3 />
                        </IconButton>
                        <VStack align="start" gap="0">
                            <Heading size="2xl" color={{ base: "gray.800", _dark: "white" }}>
                                📊 Attendance Overview
                            </Heading>
                            <Text fontSize="lg" color={{ base: "gray.600", _dark: "gray.300" }}>
                                {month} {year}
                            </Text>
                        </VStack>
                    </HStack>
                </VStack>
            </HStack>

            {/* Tab Navigation */}
            <Tabs.Root 
                value={activeTab} 
                onValueChange={(details) => setActiveTab(details.value)}
                lazyMount
                unmountOnExit
            >
                <Tabs.List borderBottom="2px" borderColor={{ base: "gray.200", _dark: "gray.700" }} mb="6">
                    <Tabs.Trigger value="0" fontSize="lg" fontWeight="semibold">
                        Overview
                    </Tabs.Trigger>
                    <Tabs.Trigger value="1" fontSize="lg" fontWeight="semibold">
                        Defaulters Table
                    </Tabs.Trigger>
                    <Tabs.Indicator />
                </Tabs.List>

                {/* Tab 1: Overview Content */}
                <Tabs.Content value="0">
                    <VStack gap="8" align="stretch">
                        {/* Summary Cards */}
                        <Box>
                            <Heading size="md" mb="4" fontSize="xl">
                                Quick Summary
                            </Heading>
                            <Grid
                                templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }}
                                gap="4"
                            >
                                <Box p="6" bg="blue.100" rounded="lg" _dark={{ bg: "blue.900" }}>
                                    <Text fontSize="sm" fontWeight="bold" mb="2">Total Districts</Text>
                                    <Text fontSize="4xl" fontWeight="bold">{summary.total}</Text>
                                </Box>
                                <Box p="6" bg="green.100" rounded="lg" _dark={{ bg: "green.900" }}>
                                    <Text fontSize="sm" fontWeight="bold" mb="2">Submitted ✓</Text>
                                    <Text fontSize="4xl" fontWeight="bold">{summary.submitted}</Text>
                                </Box>
                                <Box p="6" bg="red.100" rounded="lg" _dark={{ bg: "red.900" }}>
                                    <Text fontSize="sm" fontWeight="bold" mb="2">Defaulting 🔴</Text>
                                    <Text fontSize="4xl" fontWeight="bold">{summary.pending}</Text>
                                </Box>
                            </Grid>
                        </Box>

                        {/* Reminder Section */}
                        <Card.Root p="0" bg="bg" border="1px" borderColor={{ base: "gray.200", _dark: "gray.700" }} rounded="xl">
                            <Card.Header>
                                <Heading size="lg" color={{ base: "gray.900", _dark: "white" }}>
                                    📢 Send Reminders
                                </Heading>
                                <Text color={{ base: "gray.600", _dark: "gray.400" }} mt={1}>
                                    Notify appropriate levels to submit attendance
                                </Text>
                            </Card.Header>
                            <Card.Body p="0">
                                <Reminder />
                            </Card.Body>
                        </Card.Root>

                        {/* Status Legend */}
                        <Box p="6" bg={{ base: "yellow.50", _dark: "yellow.900" }} rounded="lg" border="2px" borderColor="yellow.200" _dark={{ borderColor: "yellow.700" }}>
                            <Heading size="md" mb="4">📋 Status Guide</Heading>
                            <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap="4">
                                <VStack align="start" gap="2">
                                    <HStack gap="2">
                                        <Text fontSize="2xl">🟢</Text>
                                        <Text fontWeight="bold">Green - Up to Date</Text>
                                    </HStack>
                                    <Text fontSize="sm">Current on submissions</Text>
                                </VStack>
                                <VStack align="start" gap="2">
                                    <HStack gap="2">
                                        <Text fontSize="2xl">🟡</Text>
                                        <Text fontWeight="bold">Yellow - 1 Week Behind</Text>
                                    </HStack>
                                    <Text fontSize="sm">Missing 1 week of data</Text>
                                </VStack>
                                <VStack align="start" gap="2">
                                    <HStack gap="2">
                                        <Text fontSize="2xl">🟠</Text>
                                        <Text fontWeight="bold">Orange - 2 Weeks Behind</Text>
                                    </HStack>
                                    <Text fontSize="sm">Missing 2 weeks of data</Text>
                                </VStack>
                                <VStack align="start" gap="2">
                                    <HStack gap="2">
                                        <Text fontSize="2xl">🔴</Text>
                                        <Text fontWeight="bold">Red - No Submission</Text>
                                    </HStack>
                                    <Text fontSize="sm">No submission for full month</Text>
                                </VStack>
                            </Grid>
                        </Box>

                        {/* Loading or Empty State */}
                        {isLoading ? (
                            <Box textAlign="center" py="10">
                                <Spinner size="lg" mb="4" />
                                <Text fontSize="lg">Loading attendance data...</Text>
                            </Box>
                        ) : summary.total === 0 ? (
                            <Box textAlign="center" py="10" bg={{ base: "green.50", _dark: "green.900" }} rounded="lg">
                                <Text fontSize="2xl" fontWeight="bold" mb="2">
                                    ✓ All attendance is up to date!
                                </Text>
                                <Text color={{ base: "gray.600", _dark: "gray.400" }} fontSize="lg">
                                    No action needed at this time.
                                </Text>
                            </Box>
                        ) : (
                            <Text fontSize="lg" color={{ base: "gray.600", _dark: "gray.400" }} mb="6">
                                Showing summary of attendance status. Use the "Defaulters Table" tab for detailed list of items needing attention.
                            </Text>
                        )}
                    </VStack>
                </Tabs.Content>

                {/* Tab 2: Defaulters Table */}
                <Tabs.Content value="1">
                    <DefaultersTable
                        isLoading={isLoading}
                        groupedItems={groupedItems}
                        canView={canView}
                        allDefaultersCount={summary.total}
                        onDownload={handleDownloadPDF}
                        isDownloading={isDownloading}

                         // New props for report type selection
                        reportType={reportType}
                        setReportType={setReportType}
                        defaultersCount={defaultersCount}
                        fullCount={fullCount}
                    />
                </Tabs.Content>
            </Tabs.Root>
        </VStack>
    );
}













// 'use client';

// import React from "react"

// import ErrorFallback from "@/components/ErrorFallback";
// import { ENV } from "@/config/env";
// import { useQuery, useQueryErrorResetBoundary } from "@tanstack/react-query";
// import { ErrorBoundary } from "react-error-boundary";
// import { adminApi } from "@/api/admin.api";
// import type { AttendanceMonitoring } from "@/types/attendance-monitoring.type";
// import { VStack, Card, Heading, Text, Table, Badge, SimpleGrid, HoverCard, IconButton, Portal as ChakraPortal, HStack, Button, Box, Grid, Spinner, Tabs } from "@chakra-ui/react";
// import { ArrowLeft3 } from "iconsax-reactjs";
// import { useMemo, useCallback, useState } from "react";
// import { useNavigate } from "react-router";
// import Reminder from "./components/Reminder";
// import { Toaster } from "@/components/ui/toaster";
// import { useAuth } from "@/hooks/useAuth";
// import { getStatusBadge, getCurrentMonthInfo } from "@/lib/calendar-utils";
// import { generateDefaultersPDF, type DefaulterItem } from "@/lib/pdf-generator";
// import DefaultersTable from "./components/DefaultersTable";

// const AttendanceMonitoringPage: React.FC = () => {
//     const { reset } = useQueryErrorResetBoundary();

//     return (
//         <>
//             <title>Attendance Monitoring | {ENV.APP_NAME}</title>
//             <meta
//                 name="description"
//                 content="Manage districts data"
//             />
//             <ErrorBoundary
//                 onReset={reset}
//                 fallbackRender={({ resetErrorBoundary, error }) => (
//                     <ErrorFallback {...{ resetErrorBoundary, error }} />
//                 )}
//             >
//                 <Content />
//             </ErrorBoundary>
//         </>
//     );
// };

// export default AttendanceMonitoringPage;

// const Content = () => {
//     const { hasRole } = useAuth()
//     const navigate = useNavigate()
//     const { month, year } = getCurrentMonthInfo()
//     const [isDownloading, setIsDownloading] = useState(false)
//     const [activeTab, setActiveTab] = useState(0) // 0: Overview, 1: Defaulters Table
    
//     const { data, isLoading } = useQuery<AttendanceMonitoring>({
//         queryKey: ["attendance-monitoring"],
//         queryFn: adminApi.getAttendanceMonitoring,
//         staleTime: 5 * 60 * 1000,
//     });

//     // Collect all defaulters (red status) for PDF generation
//     const allDefaulters = useMemo(() => {
//         const d = data?.data
//         if (!d) return []
        
//         const defaulters: DefaulterItem[] = []
        
//         const addItems = (items: any[], level: 'State' | 'Region' | 'District' | 'Group' | 'Old Group') => {
//             items.forEach(item => {
//                 if (item.status === 'red') {
//                     defaulters.push({
//                         id: item.id,
//                         name: item.name,
//                         level,
//                         status: item.status,
//                         lastFilledWeek: item.last_filled_week,
//                         weeksOwed: Math.max(0, 4 - item.last_filled_week), // Simplified calculation
//                     })
//                 }
//             })
//         }
        
//         addItems(d.states ?? [], 'State')
//         addItems(d.regions ?? [], 'Region')
//         addItems(d.districts ?? [], 'District')
//         addItems(d.groups ?? [], 'Group')
//         addItems(d.old_groups ?? [], 'Old Group')
        
//         return defaulters
//     }, [data])

//     // Calculate summary statistics
//     const summary = useMemo(() => {
//         const d = data?.data
//         if (!d) return { total: 0, submitted: 0, pending: 0 }
        
//         const allItems = [
//             ...(d.states ?? []),
//             ...(d.regions ?? []),
//             ...(d.districts ?? []),
//             ...(d.groups ?? []),
//             ...(d.old_groups ?? []),
//         ]
        
//         const pending = allItems.filter(i => i.status === 'red').length
//         const submitted = allItems.filter(i => i.status !== 'red').length
        
//         return {
//             total: allItems.length,
//             submitted,
//             pending,
//         }
//     }, [data])

//     // Group items by status and hierarchy
//     const groupedItems = useMemo(() => {
//         const d = data?.data
//         return {
//             red: {
//                 states: (d?.states ?? []).filter((i) => i.status === 'red'),
//                 regions: (d?.regions ?? []).filter((i) => i.status === 'red'),
//                 districts: (d?.districts ?? []).filter((i) => i.status === 'red'),
//                 groups: (d?.groups ?? []).filter((i) => i.status === 'red'),
//                 old_groups: (d?.old_groups ?? []).filter((i) => i.status === 'red'),
//             },
//             orange: {
//                 states: (d?.states ?? []).filter((i) => i.status === 'orange'),
//                 regions: (d?.regions ?? []).filter((i) => i.status === 'orange'),
//                 districts: (d?.districts ?? []).filter((i) => i.status === 'orange'),
//                 groups: (d?.groups ?? []).filter((i) => i.status === 'orange'),
//                 old_groups: (d?.old_groups ?? []).filter((i) => i.status === 'orange'),
//             },
//             yellow: {
//                 states: (d?.states ?? []).filter((i) => i.status === 'yellow'),
//                 regions: (d?.regions ?? []).filter((i) => i.status === 'yellow'),
//                 districts: (d?.districts ?? []).filter((i) => i.status === 'yellow'),
//                 groups: (d?.groups ?? []).filter((i) => i.status === 'yellow'),
//                 old_groups: (d?.old_groups ?? []).filter((i) => i.status === 'yellow'),
//             },
//             green: {
//                 states: (d?.states ?? []).filter((i) => i.status === 'green'),
//                 regions: (d?.regions ?? []).filter((i) => i.status === 'green'),
//                 districts: (d?.districts ?? []).filter((i) => i.status === 'green'),
//                 groups: (d?.groups ?? []).filter((i) => i.status === 'green'),
//                 old_groups: (d?.old_groups ?? []).filter((i) => i.status === 'green'),
//             },
//         }
//     }, [data])

//     const handleDownloadPDF = useCallback(() => {
//         setIsDownloading(true)
//         try {
//             generateDefaultersPDF(allDefaulters)
//         } catch (error) {
//             console.error('Error generating PDF:', error)
//         } finally {
//             setIsDownloading(false)
//         }
//     }, [allDefaulters])

//     // Check if user can view categories
//     const canView = useCallback((hierarchy: string) => {
//         if (hasRole('Super Admin')) return true
//         if (hierarchy === 'State') return hasRole('Super Admin')
//         if (hierarchy === 'Region') return hasRole('Super Admin') || hasRole('State Admin')
//         if (hierarchy === 'District') return hasRole('Super Admin') || hasRole('State Admin') || hasRole('Region Admin') || hasRole('Group Admin')
//         if (hierarchy === 'Group') return hasRole('Super Admin') || hasRole('State Admin') || hasRole('Region Admin')
//         if (hierarchy === 'Old Group') return hasRole('Super Admin') || hasRole('State Admin') || hasRole('Region Admin')
//         return false
//     }, [hasRole])

//     return (
//         <>
//             <VStack gap="8" align="stretch" pb="8">
//                 {/* Header */}
//                 <HStack justify="space-between" align="start">
//                     <VStack align="start" gap="2">
//                         <HStack gap="3">
//                             <IconButton
//                                 aria-label="Go back"
//                                 variant="outline"
//                                 rounded="xl"
//                                 onClick={() => navigate(-1)}
//                                 size="lg"
//                             >
//                                 <ArrowLeft3 />
//                             </IconButton>
//                             <VStack align="start" gap="0">
//                                 <Heading size="2xl" color={{ base: "gray.800", _dark: "white" }}>
//                                     📊 Attendance Overview
//                                 </Heading>
//                                 <Text fontSize="lg" color={{ base: "gray.600", _dark: "gray.300" }}>
//                                     {month} {year}
//                                 </Text>
//                             </VStack>
//                         </HStack>
//                     </VStack>
//                 </HStack>

//                 {/* Summary Cards */}
//                 <Box>

//                       {/* Tab Navigation */}
//                 <Tabs.Root
//   value={String(activeTab)}
//   onValueChange={(details) => setActiveTab(parseInt(details.value))}
// >

//                     <Tabs.List borderBottom="2px" borderColor={{ base: "gray.200", _dark: "gray.700" }} mb="6">
//                         <Tabs.Trigger value="0" fontSize="lg" fontWeight="semibold">
//                             Overview
//                         </Tabs.Trigger>
//                         <Tabs.Trigger value="1" fontSize="lg" fontWeight="semibold">
//                             Defaulters Table
//                         </Tabs.Trigger>
//                     </Tabs.List>

//                     {/* Tab 1: Overview */}
//                     <Tabs.Content value="0">
//                         {isLoading ? (
//                             <Box textAlign="center" py="10">
//                                 <Spinner size="lg" mb="4" />
//                                 <Text fontSize="lg">Loading attendance data...</Text>
//                             </Box>
//                         ) : (
//                             <>
//                                 {summary.total === 0 ? (
//                                     <Box textAlign="center" py="10" bg={{ base: "green.50", _dark: "green.900" }} rounded="lg">
//                                         <Text fontSize="2xl" fontWeight="bold" mb="2">
//                                             ✓ All attendance is up to date!
//                                         </Text>
//                                         <Text color={{ base: "gray.600", _dark: "gray.400" }} fontSize="lg">
//                                             No action needed at this time.
//                                         </Text>
//                                     </Box>
//                                 ) : (
//                                     <Text fontSize="lg" color={{ base: "gray.600", _dark: "gray.400" }} mb="6">
//                                         Showing summary of attendance status. Use the "Defaulters Table" tab for detailed list of items needing attention.
//                                     </Text>
//                                 )}
//                             </>
//                         )}
//                     </Tabs.Content>

//                     {/* Tab 2: Defaulters Table */}
//                     <Tabs.Content value="1">
//                         <DefaultersTable
//                             isLoading={isLoading}
//                             groupedItems={groupedItems}
//                             canView={canView}
//                             allDefaultersCount={summary.total}
//                             onDownload={handleDownloadPDF}
//                             isDownloading={isDownloading}
//                         />
//                     </Tabs.Content>
//                 </Tabs.Root>
//                     <Heading size="md" mb="4" fontSize="xl">
//                         Quick Summary
//                     </Heading>
//                     <Grid
//                         templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }}
//                         gap="4"
//                     >
//                         <Box p="6" bg="blue.100" rounded="lg" _dark={{ bg: "blue.900" }}>
//                             <Text fontSize="sm" fontWeight="bold" mb="2">Total Levels</Text>
//                             <Text fontSize="4xl" fontWeight="bold">{summary.total}</Text>
//                         </Box>
//                         <Box p="6" bg="green.100" rounded="lg" _dark={{ bg: "green.900" }}>
//                             <Text fontSize="sm" fontWeight="bold" mb="2">Submitted ✓</Text>
//                             <Text fontSize="4xl" fontWeight="bold">{summary.submitted}</Text>
//                         </Box>
//                         <Box p="6" bg="red.100" rounded="lg" _dark={{ bg: "red.900" }}>
//                             <Text fontSize="sm" fontWeight="bold" mb="2">Defaulting 🔴</Text>
//                             <Text fontSize="4xl" fontWeight="bold">{summary.pending}</Text>
//                         </Box>
//                     </Grid>
//                 </Box>

//                 {/* Reminder Section */}
//                 <Card.Root p="0" bg="bg" border="1px" borderColor={{ base: "gray.200", _dark: "gray.700" }} rounded="xl">
//                     <Card.Header>
//                         <Heading size="lg" color={{ base: "gray.900", _dark: "white" }}>
//                             📢 Send Reminders
//                         </Heading>
//                         <Text color={{ base: "gray.600", _dark: "gray.400" }} mt={1}>
//                             Notify appropriate levels to submit attendance
//                         </Text>
//                     </Card.Header>
//                     <Card.Body p="0">
//                         <Reminder />
//                     </Card.Body>
//                 </Card.Root>

//                 {/* Status Legend */}
//                 <Box p="6" bg={{ base: "yellow.50", _dark: "yellow.900" }} rounded="lg" border="2px" borderColor="yellow.200" _dark={{ borderColor: "yellow.700" }}>
//                     <Heading size="md" mb="4">📋 Status Guide</Heading>
//                     <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap="4">
//                         <VStack align="start" gap="2">
//                             <HStack gap="2">
//                                 <Text fontSize="2xl">🟢</Text>
//                                 <Text fontWeight="bold">Green - Up to Date</Text>
//                             </HStack>
//                             <Text fontSize="sm">Current on submissions</Text>
//                         </VStack>
//                         <VStack align="start" gap="2">
//                             <HStack gap="2">
//                                 <Text fontSize="2xl">🟡</Text>
//                                 <Text fontWeight="bold">Yellow - 1 Week Behind</Text>
//                             </HStack>
//                             <Text fontSize="sm">Missing 1 week of data</Text>
//                         </VStack>
//                         <VStack align="start" gap="2">
//                             <HStack gap="2">
//                                 <Text fontSize="2xl">🟠</Text>
//                                 <Text fontWeight="bold">Orange - 2 Weeks Behind</Text>
//                             </HStack>
//                             <Text fontSize="sm">Missing 2 weeks of data</Text>
//                         </VStack>
//                         <VStack align="start" gap="2">
//                             <HStack gap="2">
//                                 <Text fontSize="2xl">🔴</Text>
//                                 <Text fontWeight="bold">Red - No Submission</Text>
//                             </HStack>
//                             <Text fontSize="sm">No submission for full month</Text>
//                         </VStack>
//                     </Grid>
//                 </Box>

              
//             </VStack>

//             {/* <Toaster /> */}
//         </>
//     );
// }














// import ErrorFallback from "@/components/ErrorFallback";
// import { ENV } from "@/config/env";
// import { useQuery, useQueryErrorResetBoundary } from "@tanstack/react-query";
// import { ErrorBoundary } from "react-error-boundary";
// import { adminApi } from "@/api/admin.api";
// import type { AttendanceMonitoring } from "@/types/attendance-monitoring.type";
// import { VStack, Card, Heading, Text, Table, Badge, SimpleGrid, HoverCard, IconButton, Portal as ChakraPortal, HStack } from "@chakra-ui/react";
// import { ArrowLeft3, Eye } from "iconsax-reactjs";
// import { useMemo, useCallback } from "react";
// import { useNavigate } from "react-router";
// import Reminder from "./components/Reminder";
// import { Toaster } from "@/components/ui/toaster";
// import { useAuth } from "@/hooks/useAuth";

// const AttendanceMonitoringPage: React.FC = () => {
//     const { reset } = useQueryErrorResetBoundary();

//     return (
//         <>
//             <title>Attendance Monitoring | {ENV.APP_NAME}</title>
//             <meta
//                 name="description"
//                 content="Manage districts data"
//             />
//             <ErrorBoundary
//                 onReset={reset}
//                 fallbackRender={({ resetErrorBoundary, error }) => (
//                     <ErrorFallback {...{ resetErrorBoundary, error }} />
//                 )}
//             >
//                 <Content />
//             </ErrorBoundary>
//         </>
//     );
// };

// export default AttendanceMonitoringPage;

// const Content = () => {
//     const { hasRole } = useAuth()
//     const navigate = useNavigate()
//     const { data, isLoading } = useQuery<AttendanceMonitoring>({
//         queryKey: ["attendance-monitoring"],
//         queryFn: adminApi.getAttendanceMonitoring,
//         staleTime: 5 * 60 * 1000,
//     });

//     console.log(data)

//     const pending = useMemo(() => {
//         const d = data?.data
//         return {
//             states: (d?.states ?? []).filter((i) => i.status === 'red'),
//             regions: (d?.regions ?? []).filter((i) => i.status === 'red'),
//             districts: (d?.districts ?? []).filter((i) => i.status === 'red'),
//             groups: (d?.groups ?? []).filter((i) => i.status === 'red'),
//             old_groups: (d?.old_groups ?? []).filter((i) => i.status === 'red'),
//         }
//     }, [data])

//     const submitted = useMemo(() => {
//         const d = data?.data
//         const notRed = (i: { status: 'red' | 'yellow' | 'green' }) => i.status !== 'red'
//         return {
//             states: (d?.states ?? []).filter(notRed),
//             regions: (d?.regions ?? []).filter(notRed),
//             districts: (d?.districts ?? []).filter(notRed),
//             groups: (d?.groups ?? []).filter(notRed),
//             old_groups: (d?.old_groups ?? []).filter(notRed),
//         }
//     }, [data])

//     const renderItemHover = useCallback((title: string, items: { id: number; name: string; status: 'red' | 'yellow' | 'green'; last_filled_week: number }[]) => (
//         <HoverCard.Root openDelay={300} closeDelay={300} positioning={{ placement: 'top' }}>
//             <HoverCard.Trigger asChild>
//                 <IconButton aria-label={`View ${title}`} size="sm" variant="ghost" rounded="md">
//                     <Eye />
//                 </IconButton>
//             </HoverCard.Trigger>
//             <ChakraPortal>
//                 <HoverCard.Positioner>
//                     <HoverCard.Content rounded="md" p="3" bg="bg" borderWidth="1px" minW={{ base: "xs", md: "sm" }} maxW="xs">
//                         <Heading size="sm" mb="2">{title}</Heading>
//                         <VStack align="start" gap="2" maxH="40" overflowY="auto">
//                             {items.map((it) => (
//                                 <HStack key={it.id} justify="space-between" w="full">
//                                     <Text fontSize="sm" wordBreak="break-word" flex="1">{it.name}</Text>
//                                     <Badge colorPalette={it.status === 'red' ? 'red' : (it.status === 'yellow' ? 'yellow' : 'green')} flexShrink={0}>
//                                         week {it.last_filled_week}
//                                     </Badge>
//                                 </HStack>
//                             ))}
//                             {items.length === 0 && (
//                                 <Text color="gray.500" fontSize="sm">No items</Text>
//                             )}
//                         </VStack>
//                     </HoverCard.Content>
//                 </HoverCard.Positioner>
//             </ChakraPortal>
//         </HoverCard.Root>
//     ), [])

//     const renderRows = useCallback((section: {
//         states: { id: number; name: string; status: 'red' | 'yellow' | 'green'; last_filled_week: number }[];
//         regions: { id: number; name: string; status: 'red' | 'yellow' | 'green'; last_filled_week: number }[];
//         districts: { id: number; name: string; status: 'red' | 'yellow' | 'green'; last_filled_week: number }[];
//         groups: { id: number; name: string; status: 'red' | 'yellow' | 'green'; last_filled_week: number }[];
//         old_groups: { id: number; name: string; status: 'red' | 'yellow' | 'green'; last_filled_week: number }[];
//     }) => {
//         const showStates = hasRole('Super Admin')
//         const showRegions = hasRole('Super Admin') || hasRole('State Admin')
//         const showDistricts = hasRole('Super Admin') || hasRole('State Admin') || hasRole('Region Admin') || hasRole('Group Admin')
//         const showGroups = hasRole('Super Admin') || hasRole('State Admin') || hasRole('Region Admin')
//         const showOldGroups = hasRole('Super Admin') || hasRole('State Admin') || hasRole('Region Admin')

//         return (
//             <>
//                 {showStates && (
//                     <Table.Row>
//                         <Table.Cell fontWeight="medium">States</Table.Cell>
//                         <Table.Cell>{section.states.length}</Table.Cell>
//                         <Table.Cell>
//                             {renderItemHover('States', section.states)}
//                         </Table.Cell>
//                     </Table.Row>
//                 )}
//                 {showRegions && (
//                     <Table.Row>
//                         <Table.Cell fontWeight="medium">Regions</Table.Cell>
//                         <Table.Cell>{section.regions.length}</Table.Cell>
//                         <Table.Cell>
//                             {renderItemHover('Regions', section.regions)}
//                         </Table.Cell>
//                     </Table.Row>
//                 )}
//                 {showDistricts && (
//                     <Table.Row>
//                         <Table.Cell fontWeight="medium">Districts</Table.Cell>
//                         <Table.Cell>{section.districts.length}</Table.Cell>
//                         <Table.Cell>
//                             {renderItemHover('Districts', section.districts)}
//                         </Table.Cell>
//                     </Table.Row>
//                 )}
//                 {showGroups && (
//                     <Table.Row>
//                         <Table.Cell fontWeight="medium">Groups</Table.Cell>
//                         <Table.Cell>{section.groups.length}</Table.Cell>
//                         <Table.Cell>
//                             {renderItemHover('Groups', section.groups)}
//                         </Table.Cell>
//                     </Table.Row>
//                 )}
//                 {showOldGroups && (
//                     <Table.Row>
//                         <Table.Cell fontWeight="medium">Old Groups</Table.Cell>
//                         <Table.Cell>{section.old_groups.length}</Table.Cell>
//                         <Table.Cell>
//                             {renderItemHover('Old Groups', section.old_groups)}
//                         </Table.Cell>
//                     </Table.Row>
//                 )}
//             </>
//         )
//     }, [renderItemHover, hasRole])

//     return (
//         <>
//             <VStack gap="6" align="stretch">
//                 <HStack justify="space-between">
//                     <HStack gap="3">
//                         <IconButton aria-label="Go back" variant="outline" rounded="xl" onClick={() => navigate(-1)}>
//                             <ArrowLeft3 />
//                         </IconButton>
//                         <Heading size="2xl" color={{ base: "gray.800", _dark: "white" }}>Attendance Monitoring</Heading>
//                     </HStack>
//                 </HStack>
//                 <Text color={{ base: "gray.600", _dark: "gray.300" }}>Overview of pending and submitted attendance by hierarchy</Text>

//                 <Card.Root p="0" bg="bg" border="1px" borderColor={{ base: "gray.200", _dark: "gray.700" }} rounded="xl">
//                     <Card.Header>
//                         <Heading size="lg" color={{ base: "gray.900", _dark: "white" }}>Send Reminders</Heading>
//                         <Text color={{ base: "gray.600", _dark: "gray.400" }} mt={1}>Notify appropriate levels based on your role</Text>
//                     </Card.Header>
//                     <Card.Body p="0">
//                         <Reminder />
//                     </Card.Body>
//                 </Card.Root>

//                 <VStack gap={{ base: 4, md: 6 }} flexDir={{ base: "column", md: "row" }}>
//                     <Card.Root bg="bg" border="1px" borderColor={{ base: "gray.200", _dark: "gray.700" }} rounded="xl" w={{ base: "full", md: "full" }} ml={{ base: "-16px", md: "0" }} mr={{ base: "-16px", md: "0" }} >
//                         <Card.Header>
//                             <Heading size="lg" color={{ base: "gray.900", _dark: "white" }}>Pending</Heading>
//                             <Text color={{ base: "gray.600", _dark: "gray.400" }} mt={1}>Awaiting submission at visible levels</Text>
//                         </Card.Header>
//                         <Card.Body>
//                             <Table.Root rounded="md" overflow="hidden" variant="outline" size="sm">
//                                 <Table.Header>
//                                     <Table.Row>
//                                         <Table.ColumnHeader>Category</Table.ColumnHeader>
//                                         <Table.ColumnHeader>Count</Table.ColumnHeader>
//                                         <Table.ColumnHeader>Items</Table.ColumnHeader>
//                                     </Table.Row>
//                                 </Table.Header>
//                                 <Table.Body>
//                                     {isLoading ? renderRows({ states: [], regions: [], districts: [], groups: [], old_groups: [] }) : renderRows(pending)}
//                                 </Table.Body>
//                             </Table.Root>
//                         </Card.Body>
//                     </Card.Root>

//                     <Card.Root bg="bg" border="1px" borderColor={{ base: "gray.200", _dark: "gray.700" }} rounded="xl" w={{ base: "full", md: "full" }} ml={{ base: "-16px", md: "0" }} mr={{ base: "-16px", md: "0" }}>
//                         <Card.Header>
//                             <Heading size="lg" color={{ base: "gray.900", _dark: "white" }}>Submitted</Heading>
//                             <Text color={{ base: "gray.600", _dark: "gray.400" }} mt={1}>Received submissions at visible levels</Text>
//                         </Card.Header>
//                         <Card.Body>
//                             <Table.Root rounded="md" overflow="hidden" variant="outline" size="sm">
//                                 <Table.Header>
//                                     <Table.Row>
//                                         <Table.ColumnHeader>Category</Table.ColumnHeader>
//                                         <Table.ColumnHeader>Count</Table.ColumnHeader>
//                                         <Table.ColumnHeader>Items</Table.ColumnHeader>
//                                     </Table.Row>
//                                 </Table.Header>
//                                 <Table.Body>
//                                     {isLoading ? renderRows({ states: [], regions: [], districts: [], groups: [], old_groups: [] }) : renderRows(submitted)}
//                                 </Table.Body>
//                             </Table.Root>
//                         </Card.Body>
//                     </Card.Root>
//                 </VStack>
//             </VStack>
            
//             {/* <Toaster /> */}
//         </>
//     );
// }
