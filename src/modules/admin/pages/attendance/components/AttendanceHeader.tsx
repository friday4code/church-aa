"use client"

import { Heading, HStack, Button, Badge, Flex, InputGroup, Input, CloseButton, VStack, IconButton, Drawer, Portal, Box, NativeSelect, createListCollection, Span, Stack, Select } from "@chakra-ui/react"
import { Add, SearchNormal1, ArrowLeft3, MoreSquare, DocumentDownload, CloseCircle } from "iconsax-reactjs"
import { useState, useCallback } from "react"
import { useNavigate } from "react-router"
import { exportAttendanceToExcel, exportAttendanceToCSV, exportAttendanceToPDF, copyAttendanceToClipboard } from "@/utils/attendance.utils"
import { useDistricts } from "@/modules/admin/hooks/useDistrict"
import type { Group } from "@/types/groups.type"

interface AttendanceHeaderProps {
    serviceName: string
    serviceAttendances: any[]
    onAddAttendance: () => void
    onSearch: (value: string) => void
    onNavigateBack?: () => void
    yearFilter: string
    setYearFilter: (value: string) => void
    monthFilter: string
    setMonthFilter: (value: string) => void
    weekFilter: string
    setWeekFilter: (value: string) => void
    districtFilter: string
    setDistrictFilter: (value: string) => void
    districts: any[];
    pageSize: number;
    setPageSize: (size: number) => void;
}

const pageSizes = createListCollection({
    items: [
        { label: "10 rows", value: 10 },
        { label: "30 rows", value: 30 },
        { label: "50 rows", value: 50 },
        { label: "70 rows", value: 70 },
        { label: "100 rows", value: 100 },
        { label: "150 rows", value: 150 },
        { label: "200 rows", value: 200 },
        { label: "250 rows", value: 250 },
    ],
})

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
    weekFilter,
    setWeekFilter,
    districtFilter,
    setDistrictFilter,
    districts,
    pageSize,
    setPageSize
}: AttendanceHeaderProps) => {
    const navigate = useNavigate()
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

    const yearCollection = createListCollection({
        items: Array.from({ length: new Date().getFullYear() - 2000 + 1 }, (_, i) => new Date().getFullYear() - i)
            .map((year) => ({ label: year.toString(), value: year.toString() })),
    })

    const monthCollection = createListCollection({
        items: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((month) => ({ label: month, value: month })),
    })

    const weekCollection = createListCollection({
        items: [1, 2, 3, 4, 5].map((week) => ({ label: `Week ${week}`, value: week.toString() })),
    })

    const districtCollection = createListCollection({
        items: districts.map((district) => ({ label: district.name, value: district.id.toString() })),
    })

    return (
        <>
            <VStack
                bg={"bg"}
                border="xs"
                borderColor={"border"}
                rounded="xl"
                p="4"
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
                                            <Stack justify="start" w={{ base: "full", md: "full" }} gap={2}>
                                                <Select.Root size="md" width={{ base: "full", md: "120px" }} collection={yearCollection} value={[yearFilter]} onValueChange={(e) => setYearFilter(e.value[0])}>
                                                    <Select.HiddenSelect />
                                                    <Select.Control>
                                                        <Select.Trigger bg="bg" rounded="xl">
                                                            <Stack gapY="0" justify="center" w="full">
                                                                <Span color="fg.subtle" fontSize="xs">Year</Span>
                                                                <Select.ValueText mt="-1.5" placeholder="Year" />
                                                            </Stack>
                                                        </Select.Trigger>
                                                        <Select.IndicatorGroup>
                                                            <Select.Indicator />
                                                        </Select.IndicatorGroup>
                                                    </Select.Control>
                                                    <Portal>
                                                        <Select.Positioner>
                                                            <Select.Content>
                                                                {yearCollection.items.map((item: any) => (
                                                                    <Select.Item item={item} key={item.value}>
                                                                        {item.label}
                                                                        <Select.ItemIndicator />
                                                                    </Select.Item>
                                                                ))}
                                                            </Select.Content>
                                                        </Select.Positioner>
                                                    </Portal>
                                                </Select.Root>

                                                <Select.Root size="md" width={{ base: "full", md: "140px" }} collection={monthCollection} value={[monthFilter]} onValueChange={(e) => setMonthFilter(e.value[0])}>
                                                    <Select.HiddenSelect />
                                                    <Select.Control>
                                                        <Select.Trigger bg="bg" rounded="xl">
                                                            <Stack gapY="0" justify="center" w="full">
                                                                <Span color="fg.subtle" fontSize="xs">Month</Span>
                                                                <Select.ValueText mt="-1.5" placeholder="Month" />
                                                            </Stack>
                                                        </Select.Trigger>
                                                        <Select.IndicatorGroup>
                                                            <Select.Indicator />
                                                        </Select.IndicatorGroup>
                                                    </Select.Control>
                                                    <Portal>
                                                        <Select.Positioner>
                                                            <Select.Content>
                                                                {monthCollection.items.map((item) => (
                                                                    <Select.Item item={item} key={item.value}>
                                                                        {item.label}
                                                                        <Select.ItemIndicator />
                                                                    </Select.Item>
                                                                ))}
                                                            </Select.Content>
                                                        </Select.Positioner>
                                                    </Portal>
                                                </Select.Root>

                                                <Select.Root size="md" width={{ base: "full", md: "100px" }} collection={weekCollection} value={[weekFilter]} onValueChange={(e) => setWeekFilter(e.value[0])}>
                                                    <Select.HiddenSelect />
                                                    <Select.Control>
                                                        <Select.Trigger bg="bg" rounded="xl">
                                                            <Stack gapY="0" justify="center" w="full">
                                                                <Span color="fg.subtle" fontSize="xs">Week</Span>
                                                                <Select.ValueText mt="-1.5" placeholder="Week" />
                                                            </Stack>
                                                        </Select.Trigger>
                                                        <Select.IndicatorGroup>
                                                            <Select.Indicator />
                                                        </Select.IndicatorGroup>
                                                    </Select.Control>
                                                    <Portal>
                                                        <Select.Positioner>
                                                            <Select.Content>
                                                                {weekCollection.items.map((item: any) => (
                                                                    <Select.Item item={item} key={item.value}>
                                                                        {item.label}
                                                                        <Select.ItemIndicator />
                                                                    </Select.Item>
                                                                ))}
                                                            </Select.Content>
                                                        </Select.Positioner>
                                                    </Portal>
                                                </Select.Root>

                                                <Select.Root size="md" width={{ base: "full", md: "200px" }} collection={districtCollection} value={[districtFilter]} onValueChange={(e) => setDistrictFilter(e.value[0])}>
                                                    <Select.HiddenSelect />
                                                    <Select.Control>
                                                        <Select.Trigger bg="bg" rounded="xl">
                                                            <Stack gapY="0" justify="center" w="full">
                                                                <Span color="fg.subtle" fontSize="xs">District</Span>
                                                                <Select.ValueText mt="-1.5" placeholder="District" />
                                                            </Stack>
                                                        </Select.Trigger>
                                                        <Select.IndicatorGroup>
                                                            <Select.Indicator />
                                                        </Select.IndicatorGroup>
                                                    </Select.Control>
                                                    <Portal>
                                                        <Select.Positioner>
                                                            <Select.Content>
                                                                {districtCollection.items.map((item: any) => (
                                                                    <Select.Item item={item} key={item.value}>
                                                                        {item.label}
                                                                        <Select.ItemIndicator />
                                                                    </Select.Item>
                                                                ))}
                                                            </Select.Content>
                                                        </Select.Positioner>
                                                    </Portal>
                                                </Select.Root>

                                                <Button variant="surface" colorPalette={"red"} onClick={() => { setDistrictFilter(""); setWeekFilter(""); setMonthFilter(""); setYearFilter(""); }}>
                                                    <CloseCircle />   Reset Filters
                                                </Button>

                                            </Stack>

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

                        {/* Page Size Selector */}
                        <Box width="150px" hideBelow="md">
                            <Select.Root
                                collection={pageSizes}
                                size="sm"
                                value={[pageSize.toString()]}
                                onValueChange={(e) => setPageSize(Number(e.value[0]))}
                            >
                                <Select.HiddenSelect />
                                <Select.Control>
                                    <Select.Trigger>
                                        <Select.ValueText placeholder={`${pageSize} rows`} />
                                    </Select.Trigger>
                                    <Select.IndicatorGroup>
                                        <Select.Indicator />
                                    </Select.IndicatorGroup>
                                </Select.Control>
                                <Portal>
                                    <Select.Positioner>
                                        <Select.Content>
                                            {pageSizes.items.map((size) => (
                                                <Select.Item item={size} key={size.value}>
                                                    {size.label}
                                                    <Select.ItemIndicator />
                                                </Select.Item>
                                            ))}
                                        </Select.Content>
                                    </Select.Positioner>
                                </Portal>
                            </Select.Root>
                        </Box>

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
                        </Box>

                    </HStack>


                    <HStack justify="start" w={{ base: "full", md: "full" }} gap={2}>
                        <Select.Root size="md" width={{ base: "full", md: "120px" }} collection={yearCollection} value={[yearFilter]} onValueChange={(e) => setYearFilter(e.value[0])}>
                            <Select.HiddenSelect />
                            <Select.Control>
                                <Select.Trigger bg="bg" rounded="xl">
                                    <Stack gapY="0" justify="center" w="full">
                                        <Span color="fg.subtle" fontSize="xs">Year</Span>
                                        <Select.ValueText mt="-1.5" placeholder="Year" />
                                    </Stack>
                                </Select.Trigger>
                                <Select.IndicatorGroup>
                                    <Select.Indicator />
                                </Select.IndicatorGroup>
                            </Select.Control>
                            <Portal>
                                <Select.Positioner>
                                    <Select.Content>
                                        {yearCollection.items.map((item: any) => (
                                            <Select.Item item={item} key={item.value}>
                                                {item.label}
                                                <Select.ItemIndicator />
                                            </Select.Item>
                                        ))}
                                    </Select.Content>
                                </Select.Positioner>
                            </Portal>
                        </Select.Root>

                        <Select.Root size="md" width={{ base: "full", md: "140px" }} collection={monthCollection} value={[monthFilter]} onValueChange={(e) => setMonthFilter(e.value[0])}>
                            <Select.HiddenSelect />
                            <Select.Control>
                                <Select.Trigger bg="bg" rounded="xl">
                                    <Stack gapY="0" justify="center" w="full">
                                        <Span color="fg.subtle" fontSize="xs">Month</Span>
                                        <Select.ValueText mt="-1.5" placeholder="Month" />
                                    </Stack>
                                </Select.Trigger>
                                <Select.IndicatorGroup>
                                    <Select.Indicator />
                                </Select.IndicatorGroup>
                            </Select.Control>
                            <Portal>
                                <Select.Positioner>
                                    <Select.Content>
                                        {monthCollection.items.map((item) => (
                                            <Select.Item item={item} key={item.value}>
                                                {item.label}
                                                <Select.ItemIndicator />
                                            </Select.Item>
                                        ))}
                                    </Select.Content>
                                </Select.Positioner>
                            </Portal>
                        </Select.Root>

                        <Select.Root size="md" width={{ base: "full", md: "100px" }} collection={weekCollection} value={[weekFilter]} onValueChange={(e) => setWeekFilter(e.value[0])}>
                            <Select.HiddenSelect />
                            <Select.Control>
                                <Select.Trigger bg="bg" rounded="xl">
                                    <Stack gapY="0" justify="center" w="full">
                                        <Span color="fg.subtle" fontSize="xs">Week</Span>
                                        <Select.ValueText mt="-1.5" placeholder="Week" />
                                    </Stack>
                                </Select.Trigger>
                                <Select.IndicatorGroup>
                                    <Select.Indicator />
                                </Select.IndicatorGroup>
                            </Select.Control>
                            <Portal>
                                <Select.Positioner>
                                    <Select.Content>
                                        {weekCollection.items.map((item: any) => (
                                            <Select.Item item={item} key={item.value}>
                                                {item.label}
                                                <Select.ItemIndicator />
                                            </Select.Item>
                                        ))}
                                    </Select.Content>
                                </Select.Positioner>
                            </Portal>
                        </Select.Root>

                        <Select.Root size="md" width={{ base: "full", md: "200px" }} collection={districtCollection} value={[districtFilter]} onValueChange={(e) => setDistrictFilter(e.value[0])}>
                            <Select.HiddenSelect />
                            <Select.Control>
                                <Select.Trigger bg="bg" rounded="xl">
                                    <Stack gapY="0" justify="center" w="full">
                                        <Span color="fg.subtle" fontSize="xs">District</Span>
                                        <Select.ValueText mt="-1.5" placeholder="District" />
                                    </Stack>
                                </Select.Trigger>
                                <Select.IndicatorGroup>
                                    <Select.Indicator />
                                </Select.IndicatorGroup>
                            </Select.Control>
                            <Portal>
                                <Select.Positioner>
                                    <Select.Content>
                                        {districtCollection.items.map((item: any) => (
                                            <Select.Item item={item} key={item.value}>
                                                {item.label}
                                                <Select.ItemIndicator />
                                            </Select.Item>
                                        ))}
                                    </Select.Content>
                                </Select.Positioner>
                            </Portal>
                        </Select.Root>

                        <Button variant="surface" colorPalette={"red"} onClick={() => { setDistrictFilter(""); setWeekFilter(""); setMonthFilter(""); setYearFilter(""); }}>
                            <CloseCircle />   Reset Filters
                        </Button>
                    </HStack>
                </VStack>

            </VStack>
        </>
    )
}

export default AttendanceHeader