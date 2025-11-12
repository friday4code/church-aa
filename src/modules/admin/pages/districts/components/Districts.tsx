// components/districts/Districts.tsx
"use client"

import ErrorFallback from "@/components/ErrorFallback"
import { ENV } from "@/config/env"
import { useQueryErrorResetBoundary } from "@tanstack/react-query"
import { ErrorBoundary } from "react-error-boundary"
import { DistrictsContent } from "./DistrictsContent"

export const Districts: React.FC = () => {
    const { reset } = useQueryErrorResetBoundary();

    return (
        <>
            <title>Districts Data | {ENV.APP_NAME}</title>
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
                <DistrictsContent />
            </ErrorBoundary>
        </>
    );
};

export default Districts;