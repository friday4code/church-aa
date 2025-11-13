"use client"

import { Suspense } from "react"
import { useQueryErrorResetBoundary } from "@tanstack/react-query"
import { ENV } from "@/config/env"
import { ErrorBoundary } from "react-error-boundary"
import ErrorFallback from "@/components/ErrorFallback"
import { SERVICE_TYPES, type ServiceType } from "@/types/attendance.type"
import {
    Center,
    VStack,
    Spinner,
    Text
} from "@chakra-ui/react"
import AttendanceContent from "./components/AttendanceContent"

// Props for the dynamic attendance component
interface AttendancePageProps {
    serviceType: ServiceType;
}

export const AttendancePage: React.FC<AttendancePageProps> = ({ serviceType }) => {
    const { reset } = useQueryErrorResetBoundary();
    const serviceName = SERVICE_TYPES[serviceType]?.name;

    return (
        <>
            <title>{serviceName} | {ENV.APP_NAME}</title>
            <meta
                name="description"
                content={`Manage ${serviceName} attendance data`}
            />
            <ErrorBoundary
                onReset={reset}
                fallbackRender={({ resetErrorBoundary, error }) => (
                    <ErrorFallback {...{ resetErrorBoundary, error }} />
                )}
            >
                <Suspense fallback={
                    <Center h="400px">
                        <VStack gap="4">
                            <Spinner size="xl" color="accent.500" />
                            <Text fontSize="lg" color="gray.600">Loading Attendance Page...</Text>
                        </VStack>
                    </Center>
                }>
                    <AttendanceContent serviceType={serviceType} serviceName={serviceName} />
                </Suspense>
            </ErrorBoundary>
        </>
    );
};

export default AttendancePage;