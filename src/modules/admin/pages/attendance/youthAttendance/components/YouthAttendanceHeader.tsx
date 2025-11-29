// components/YouthAttendanceHeader.tsx
"use client"

import { Heading, HStack, Button, Badge, Flex, InputGroup, Input, IconButton, CloseButton, VStack, Drawer, Portal, Box, Text } from "@chakra-ui/react"
import { Add, DocumentDownload, ArrowLeft3, MoreSquare, SearchNormal1 } from "iconsax-reactjs"
import { useNavigate } from "react-router"
import { useState, useCallback } from "react"
import { copyYouthAttendanceToClipboard, exportYouthAttendanceToExcel, exportYouthAttendanceToCSV, exportYouthAttendanceToPDF } from "@/utils/youthMinistry/youthAttendance.utils"

import type { YouthAttendance as YA } from "@/types/youthAttendance.type"
import type { YouthAttendance } from "@/modules/admin/stores/youthMinistry/youthAttendance.store"

interface YouthAttendanceHeaderProps {
    onAddClick: () => void
    onExportClick: () => void
    attendanceType: 'weekly' | 'revival'
    showBackButton?: boolean
    attendanceData?: YA & YouthAttendance[]
}

export const YouthAttendanceHeader = ({ onAddClick, onExportClick, attendanceType, showBackButton, attendanceData = [] }: YouthAttendanceHeaderProps) => {
    const navigate = useNavigate()
    const [search, setSearch] = useState("")

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value)
    }, [])

    const clearSearch = useCallback(() => {
        setSearch("")
    }, [])

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
                        <VStack align="start" gap={1}>
                            <Heading size={{ base: "lg", md: "xl" }}>Youth {attendanceType === 'weekly' ? 'Weekly' : 'Revival'} Attendance</Heading>
                            <Text color="gray.600" fontSize={{ base: "xs", md: "sm" }}>
                                Manage {attendanceType} attendance records for youth groups
                            </Text>
                        </VStack>
                    </Flex>


                    {/* Desktop buttons - only on desktop */}
                    <HStack hideBelow={"md"}>
                        {/* desktop Add Record Button */}
                        <Button
                            colorPalette="accent"
                            rounded="xl"
                            w="fit"
                            hideBelow={"md"}
                            onClick={onAddClick}
                            size="lg"
                        >
                            <Add />
                            Add Record
                        </Button>
                    </HStack>

                </Flex>

                {/* Second line: Search input (full width) */}
                <HStack w="full" justify={"space-between"}>
                    <InputGroup
                        maxW="full"
                        colorPalette={"accent"}
                        startElement={<SearchNormal1 />}
                        endElement={search ? <CloseButton size="xs" onClick={clearSearch} /> : undefined}
                    >
                        <Input
                            bg="bg"
                            rounded="xl"
                            placeholder="Search youth attendance..."
                            value={search}
                            onChange={handleChange}
                            size={{ base: "md", md: "lg" }}
                        />
                    </InputGroup>

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

                                            {/* Export Button */}
                                            <VStack gap={3} align="stretch">
                                                <Heading size="sm" color="fg.muted">Export Data</Heading>
                                                <Button
                                                    rounded="xl"
                                                    variant="solid"
                                                    bg="bg"
                                                    w={{ base: "full", md: "auto" }}
                                                    justifyContent={{ base: "start", md: "center" }}
                                                    color="accent"
                                                    _hover={{ bg: "bg.muted" }}
                                                    size="sm"
                                                    onClick={async () => await copyYouthAttendanceToClipboard(attendanceData)}
                                                >
                                                    <DocumentDownload />
                                                    Copy
                                                </Button>
                                                <Button
                                                    variant="solid"
                                                    bg="bg"
                                                    color="accent"
                                                    w={{ base: "full", md: "auto" }}
                                                    justifyContent={{ base: "start", md: "center" }}
                                                    _hover={{ bg: "bg.muted" }}
                                                    size="sm"
                                                    rounded="xl"
                                                    onClick={() => exportYouthAttendanceToExcel(attendanceData)}
                                                >
                                                    <DocumentDownload />
                                                    Excel
                                                </Button>
                                                <Button
                                                    variant="solid"
                                                    bg="bg"
                                                    color="accent"
                                                    w={{ base: "full", md: "auto" }}
                                                    justifyContent={{ base: "start", md: "center" }}
                                                    _hover={{ bg: "bg.muted" }}
                                                    size="sm"
                                                    rounded="xl"
                                                    onClick={() => exportYouthAttendanceToCSV(attendanceData)}
                                                >
                                                    <DocumentDownload />
                                                    CSV
                                                </Button>
                                                <Button
                                                    variant="solid"
                                                    bg="bg"
                                                    color="accent"
                                                    w={{ base: "full", md: "auto" }}
                                                    justifyContent={{ base: "start", md: "center" }}
                                                    _hover={{ bg: "bg.muted" }}
                                                    size="sm"
                                                    rounded="xl"
                                                    onClick={() => exportYouthAttendanceToPDF(attendanceData)}
                                                >
                                                    <DocumentDownload />
                                                    PDF
                                                </Button>
                                            </VStack>
                                        </VStack>
                                    </Drawer.Body>
                                </Drawer.Content>
                            </Drawer.Positioner>
                        </Portal>
                    </Drawer.Root>


                    <Box hideBelow={"md"}>
                        <HStack w="full" flexDir={{ base: "column", md: "row" }} justify={{ base: "start", md: "center" }}>
                            <Button
                                rounded="xl"
                                variant="solid"
                                bg="bg"
                                w={{ base: "full", md: "auto" }}
                                justifyContent={{ base: "start", md: "center" }}
                                color="accent"
                                _hover={{ bg: "bg.muted" }}
                                size="sm"
                                onClick={async () => await copyYouthAttendanceToClipboard(attendanceData)}
                            >
                                <DocumentDownload />
                                Copy
                            </Button>
                            <Button
                                variant="solid"
                                bg="bg"
                                color="accent"
                                w={{ base: "full", md: "auto" }}
                                justifyContent={{ base: "start", md: "center" }}
                                _hover={{ bg: "bg.muted" }}
                                size="sm"
                                rounded="xl"
                                onClick={() => exportYouthAttendanceToExcel(attendanceData)}
                            >
                                <DocumentDownload />
                                Excel
                            </Button>
                            <Button
                                variant="solid"
                                bg="bg"
                                color="accent"
                                w={{ base: "full", md: "auto" }}
                                justifyContent={{ base: "start", md: "center" }}
                                _hover={{ bg: "bg.muted" }}
                                size="sm"
                                rounded="xl"
                                onClick={() => exportYouthAttendanceToCSV(attendanceData)}
                            >
                                <DocumentDownload />
                                CSV
                            </Button>
                            <Button
                                variant="solid"
                                bg="bg"
                                color="accent"
                                w={{ base: "full", md: "auto" }}
                                justifyContent={{ base: "start", md: "center" }}
                                _hover={{ bg: "bg.muted" }}
                                size="sm"
                                rounded="xl"
                                onClick={() => exportYouthAttendanceToPDF(attendanceData)}
                            >
                                <DocumentDownload />
                                PDF
                            </Button>
                        </HStack>
                    </Box>
                </HStack>
            </VStack>
        </>
    )
}
