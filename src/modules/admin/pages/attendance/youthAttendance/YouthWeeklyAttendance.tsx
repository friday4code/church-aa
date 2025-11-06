// components/attendance/YouthWeeklyAttendance.tsx
"use client"

import { useState, useMemo, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router"
import {
    Box,
    Heading,
    HStack,
    VStack,
    Button,
    Input,
    InputGroup,
    Table,
    IconButton,
    Menu,
    Portal,
    Dialog,
    CloseButton,
    Field,
    Card,
    Flex,
    Pagination,
    ButtonGroup,
    Checkbox,
    ActionBar,
    Tabs,
    Text,
    Badge,
    Select,
    NumberInput,
    createListCollection,
} from "@chakra-ui/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Add, ArrowLeft3, ArrowRight3, Copy, DocumentDownload, DocumentText, Edit, More, ReceiptText, SearchNormal1, Trash } from "iconsax-reactjs"
import { useQueryErrorResetBoundary } from "@tanstack/react-query"
import { ENV } from "@/config/env"
import { ErrorBoundary } from "react-error-boundary"
import ErrorFallback from "@/components/ErrorFallback"
import { calculateTotals, copyYouthWeeklyToClipboard, exportYouthWeeklyToCSV, exportYouthWeeklyToExcel, exportYouthWeeklyToPDF, getMonthOptions, getWeekOptions, getYearOptions } from "@/utils/youthMinistry/youthWeekly.utils"
import { useYouthWeeklyStore, type YouthWeeklyAttendance } from "@/modules/admin/stores/youthMinistry/youthWeekly.store"
import { youthWeeklySchema, type YouthWeeklyFormData } from "@/modules/admin/schemas/youthMinistry/youthWeekly.schema"

// UUID generator function
const uuid = () => {
    return Math.random().toString(36).substring(2, 15)
}

// collections
const monthCollection = createListCollection({
    items: getMonthOptions().map(month => ({
        label: month,
        value: month
    }))
});

const weekCollection = createListCollection({
    items: getWeekOptions().map(week => ({
        label: `Week ${week}`,
        value: week.toString()
    }))
});

const yearCollection = createListCollection({
    items: getYearOptions().map(year => ({
        label: year.toString(),
        value: year.toString()
    }))
});

// Bulk Edit Dialog Component
interface BulkEditDialogProps {
    isOpen: boolean
    selectedAttendances: number[]
    attendances: YouthWeeklyAttendance[]
    onClose: () => void
    onUpdate: (id: number, data: Partial<YouthWeeklyFormData>) => void
}

const BulkEditDialog = ({ isOpen, selectedAttendances, attendances, onClose, onUpdate }: BulkEditDialogProps) => {
    const [tabs, setTabs] = useState<Array<{ id: string; attendance: YouthWeeklyAttendance; title: string }>>([])
    const [selectedTab, setSelectedTab] = useState<string | null>(null)

    useEffect(() => {
        if (isOpen && selectedAttendances.length > 0) {
            const initialTabs = selectedAttendances.map(attendanceId => {
                const attendance = attendances.find(a => a.id === attendanceId)
                return {
                    id: uuid(),
                    attendance: attendance!,
                    title: `${attendance?.period}`
                }
            })
            setTabs(initialTabs)
            setSelectedTab(initialTabs[0]?.id || null)
        }
    }, [isOpen, selectedAttendances, attendances])

    const removeTab = (id: string) => {
        if (tabs.length > 1) {
            const newTabs = tabs.filter(tab => tab.id !== id)
            setTabs(newTabs)

            if (selectedTab === id) {
                setSelectedTab(newTabs[0]?.id || null)
            }
        } else {
            onClose()
        }
    }

    const handleTabUpdate = (tabId: string, data: Partial<YouthWeeklyFormData>) => {
        const tab = tabs.find(t => t.id === tabId)
        if (tab) {
            onUpdate(tab.attendance.id, data)
            removeTab(tabId)
        }
    }

    return (
        <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content rounded="xl" maxW="4xl" w="full">
                        <Dialog.Header>
                            <Dialog.Title>Update Youth Weekly Attendance</Dialog.Title>
                        </Dialog.Header>

                        <Dialog.Body>
                            <Tabs.Root
                                value={selectedTab}
                                variant="outline"
                                size="sm"
                                onValueChange={(e) => setSelectedTab(e.value)}
                            >
                                <Tabs.List flex="1 1 auto" overflowX="auto">
                                    {tabs.map((tab) => (
                                        <Tabs.Trigger value={tab.id} key={tab.id}>
                                            {tab.title}{" "}
                                            <CloseButton
                                                as="span"
                                                role="button"
                                                size="2xs"
                                                me="-2"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    removeTab(tab.id)
                                                }}
                                            />
                                        </Tabs.Trigger>
                                    ))}
                                </Tabs.List>

                                <Tabs.ContentGroup>
                                    {tabs.map((tab) => (
                                        <Tabs.Content value={tab.id} key={tab.id}>
                                            <AttendanceEditForm
                                                attendance={tab.attendance}
                                                onUpdate={(data) => handleTabUpdate(tab.id, data)}
                                                onCancel={() => removeTab(tab.id)}
                                            />
                                        </Tabs.Content>
                                    ))}
                                </Tabs.ContentGroup>
                            </Tabs.Root>
                        </Dialog.Body>

                        <Dialog.Footer>
                            <Dialog.ActionTrigger asChild>
                                <Button variant="outline" rounded="xl">Close</Button>
                            </Dialog.ActionTrigger>
                        </Dialog.Footer>

                        <Dialog.CloseTrigger asChild>
                            <CloseButton size="sm" />
                        </Dialog.CloseTrigger>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    )
}

// Bulk Delete Dialog Component
interface BulkDeleteDialogProps {
    isOpen: boolean
    selectedAttendances: number[]
    attendances: YouthWeeklyAttendance[]
    onClose: () => void
    onConfirm: (ids: number[]) => void
}

const BulkDeleteDialog = ({ isOpen, selectedAttendances, attendances, onClose, onConfirm }: BulkDeleteDialogProps) => {
    const selectedAttendanceDetails = attendances
        .filter(attendance => selectedAttendances.includes(attendance.id))
        .map(attendance => attendance.period)

    const handleConfirm = () => {
        onConfirm(selectedAttendances)
        onClose()
    }

    return (
        <Dialog.Root role="alertdialog" open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content rounded="xl">
                        <Dialog.Header>
                            <Dialog.Title>Delete Multiple Attendance Records</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body>
                            <VStack align="stretch" gap="3">
                                <Text>
                                    Are you sure you want to delete <strong>{selectedAttendances.length} attendance record(s)</strong>?
                                    This action cannot be undone.
                                </Text>

                                {selectedAttendanceDetails.length > 0 && (
                                    <Box>
                                        <Text fontWeight="medium" mb="2">Records to be deleted:</Text>
                                        <Box
                                            maxH="200px"
                                            overflowY="auto"
                                            border="1px"
                                            borderColor="gray.200"
                                            rounded="md"
                                            p="3"
                                            bg="gray.50"
                                        >
                                            <VStack align="start" gap="1">
                                                {selectedAttendanceDetails.map((detail, index) => (
                                                    <Text key={index} fontSize="sm">• {detail}</Text>
                                                ))}
                                            </VStack>
                                        </Box>
                                    </Box>
                                )}
                            </VStack>
                        </Dialog.Body>
                        <Dialog.Footer>
                            <Dialog.ActionTrigger asChild>
                                <Button variant="outline" rounded="xl">Cancel</Button>
                            </Dialog.ActionTrigger>
                            <Button colorPalette="red" rounded="xl" onClick={handleConfirm}>
                                Delete {selectedAttendances.length} Record{selectedAttendances.length > 1 ? 's' : ''}
                            </Button>
                        </Dialog.Footer>
                        <Dialog.CloseTrigger asChild>
                            <CloseButton size="sm" />
                        </Dialog.CloseTrigger>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    )
}

// Individual Attendance Edit Form
interface AttendanceEditFormProps {
    attendance: YouthWeeklyAttendance
    onUpdate: (data: Partial<YouthWeeklyFormData>) => void
    onCancel: () => void
}

const AttendanceEditForm = ({ attendance, onUpdate, onCancel }: AttendanceEditFormProps) => {
    const { register, handleSubmit, formState: { errors }, setValue } = useForm<YouthWeeklyFormData>({
        resolver: zodResolver(youthWeeklySchema),
        defaultValues: {
            year: attendance.year,
            month: attendance.month,
            week: attendance.week,
            membersBoys: attendance.membersBoys,
            visitorsBoys: attendance.visitorsBoys,
            membersGirls: attendance.membersGirls,
            visitorsGirls: attendance.visitorsGirls,
            period: attendance.period
        }
    })

    const onSubmit = (data: YouthWeeklyFormData) => {
        onUpdate(data)
    }

    return (
        <VStack gap="4" align="stretch">
            <Text fontSize="sm" color="gray.600" mb="2">
                Editing: <strong>{attendance.period}</strong>
            </Text>

            <form id={`attendance-form-${attendance.id}`} onSubmit={handleSubmit(onSubmit)}>
                <VStack gap="4" colorPalette={"accent"}>
                    <HStack gap="4" w="full">
                        <Field.Root required invalid={!!errors.year}>
                            <Field.Label>Year
                                <Field.RequiredIndicator />
                            </Field.Label>
                            <Select.Root
                                collection={yearCollection}
                                size="sm"
                                {...register('year')}
                            >
                                <Select.HiddenSelect />
                                <Select.Control>
                                    <Select.Trigger rounded="lg">
                                        <Select.ValueText placeholder="Select year" />
                                    </Select.Trigger>
                                    <Select.IndicatorGroup>
                                        <Select.Indicator />
                                    </Select.IndicatorGroup>
                                </Select.Control>
                                <Portal>
                                    <Select.Positioner>
                                        <Select.Content>
                                            {yearCollection.items.map((year) => (
                                                <Select.Item item={year} key={year.value}>
                                                    {year.label}
                                                    <Select.ItemIndicator />
                                                </Select.Item>
                                            ))}
                                        </Select.Content>
                                    </Select.Positioner>
                                </Portal>
                            </Select.Root>
                            <Field.ErrorText>{errors.year?.message}</Field.ErrorText>
                        </Field.Root>

                        <Field.Root required invalid={!!errors.month}>
                            <Field.Label>Month
                                <Field.RequiredIndicator />
                            </Field.Label>
                            <Select.Root
                                collection={monthCollection}
                                size="sm"
                                {...register('month')}
                            >
                                <Select.HiddenSelect />
                                <Select.Control>
                                    <Select.Trigger rounded="lg">
                                        <Select.ValueText placeholder="Select month" />
                                    </Select.Trigger>
                                    <Select.IndicatorGroup>
                                        <Select.Indicator />
                                    </Select.IndicatorGroup>
                                </Select.Control>
                                <Portal>
                                    <Select.Positioner>
                                        <Select.Content>
                                            {monthCollection.items.map((month) => (
                                                <Select.Item item={month} key={month.value}>
                                                    {month.label}
                                                    <Select.ItemIndicator />
                                                </Select.Item>
                                            ))}
                                        </Select.Content>
                                    </Select.Positioner>
                                </Portal>
                            </Select.Root>
                            <Field.ErrorText>{errors.month?.message}</Field.ErrorText>
                        </Field.Root>
                    </HStack>

                    <Field.Root required invalid={!!errors.week}>
                        <Field.Label>Week
                            <Field.RequiredIndicator />
                        </Field.Label>
                        <Select.Root
                            collection={weekCollection}
                            size="sm"
                            {...register('week')}
                        >
                            <Select.HiddenSelect />
                            <Select.Control>
                                <Select.Trigger rounded="lg">
                                    <Select.ValueText placeholder="Select week" />
                                </Select.Trigger>
                                <Select.IndicatorGroup>
                                    <Select.Indicator />
                                </Select.IndicatorGroup>
                            </Select.Control>
                            <Portal>
                                <Select.Positioner>
                                    <Select.Content>
                                        {weekCollection.items.map((week) => (
                                            <Select.Item item={week} key={week.value}>
                                                {week.label}
                                                <Select.ItemIndicator />
                                            </Select.Item>
                                        ))}
                                    </Select.Content>
                                </Select.Positioner>
                            </Portal>
                        </Select.Root>
                        <Field.ErrorText>{errors.week?.message}</Field.ErrorText>
                    </Field.Root>

                    <Heading size="md" w="full" mt="4">Attendance Numbers</Heading>

                    <HStack gap="4" w="full">
                        <Field.Root required invalid={!!errors.membersBoys}>
                            <Field.Label>Members Boys</Field.Label>
                            <NumberInput.Root
                                min={0}
                                value={String(attendance.membersBoys)}
                                onValueChange={(e) => setValue('membersBoys', e.valueAsNumber)}
                            >
                                <NumberInput.Input rounded="lg" {...register('membersBoys', { valueAsNumber: true })} />
                            </NumberInput.Root>
                            <Field.ErrorText>{errors.membersBoys?.message}</Field.ErrorText>
                        </Field.Root>

                        <Field.Root required invalid={!!errors.visitorsBoys}>
                            <Field.Label>Visitors Boys</Field.Label>
                            <NumberInput.Root
                                min={0}
                                value={String(attendance.visitorsBoys)}
                                onValueChange={(e) => setValue('visitorsBoys', e.valueAsNumber)}
                            >
                                <NumberInput.Input rounded="lg" {...register('visitorsBoys', { valueAsNumber: true })} />
                            </NumberInput.Root>
                            <Field.ErrorText>{errors.visitorsBoys?.message}</Field.ErrorText>
                        </Field.Root>
                    </HStack>

                    <HStack gap="4" w="full">
                        <Field.Root required invalid={!!errors.membersGirls}>
                            <Field.Label>Members Girls</Field.Label>
                            <NumberInput.Root
                                min={0}
                                value={String(attendance.membersGirls)}
                                onValueChange={(e) => setValue('membersGirls', e.valueAsNumber)}
                            >
                                <NumberInput.Input rounded="lg" {...register('membersGirls', { valueAsNumber: true })} />
                            </NumberInput.Root>
                            <Field.ErrorText>{errors.membersGirls?.message}</Field.ErrorText>
                        </Field.Root>

                        <Field.Root required invalid={!!errors.visitorsGirls}>
                            <Field.Label>Visitors Girls</Field.Label>
                            <NumberInput.Root
                                min={0}
                                value={String(attendance.visitorsGirls)}
                                onValueChange={(e) => setValue('visitorsGirls', e.valueAsNumber)}
                            >
                                <NumberInput.Input rounded="lg" {...register('visitorsGirls', { valueAsNumber: true })} />
                            </NumberInput.Root>
                            <Field.ErrorText>{errors.visitorsGirls?.message}</Field.ErrorText>
                        </Field.Root>
                    </HStack>
                </VStack>
            </form>

            <HStack justify="flex-end" gap="2" mt="4">
                <Button rounded="xl" variant="outline" size="sm" onClick={onCancel}>
                    Skip
                </Button>
                <Button
                    rounded="xl"
                    size="sm"
                    colorPalette="accent"
                    type="submit"
                    form={`attendance-form-${attendance.id}`}
                >
                    Update & Close
                </Button>
            </HStack>
        </VStack>
    )
}

const YouthWeeklyAttendancePage: React.FC = () => {
    const { reset } = useQueryErrorResetBoundary();

    return (
        <>
            <title>Youth Weekly Attendance | {ENV.APP_NAME}</title>
            <meta
                name="description"
                content="Manage Youth Weekly Attendance data"
            />
            <ErrorBoundary
                onReset={reset}
                fallbackRender={({ resetErrorBoundary, error }) => (
                    <ErrorFallback {...{ resetErrorBoundary, error }} />
                )}
            >
                <Content />
            </ErrorBoundary>
        </>
    );
};

export default YouthWeeklyAttendancePage;

const Content = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const [sortField, setSortField] = useState<keyof YouthWeeklyAttendance>('period')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
    const [currentPage, setCurrentPage] = useState(1)
    const pageSize = 10
    const [selectedAttendances, setSelectedAttendances] = useState<number[]>([])
    const [isActionBarOpen, setIsActionBarOpen] = useState(false)
    const [isBulkEditOpen, setIsBulkEditOpen] = useState(false)
    const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false)
    const navigate = useNavigate();

    const { attendances, addAttendance, updateAttendance, deleteAttendance } = useYouthWeeklyStore()

    const searchQuery = searchParams.get('search') || ''
    const [dialogState, setDialogState] = useState<{
        isOpen: boolean
        attendance?: YouthWeeklyAttendance
        mode: 'add' | 'edit'
    }>({ isOpen: false, mode: 'add' })

    const [deleteDialogState, setDeleteDialogState] = useState<{
        isOpen: boolean
        attendance?: YouthWeeklyAttendance
    }>({ isOpen: false })

    // Filter and sort attendances
    const filteredAndSortedAttendances = useMemo(() => {
        let filtered = attendances.filter(attendance =>
            attendance.period.toLowerCase().includes(searchQuery.toLowerCase()) ||
            attendance.year.toString().includes(searchQuery) ||
            attendance.month.toLowerCase().includes(searchQuery.toLowerCase())
        )

        // Sorting
        filtered.sort((a, b) => {
            const aValue = a[sortField]
            const bValue = b[sortField]

            // Safely handle undefined/null values
            if (aValue == null && bValue == null) return 0
            if (aValue == null) return sortOrder === 'asc' ? -1 : 1
            if (bValue == null) return sortOrder === 'asc' ? 1 : -1

            const aStr = String(aValue).toLowerCase()
            const bStr = String(bValue).toLowerCase()

            if (aStr < bStr) return sortOrder === 'asc' ? -1 : 1
            if (aStr > bStr) return sortOrder === 'asc' ? 1 : -1
            return 0
        })

        return filtered
    }, [attendances, searchQuery, sortField, sortOrder])

    // Calculate totals
    const totals = useMemo(() => calculateTotals(filteredAndSortedAttendances), [filteredAndSortedAttendances])

    // Pagination
    const totalPages = Math.ceil(filteredAndSortedAttendances.length / pageSize)
    const paginatedAttendances = filteredAndSortedAttendances.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    )

    // Selection logic
    const allIdsOnCurrentPage = paginatedAttendances.map(attendance => attendance.id)
    const allIds = filteredAndSortedAttendances.map(attendance => attendance.id)

    const isAllSelectedOnPage = paginatedAttendances.length > 0 &&
        paginatedAttendances.every(attendance => selectedAttendances.includes(attendance.id))

    const isAllSelected = filteredAndSortedAttendances.length > 0 &&
        filteredAndSortedAttendances.every(attendance => selectedAttendances.includes(attendance.id))

    const handleSelectAllOnPage = () => {
        if (isAllSelectedOnPage) {
            setSelectedAttendances(prev => prev.filter(id => !allIdsOnCurrentPage.includes(id)))
        } else {
            setSelectedAttendances(prev => [...new Set([...prev, ...allIdsOnCurrentPage])])
        }
    }

    const handleSelectAll = () => {
        if (isAllSelected) {
            setSelectedAttendances([])
        } else {
            setSelectedAttendances(allIds)
        }
    }

    const handleSelectAttendance = (attendanceId: number) => {
        setSelectedAttendances(prev =>
            prev.includes(attendanceId)
                ? prev.filter(id => id !== attendanceId)
                : [...prev, attendanceId]
        )
    }

    const handleSearch = (value: string) => {
        setSearchParams(s => (s.set("search", value), s))
        setCurrentPage(1)
    }

    const handleSort = (field: keyof YouthWeeklyAttendance) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortOrder('asc')
        }
    }

    const handleDeleteAttendance = (attendance: YouthWeeklyAttendance) => {
        setDeleteDialogState({ isOpen: true, attendance })
    }

    const confirmDelete = () => {
        if (deleteDialogState.attendance) {
            deleteAttendance(deleteDialogState.attendance.id)
            setDeleteDialogState({ isOpen: false })
        }
    }

    // Bulk actions
    const handleBulkDelete = () => {
        setIsBulkDeleteOpen(true)
    }

    const confirmBulkDelete = (ids: number[]) => {
        ids.forEach(id => deleteAttendance(id))
        setSelectedAttendances([])
        setIsActionBarOpen(false)
        setIsBulkDeleteOpen(false)
    }

    const handleBulkEdit = () => {
        setIsBulkEditOpen(true)
    }

    const handleBulkUpdate = (id: number, data: Partial<YouthWeeklyFormData>) => {
        updateAttendance(id, data)
        setSelectedAttendances(prev => prev.filter(attendanceId => attendanceId !== id))
    }

    const handleBulkEditClose = () => {
        setIsBulkEditOpen(false)
        if (selectedAttendances.length === 0) {
            setIsActionBarOpen(false)
        }
    }

    // Close action bar when no items are selected
    useEffect(() => {
        if (selectedAttendances.length === 0 && isActionBarOpen) {
            setIsActionBarOpen(false)
        } else if (selectedAttendances.length > 0 && !isActionBarOpen) {
            setIsActionBarOpen(true)
        }
    }, [selectedAttendances, isActionBarOpen])

    return (
        <>
            <VStack gap="6" align="stretch">
                {/* Header */}
                <HStack>
                    <IconButton size="sm" rounded="xl" colorPalette={"accent"} onClick={() => navigate(-1)}>
                        <ArrowLeft3 />
                    </IconButton>
                </HStack>

                <Flex
                    justify="space-between"
                    align="center"
                    pos="sticky"
                    top={6}
                    zIndex={"sticky"}
                    backdropFilter={"blur(20px)"}
                >
                    <HStack>
                        <Heading size="3xl">Youth Weekly Attendance</Heading>
                        <Badge colorPalette={"accent"}>{attendances.length}</Badge>
                    </HStack>

                    <HStack gap="4">
                        <Button
                            colorPalette="accent"
                            rounded="xl"
                            onClick={() => setDialogState({ isOpen: true, mode: 'add' })}
                        >
                            <Add />
                            Add Attendance
                        </Button>
                    </HStack>
                </Flex>

                {/* Totals Summary */}
                <Card.Root bg="accent.50" border="1px" borderColor="accent.200">
                    <Card.Body>
                        <HStack justify="space-around" textAlign="center">
                            <VStack>
                                <Text fontWeight="bold" color="accent.700">Members Boys</Text>
                                <Text fontSize="xl" fontWeight="bold">{totals.membersBoys}</Text>
                            </VStack>
                            <VStack>
                                <Text fontWeight="bold" color="accent.700">Visitors Boys</Text>
                                <Text fontSize="xl" fontWeight="bold">{totals.visitorsBoys}</Text>
                            </VStack>
                            <VStack>
                                <Text fontWeight="bold" color="accent.700">Members Girls</Text>
                                <Text fontSize="xl" fontWeight="bold">{totals.membersGirls}</Text>
                            </VStack>
                            <VStack>
                                <Text fontWeight="bold" color="accent.700">Visitors Girls</Text>
                                <Text fontSize="xl" fontWeight="bold">{totals.visitorsGirls}</Text>
                            </VStack>
                            <VStack>
                                <Text fontWeight="bold" color="accent.700">Total</Text>
                                <Text fontSize="xl" fontWeight="bold">{totals.total}</Text>
                            </VStack>
                        </HStack>
                    </Card.Body>
                </Card.Root>

                <Card.Root bg="transparent" border={"none"}>
                    <Card.Body p={0}>
                        <VStack gap="4">
                            {/* Export Buttons */}
                            <HStack justify="space-between" w="full">
                                <HStack>
                                    <Button
                                        rounded="xl"
                                        variant="solid"
                                        bg="whiteAlpha.500"
                                        color="accent"
                                        _hover={{ bg: "white" }}
                                        size="sm"
                                        onClick={async () => await copyYouthWeeklyToClipboard(attendances)}
                                    >
                                        <Copy />
                                        Copy
                                    </Button>
                                    <Button
                                        variant="solid"
                                        bg="whiteAlpha.500"
                                        color="accent"
                                        _hover={{ bg: "white" }}
                                        size="sm"
                                        rounded="xl"
                                        onClick={() => exportYouthWeeklyToExcel(attendances)}
                                    >
                                        <DocumentDownload />
                                        Excel
                                    </Button>
                                    <Button
                                        variant="solid"
                                        bg="whiteAlpha.500"
                                        color="accent"
                                        _hover={{ bg: "white" }}
                                        size="sm"
                                        rounded="xl"
                                        onClick={() => exportYouthWeeklyToCSV(attendances)}
                                    >
                                        <DocumentText />
                                        CSV
                                    </Button>
                                    <Button
                                        variant="solid"
                                        bg="whiteAlpha.500"
                                        color="accent"
                                        _hover={{ bg: "white" }}
                                        size="sm"
                                        rounded="xl"
                                        onClick={() => exportYouthWeeklyToPDF(attendances)}
                                    >
                                        <ReceiptText />
                                        PDF
                                    </Button>
                                </HStack>

                                {/* Search */}
                                <InputGroup bg="whiteAlpha.600" maxW="300px" colorPalette={"accent"} startElement={<SearchNormal1 />}>
                                    <Input
                                        rounded="xl"
                                        placeholder="Search attendance..."
                                        onChange={(e) => handleSearch(e.target.value)}
                                    />
                                </InputGroup>
                            </HStack>

                            {/* Table */}
                            <Table.ScrollArea borderWidth="1px" w="full" maxW={{ md: "990px", "mdToXl": "full", "2xl": "full" }} rounded="xl">
                                <Table.Root size="sm">
                                    <Table.Header>
                                        <Table.Row fontSize={"md"}>
                                            <Table.ColumnHeader w="50px">
                                                <Checkbox.Root
                                                    colorPalette={"accent"}
                                                    checked={isAllSelectedOnPage}
                                                    onCheckedChange={handleSelectAllOnPage}
                                                >
                                                    <Checkbox.HiddenInput />
                                                    <Checkbox.Control rounded="md" cursor={"pointer"} />
                                                </Checkbox.Root>
                                            </Table.ColumnHeader>
                                            <Table.ColumnHeader
                                                fontWeight={"bold"}
                                                cursor="pointer"
                                                onClick={() => handleSort('id')}
                                            >
                                                S/N {sortField === 'id' && (sortOrder === 'asc' ? '↑' : '↓')}
                                            </Table.ColumnHeader>
                                            <Table.ColumnHeader
                                                fontWeight={"bold"}
                                                cursor="pointer"
                                                onClick={() => handleSort('youthAttId')}
                                            >
                                                Youth Att ID {sortField === 'youthAttId' && (sortOrder === 'asc' ? '↑' : '↓')}
                                            </Table.ColumnHeader>
                                            <Table.ColumnHeader
                                                fontWeight={"bold"}
                                                cursor="pointer"
                                                onClick={() => handleSort('period')}
                                            >
                                                Period {sortField === 'period' && (sortOrder === 'asc' ? '↑' : '↓')}
                                            </Table.ColumnHeader>
                                            <Table.ColumnHeader
                                                fontWeight={"bold"}
                                                cursor="pointer"
                                                onClick={() => handleSort('membersBoys')}
                                            >
                                                Members Boys {sortField === 'membersBoys' && (sortOrder === 'asc' ? '↑' : '↓')}
                                            </Table.ColumnHeader>
                                            <Table.ColumnHeader
                                                fontWeight={"bold"}
                                                cursor="pointer"
                                                onClick={() => handleSort('visitorsBoys')}
                                            >
                                                Visitors Boys {sortField === 'visitorsBoys' && (sortOrder === 'asc' ? '↑' : '↓')}
                                            </Table.ColumnHeader>
                                            <Table.ColumnHeader
                                                fontWeight={"bold"}
                                                cursor="pointer"
                                                onClick={() => handleSort('membersGirls')}
                                            >
                                                Members Girls {sortField === 'membersGirls' && (sortOrder === 'asc' ? '↑' : '↓')}
                                            </Table.ColumnHeader>
                                            <Table.ColumnHeader
                                                fontWeight={"bold"}
                                                cursor="pointer"
                                                onClick={() => handleSort('visitorsGirls')}
                                            >
                                                Visitors Girls {sortField === 'visitorsGirls' && (sortOrder === 'asc' ? '↑' : '↓')}
                                            </Table.ColumnHeader>
                                            <Table.ColumnHeader
                                                fontWeight={"bold"}
                                                textAlign="center">
                                                Action
                                            </Table.ColumnHeader>
                                        </Table.Row>
                                    </Table.Header>
                                    <Table.Body>
                                        {paginatedAttendances.map((attendance) => (
                                            <Table.Row key={attendance.id} bg="whiteAlpha.500">
                                                <Table.Cell>
                                                    <Checkbox.Root
                                                        colorPalette={"accent"}
                                                        checked={selectedAttendances.includes(attendance.id)}
                                                        onCheckedChange={() => handleSelectAttendance(attendance.id)}
                                                    >
                                                        <Checkbox.HiddenInput />
                                                        <Checkbox.Control cursor="pointer" rounded="md" />
                                                    </Checkbox.Root>
                                                </Table.Cell>
                                                <Table.Cell>{attendance.id}</Table.Cell>
                                                <Table.Cell>{attendance.youthAttId}</Table.Cell>
                                                <Table.Cell fontWeight="medium">{attendance.period}</Table.Cell>
                                                <Table.Cell textAlign="center">{attendance.membersBoys}</Table.Cell>
                                                <Table.Cell textAlign="center">{attendance.visitorsBoys}</Table.Cell>
                                                <Table.Cell textAlign="center">{attendance.membersGirls}</Table.Cell>
                                                <Table.Cell textAlign="center">{attendance.visitorsGirls}</Table.Cell>
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
                                                                        onClick={() => setDialogState({
                                                                            isOpen: true,
                                                                            attendance,
                                                                            mode: 'edit'
                                                                        })}
                                                                    >
                                                                        <Edit /> Edit
                                                                    </Menu.Item>
                                                                    <Menu.Item
                                                                        color="red"
                                                                        value="delete"
                                                                        colorPalette="red"
                                                                        onClick={() => handleDeleteAttendance(attendance)}
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
                                    onPageChange={(d) => setCurrentPage(d.page)}
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
                        </VStack>
                    </Card.Body>
                </Card.Root>
            </VStack>

            {/* Action Bar for selected items */}
            <ActionBar.Root
                open={isActionBarOpen}
                onOpenChange={(s) => {
                    setIsActionBarOpen(s.open)
                    if (!s.open) {
                        setSelectedAttendances([]);
                    }
                }}
                closeOnInteractOutside={false}
            >
                <ActionBar.Positioner>
                    <ActionBar.Content rounded="xl" shadow="2xl">
                        <ActionBar.SelectionTrigger>
                            {selectedAttendances.length} selected
                        </ActionBar.SelectionTrigger>
                        <ActionBar.Separator />
                        <Button
                            rounded="xl"
                            variant="outline"
                            size="sm"
                            onClick={handleSelectAll}
                        >
                            {isAllSelected ? 'Deselect All' : 'Select All'}
                        </Button>
                        <Button
                            variant="outline"
                            rounded="xl"
                            size="sm"
                            onClick={handleBulkEdit}
                        >
                            <Edit />
                            Edit
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            rounded="xl"
                            colorPalette="red"
                            onClick={handleBulkDelete}
                        >
                            <Trash />
                            Delete
                        </Button>
                        <ActionBar.CloseTrigger asChild>
                            <CloseButton size="sm" rounded="xl" />
                        </ActionBar.CloseTrigger>
                    </ActionBar.Content>
                </ActionBar.Positioner>
            </ActionBar.Root>

            <Box>
                {/* Add/Edit Dialog */}
                <AttendanceDialog
                    {...dialogState}
                    onClose={() => setDialogState({ isOpen: false, mode: 'add' })}
                    onSave={(data) => {
                        if (dialogState.mode === 'add') {
                            addAttendance(data)
                        } else if (dialogState.attendance) {
                            updateAttendance(dialogState.attendance.id, data)
                        }
                        setDialogState({ isOpen: false, mode: 'add' })
                    }}
                />

                {/* Single Delete Confirmation Dialog */}
                <DeleteConfirmationDialog
                    isOpen={deleteDialogState.isOpen}
                    attendance={deleteDialogState.attendance}
                    onClose={() => setDeleteDialogState({ isOpen: false })}
                    onConfirm={confirmDelete}
                />

                {/* Bulk Delete Dialog */}
                <BulkDeleteDialog
                    isOpen={isBulkDeleteOpen}
                    selectedAttendances={selectedAttendances}
                    attendances={attendances}
                    onClose={() => setIsBulkDeleteOpen(false)}
                    onConfirm={confirmBulkDelete}
                />

                {/* Bulk Edit Dialog */}
                <BulkEditDialog
                    isOpen={isBulkEditOpen}
                    selectedAttendances={selectedAttendances}
                    attendances={attendances}
                    onClose={handleBulkEditClose}
                    onUpdate={handleBulkUpdate}
                />
            </Box >
        </>
    )
}

// Delete Confirmation Dialog Component
interface DeleteConfirmationDialogProps {
    isOpen: boolean
    attendance?: YouthWeeklyAttendance
    onClose: () => void
    onConfirm: () => void
}

const DeleteConfirmationDialog = ({ isOpen, attendance, onClose, onConfirm }: DeleteConfirmationDialogProps) => {
    return (
        <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content rounded="xl">
                        <Dialog.Header>
                            <Dialog.Title>Delete Attendance Record</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body>
                            <p>
                                Are you sure you want to delete the attendance record for <strong>{attendance?.period}</strong>?
                                This action cannot be undone.
                            </p>
                        </Dialog.Body>
                        <Dialog.Footer>
                            <Dialog.ActionTrigger asChild>
                                <Button variant="outline" rounded="xl">Cancel</Button>
                            </Dialog.ActionTrigger>
                            <Button colorPalette="red" rounded="xl" onClick={onConfirm}>
                                Delete
                            </Button>
                        </Dialog.Footer>
                        <Dialog.CloseTrigger asChild>
                            <CloseButton size="sm" />
                        </Dialog.CloseTrigger>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    )
}

// Attendance Form Dialog Component
interface AttendanceDialogProps {
    isOpen: boolean
    attendance?: YouthWeeklyAttendance
    mode: 'add' | 'edit'
    onClose: () => void
    onSave: (data: YouthWeeklyFormData) => void
}

const AttendanceDialog = ({ isOpen, attendance, mode, onClose, onSave }: AttendanceDialogProps) => {
    const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm<YouthWeeklyFormData>({
        resolver: zodResolver(youthWeeklySchema),
        defaultValues: {
            year: attendance?.year || new Date().getFullYear().toString(),
            month: attendance?.month || '',
            week: attendance?.week || '',
            membersBoys: attendance?.membersBoys || 0,
            visitorsBoys: attendance?.visitorsBoys || 0,
            membersGirls: attendance?.membersGirls || 0,
            visitorsGirls: attendance?.visitorsGirls || 0,
            period: attendance?.period || ''
        }
    })

    const onSubmit = (data: YouthWeeklyFormData) => {
        onSave(data)
        reset()
    }

    return (
        <Dialog.Root
            open={isOpen}
            onOpenChange={(e) => {
                if (!e.open) {
                    onClose()
                    reset();
                }
            }}
        >
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content rounded="xl" maxW="2xl">
                        <Dialog.Header>
                            <Dialog.Title>
                                {mode === 'add' ? 'Add Youth Weekly Attendance' : 'Update Attendance Record'}
                            </Dialog.Title>
                        </Dialog.Header>

                        <Dialog.Body>
                            <form noValidate id="attendance-form" onSubmit={handleSubmit(onSubmit)}>
                                <VStack gap="4" colorPalette={"accent"}>
                                    <HStack gap="4" w="full">
                                        <Field.Root required invalid={!!errors.year}>
                                            <Field.Label>Year
                                                <Field.RequiredIndicator />
                                            </Field.Label>
                                            <Select.Root
                                                collection={yearCollection}
                                                size="sm"
                                                {...register('year')}
                                            >
                                                <Select.HiddenSelect />
                                                <Select.Control>
                                                    <Select.Trigger rounded="lg">
                                                        <Select.ValueText placeholder="Select year" />
                                                    </Select.Trigger>
                                                    <Select.IndicatorGroup>
                                                        <Select.Indicator />
                                                    </Select.IndicatorGroup>
                                                </Select.Control>
                                                <Portal>
                                                    <Select.Positioner>
                                                        <Select.Content>
                                                            {yearCollection.items.map((year) => (
                                                                <Select.Item item={year} key={year.value}>
                                                                    {year.label}
                                                                    <Select.ItemIndicator />
                                                                </Select.Item>
                                                            ))}
                                                        </Select.Content>
                                                    </Select.Positioner>
                                                </Portal>
                                            </Select.Root>
                                            <Field.ErrorText>{errors.year?.message}</Field.ErrorText>
                                        </Field.Root>

                                        <Field.Root required invalid={!!errors.month}>
                                            <Field.Label>Month
                                                <Field.RequiredIndicator />
                                            </Field.Label>
                                            <Select.Root
                                                collection={monthCollection}
                                                size="sm"
                                                {...register('month')}
                                            >
                                                <Select.HiddenSelect />
                                                <Select.Control>
                                                    <Select.Trigger rounded="lg">
                                                        <Select.ValueText placeholder="Select month" />
                                                    </Select.Trigger>
                                                    <Select.IndicatorGroup>
                                                        <Select.Indicator />
                                                    </Select.IndicatorGroup>
                                                </Select.Control>
                                                <Portal>
                                                    <Select.Positioner>
                                                        <Select.Content>
                                                            {monthCollection.items.map((month) => (
                                                                <Select.Item item={month} key={month.value}>
                                                                    {month.label}
                                                                    <Select.ItemIndicator />
                                                                </Select.Item>
                                                            ))}
                                                        </Select.Content>
                                                    </Select.Positioner>
                                                </Portal>
                                            </Select.Root>
                                            <Field.ErrorText>{errors.month?.message}</Field.ErrorText>
                                        </Field.Root>
                                    </HStack>

                                    <Field.Root required invalid={!!errors.week}>
                                        <Field.Label>Week
                                            <Field.RequiredIndicator />
                                        </Field.Label>
                                        <Select.Root
                                            collection={weekCollection}
                                            size="sm"
                                            {...register('week')}
                                        >
                                            <Select.HiddenSelect />
                                            <Select.Control>
                                                <Select.Trigger rounded="lg">
                                                    <Select.ValueText placeholder="Select week" />
                                                </Select.Trigger>
                                                <Select.IndicatorGroup>
                                                    <Select.Indicator />
                                                </Select.IndicatorGroup>
                                            </Select.Control>
                                            <Portal>
                                                <Select.Positioner>
                                                    <Select.Content>
                                                        {weekCollection.items.map((week) => (
                                                            <Select.Item item={week} key={week.value}>
                                                                {week.label}
                                                                <Select.ItemIndicator />
                                                            </Select.Item>
                                                        ))}
                                                    </Select.Content>
                                                </Select.Positioner>
                                            </Portal>
                                        </Select.Root>
                                        <Field.ErrorText>{errors.week?.message}</Field.ErrorText>
                                    </Field.Root>

                                    <Heading size="md" w="full" mt="4">Attendance Numbers</Heading>

                                    <HStack gap="4" w="full">
                                        <Field.Root required invalid={!!errors.membersBoys}>
                                            <Field.Label>Members Boys</Field.Label>
                                            <NumberInput.Root
                                                min={0}
                                                defaultValue={(attendance?.membersBoys || 0).toString()}
                                                onValueChange={(e) => setValue('membersBoys', e.valueAsNumber)}
                                            >
                                                <NumberInput.Input rounded="lg" {...register('membersBoys', { valueAsNumber: true })} />
                                            </NumberInput.Root>
                                            <Field.ErrorText>{errors.membersBoys?.message}</Field.ErrorText>
                                        </Field.Root>

                                        <Field.Root required invalid={!!errors.visitorsBoys}>
                                            <Field.Label>Visitors Boys</Field.Label>
                                            <NumberInput.Root
                                                min={0}
                                                defaultValue={(attendance?.visitorsBoys || 0).toString()}
                                                onValueChange={(e) => setValue('visitorsBoys', e.valueAsNumber)}
                                            >
                                                <NumberInput.Input rounded="lg" {...register('visitorsBoys', { valueAsNumber: true })} />
                                            </NumberInput.Root>
                                            <Field.ErrorText>{errors.visitorsBoys?.message}</Field.ErrorText>
                                        </Field.Root>
                                    </HStack>

                                    <HStack gap="4" w="full">
                                        <Field.Root required invalid={!!errors.membersGirls}>
                                            <Field.Label>Members Girls</Field.Label>
                                            <NumberInput.Root
                                                min={0}
                                                defaultValue={(attendance?.membersGirls || 0).toString()}
                                                onValueChange={(e) => setValue('membersGirls', e.valueAsNumber)}
                                            >
                                                <NumberInput.Input rounded="lg" {...register('membersGirls', { valueAsNumber: true })} />
                                            </NumberInput.Root>
                                            <Field.ErrorText>{errors.membersGirls?.message}</Field.ErrorText>
                                        </Field.Root>

                                        <Field.Root required invalid={!!errors.visitorsGirls}>
                                            <Field.Label>Visitors Girls</Field.Label>
                                            <NumberInput.Root
                                                min={0}
                                                defaultValue={(attendance?.visitorsGirls || 0).toString()}
                                                onValueChange={(e) => setValue('visitorsGirls', e.valueAsNumber)}
                                            >
                                                <NumberInput.Input rounded="lg" {...register('visitorsGirls', { valueAsNumber: true })} />
                                            </NumberInput.Root>
                                            <Field.ErrorText>{errors.visitorsGirls?.message}</Field.ErrorText>
                                        </Field.Root>
                                    </HStack>
                                </VStack>
                            </form>
                        </Dialog.Body>

                        <Dialog.Footer>
                            <Dialog.ActionTrigger asChild>
                                <Button rounded="xl" variant="outline">Cancel</Button>
                            </Dialog.ActionTrigger>
                            <Button rounded="xl" type="submit" form="attendance-form" colorPalette="accent">
                                {mode === 'add' ? 'Add Attendance' : 'Update Attendance'}
                            </Button>
                        </Dialog.Footer>

                        <Dialog.CloseTrigger asChild>
                            <CloseButton size="sm" />
                        </Dialog.CloseTrigger>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    )
}