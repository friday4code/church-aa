// components/youth-revival-attendance/YouthRevivalAttendance.tsx
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
    Textarea,
    NumberInput,
} from "@chakra-ui/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Add, ArrowLeft3, ArrowRight3, Copy, DocumentDownload, DocumentText, Edit, More, ReceiptText, SearchNormal1, Trash } from "iconsax-reactjs"
import { useQueryErrorResetBoundary } from "@tanstack/react-query"
import { ENV } from "@/config/env"
import { ErrorBoundary } from "react-error-boundary"
import ErrorFallback from "@/components/ErrorFallback"
import { type YouthRevivalAttendance, useYouthRevivalAttendanceStore } from "@/modules/admin/stores/youthMinistry/revival.store"
import { youthRevivalAttendanceSchema, type YouthRevivalAttendanceFormData } from "@/modules/admin/schemas/youthMinistry/revival.schema"
import { copyYouthRevivalAttendanceToClipboard, exportYouthRevivalAttendanceToExcel, exportYouthRevivalAttendanceToCSV, exportYouthRevivalAttendanceToPDF } from "@/utils/youthMinistry/revivalAttendance.utils"

// UUID generator function
const uuid = () => {
    return Math.random().toString(36).substring(2, 15)
}

// Bulk Edit Dialog Component
interface BulkEditDialogProps {
    isOpen: boolean
    selectedAttendances: number[]
    attendances: YouthRevivalAttendance[]
    onClose: () => void
    onUpdate: (id: number, data: Partial<YouthRevivalAttendanceFormData>) => void
}

const BulkEditDialog = ({ isOpen, selectedAttendances, attendances, onClose, onUpdate }: BulkEditDialogProps) => {
    const [tabs, setTabs] = useState<Array<{ id: string; attendance: YouthRevivalAttendance; title: string }>>([])
    const [selectedTab, setSelectedTab] = useState<string | null>(null)

    useEffect(() => {
        if (isOpen && selectedAttendances.length > 0) {
            const initialTabs = selectedAttendances.map(attendanceId => {
                const attendance = attendances.find(d => d.id === attendanceId)
                return {
                    id: uuid(),
                    attendance: attendance!,
                    title: attendance?.period || 'Attendance'
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

    const handleTabUpdate = (tabId: string, data: Partial<YouthRevivalAttendanceFormData>) => {
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
                            <Dialog.Title>Update Youth Revival Attendance</Dialog.Title>
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
                                            <YouthRevivalAttendanceEditForm
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
    attendances: YouthRevivalAttendance[]
    onClose: () => void
    onConfirm: (ids: number[]) => void
}

const BulkDeleteDialog = ({ isOpen, selectedAttendances, attendances, onClose, onConfirm }: BulkDeleteDialogProps) => {
    const selectedAttendancePeriods = attendances
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
                            <Dialog.Title>Delete Multiple Youth Revival Attendance Records</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body>
                            <VStack align="stretch" gap="3">
                                <Text>
                                    Are you sure you want to delete <strong>{selectedAttendances.length} record(s)</strong>?
                                    This action cannot be undone.
                                </Text>

                                {selectedAttendancePeriods.length > 0 && (
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
                                                {selectedAttendancePeriods.map((period, index) => (
                                                    <Text key={index} fontSize="sm">• {period}</Text>
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

// Individual Youth Revival Attendance Edit Form
interface YouthRevivalAttendanceEditFormProps {
    attendance: YouthRevivalAttendance
    onUpdate: (data: Partial<YouthRevivalAttendanceFormData>) => void
    onCancel: () => void
}

const YouthRevivalAttendanceEditForm = ({ attendance, onUpdate, onCancel }: YouthRevivalAttendanceEditFormProps) => {
    const { register, handleSubmit, formState: { errors } } = useForm<YouthRevivalAttendanceFormData>({
        resolver: zodResolver(youthRevivalAttendanceSchema),
        defaultValues: {
            period: attendance.period,
            male: attendance.male,
            female: attendance.female,
            testimony: attendance.testimony,
            challenges: attendance.challenges,
            solutions: attendance.solutions,
            remarks: attendance.remarks
        }
    })

    const onSubmit = (data: YouthRevivalAttendanceFormData) => {
        onUpdate(data)
    }

    return (
        <VStack gap="4" align="stretch">
            <Text fontSize="sm" color="gray.600" mb="2">
                Editing: <strong>{attendance.period}</strong>
            </Text>

            <form id={`attendance-form-${attendance.id}`} onSubmit={handleSubmit(onSubmit)}>
                <VStack gap="4" colorPalette={"accent"}>
                    <Field.Root required invalid={!!errors.period}>
                        <Field.Label>Period
                            <Field.RequiredIndicator />
                        </Field.Label>
                        <Input
                            rounded="lg"
                            placeholder="Enter period (e.g., Elelenwo - January - 2021)"
                            {...register('period')}
                        />
                        <Field.ErrorText>{errors.period?.message}</Field.ErrorText>
                    </Field.Root>

                    <HStack w="full" gap="4">
                        <Field.Root required invalid={!!errors.male}>
                            <Field.Label>Male
                                <Field.RequiredIndicator />
                            </Field.Label>
                            <NumberInput.Root>
                                <NumberInput.Input {...register("male")} rounded="lg" placeholder="Enter male count" />
                                <NumberInput.Control />
                            </NumberInput.Root>
                            <Field.ErrorText>{errors.male?.message}</Field.ErrorText>
                        </Field.Root>

                        <Field.Root required invalid={!!errors.female}>
                            <Field.Label>Female
                                <Field.RequiredIndicator />
                            </Field.Label>
                            <NumberInput.Root>
                                <NumberInput.Input {...register("female")} rounded="lg" placeholder="Enter female count" />
                                <NumberInput.Control />
                            </NumberInput.Root>
                            <Field.ErrorText>{errors.female?.message}</Field.ErrorText>
                        </Field.Root>
                    </HStack>

                    <Field.Root invalid={!!errors.testimony}>
                        <Field.Label>Testimony</Field.Label>
                        <Textarea
                            rounded="lg"
                            placeholder="Enter testimony (optional)"
                            rows={3}
                            {...register('testimony')}
                        />
                        <Field.ErrorText>{errors.testimony?.message}</Field.ErrorText>
                    </Field.Root>

                    <Field.Root invalid={!!errors.challenges}>
                        <Field.Label>Challenges</Field.Label>
                        <Textarea
                            rounded="lg"
                            placeholder="Enter challenges (optional)"
                            rows={3}
                            {...register('challenges')}
                        />
                        <Field.ErrorText>{errors.challenges?.message}</Field.ErrorText>
                    </Field.Root>

                    <Field.Root invalid={!!errors.solutions}>
                        <Field.Label>Solutions</Field.Label>
                        <Textarea
                            rounded="lg"
                            placeholder="Enter solutions (optional)"
                            rows={3}
                            {...register('solutions')}
                        />
                        <Field.ErrorText>{errors.solutions?.message}</Field.ErrorText>
                    </Field.Root>

                    <Field.Root invalid={!!errors.remarks}>
                        <Field.Label>Remarks</Field.Label>
                        <Textarea
                            rounded="lg"
                            placeholder="Enter remarks (optional)"
                            rows={3}
                            {...register('remarks')}
                        />
                        <Field.ErrorText>{errors.remarks?.message}</Field.ErrorText>
                    </Field.Root>
                </VStack>
            </form >

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
        </VStack >
    )
}

export const YouthRevivalAttendancePage: React.FC = () => {
    const { reset } = useQueryErrorResetBoundary();

    return (
        <>
            <title>Youth Revival Attendance | {ENV.APP_NAME}</title>
            <meta
                name="description"
                content="Manage youth revival attendance data"
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

export default YouthRevivalAttendancePage;

const Content = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const [sortField, setSortField] = useState<keyof YouthRevivalAttendance>('period')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
    const [currentPage, setCurrentPage] = useState(1)
    const pageSize = 10
    const [selectedAttendances, setSelectedAttendances] = useState<number[]>([])
    const [isActionBarOpen, setIsActionBarOpen] = useState(false)
    const [isBulkEditOpen, setIsBulkEditOpen] = useState(false)
    const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false)
    const navigate = useNavigate();


    const { youthRevivalAttendances, addAttendance, updateAttendance, deleteAttendance } = useYouthRevivalAttendanceStore()

    const searchQuery = searchParams.get('search') || ''
    const [dialogState, setDialogState] = useState<{
        isOpen: boolean
        attendance?: YouthRevivalAttendance
        mode: 'add' | 'edit'
    }>({ isOpen: false, mode: 'add' })

    const [deleteDialogState, setDeleteDialogState] = useState<{
        isOpen: boolean
        attendance?: YouthRevivalAttendance
    }>({ isOpen: false })

    // Filter and sort attendances
    const filteredAndSortedAttendances = useMemo(() => {
        let filtered = youthRevivalAttendances.filter(attendance =>
            attendance.period.toLowerCase().includes(searchQuery.toLowerCase()) ||
            attendance.testimony.toLowerCase().includes(searchQuery.toLowerCase()) ||
            attendance.challenges.toLowerCase().includes(searchQuery.toLowerCase()) ||
            attendance.solutions.toLowerCase().includes(searchQuery.toLowerCase()) ||
            attendance.remarks.toLowerCase().includes(searchQuery.toLowerCase())
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
    }, [youthRevivalAttendances, searchQuery, sortField, sortOrder])

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

    const handleSort = (field: keyof YouthRevivalAttendance) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortOrder('asc')
        }
    }

    const handleDeleteAttendance = (attendance: YouthRevivalAttendance) => {
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

    const handleBulkUpdate = (id: number, data: Partial<YouthRevivalAttendanceFormData>) => {
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
                        <Heading size="3xl">Youth Revival Attendance</Heading>
                        <Badge colorPalette={"accent"}>{youthRevivalAttendances.length}</Badge>
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
                                        onClick={async () => await copyYouthRevivalAttendanceToClipboard(youthRevivalAttendances)}
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
                                        onClick={() => exportYouthRevivalAttendanceToExcel(youthRevivalAttendances)}
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
                                        onClick={() => exportYouthRevivalAttendanceToCSV(youthRevivalAttendances)}
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
                                        onClick={() => exportYouthRevivalAttendanceToPDF(youthRevivalAttendances)}
                                    >
                                        <ReceiptText />
                                        PDF
                                    </Button>
                                </HStack>

                                {/* Search */}
                                <InputGroup bg="whiteAlpha.600" maxW="300px" colorPalette={"accent"} startElement={<SearchNormal1 />}>
                                    <Input
                                        rounded="xl"
                                        placeholder="Search attendance records..."
                                        onChange={(e) => handleSearch(e.target.value)}
                                    />
                                </InputGroup>
                            </HStack>

                            {/* Table */}
                            <Table.ScrollArea borderWidth="1px" maxW="full" w="full" rounded="xl">
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
                                                onClick={() => handleSort('period')}
                                            >
                                                Period {sortField === 'period' && (sortOrder === 'asc' ? '↑' : '↓')}
                                            </Table.ColumnHeader>
                                            <Table.ColumnHeader
                                                fontWeight={"bold"}
                                                cursor="pointer"
                                                onClick={() => handleSort('male')}
                                            >
                                                Male {sortField === 'male' && (sortOrder === 'asc' ? '↑' : '↓')}
                                            </Table.ColumnHeader>
                                            <Table.ColumnHeader
                                                fontWeight={"bold"}
                                                cursor="pointer"
                                                onClick={() => handleSort('female')}
                                            >
                                                Female {sortField === 'female' && (sortOrder === 'asc' ? '↑' : '↓')}
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
                                                <Table.Cell fontWeight="medium">{attendance.period}</Table.Cell>
                                                <Table.Cell>{attendance.male}</Table.Cell>
                                                <Table.Cell>{attendance.female}</Table.Cell>
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
                <YouthRevivalAttendanceDialog
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
                    attendances={youthRevivalAttendances}
                    onClose={() => setIsBulkDeleteOpen(false)}
                    onConfirm={confirmBulkDelete}
                />

                {/* Bulk Edit Dialog */}
                <BulkEditDialog
                    isOpen={isBulkEditOpen}
                    selectedAttendances={selectedAttendances}
                    attendances={youthRevivalAttendances}
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
    attendance?: YouthRevivalAttendance
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
                            <Dialog.Title>Delete Youth Revival Attendance</Dialog.Title>
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

// Youth Revival Attendance Form Dialog Component
interface YouthRevivalAttendanceDialogProps {
    isOpen: boolean
    attendance?: YouthRevivalAttendance
    mode: 'add' | 'edit'
    onClose: () => void
    onSave: (data: YouthRevivalAttendanceFormData) => void
}

const YouthRevivalAttendanceDialog = ({ isOpen, attendance, mode, onClose, onSave }: YouthRevivalAttendanceDialogProps) => {
    const { register, handleSubmit, formState: { errors }, reset } = useForm<YouthRevivalAttendanceFormData>({
        resolver: zodResolver(youthRevivalAttendanceSchema),
        defaultValues: {
            period: attendance?.period || '',
            male: attendance?.male || 0,
            female: attendance?.female || 0,
            testimony: attendance?.testimony || '',
            challenges: attendance?.challenges || '',
            solutions: attendance?.solutions || '',
            remarks: attendance?.remarks || ''
        }
    })

    const onSubmit = (data: YouthRevivalAttendanceFormData) => {
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
                                {mode === 'add' ? 'Add Youth Revival Attendance' : 'Update Youth Revival Attendance'}
                            </Dialog.Title>
                        </Dialog.Header>

                        <Dialog.Body>
                            <form noValidate id="youth-revival-attendance-form" onSubmit={handleSubmit(onSubmit)}>
                                <VStack gap="4" colorPalette={"accent"}>
                                    <Field.Root required invalid={!!errors.period}>
                                        <Field.Label>Period
                                            <Field.RequiredIndicator />
                                        </Field.Label>
                                        <Input
                                            rounded="lg"
                                            placeholder="Enter period (e.g., Elelenwo - January - 2021)"
                                            {...register('period')}
                                        />
                                        <Field.ErrorText>{errors.period?.message}</Field.ErrorText>
                                    </Field.Root>

                                    <HStack w="full" gap="4">
                                        <Field.Root required invalid={!!errors.male}>
                                            <Field.Label>Male
                                                <Field.RequiredIndicator />
                                            </Field.Label>
                                            <NumberInput.Root>
                                                <NumberInput.Input {...register("male")} rounded="lg" placeholder="Enter male count" />
                                                <NumberInput.Control />
                                            </NumberInput.Root>
                                            <Field.ErrorText>{errors.male?.message}</Field.ErrorText>
                                        </Field.Root>

                                        <Field.Root required invalid={!!errors.female}>
                                            <Field.Label>Female
                                                <Field.RequiredIndicator />
                                            </Field.Label>
                                            <NumberInput.Root>
                                                <NumberInput.Input {...register("female")} rounded="lg" placeholder="Enter female count" />
                                                <NumberInput.Control />
                                            </NumberInput.Root>
                                            <Field.ErrorText>{errors.female?.message}</Field.ErrorText>
                                        </Field.Root>
                                    </HStack>

                                    <Field.Root invalid={!!errors.testimony}>
                                        <Field.Label>Testimony</Field.Label>
                                        <Textarea
                                            rounded="lg"
                                            placeholder="Enter testimony (optional)"
                                            rows={3}
                                            {...register('testimony')}
                                        />
                                        <Field.ErrorText>{errors.testimony?.message}</Field.ErrorText>
                                    </Field.Root>

                                    <Field.Root invalid={!!errors.challenges}>
                                        <Field.Label>Challenges</Field.Label>
                                        <Textarea
                                            rounded="lg"
                                            placeholder="Enter challenges (optional)"
                                            rows={3}
                                            {...register('challenges')}
                                        />
                                        <Field.ErrorText>{errors.challenges?.message}</Field.ErrorText>
                                    </Field.Root>

                                    <Field.Root invalid={!!errors.solutions}>
                                        <Field.Label>Solutions</Field.Label>
                                        <Textarea
                                            rounded="lg"
                                            placeholder="Enter solutions (optional)"
                                            rows={3}
                                            {...register('solutions')}
                                        />
                                        <Field.ErrorText>{errors.solutions?.message}</Field.ErrorText>
                                    </Field.Root>

                                    <Field.Root invalid={!!errors.remarks}>
                                        <Field.Label>Remarks</Field.Label>
                                        <Textarea
                                            rounded="lg"
                                            placeholder="Enter remarks (optional)"
                                            rows={3}
                                            {...register('remarks')}
                                        />
                                        <Field.ErrorText>{errors.remarks?.message}</Field.ErrorText>
                                    </Field.Root>
                                </VStack>
                            </form>
                        </Dialog.Body>

                        <Dialog.Footer>
                            <Dialog.ActionTrigger asChild>
                                <Button rounded="xl" variant="outline">Cancel</Button>
                            </Dialog.ActionTrigger>
                            <Button rounded="xl" type="submit" form="youth-revival-attendance-form" colorPalette="accent">
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