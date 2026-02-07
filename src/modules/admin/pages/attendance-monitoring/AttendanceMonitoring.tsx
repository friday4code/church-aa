import ErrorFallback from "@/components/ErrorFallback";
import { ENV } from "@/config/env";
import { useQuery, useQueryErrorResetBoundary } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";
import { adminApi } from "@/api/admin.api";
import type { AttendanceMonitoring } from "@/types/attendance-monitoring.type";
import { VStack, Card, Heading, Text, Table, Badge, SimpleGrid, HoverCard, IconButton, Portal as ChakraPortal, HStack } from "@chakra-ui/react";
import { ArrowLeft3, Eye } from "iconsax-reactjs";
import { useMemo, useCallback } from "react";
import { useNavigate } from "react-router";
import Reminder from "./components/Reminder";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "@/hooks/useAuth";

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
    const { data, isLoading } = useQuery<AttendanceMonitoring>({
        queryKey: ["attendance-monitoring"],
        queryFn: adminApi.getAttendanceMonitoring,
        staleTime: 5 * 60 * 1000,
    });

    console.log(data)

    const pending = useMemo(() => {
        const d = data?.data
        return {
            states: (d?.states ?? []).filter((i) => i.status === 'red'),
            regions: (d?.regions ?? []).filter((i) => i.status === 'red'),
            districts: (d?.districts ?? []).filter((i) => i.status === 'red'),
            groups: (d?.groups ?? []).filter((i) => i.status === 'red'),
            old_groups: (d?.old_groups ?? []).filter((i) => i.status === 'red'),
        }
    }, [data])

    const submitted = useMemo(() => {
        const d = data?.data
        const notRed = (i: { status: 'red' | 'yellow' | 'green' }) => i.status !== 'red'
        return {
            states: (d?.states ?? []).filter(notRed),
            regions: (d?.regions ?? []).filter(notRed),
            districts: (d?.districts ?? []).filter(notRed),
            groups: (d?.groups ?? []).filter(notRed),
            old_groups: (d?.old_groups ?? []).filter(notRed),
        }
    }, [data])

    const renderItemHover = useCallback((title: string, items: { id: number; name: string; status: 'red' | 'yellow' | 'green'; last_filled_week: number }[]) => (
        <HoverCard.Root openDelay={300} closeDelay={300} positioning={{ placement: 'top' }}>
            <HoverCard.Trigger asChild>
                <IconButton aria-label={`View ${title}`} size="sm" variant="ghost" rounded="md">
                    <Eye />
                </IconButton>
            </HoverCard.Trigger>
            <ChakraPortal>
                <HoverCard.Positioner>
                    <HoverCard.Content rounded="md" p="3" bg="bg" borderWidth="1px" minW={{ base: "xs", md: "sm" }} maxW="xs">
                        <Heading size="sm" mb="2">{title}</Heading>
                        <VStack align="start" gap="2" maxH="40" overflowY="auto">
                            {items.map((it) => (
                                <HStack key={it.id} justify="space-between" w="full">
                                    <Text fontSize="sm" wordBreak="break-word" flex="1">{it.name}</Text>
                                    <Badge colorPalette={it.status === 'red' ? 'red' : (it.status === 'yellow' ? 'yellow' : 'green')} flexShrink={0}>
                                        week {it.last_filled_week}
                                    </Badge>
                                </HStack>
                            ))}
                            {items.length === 0 && (
                                <Text color="gray.500" fontSize="sm">No items</Text>
                            )}
                        </VStack>
                    </HoverCard.Content>
                </HoverCard.Positioner>
            </ChakraPortal>
        </HoverCard.Root>
    ), [])

    const renderRows = useCallback((section: {
        states: { id: number; name: string; status: 'red' | 'yellow' | 'green'; last_filled_week: number }[];
        regions: { id: number; name: string; status: 'red' | 'yellow' | 'green'; last_filled_week: number }[];
        districts: { id: number; name: string; status: 'red' | 'yellow' | 'green'; last_filled_week: number }[];
        groups: { id: number; name: string; status: 'red' | 'yellow' | 'green'; last_filled_week: number }[];
        old_groups: { id: number; name: string; status: 'red' | 'yellow' | 'green'; last_filled_week: number }[];
    }) => {
        const showStates = hasRole('Super Admin')
        const showRegions = hasRole('Super Admin') || hasRole('State Admin')
        const showDistricts = hasRole('Super Admin') || hasRole('State Admin') || hasRole('Region Admin') || hasRole('Group Admin')
        const showGroups = hasRole('Super Admin') || hasRole('State Admin') || hasRole('Region Admin')
        const showOldGroups = hasRole('Super Admin') || hasRole('State Admin') || hasRole('Region Admin')

        return (
            <>
                {showStates && (
                    <Table.Row>
                        <Table.Cell fontWeight="medium">States</Table.Cell>
                        <Table.Cell>{section.states.length}</Table.Cell>
                        <Table.Cell>
                            {renderItemHover('States', section.states)}
                        </Table.Cell>
                    </Table.Row>
                )}
                {showRegions && (
                    <Table.Row>
                        <Table.Cell fontWeight="medium">Regions</Table.Cell>
                        <Table.Cell>{section.regions.length}</Table.Cell>
                        <Table.Cell>
                            {renderItemHover('Regions', section.regions)}
                        </Table.Cell>
                    </Table.Row>
                )}
                {showDistricts && (
                    <Table.Row>
                        <Table.Cell fontWeight="medium">Districts</Table.Cell>
                        <Table.Cell>{section.districts.length}</Table.Cell>
                        <Table.Cell>
                            {renderItemHover('Districts', section.districts)}
                        </Table.Cell>
                    </Table.Row>
                )}
                {showGroups && (
                    <Table.Row>
                        <Table.Cell fontWeight="medium">Groups</Table.Cell>
                        <Table.Cell>{section.groups.length}</Table.Cell>
                        <Table.Cell>
                            {renderItemHover('Groups', section.groups)}
                        </Table.Cell>
                    </Table.Row>
                )}
                {showOldGroups && (
                    <Table.Row>
                        <Table.Cell fontWeight="medium">Old Groups</Table.Cell>
                        <Table.Cell>{section.old_groups.length}</Table.Cell>
                        <Table.Cell>
                            {renderItemHover('Old Groups', section.old_groups)}
                        </Table.Cell>
                    </Table.Row>
                )}
            </>
        )
    }, [renderItemHover, hasRole])

    return (
        <>
            <VStack gap="6" align="stretch">
                <HStack justify="space-between">
                    <HStack gap="3">
                        <IconButton aria-label="Go back" variant="outline" rounded="xl" onClick={() => navigate(-1)}>
                            <ArrowLeft3 />
                        </IconButton>
                        <Heading size="2xl" color={{ base: "gray.800", _dark: "white" }}>Attendance Monitoring</Heading>
                    </HStack>
                </HStack>
                <Text color={{ base: "gray.600", _dark: "gray.300" }}>Overview of pending and submitted attendance by hierarchy</Text>

                <Card.Root p="0" bg="bg" border="1px" borderColor={{ base: "gray.200", _dark: "gray.700" }} rounded="xl">
                    <Card.Header>
                        <Heading size="lg" color={{ base: "gray.900", _dark: "white" }}>Send Reminders</Heading>
                        <Text color={{ base: "gray.600", _dark: "gray.400" }} mt={1}>Notify appropriate levels based on your role</Text>
                    </Card.Header>
                    <Card.Body p="0">
                        <Reminder />
                    </Card.Body>
                </Card.Root>

                <VStack gap={{ base: 4, md: 6 }} flexDir={{ base: "column", md: "row" }}>
                    <Card.Root bg="bg" border="1px" borderColor={{ base: "gray.200", _dark: "gray.700" }} rounded="xl" w={{ base: "full", md: "full" }} ml={{ base: "-16px", md: "0" }} mr={{ base: "-16px", md: "0" }} >
                        <Card.Header>
                            <Heading size="lg" color={{ base: "gray.900", _dark: "white" }}>Pending</Heading>
                            <Text color={{ base: "gray.600", _dark: "gray.400" }} mt={1}>Awaiting submission at visible levels</Text>
                        </Card.Header>
                        <Card.Body>
                            <Table.Root rounded="md" overflow="hidden" variant="outline" size="sm">
                                <Table.Header>
                                    <Table.Row>
                                        <Table.ColumnHeader>Category</Table.ColumnHeader>
                                        <Table.ColumnHeader>Count</Table.ColumnHeader>
                                        <Table.ColumnHeader>Items</Table.ColumnHeader>
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                    {isLoading ? renderRows({ states: [], regions: [], districts: [], groups: [], old_groups: [] }) : renderRows(pending)}
                                </Table.Body>
                            </Table.Root>
                        </Card.Body>
                    </Card.Root>

                    <Card.Root bg="bg" border="1px" borderColor={{ base: "gray.200", _dark: "gray.700" }} rounded="xl" w={{ base: "full", md: "full" }} ml={{ base: "-16px", md: "0" }} mr={{ base: "-16px", md: "0" }}>
                        <Card.Header>
                            <Heading size="lg" color={{ base: "gray.900", _dark: "white" }}>Submitted</Heading>
                            <Text color={{ base: "gray.600", _dark: "gray.400" }} mt={1}>Received submissions at visible levels</Text>
                        </Card.Header>
                        <Card.Body>
                            <Table.Root rounded="md" overflow="hidden" variant="outline" size="sm">
                                <Table.Header>
                                    <Table.Row>
                                        <Table.ColumnHeader>Category</Table.ColumnHeader>
                                        <Table.ColumnHeader>Count</Table.ColumnHeader>
                                        <Table.ColumnHeader>Items</Table.ColumnHeader>
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                    {isLoading ? renderRows({ states: [], regions: [], districts: [], groups: [], old_groups: [] }) : renderRows(submitted)}
                                </Table.Body>
                            </Table.Root>
                        </Card.Body>
                    </Card.Root>
                </VStack>
            </VStack>
            
            {/* <Toaster /> */}
        </>
    );
}
