// src/modules/admin/pages/reports/Reports.tsx
"use client"

import { ENV } from "@/config/env"
import { ReportsContent } from "./components"

export const ReportsDashboard: React.FC = () => {
    return (
        <>
            <title>Reports Dashboard | {ENV.APP_NAME}</title>
            <meta
                name="description"
                content="Church Attendance Reports Dashboard"
            />
            <ReportsContent />
        </>
    )
}

export default ReportsDashboard
