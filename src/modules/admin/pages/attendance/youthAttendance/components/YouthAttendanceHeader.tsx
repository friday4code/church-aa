// components/YouthAttendanceHeader.tsx
"use client"

import { HStack, Button, Heading, VStack, Text, IconButton, Flex, Drawer, Portal, CloseButton } from "@chakra-ui/react"
import { Add, DocumentDownload, ArrowLeft3, MoreSquare } from "iconsax-reactjs"
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
        <>
            <VStack align="stretch" gap={{ base: 4, md: 6 }}>
                {/* First line: Go back button + Title on left, drawer on right */}
                <Flex justify="space-between" align="center">
                    {/* Go back button and title */}
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

                    {/* Mobile Drawer - only on mobile */}
                    <Drawer.Root placement="bottom" size="full">
                        <Drawer.Trigger asChild>
                            <IconButton
                                aria-label="More options"
                                variant="ghost"
                                rounded="xl"
                                size="md"
                                hideFrom={"md"}
                            >
                                <MoreSquare variant="Outline" />
                            </IconButton>
                        </Drawer.Trigger>
                        <Portal>
                            <Drawer.Backdrop />
                            <Drawer.Positioner>
                                <Drawer.Content h='fit' bg="bg" borderTopRadius="xl">
                                    <Drawer.Header p={4} borderBottom="1px solid" borderColor="border">
                                        <Flex justify="space-between" align="center">
                                            <Heading size="lg">Actions</Heading>
                                            <Drawer.CloseTrigger asChild>
                                                <IconButton
                                                    aria-label="Close drawer"
                                                    variant="ghost"
                                                    size="sm"
                                                >
                                                    <CloseButton />
                                                </IconButton>
                                            </Drawer.CloseTrigger>
                                        </Flex>
                                    </Drawer.Header>
                                    <Drawer.Body p={4}>
                                        <VStack gap={4} align="stretch">
                                            {/* Export Button */}
                                            <VStack gap={3} align="stretch">
                                                <Heading size="sm" color="fg.muted">Export Data</Heading>
                                                <Button
                                                    variant="outline"
                                                    size="lg"
                                                    onClick={onExportClick}
                                                    w="full"
                                                >
                                                    <DocumentDownload size={16} style={{ marginRight: 8 }} />
                                                    Export
                                                </Button>
                                            </VStack>
                                            
                                            {/* Add Record Button */}
                                            <Button
                                                colorPalette="accent"
                                                size="lg"
                                                onClick={onAddClick}
                                                w="full"
                                            >
                                                <Add size={16} style={{ marginRight: 8 }} />
                                                Add Record
                                            </Button>
                                        </VStack>
                                    </Drawer.Body>
                                </Drawer.Content>
                            </Drawer.Positioner>
                        </Portal>
                    </Drawer.Root>

                    {/* Desktop buttons - only on desktop */}
                    <HStack hideBelow={"md"}>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onExportClick}
                            w="auto"
                        >
                            <DocumentDownload size={16} style={{ marginRight: 8 }} />
                            Export
                        </Button>
                        <Button
                            colorPalette="accent"
                            size="sm"
                            onClick={onAddClick}
                            w="auto"
                        >
                            <Add size={16} style={{ marginRight: 8 }} />
                            Add Record
                        </Button>
                    </HStack>

                </Flex>
            </VStack>
        </>
    )
}
