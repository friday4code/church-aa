"use client"

import { useState, useMemo, useEffect } from "react"
import { useSearchParams } from "react-router"
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
import { getMonthOptions, getWeekOptions, getYearOptions, calculateTotals, copyAttendanceToClipboard, exportAttendanceToExcel, exportAttendanceToCSV, exportAttendanceToPDF } from "@/utils/attendance.utils"
import { AttendanceSchema, type AttendanceFormData } from "../schemas/attendance.schema"
import { type Attendance, useAttendanceStore, SERVICE_TYPES, type ServiceType } from "../stores/attendance.store"

// Props for the dynamic attendance component
interface AttendancePageProps {
    serviceType: ServiceType;
}

// UUID generator function
const uuid = () => {
    return Math.random().toString(36).substring(2, 15)
}

// Collections for Select components
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
    attendances: Attendance[]
    onClose: () => void
    onUpdate: (id: number, data: Partial<AttendanceFormData>) => void
    serviceName: string
}

const BulkEditDialog = ({ isOpen, selectedAttendances, attendances, onClose, onUpdate, serviceName }: BulkEditDialogProps) => {
    const [tabs, setTabs] = useState<Array<{ id: string; attendance: Attendance; title: string }>>([])
    const [selectedTab, setSelectedTab] = useState<string | null>(null)

    useEffect(() => {
        if (isOpen && selectedAttendances.length > 0) {
            const initialTabs = selectedAttendances.map(attendanceId => {
                const attendance = attendances.find(a => a.id === attendanceId)
                return {
                    id: uuid(),
                    attendance: attendance!,
                    title: `${attendance?.district} - ${attendance?.month}`
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

    const handleTabUpdate = (tabId: string, data: Partial<AttendanceFormData>) => {
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
                            <Dialog.Title>Update {serviceName} Attendance</Dialog.Title>
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
    attendances: Attendance[]
    onClose: () => void
    onConfirm: (ids: number[]) => void
    serviceName: string
}

const BulkDeleteDialog = ({ isOpen, selectedAttendances, attendances, onClose, onConfirm, serviceName }: BulkDeleteDialogProps) => {
    const selectedAttendanceDetails = attendances
        .filter(attendance => selectedAttendances.includes(attendance.id))
        .map(attendance => `${attendance.district} - ${attendance.month} Week ${attendance.week}`)

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
                            <Dialog.Title>Delete Multiple {serviceName} Attendance Records</Dialog.Title>
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

// Delete Confirmation Dialog Component
interface DeleteConfirmationDialogProps {
    isOpen: boolean
    attendance?: Attendance
    onClose: () => void
    onConfirm: () => void
    serviceName: string
}

const DeleteConfirmationDialog = ({ isOpen, attendance, onClose, onConfirm, serviceName }: DeleteConfirmationDialogProps) => {
    return (
        <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content rounded="xl">
                        <Dialog.Header>
                            <Dialog.Title>Delete {serviceName} Attendance Record</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body>
                            <p>
                                Are you sure you want to delete the attendance record for <strong>{attendance?.district} - {attendance?.month} Week {attendance?.week}</strong>?
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
    attendance?: Attendance
    mode: 'add' | 'edit'
    onClose: () => void
    onSave: (data: AttendanceFormData) => void
    serviceName: string
}

const AttendanceDialog = ({ isOpen, attendance, mode, onClose, onSave, serviceName }: AttendanceDialogProps) => {
    const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<AttendanceFormData>({
        resolver: zodResolver(AttendanceSchema),
        defaultValues: {
            district: attendance?.district || '',
            month: attendance?.month || '',
            week: attendance?.week?.toString() || '',
            men: attendance?.men || 0,
            women: attendance?.women || 0,
            youthBoys: attendance?.youthBoys || 0,
            youthGirls: attendance?.youthGirls || 0,
            childrenBoys: attendance?.childrenBoys || 0,
            childrenGirls: attendance?.childrenGirls || 0,
            year: attendance?.year?.toString() || new Date().getFullYear().toString(),
            state: attendance?.state || '',
            region: attendance?.region || '',
            group: attendance?.group || '',
            oldGroup: attendance?.oldGroup || ''
        }
    })

    const onSubmit = (data: AttendanceFormData) => {
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
                                {mode === 'add' ? `Add ${serviceName} Attendance` : 'Update Attendance Record'}
                            </Dialog.Title>
                        </Dialog.Header>

                        <Dialog.Body>
                            <form noValidate id="attendance-form" onSubmit={handleSubmit(onSubmit)}>
                                <VStack gap="4" colorPalette={"accent"}>
                                    {/* Form fields remain exactly the same */}
                                    <HStack gap="4" w="full">
                                        <Field.Root required invalid={!!errors.district}>
                                            <Field.Label>District
                                                <Field.RequiredIndicator />
                                            </Field.Label>
                                            <Input
                                                rounded="lg"
                                                placeholder="Enter district"
                                                {...register('district')}
                                            />
                                            <Field.ErrorText>{errors.district?.message}</Field.ErrorText>
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

                                    <HStack gap="4" w="full">
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
                                    </HStack>

                                    <Heading size="md" w="full" mt="4">Attendance Numbers</Heading>

                                    <HStack gap="4" w="full">
                                        <Field.Root required invalid={!!errors.men}>
                                            <Field.Label>Men</Field.Label>
                                            <NumberInput.Root
                                                min={0}
                                                defaultValue={(attendance?.men || 0).toString()}
                                                onValueChange={(e) => setValue('men', e.valueAsNumber)}
                                            >
                                                <NumberInput.Input rounded="lg" {...register('men', { valueAsNumber: true })} />
                                            </NumberInput.Root>
                                            <Field.ErrorText>{errors.men?.message}</Field.ErrorText>
                                        </Field.Root>

                                        <Field.Root required invalid={!!errors.women}>
                                            <Field.Label>Women</Field.Label>
                                            <NumberInput.Root
                                                min={0}
                                                defaultValue={(attendance?.women || 0).toString()}
                                                onValueChange={(e) => setValue('women', e.valueAsNumber)}
                                            >
                                                <NumberInput.Input rounded="lg" {...register('women', { valueAsNumber: true })} />
                                            </NumberInput.Root>
                                            <Field.ErrorText>{errors.women?.message}</Field.ErrorText>
                                        </Field.Root>
                                    </HStack>

                                    <HStack gap="4" w="full">
                                        <Field.Root required invalid={!!errors.youthBoys}>
                                            <Field.Label>Youth Boys</Field.Label>
                                            <NumberInput.Root
                                                min={0}
                                                defaultValue={(attendance?.youthBoys || 0).toString()}
                                                onValueChange={(e) => setValue('youthBoys', e.valueAsNumber)}
                                            >
                                                <NumberInput.Input rounded="lg" {...register('youthBoys', { valueAsNumber: true })} />
                                            </NumberInput.Root>
                                            <Field.ErrorText>{errors.youthBoys?.message}</Field.ErrorText>
                                        </Field.Root>

                                        <Field.Root required invalid={!!errors.youthGirls}>
                                            <Field.Label>Youth Girls</Field.Label>
                                            <NumberInput.Root
                                                min={0}
                                                defaultValue={(attendance?.youthGirls || 0).toString()}
                                                onValueChange={(e) => setValue('youthGirls', e.valueAsNumber)}
                                            >
                                                <NumberInput.Input rounded="lg" {...register('youthGirls', { valueAsNumber: true })} />
                                            </NumberInput.Root>
                                            <Field.ErrorText>{errors.youthGirls?.message}</Field.ErrorText>
                                        </Field.Root>
                                    </HStack>

                                    <HStack gap="4" w="full">
                                        <Field.Root required invalid={!!errors.childrenBoys}>
                                            <Field.Label>Children Boys</Field.Label>
                                            <NumberInput.Root
                                                min={0}
                                                defaultValue={(attendance?.childrenBoys || 0).toString()}
                                                onValueChange={(e) => setValue('childrenBoys', e.valueAsNumber)}
                                            >
                                                <NumberInput.Input rounded="lg" {...register('childrenBoys', { valueAsNumber: true })} />
                                            </NumberInput.Root>
                                            <Field.ErrorText>{errors.childrenBoys?.message}</Field.ErrorText>
                                        </Field.Root>

                                        <Field.Root required invalid={!!errors.childrenGirls}>
                                            <Field.Label>Children Girls</Field.Label>
                                            <NumberInput.Root
                                                min={0}
                                                defaultValue={(attendance?.childrenGirls || 0).toString()}
                                                onValueChange={(e) => setValue('childrenGirls', e.valueAsNumber)}
                                            >
                                                <NumberInput.Input rounded="lg" {...register('childrenGirls', { valueAsNumber: true })} />
                                            </NumberInput.Root>
                                            <Field.ErrorText>{errors.childrenGirls?.message}</Field.ErrorText>
                                        </Field.Root>
                                    </HStack>f
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

// Main Dynamic Attendance Component
export const AttendancePage: React.FC<AttendancePageProps> = ({ serviceType }) => {
    const { reset } = useQueryErrorResetBoundary();
    const serviceName = SERVICE_TYPES[serviceType].name;

    return (
        <>
            <title>{serviceName} | {ENV.APP_NAME}</title>
            <meta
                name="description"
                content={`Manage ${serviceName} attendance data`}
            />
            <ErrorBoundary
                onReset={reset}
                fallbackRender={({ resetErrorBoundary, error }) => (
                    <ErrorFallback {...{ resetErrorBoundary, error }} />
                )}
            >
                <Content serviceType={serviceType} serviceName={serviceName} />
            </ErrorBoundary>
        </>
    );
};

// Content component that uses the service type
interface ContentProps {
    serviceType: ServiceType;
    serviceName: string;
}

const Content = ({ serviceType, serviceName }: ContentProps) => {
    const [searchParams, setSearchParams] = useSearchParams()
    const [sortField, setSortField] = useState<keyof Attendance>('district')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
    const [currentPage, setCurrentPage] = useState(1)
    const pageSize = 10
    const [selectedAttendances, setSelectedAttendances] = useState<number[]>([])
    const [isActionBarOpen, setIsActionBarOpen] = useState(false)
    const [isBulkEditOpen, setIsBulkEditOpen] = useState(false)
    const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false)

    const { attendances, addAttendance, updateAttendance, deleteAttendance, getAttendancesByServiceType } = useAttendanceStore()

    // Filter attendances by service type
    const serviceAttendances = useMemo(() =>
        getAttendancesByServiceType(serviceType),
        [getAttendancesByServiceType, serviceType, attendances]
    )

    const searchQuery = searchParams.get('search') || ''
    const [dialogState, setDialogState] = useState<{
        isOpen: boolean
        attendance?: Attendance
        mode: 'add' | 'edit'
    }>({ isOpen: false, mode: 'add' })

    const [deleteDialogState, setDeleteDialogState] = useState<{
        isOpen: boolean
        attendance?: Attendance
    }>({ isOpen: false })

    // Filter and sort attendances
    const filteredAndSortedAttendances = useMemo(() => {
        let filtered = serviceAttendances.filter(attendance =>
            attendance.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
            attendance.month.toLowerCase().includes(searchQuery.toLowerCase()) ||
            attendance.year.toString().includes(searchQuery)
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
    }, [serviceAttendances, searchQuery, sortField, sortOrder])

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

    const handleSort = (field: keyof Attendance) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortOrder('asc')
        }
    }

    const handleDeleteAttendance = (attendance: Attendance) => {
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

    const handleBulkUpdate = (id: number, data: Partial<AttendanceFormData>) => {
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
                <Flex
                    justify="space-between"
                    align="center"
                    pos="sticky"
                    top={6}
                    zIndex={"sticky"}
                    backdropFilter={"blur(20px)"}
                >
                    <HStack>
                        <Heading size="3xl">{serviceName}</Heading>
                        <Badge colorPalette={"accent"}>{serviceAttendances.length}</Badge>
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
                                <Text fontWeight="bold" color="accent.700">Men</Text>
                                <Text fontSize="xl" fontWeight="bold">{totals.men}</Text>
                            </VStack>
                            <VStack>
                                <Text fontWeight="bold" color="accent.700">Women</Text>
                                <Text fontSize="xl" fontWeight="bold">{totals.women}</Text>
                            </VStack>
                            <VStack>
                                <Text fontWeight="bold" color="accent.700">Youth</Text>
                                <Text fontSize="xl" fontWeight="bold">{totals.youthBoys + totals.youthGirls}</Text>
                            </VStack>
                            <VStack>
                                <Text fontWeight="bold" color="accent.700">Children</Text>
                                <Text fontSize="xl" fontWeight="bold">{totals.childrenBoys + totals.childrenGirls}</Text>
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
                                        onClick={async () => await copyAttendanceToClipboard(serviceAttendances, serviceType)}
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
                                        onClick={() => exportAttendanceToExcel(serviceAttendances, serviceType)}
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
                                        onClick={() => exportAttendanceToCSV(serviceAttendances, serviceType)}
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
                                        onClick={() => exportAttendanceToPDF(serviceAttendances, serviceType)}
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
                                                onClick={() => handleSort('district')}
                                            >
                                                District {sortField === 'district' && (sortOrder === 'asc' ? '↑' : '↓')}
                                            </Table.ColumnHeader>
                                            <Table.ColumnHeader
                                                fontWeight={"bold"}
                                                cursor="pointer"
                                                onClick={() => handleSort('month')}
                                            >
                                                Month {sortField === 'month' && (sortOrder === 'asc' ? '↑' : '↓')}
                                            </Table.ColumnHeader>
                                            <Table.ColumnHeader
                                                fontWeight={"bold"}
                                                cursor="pointer"
                                                onClick={() => handleSort('week')}
                                            >
                                                Week {sortField === 'week' && (sortOrder === 'asc' ? '↑' : '↓')}
                                            </Table.ColumnHeader>
                                            <Table.ColumnHeader
                                                fontWeight={"bold"}
                                                cursor="pointer"
                                                onClick={() => handleSort('men')}
                                            >
                                                Men {sortField === 'men' && (sortOrder === 'asc' ? '↑' : '↓')}
                                            </Table.ColumnHeader>
                                            <Table.ColumnHeader
                                                fontWeight={"bold"}
                                                cursor="pointer"
                                                onClick={() => handleSort('women')}
                                            >
                                                Women {sortField === 'women' && (sortOrder === 'asc' ? '↑' : '↓')}
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
                                                <Table.Cell fontWeight="medium">
                                                    {attendance.district}
                                                </Table.Cell>
                                                <Table.Cell>{attendance.month}</Table.Cell>
                                                <Table.Cell>Week {attendance.week}</Table.Cell>
                                                <Table.Cell>{attendance.men}</Table.Cell>
                                                <Table.Cell>{attendance.women}</Table.Cell>
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
                            addAttendance(serviceType, data)
                        } else if (dialogState.attendance) {
                            updateAttendance(dialogState.attendance.id, data)
                        }
                        setDialogState({ isOpen: false, mode: 'add' })
                    }}
                    serviceName={serviceName}
                />

                {/* Single Delete Confirmation Dialog */}
                <DeleteConfirmationDialog
                    isOpen={deleteDialogState.isOpen}
                    attendance={deleteDialogState.attendance}
                    onClose={() => setDeleteDialogState({ isOpen: false })}
                    onConfirm={confirmDelete}
                    serviceName={serviceName}
                />

                {/* Bulk Delete Dialog */}
                <BulkDeleteDialog
                    isOpen={isBulkDeleteOpen}
                    selectedAttendances={selectedAttendances}
                    attendances={serviceAttendances}
                    onClose={() => setIsBulkDeleteOpen(false)}
                    onConfirm={confirmBulkDelete}
                    serviceName={serviceName}
                />

                {/* Bulk Edit Dialog */}
                <BulkEditDialog
                    isOpen={isBulkEditOpen}
                    selectedAttendances={selectedAttendances}
                    attendances={serviceAttendances}
                    onClose={handleBulkEditClose}
                    onUpdate={handleBulkUpdate}
                    serviceName={serviceName}
                />
            </Box >
        </>
    )
}

// Individual Attendance Edit Form
interface AttendanceEditFormProps {
    attendance: Attendance
    onUpdate: (data: Partial<AttendanceFormData>) => void
    onCancel: () => void
}

const AttendanceEditForm = ({ attendance, onUpdate, onCancel }: AttendanceEditFormProps) => {
    const { register, handleSubmit, formState: { errors }, setValue } = useForm<AttendanceFormData>({
        resolver: zodResolver(AttendanceSchema),
        defaultValues: {
            district: attendance.district,
            month: attendance.month,
            week: attendance.week.toString(),
            men: attendance.men,
            women: attendance.women,
            youthBoys: attendance.youthBoys,
            youthGirls: attendance.youthGirls,
            childrenBoys: attendance.childrenBoys,
            childrenGirls: attendance.childrenGirls,
            year: attendance.year.toString(),
            state: attendance.state || '',
            region: attendance.region || '',
            group: attendance.group || '',
            oldGroup: attendance.oldGroup || ''
        }
    })

    const onSubmit = (data: AttendanceFormData) => {
        onUpdate(data)
    }

    return (
        <VStack gap="4" align="stretch">
            <Text fontSize="sm" color="gray.600" mb="2">
                Editing: <strong>{attendance.district} - {attendance.month} Week {attendance.week}</strong>
            </Text>

            <form id={`attendance-form-${attendance.id}`} onSubmit={handleSubmit(onSubmit)}>
                <VStack gap="4" colorPalette={"accent"}>
                    <HStack gap="4" w="full">
                        <Field.Root required invalid={!!errors.district}>
                            <Field.Label>District
                                <Field.RequiredIndicator />
                            </Field.Label>
                            <Input
                                rounded="lg"
                                placeholder="Enter district"
                                {...register('district')}
                            />
                            <Field.ErrorText>{errors.district?.message}</Field.ErrorText>
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

                    <HStack gap="4" w="full">
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
                    </HStack>

                    <Heading size="md" w="full" mt="4">Attendance Numbers</Heading>

                    <HStack gap="4" w="full">
                        <Field.Root required invalid={!!errors.men}>
                            <Field.Label>Men</Field.Label>
                            <NumberInput.Root
                                min={0}
                                value={String(attendance.men)}
                                onValueChange={(e) => setValue('men', e.valueAsNumber)}
                            >
                                <NumberInput.Input rounded="lg" {...register('men', { valueAsNumber: true })} />
                            </NumberInput.Root>
                            <Field.ErrorText>{errors.men?.message}</Field.ErrorText>
                        </Field.Root>

                        <Field.Root required invalid={!!errors.women}>
                            <Field.Label>Women</Field.Label>
                            <NumberInput.Root
                                min={0}
                                value={String(attendance.women)}
                                onValueChange={(e) => setValue('women', e.valueAsNumber)}
                            >
                                <NumberInput.Input rounded="lg" {...register('women', { valueAsNumber: true })} />
                            </NumberInput.Root>
                            <Field.ErrorText>{errors.women?.message}</Field.ErrorText>
                        </Field.Root>
                    </HStack>

                    <HStack gap="4" w="full">
                        <Field.Root required invalid={!!errors.youthBoys}>
                            <Field.Label>Youth Boys</Field.Label>
                            <NumberInput.Root
                                min={0}
                                value={attendance.youthBoys.toString()}
                                onValueChange={(e) => setValue('youthBoys', e.valueAsNumber)}
                            >
                                <NumberInput.Input rounded="lg" {...register('youthBoys', { valueAsNumber: true })} />
                            </NumberInput.Root>
                            <Field.ErrorText>{errors.youthBoys?.message}</Field.ErrorText>
                        </Field.Root>

                        <Field.Root required invalid={!!errors.youthGirls}>
                            <Field.Label>Youth Girls</Field.Label>
                            <NumberInput.Root
                                min={0}
                                value={attendance.youthGirls.toString()}
                                onValueChange={(e) => setValue('youthGirls', e.valueAsNumber)}
                            >
                                <NumberInput.Input rounded="lg" {...register('youthGirls', { valueAsNumber: true })} />
                            </NumberInput.Root>
                            <Field.ErrorText>{errors.youthGirls?.message}</Field.ErrorText>
                        </Field.Root>
                    </HStack>

                    <HStack gap="4" w="full">
                        <Field.Root required invalid={!!errors.childrenBoys}>
                            <Field.Label>Children Boys</Field.Label>
                            <NumberInput.Root
                                min={0}
                                value={attendance.childrenBoys.toString()}
                                onValueChange={(e) => setValue('childrenBoys', e.valueAsNumber)}
                            >
                                <NumberInput.Input rounded="lg" {...register('childrenBoys', { valueAsNumber: true })} />
                            </NumberInput.Root>
                            <Field.ErrorText>{errors.childrenBoys?.message}</Field.ErrorText>
                        </Field.Root>

                        <Field.Root required invalid={!!errors.childrenGirls}>
                            <Field.Label>Children Girls</Field.Label>
                            <NumberInput.Root
                                min={0}
                                value={attendance.childrenGirls.toString()}
                                onValueChange={(e) => setValue('childrenGirls', e.valueAsNumber)}
                            >
                                <NumberInput.Input rounded="lg" {...register('childrenGirls', { valueAsNumber: true })} />
                            </NumberInput.Root>
                            <Field.ErrorText>{errors.childrenGirls?.message}</Field.ErrorText>
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


export default AttendancePage;