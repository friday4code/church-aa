// components/regions/Regions.tsx
"use client"

import { Suspense } from "react"
import {
    VStack,
    Spinner,
    Center,
    Text,
} from "@chakra-ui/react"
import { useQueryErrorResetBoundary } from "@tanstack/react-query"
import { ENV } from "@/config/env"
import { ErrorBoundary } from "react-error-boundary"
import ErrorFallback from "@/components/ErrorFallback"
import RegionsContent from "./components/RegionsContent"


export const Regions: React.FC = () => {
    const { reset } = useQueryErrorResetBoundary();

    return (
        <>
            <title>Regions | {ENV.APP_NAME}</title>
            <meta
                name="description"
                content="track your Regions"
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
                            <Text fontSize="lg" color="gray.600">Loading Regions Page...</Text>
                        </VStack>
                    </Center>
                }>
                    <RegionsContent />
                </Suspense>
            </ErrorBoundary>
        </>
    );
};

export default Regions;