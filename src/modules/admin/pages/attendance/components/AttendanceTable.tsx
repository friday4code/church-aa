"use client"

import {
    Table,
    Checkbox,
    IconButton,
    Menu,
    Portal,
    ButtonGroup,
    Pagination,
    HStack,
    Button,
} from "@chakra-ui/react"
import { More, Edit, Trash, ArrowLeft3, ArrowRight3 } from "iconsax-reactjs"
import { type AttendanceRecord, type ServiceType } from "@/types/attendance.type"
import {
    exportAttendanceToExcel,
    exportAttendanceToCSV,
    exportAttendanceToPDF,
    copyAttendanceToClipboard,
} from "@/utils/attendance.utils"
import { useDistricts } from "@/modules/admin/hooks/useDistrict"

interface AttendanceTableProps {
    paginatedAttendances: AttendanceRecord[]
    selectedAttendances: number[]
    sortField: keyof AttendanceRecord
    sortOrder: 'asc' | 'desc'
    currentPage: number
    totalPages: number
    isAllSelectedOnPage: boolean
    serviceType: ServiceType
    onSort: (field: keyof AttendanceRecord) => void
    onSelectAllOnPage: () => void
    onSelectAttendance: (attendanceId: number) => void
    onEditAttendance: (attendance: AttendanceRecord) => void
    onDeleteAttendance: (attendance: AttendanceRecord) => void
    onPageChange: (page: number) => void
}

const AttendanceTable = ({
    paginatedAttendances,
    selectedAttendances,
    sortField,
    sortOrder,
    currentPage,
    totalPages,
    isAllSelectedOnPage,
    onSort,
    onSelectAllOnPage,
    onSelectAttendance,
    onEditAttendance,
    onDeleteAttendance,
    onPageChange,
}: AttendanceTableProps) => {
    const { districts = [] } = useDistricts()
    const getDistrictName = (districtId: number): string => {
        const district = districts.find(d => d.id === districtId)
        return district?.name || `District ${districtId}`
    }

    return (
        <>
            {/* Export Buttons */}
            <HStack justify="space-between" w="full">
                <HStack>
                    <Button
                        rounded="xl"
                        variant="solid"
                        bg={{ base: "whiteAlpha.500", _dark: "whiteAlpha.100" }}
                        color={{ base: "accent", _dark: "accent.100" }}
                        _hover={{ bg: { base: "white", _dark: "whiteAlpha.200" } }}
                        size="sm"
                        onClick={async () => await copyAttendanceToClipboard(paginatedAttendances, districts)}
                    >
                        Copy
                    </Button>
                    <Button
                        variant="solid"
                        bg={{ base: "whiteAlpha.500", _dark: "whiteAlpha.100" }}
                        color={{ base: "accent", _dark: "accent.100" }}
                        _hover={{ bg: { base: "white", _dark: "whiteAlpha.200" } }}
                        size="sm"
                        rounded="xl"
                        onClick={() => exportAttendanceToExcel(paginatedAttendances, districts)}
                    >
                        Excel
                    </Button>
                    <Button
                        variant="solid"
                        bg={{ base: "whiteAlpha.500", _dark: "whiteAlpha.100" }}
                        color={{ base: "accent", _dark: "accent.100" }}
                        _hover={{ bg: { base: "white", _dark: "whiteAlpha.200" } }}
                        size="sm"
                        rounded="xl"
                        onClick={() => exportAttendanceToCSV(paginatedAttendances, districts)}
                    >
                        CSV
                    </Button>
                    <Button
                        variant="solid"
                        bg={{ base: "whiteAlpha.500", _dark: "whiteAlpha.100" }}
                        color={{ base: "accent", _dark: "accent.100" }}
                        _hover={{ bg: { base: "white", _dark: "whiteAlpha.200" } }}
                        size="sm"
                        rounded="xl"
                        onClick={() => exportAttendanceToPDF(paginatedAttendances, districts)}
                    >
                        PDF
                    </Button>
                </HStack>
            </HStack>

            {/* Table */}
            <Table.ScrollArea _scrollbar={{ h: 1 }} _scrollbarThumb={{ bg: "bg.inverted/20", rounded: "full" }} borderWidth="1px" maxW={{ md: "62em", "2xl": "full" }} w={{ md: "62em", "2xl": "full" }} rounded="xl" borderColor={{ base: "gray.200", _dark: "gray.700" }}>
                <Table.Root size="sm">
                    <Table.Header bg={{ base: "gray.50", _dark: "gray.900" }}>
                        <Table.Row fontSize={"md"}>
                            <Table.ColumnHeader w="50px">
                                <Checkbox.Root
                                    colorPalette={"accent"}
                                    checked={isAllSelectedOnPage}
                                    onCheckedChange={onSelectAllOnPage}
                                >
                                    <Checkbox.HiddenInput />
                                    <Checkbox.Control rounded="md" cursor={"pointer"} />
                                </Checkbox.Root>
                            </Table.ColumnHeader>
                            <Table.ColumnHeader
                                fontWeight={"bold"}
                            >
                                S/N
                            </Table.ColumnHeader>
                            {/* <Table.ColumnHeader
                                fontWeight={"bold"}
                                cursor="pointer"
                                onClick={() => onSort('district_id')}
                            >
                                District {sortField === 'district_id' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </Table.ColumnHeader> */}
                            <Table.ColumnHeader
                                fontWeight={"bold"}
                                cursor="pointer"
                                onClick={() => onSort('month')}
                            >
                                Month {sortField === 'month' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </Table.ColumnHeader>
                            <Table.ColumnHeader
                                fontWeight={"bold"}
                                cursor="pointer"
                                onClick={() => onSort('week')}
                            >
                                Week {sortField === 'week' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </Table.ColumnHeader>
                            <Table.ColumnHeader
                                fontWeight={"bold"}
                                cursor="pointer"
                                onClick={() => onSort('year')}
                            >
                                Year {sortField === 'year' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </Table.ColumnHeader>
                            <Table.ColumnHeader
                                fontWeight={"bold"}
                                cursor="pointer"
                                onClick={() => onSort('men')}
                            >
                                Men {sortField === 'men' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </Table.ColumnHeader>
                            <Table.ColumnHeader
                                fontWeight={"bold"}
                                cursor="pointer"
                                onClick={() => onSort('women')}
                            >
                                Women {sortField === 'women' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </Table.ColumnHeader>
                            <Table.ColumnHeader
                                fontWeight={"bold"}
                                cursor="pointer"
                                onClick={() => onSort('youth_boys')}
                            >
                                Youth Boys {sortField === 'youth_boys' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </Table.ColumnHeader>
                            <Table.ColumnHeader
                                fontWeight={"bold"}
                                cursor="pointer"
                                onClick={() => onSort('youth_girls')}
                            >
                                Youth Girls {sortField === 'youth_girls' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </Table.ColumnHeader>
                            <Table.ColumnHeader
                                fontWeight={"bold"}
                                cursor="pointer"
                                onClick={() => onSort('children_boys')}
                            >
                                Children Boys {sortField === 'children_boys' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </Table.ColumnHeader>
                            <Table.ColumnHeader
                                fontWeight={"bold"}
                                cursor="pointer"
                                onClick={() => onSort('children_girls')}
                            >
                                Children Girls {sortField === 'children_girls' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </Table.ColumnHeader>
                            <Table.ColumnHeader
                                fontWeight={"bold"}
                                textAlign="center">
                                Action
                            </Table.ColumnHeader>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {paginatedAttendances.map((attendance, index) => (
                            <Table.Row key={attendance.id} bg={{ base: "whiteAlpha.500", _dark: "whiteAlpha.50" }} _hover={{ bg: { base: "whiteAlpha.700", _dark: "whiteAlpha.100" } }}>
                                <Table.Cell>
                                    <Checkbox.Root
                                        colorPalette={"accent"}
                                        checked={selectedAttendances.includes(attendance.id)}
                                        onCheckedChange={() => onSelectAttendance(attendance.id)}
                                    >
                                        <Checkbox.HiddenInput />
                                        <Checkbox.Control cursor="pointer" rounded="md" />
                                    </Checkbox.Root>
                                </Table.Cell>
                                <Table.Cell>{index + 1}</Table.Cell>
                                {/* <Table.Cell fontWeight="medium">
                                    {getDistrictName(attendance.district_id)}
                                </Table.Cell> */}
                                <Table.Cell>{attendance.month}</Table.Cell>
                                <Table.Cell>Week {attendance.week}</Table.Cell>
                                <Table.Cell>{attendance.year}</Table.Cell>
                                <Table.Cell>{attendance.men}</Table.Cell>
                                <Table.Cell>{attendance.women}</Table.Cell>
                                <Table.Cell>{attendance.youth_boys}</Table.Cell>
                                <Table.Cell>{attendance.youth_girls}</Table.Cell>
                                <Table.Cell>{attendance.children_boys}</Table.Cell>
                                <Table.Cell>{attendance.children_girls}</Table.Cell>
                                <Table.Cell textAlign="center">
                                    <Menu.Root>
                                        <Menu.Trigger asChild>
                                            <IconButton rounded="xl" variant="ghost" size="sm">
                                                <More />
                                            </IconButton>
                                        </Menu.Trigger>
                                        <Portal>
                                            <Menu.Positioner>
                                                <Menu.Content rounded="lg">
                                                    <Menu.Item
                                                        value="edit"
                                                        onClick={() => onEditAttendance(attendance)}
                                                    >
                                                        <Edit /> Edit
                                                    </Menu.Item>
                                                    <Menu.Item
                                                        color="red"
                                                        value="delete"
                                                        colorPalette="red"
                                                        onClick={() => onDeleteAttendance(attendance)}
                                                    >
                                                        <Trash /> Delete
                                                    </Menu.Item>
                                                </Menu.Content>
                                            </Menu.Positioner>
                                        </Portal>
                                    </Menu.Root>
                                </Table.Cell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table.Root>
            </Table.ScrollArea>

            {/* Pagination */}
            {totalPages > 1 && (
                <Pagination.Root
                    colorPalette={"accent"}
                    count={totalPages}
                    pageSize={1}
                    page={currentPage}
                    onPageChange={(d) => onPageChange(d.page)}
                >
                    <ButtonGroup variant="outline" size="sm">
                        <Pagination.PrevTrigger asChild>
                            <IconButton rounded="xl">
                                <ArrowLeft3 />
                            </IconButton>
                        </Pagination.PrevTrigger>

                        <Pagination.Items
                            render={(page) => (
                                <IconButton rounded="xl" variant={{ base: "outline", _selected: "solid" }}>
                                    {page.value}
                                </IconButton>
                            )}
                        />

                        <Pagination.NextTrigger asChild>
                            <IconButton rounded="xl">
                                <ArrowRight3 />
                            </IconButton>
                        </Pagination.NextTrigger>
                    </ButtonGroup>
                </Pagination.Root>
            )}
        </>
    )
}

export default AttendanceTable