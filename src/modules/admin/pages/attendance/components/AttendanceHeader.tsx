"use client"

import { Heading, HStack, Button, Badge, Flex, InputGroup, Input, CloseButton, VStack, IconButton, Drawer, Portal, Box, NativeSelect } from "@chakra-ui/react"
import { Add, SearchNormal1, ArrowLeft3, MoreSquare, DocumentDownload } from "iconsax-reactjs"
import type { Attendance } from "../../../stores/attendance.store"
import { useState, useCallback } from "react"
import { useNavigate } from "react-router"
import { exportAttendanceToExcel, exportAttendanceToCSV, exportAttendanceToPDF, copyAttendanceToClipboard } from "@/utils/attendance.utils"
import { useDistricts } from "@/modules/admin/hooks/useDistrict"
import type { Group } from "@/types/groups.type"

interface AttendanceHeaderProps {
    serviceName: string
    serviceAttendances: Attendance[]
    onAddAttendance: () => void
    onSearch: (value: string) => void
    onNavigateBack?: () => void
    yearFilter: string
    setYearFilter: (value: string) => void
    monthFilter: string
    setMonthFilter: (value: string) => void
    groupFilter: string
    setGroupFilter: (value: string) => void
    groups: Group[]
}

const AttendanceHeader = ({
    serviceName,
    serviceAttendances,
    onAddAttendance,
    onSearch,
    onNavigateBack,
    yearFilter,
    setYearFilter,
    monthFilter,
    setMonthFilter,
    groupFilter,
    setGroupFilter,
    groups
}: AttendanceHeaderProps) => {
    const navigate = useNavigate()
    const { districts = [] } = useDistricts()

    const [search, setSearch] = useState("")
    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value)
        onSearch(e.target.value)
    }, [onSearch])
    const clearSearch = useCallback(() => {
        setSearch("")
        onSearch("")
    }, [onSearch])

    const handleNavigateBack = useCallback(() => {
        if (onNavigateBack) {
            onNavigateBack()
        } else {
            navigate(-1)
        }
    }, [onNavigateBack, navigate])

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
                        <IconButton
                            aria-label="Go back"
                            variant="outline"
                            rounded="xl"
                            onClick={handleNavigateBack}
                            size={{ base: "md", md: "lg" }}
                            mr={4}
                        >
                            <ArrowLeft3 />
                        </IconButton>
                        <HStack>
                            <Heading size={{ base: "2xl", md: "3xl" }}>{serviceName}</Heading>
                            <Badge colorPalette={"accent"} fontSize={{ base: "md", md: "lg" }}>{serviceAttendances.length}</Badge>
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
                                            {/* Add Attendance Button */}
                                            <Button
                                                colorPalette="accent"
                                                rounded="xl"
                                                onClick={() => {
                                                    onAddAttendance()
                                                }}
                                                size="lg"
                                                width="full"
                                            >
                                                <Add />
                                                Add Attendance
                                            </Button>

                                            {/* Filters in Mobile Drawer */}
                                            <VStack gap={3} align="stretch">
                                                <Heading size="sm" color="fg.muted">Filters</Heading>
                                                <NativeSelect.Root size="md">
                                                    <NativeSelect.Field 
                                                        placeholder="All Years" 
                                                        value={yearFilter} 
                                                        onChange={(e) => setYearFilter(e.target.value)}
                                                        rounded="xl"
                                                    >
                                                        {[2023, 2024, 2025, 2026].map((year) => (
                                                            <option key={year} value={year}>{year}</option>
                                                        ))}
                                                    </NativeSelect.Field>
                                                    <NativeSelect.Indicator />
                                                </NativeSelect.Root>
                                                <NativeSelect.Root size="md">
                                                    <NativeSelect.Field 
                                                        placeholder="All Months" 
                                                        value={monthFilter} 
                                                        onChange={(e) => setMonthFilter(e.target.value)}
                                                        rounded="xl"
                                                    >
                                                        {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((month) => (
                                                            <option key={month} value={month}>{month}</option>
                                                        ))}
                                                    </NativeSelect.Field>
                                                    <NativeSelect.Indicator />
                                                </NativeSelect.Root>
                                                <NativeSelect.Root size="md">
                                                    <NativeSelect.Field 
                                                        placeholder="All Groups" 
                                                        value={groupFilter} 
                                                        onChange={(e) => setGroupFilter(e.target.value)}
                                                        rounded="xl"
                                                    >
                                                        {groups?.map((group) => (
                                                            <option key={group.id} value={group.id}>{group.name}</option>
                                                        ))}
                                                    </NativeSelect.Field>
                                                    <NativeSelect.Indicator />
                                                </NativeSelect.Root>
                                            </VStack>

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
                                                        onClick={async () => await copyAttendanceToClipboard(serviceAttendances, districts)}
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
                                                        onClick={() => exportAttendanceToExcel(serviceAttendances, districts)}
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
                                                        onClick={() => exportAttendanceToCSV(serviceAttendances, districts)}
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
                                                        onClick={() => exportAttendanceToPDF(serviceAttendances, districts)}
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
                        {/* desktop Add Attendance Button */}
                        <Button
                            colorPalette="accent"
                            rounded="xl"
                            w="fit"
                            hideBelow={"md"}
                            onClick={() => {
                                onAddAttendance()
                            }}
                            size="lg"
                        >
                            <Add />
                            Add Attendance
                        </Button>
                    </HStack>

                </Flex>

                {/* Second line: Search input and filters */}
                <VStack w="full" gap={4}>
                    <HStack w="full" flexDir={{ base: "column", md: "row" }} gap={4}>
                        <InputGroup
                            flex={1}
                            w="full"
                            colorPalette={"accent"}
                            startElement={<SearchNormal1 />}
                            endElement={search ? <CloseButton size="xs" onClick={clearSearch} /> : undefined}
                        >
                            <Input
                                bg="bg"
                                rounded="xl"
                                placeholder="Search attendance..."
                                value={search}
                                onChange={handleChange}
                                size={{ base: "md", md: "lg" }}
                            />
                        </InputGroup>

                        <HStack w={{ base: "full", md: "auto" }} gap={2}>
                            <NativeSelect.Root size="md" width={{ base: "full", md: "120px" }}>
                                <NativeSelect.Field
                                    placeholder="Year"
                                    value={yearFilter}
                                    onChange={(e) => setYearFilter(e.target.value)}
                                    rounded="xl"
                                    bg="bg"
                                >
                                    <option value="2024">2024</option>
                                    <option value="2025">2025</option>
                                    <option value="2026">2026</option>
                                </NativeSelect.Field>
                            </NativeSelect.Root>

                            <NativeSelect.Root size="md" width={{ base: "full", md: "140px" }}>
                                <NativeSelect.Field
                                    placeholder="Month"
                                    value={monthFilter}
                                    onChange={(e) => setMonthFilter(e.target.value)}
                                    rounded="xl"
                                    bg="bg"
                                >
                                    {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(m => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                </NativeSelect.Field>
                            </NativeSelect.Root>

                            <NativeSelect.Root size="md" width={{ base: "full", md: "200px" }}>
                                <NativeSelect.Field
                                    placeholder="Group"
                                    value={groupFilter}
                                    onChange={(e) => setGroupFilter(e.target.value)}
                                    rounded="xl"
                                    bg="bg"
                                >
                                    {groups.map(g => (
                                        <option key={g.id} value={g.id}>{g.name}</option>
                                    ))}
                                </NativeSelect.Field>
                            </NativeSelect.Root>
                        </HStack>
                    </HStack>

                    <Box hideBelow={"md"} w="full">
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
                                onClick={async () => await copyAttendanceToClipboard(serviceAttendances,districts)}
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
                                onClick={() => exportAttendanceToExcel(serviceAttendances,districts)}
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
                                onClick={() => exportAttendanceToCSV(serviceAttendances,districts)}
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
                                onClick={() => exportAttendanceToPDF(serviceAttendances,districts)}
                            >
                                <DocumentDownload />
                                PDF
                            </Button>
                        </HStack>
                    </Box>
                </VStack>

            </VStack>
        </>
    )
}

export default AttendanceHeader