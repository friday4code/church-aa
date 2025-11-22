// components/YouthAttendanceHeader.tsx
"use client"

import { HStack, Button, Heading, VStack, Text, IconButton } from "@chakra-ui/react"
import { Add, DocumentDownload, ArrowLeft3 } from "iconsax-reactjs"

interface YouthAttendanceHeaderProps {
    onAddClick: () => void
    onExportClick: () => void
    attendanceType: 'weekly' | 'revival'
    showBackButton?: boolean
}

export const YouthAttendanceHeader = ({ onAddClick, onExportClick, attendanceType, showBackButton }: YouthAttendanceHeaderProps) => {
    return (
        <VStack align="stretch" gap="4">
            <HStack justify="space-between">
                <VStack align="start" gap="0">
                    {showBackButton && (
                        <IconButton aria-label="Go back" variant="outline" rounded="xl" onClick={() => window.history.back()}>
                            <ArrowLeft3 />
                        </IconButton>
                    )}
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
