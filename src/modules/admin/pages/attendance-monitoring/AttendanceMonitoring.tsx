import ErrorFallback from "@/components/ErrorFallback";
import { ENV } from "@/config/env";
import { useQuery, useQueryErrorResetBoundary } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";
import { adminApi } from "@/api/admin.api";
import type { AttendanceMonitoring } from "@/types/attendance-monitoring.type";
import { VStack, Card, Heading, Text, Table, Badge, SimpleGrid } from "@chakra-ui/react";
import Reminder from "./components/Reminder";
import { Toaster } from "@/components/ui/toaster";

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
    const { data, isLoading } = useQuery<AttendanceMonitoring>({
        queryKey: ["attendance-monitoring"],
        queryFn: adminApi.getAttendanceMonitoring,
        staleTime: 5 * 60 * 1000,
    });

    const pending = data?.pending || { states: [], regions: [], districts: [], groups: [] };
    const submitted = data?.submitted || { states: [], regions: [], districts: [], groups: [] };

    const renderRows = (section: { states: string[]; regions: string[]; districts: string[]; groups: string[] }) => (
        <>
            <Table.Row>
                <Table.Cell fontWeight="medium">States</Table.Cell>
                <Table.Cell>{section.states.length}</Table.Cell>
                <Table.Cell>
                    <VStack align="start" gap="2">
                        {section.states.map((s) => (
                            <Badge key={s} variant="subtle" colorPalette="blue">{s}</Badge>
                        ))}
                    </VStack>
                </Table.Cell>
            </Table.Row>
            <Table.Row>
                <Table.Cell fontWeight="medium">Regions</Table.Cell>
                <Table.Cell>{section.regions.length}</Table.Cell>
                <Table.Cell>
                    <VStack align="start" gap="2">
                        {section.regions.map((r) => (
                            <Badge key={r} variant="subtle" colorPalette="green">{r}</Badge>
                        ))}
                    </VStack>
                </Table.Cell>
            </Table.Row>
            <Table.Row>
                <Table.Cell fontWeight="medium">Districts</Table.Cell>
                <Table.Cell>{section.districts.length}</Table.Cell>
                <Table.Cell>
                    <VStack align="start" gap="2">
                        {section.districts.map((d) => (
                            <Badge key={d} variant="subtle" colorPalette="purple">{d}</Badge>
                        ))}
                    </VStack>
                </Table.Cell>
            </Table.Row>
            <Table.Row>
                <Table.Cell fontWeight="medium">Groups</Table.Cell>
                <Table.Cell>{section.groups.length}</Table.Cell>
                <Table.Cell>
                    <VStack align="start" gap="2">
                        {section.groups.map((g) => (
                            <Badge key={g} variant="subtle" colorPalette="orange">{g}</Badge>
                        ))}
                    </VStack>
                </Table.Cell>
            </Table.Row>
        </>
    );

    return (
        <>
            <VStack gap="6" align="stretch">
                <Heading size="2xl" color={{ base: "gray.800", _dark: "white" }}>Attendance Monitoring</Heading>
                <Text color={{ base: "gray.600", _dark: "gray.300" }}>Overview of pending and submitted attendance by hierarchy</Text>

                <Reminder />

                <SimpleGrid columns={{ base: 1, lg: 2 }} gap="6">
                    <Card.Root bg="bg" border="1px" borderColor={{ base: "gray.200", _dark: "gray.700" }} rounded="xl">
                        <Card.Header>
                            <Heading size="lg" color={{ base: "gray.900", _dark: "white" }}>Pending</Heading>
                            <Text color={{ base: "gray.600", _dark: "gray.400" }} mt={1}>Awaiting submission</Text>
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
                                    {isLoading ? null : renderRows(pending)}
                                </Table.Body>
                            </Table.Root>
                        </Card.Body>
                    </Card.Root>

                    <Card.Root bg="bg" border="1px" borderColor={{ base: "gray.200", _dark: "gray.700" }} rounded="xl">
                        <Card.Header>
                            <Heading size="lg" color={{ base: "gray.900", _dark: "white" }}>Submitted</Heading>
                            <Text color={{ base: "gray.600", _dark: "gray.400" }} mt={1}>Received submissions</Text>
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
                                    {isLoading ? null : renderRows(submitted)}
                                </Table.Body>
                            </Table.Root>
                        </Card.Body>
                    </Card.Root>
                </SimpleGrid>
            </VStack>
            <Toaster />
        </>
    );
}
