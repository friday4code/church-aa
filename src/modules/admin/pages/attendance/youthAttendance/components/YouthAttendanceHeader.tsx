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
        <VStack
            align="stretch"
            gap={{ base: 4, md: 6 }}
            // pos="sticky"
            top={6}
            zIndex={"sticky"}
            backdropFilter={"blur(20px)"}
        >
            {/* First line: Go back button + title on left, drawer on right */}
            <Flex justify="space-between" align="center">
                {/* Go back button */}
                <HStack justify="flex-start">
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
                </HStack>

                {/* desktop Add Record Button */}
                <Button
                    colorPalette="accent"
                    rounded="xl"
                    hideBelow="md"
                    w="fit"
                    onClick={onAddClick}
                    size="lg"
                >
                    <Add />
                    Add Record
                </Button>
            </Flex>


            {/* Desktop buttons - only on desktop */}
            <HStack hideBelow={"md"} justify="space-between">
                <InputGroup
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

                {/* Desktop Export Buttons */}
                <HStack justify="center" gap={2}>
                    <Button
                        rounded="xl"
                        variant="solid"
                        bg="bg"
                        justifyContent="center"
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
                        justifyContent="center"
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
                        justifyContent="center"
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
                        justifyContent="center"
                        _hover={{ bg: "bg.muted" }}
                        size="sm"
                        rounded="xl"
                        onClick={() => exportYouthAttendanceToPDF(attendanceData)}
                    >
                        <DocumentDownload />
                        PDF
                    </Button>
                </HStack>
            </HStack>

            {/* Mobile layout */}
            <HStack hideFrom={"md"} align="stretch" gap={4}>
                {/* Mobile Search */}
                <InputGroup
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
                        size="md"
                    />
                </InputGroup>

                {/* Mobile Drawer Trigger */}
                <HStack justify="space-between">
                    <Box flex={1} />
                    <Drawer.Root placement="bottom" size="full">
                        <Drawer.Trigger asChild>
                            <IconButton
                                aria-label="More options"
                                variant="ghost"
                                rounded="xl"
                                size="md"
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
                                                rounded="xl"
                                                onClick={onAddClick}
                                                size="lg"
                                                width="full"
                                            >
                                                <Add />
                                                Add Record
                                            </Button>

                                            {/* Export Buttons */}
                                            <VStack gap={3} align="stretch">
                                                <Heading size="sm" color="fg.muted">Export Data</Heading>
                                                <Button
                                                    rounded="xl"
                                                    variant="solid"
                                                    bg="bg"
                                                    justifyContent="start"
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
                                                    justifyContent="start"
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
                                                    justifyContent="start"
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
                                                    justifyContent="start"
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
                </HStack>
            </HStack>

        </VStack >
    )
}
