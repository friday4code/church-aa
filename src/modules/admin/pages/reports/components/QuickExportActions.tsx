"use client"

import { Box, Button, HStack } from "@chakra-ui/react"
import { DocumentDownload, ReceiptText } from "iconsax-reactjs"
import {
    exportAttendanceToExcel,
    exportAttendanceToPDF,
    exportAttendanceToCSV,
    copyAttendanceToClipboard,
} from "@/utils/attendance.utils"
import type { AttendanceRecord, District } from "@/types/attendance.type"

interface QuickExportActionsProps {
    attendances?: AttendanceRecord[]
    districts?: District[]
}

export const QuickExportActions = ({
    attendances,
    districts,
}: QuickExportActionsProps) => {
    const handleExportExcel = () => {
        try {
            exportAttendanceToExcel(attendances as AttendanceRecord[], districts as District[])
        } catch (error) {
            console.error("Failed to export to Excel:", error)
        }
    }

    const handleExportPDF = () => {
        try {
            exportAttendanceToPDF(attendances as AttendanceRecord[], districts as District[])
        } catch (error) {
            console.error("Failed to export to PDF:", error)
        }
    }

    const handleExportCSV = () => {
        try {
            exportAttendanceToCSV(attendances as AttendanceRecord[], districts as District[])
        } catch (error) {
            console.error("Failed to export to CSV:", error)
        }
    }

    const handleCopyToClipboard = async () => {
        try {
            await copyAttendanceToClipboard(attendances as AttendanceRecord[], districts as District[])
        } catch (error) {
            console.error("Failed to copy to clipboard:", error)
        }
    }

    return (
        <Box
            bg="bg"
            p={4}
            rounded="xl"
            boxShadow={{ base: "sm", _dark: "0 1px 3px rgba(0, 0, 0, 0.3)" }}
            mb={6}
        >
            <HStack gap={3} wrap="wrap">
                <Button
                    size="sm"
                    bg={{ base: "green.500", _dark: "green.600" }}
                    color="white"
                    _hover={{ bg: { base: "green.600", _dark: "green.700" } }}
                    onClick={handleExportExcel}
                    disabled={!((attendances?.length ?? 0) > 0)}
                >
                    <DocumentDownload />
                    Export Excel
                </Button>

                <Button
                    size="sm"
                    bg={{ base: "red.500", _dark: "red.600" }}
                    color="white"
                    _hover={{ bg: { base: "red.600", _dark: "red.700" } }}
                    onClick={handleExportPDF}
                    disabled={!((attendances?.length ?? 0) > 0)}
                >
                    <DocumentDownload />
                    Export PDF
                </Button>

                <Button
                    size="sm"
                    bg={{ base: "blue.500", _dark: "blue.600" }}
                    color="white"
                    _hover={{ bg: { base: "blue.600", _dark: "blue.700" } }}
                    onClick={handleExportCSV}
                    disabled={!((attendances?.length ?? 0) !== 0)}
                >
                    <ReceiptText />
                    Export CSV
                </Button>

                <Button
                    size="sm"
                    bg={{ base: "gray.500", _dark: "gray.600" }}
                    color="white"
                    _hover={{ bg: { base: "gray.600", _dark: "gray.700" } }}
                    onClick={handleCopyToClipboard}
                    disabled={!((attendances?.length ?? 0) !== 0)}
                >
                    <DocumentDownload />
                    Copy to Clipboard
                </Button>
            </HStack>
        </Box>
    )
}

export default QuickExportActions
