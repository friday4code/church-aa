// components/YouthAttendanceHeader.tsx
"use client"

import { Heading, HStack, Button, Badge, Flex, InputGroup, Input, IconButton, CloseButton, VStack, Drawer, Portal, Box, Text } from "@chakra-ui/react"
import { Add, DocumentDownload, ArrowLeft3, MoreSquare, SearchNormal1 } from "iconsax-reactjs"
import { useNavigate } from "react-router"
import { useState, useCallback } from "react"
import { copyYouthAttendanceToClipboard, exportYouthAttendanceToExcel, exportYouthAttendanceToCSV, exportYouthAttendanceToPDF } from "@/utils/youthMinistry/youthAttendance.utils"

import type { YouthAttendance } from "@/types/youthAttendance.type"

interface YouthAttendanceHeaderProps {
    onAddClick: () => void
    onExportClick: () => void
    attendanceType: 'weekly' | 'revival'
    showBackButton?: boolean
    attendanceData?: YouthAttendance[]
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
            <VStack
                align="stretch"
                gap={{ base: 4, md: 6 }}
                pos="sticky"
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
                        <HStack>
                            <Heading size={{ base: "2xl", md: "3xl" }}>Youth {attendanceType === 'weekly' ? 'Weekly' : 'Revival'} Attendance</Heading>
                            <Badge colorPalette={"accent"} fontSize={{ base: "md", md: "lg" }}>{attendanceData.length}</Badge>
                        </HStack>
                    </HStack>

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
                                            </VStack>
                                        </VStack>
                                    </Drawer.Body>
                                </Drawer.Content>
                            </Drawer.Positioner>
                        </Portal>
                    </Drawer.Root>

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
