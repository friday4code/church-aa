// components/YouthAttendanceHeader.tsx
"use client"

import { HStack, Button, Heading, VStack, Text, IconButton, Flex } from "@chakra-ui/react"
import { Add, DocumentDownload, ArrowLeft3 } from "iconsax-reactjs"
import { useNavigate } from "react-router"

interface YouthAttendanceHeaderProps {
    onAddClick: () => void
    onExportClick: () => void
    attendanceType: 'weekly' | 'revival'
    showBackButton?: boolean
}

export const YouthAttendanceHeader = ({ onAddClick, onExportClick, attendanceType, showBackButton }: YouthAttendanceHeaderProps) => {
    const navigate = useNavigate()
    
    return (
        <VStack align="stretch" gap={{ base: 4, md: 6 }}>
            {/* First line: Go back button + Title */}
            <Flex justify="flex-start" align="center">
                {showBackButton && (
                    <IconButton 
                        aria-label="Go back" 
                        variant="outline" 
                        rounded="xl" 
                        onClick={() => navigate(-1)}
                        size={{ base: "md", md: "lg" }}
                        mr={4}
                    >
                        <ArrowLeft3 />
                    </IconButton>
                )}
                <VStack align="start" gap={1} spacing={0}>
                    <Heading size={{ base: "lg", md: "xl" }}>Youth {attendanceType === 'weekly' ? 'Weekly' : 'Revival'} Attendance</Heading>
                    <Text color="gray.600" fontSize={{ base: "xs", md: "sm" }}>
                        Manage {attendanceType} attendance records for youth groups
                    </Text>
                </VStack>
            </Flex>

            {/* Second line: Upload CSV + Attendance buttons (stacked vertically on mobile) */}
            <Flex 
                direction={{ base: "column", md: "row" }}
                gap={{ base: 3, md: 4 }}
                justify={{ base: "flex-start", md: "flex-end" }}
            >
                <Button
                    variant="outline"
                    size={{ base: "md", md: "sm" }}
                    onClick={onExportClick}
                    w={{ base: "full", md: "auto" }}
                >
                    <DocumentDownload size={16} style={{ marginRight: 8 }} />
                    Export
                </Button>
                <Button
                    colorPalette="accent"
                    size={{ base: "md", md: "sm" }}
                    onClick={onAddClick}
                    w={{ base: "full", md: "auto" }}
                >
                    <Add size={16} style={{ marginRight: 8 }} />
                    Add Record
                </Button>
            </Flex>
        </VStack>
    )
}
