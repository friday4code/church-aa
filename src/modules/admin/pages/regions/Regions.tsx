// components/regions/Regions.tsx
"use client"

 
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
                <RegionsContent />
            </ErrorBoundary>
        </>
    );
};

export default Regions;