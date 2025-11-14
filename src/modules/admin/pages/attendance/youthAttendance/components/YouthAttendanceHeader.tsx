// components/YouthAttendanceHeader.tsx
"use client"

import { HStack, Button, Heading, VStack, Text } from "@chakra-ui/react"
import { Add, DocumentDownload } from "iconsax-reactjs"

interface YouthAttendanceHeaderProps {
    onAddClick: () => void
    onExportClick: () => void
    attendanceType: 'weekly' | 'revival'
}

export const YouthAttendanceHeader = ({ onAddClick, onExportClick, attendanceType }: YouthAttendanceHeaderProps) => {
    return (
        <VStack align="stretch" gap="4">
            <HStack justify="space-between">
                <VStack align="start" gap="0">
                    <Heading size="lg">Youth {attendanceType === 'weekly' ? 'Weekly' : 'Revival'} Attendance</Heading>
                    <Text color="gray.600" fontSize="sm">
                        Manage {attendanceType} attendance records for youth groups
                    </Text>
                </VStack>
                <HStack>
                    <Button
                        colorPalette="accent"
                        size="sm"
                        onClick={onAddClick}
                    >
                        <Add size={16} style={{ marginRight: 8 }} />
                        Add Record
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onExportClick}
                    >
                        <DocumentDownload size={16} style={{ marginRight: 8 }} />
                        Export
                    </Button>
                </HStack>
            </HStack>
        </VStack>
    )
}
