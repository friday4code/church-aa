"use client"

import { useState, useMemo, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router"
import {
    Box,
    VStack,
    Card,
} from "@chakra-ui/react"
import { lazy, Suspense } from "react"
import type { AttendanceFormData } from "../../../schemas/attendance.schema"
import { calculateTotals } from "@/utils/attendance.utils"
import { SERVICE_TYPES, type AttendanceRecord, type ServiceType } from "@/types/attendance.type"
import { useAttendance } from "@/modules/admin/hooks/useAttendance"
import { useAuth } from "@/hooks/useAuth"
import { useDistricts } from "../../../hooks/useDistrict"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { adminApi } from "@/api/admin.api"
import { Toaster, toaster } from "@/components/ui/toaster"
import { delay } from "@/utils/helpers"

// Lazy load components
const AttendanceHeader = lazy(() => import("./AttendanceHeader"))
const AttendanceTotals = lazy(() => import("./AttendanceTotals"))
const AttendanceTable = lazy(() => import("./AttendanceTable"))
const AttendanceActionBar = lazy(() => import("./AttendanceActionBar"))
const AttendanceDialog = lazy(() => import("./AttendanceDialog"))
const DeleteConfirmationDialog = lazy(() => import("./DeleteConfirmationDialog"))
const BulkDeleteDialog = lazy(() => import("./BulkDeleteDialog"))
const BulkEditDialog = lazy(() => import("./BulkEditDialog"))

// Loading components
const TableLoading = () => (
    <Box>Loading table...</Box>
)

const HeaderLoading = () => (
    <Box>Loading header...</Box>
)

const ActionBarLoading = () => (
    <Box>Loading action bar...</Box>
)

const DialogLoading = () => (
    <Box>Loading dialog...</Box>
)

interface ContentProps {
    serviceType: ServiceType;
    serviceName: string;
}

const AttendanceContent = ({ serviceType, serviceName }: ContentProps) => {
    const [searchParams, setSearchParams] = useSearchParams()
    const [sortField, setSortField] = useState<keyof AttendanceRecord>('year')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
    const [currentPage, setCurrentPage] = useState(1)
    const pageSize = 10
    const [selectedAttendances, setSelectedAttendances] = useState<number[]>([])
    const [isActionBarOpen, setIsActionBarOpen] = useState(false)
    const [isBulkEditOpen, setIsBulkEditOpen] = useState(false)
    const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false)
    const navigate = useNavigate();
    const queryClient = useQueryClient()

    // Filter attendances by service type
    const { data: allAttendances = [] } = useAttendance();
    const { user: authUser, hasRole } = useAuth()
    const searchQuery = searchParams.get('search') || ''
    const [dialogState, setDialogState] = useState<{
        isOpen: boolean
        attendance?: AttendanceRecord
        mode: 'add' | 'edit'
    }>({ isOpen: false, mode: 'add' })

    const [deleteDialogState, setDeleteDialogState] = useState<{
        isOpen: boolean
        attendance?: AttendanceRecord
    }>({ isOpen: false })

    // Filter attendances by service type
    const serviceAttendances = useMemo(() => {
        const base = allAttendances.filter(attendance => attendance.service_type === SERVICE_TYPES[serviceType].apiValue)
        const isSuperAdmin = hasRole('Super Admin')
        const isStateAdmin = hasRole('State Admin')
        const isRegionAdmin = hasRole('Region Admin')
        const isDistrictAdmin = hasRole('District Admin')
        if (isSuperAdmin) return base
        if (isStateAdmin) return base.filter(a => a.state_id === (authUser?.state_id ?? 0))
        if (isRegionAdmin) return base.filter(a => a.region_id === (authUser?.region_id ?? 0))
        if (isDistrictAdmin) return base.filter(a => a.district_id === (authUser?.district_id ?? 0))
        return []
    }, [allAttendances, serviceType, hasRole, authUser])

    // Setup mutations
    const createMutation = useMutation({
        mutationFn: (data: any) => adminApi.createAttendance(data),
        onSuccess: async () => {
            toaster.create({ title: 'Attendance created successfully' })
            await delay(1000);
            queryClient.invalidateQueries({ queryKey: ['attendance'] })
            setDialogState({ isOpen: false, mode: "add" })
        },
        onError: () => {
            toaster.create({ title: 'Failed to create attendance', type: 'error' })
        },
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) => adminApi.updateAttendance(id, data),
        onSuccess: async () => {
            toaster.create({ title: 'Attendance updated successfully' });
            await delay(1000);
            queryClient.invalidateQueries({ queryKey: ['attendance'] })
            setDialogState({ isOpen: false, mode: "edit" })
        },
        onError: () => {
            toaster.create({ title: 'Failed to update attendance', type: 'error' })
        },
    })

    const deleteMutation = useMutation({
        mutationFn: (id: number) => adminApi.deleteAttendance(id),
        onSuccess: async () => {
            toaster.create({ title: 'Attendance deleted successfully' })

            await delay(1000);

            queryClient.invalidateQueries({ queryKey: ['attendance'] })
            setDeleteDialogState({ isOpen: false })
        },
        onError: () => {
            toaster.create({ title: 'Failed to delete attendance', type: 'error' })
        },
    })


    const addAttendance = (type: ServiceType, data: AttendanceFormData) => {
        createMutation.mutate({ ...data, service_type: SERVICE_TYPES[type].apiValue })
    }

    const updateAttendance = (id: number, data: Partial<AttendanceFormData>) => {
        updateMutation.mutate({ id, data })
    }

    const deleteAttendance = (id: number) => {
        deleteMutation.mutate(id)
    }

    // Get districts for name lookup in search
    const { districts } = useDistricts()

    // Filter and sort attendances
    const filteredAndSortedAttendances = useMemo(() => {
        let filtered = serviceAttendances.filter(attendance => {
            const districtName = districts?.find(d => d.id === attendance.district_id)?.name || ''
            return (
                attendance.month.toLowerCase().includes(searchQuery.toLowerCase()) ||
                attendance.year.toString().includes(searchQuery) ||
                String(attendance.district_id).includes(searchQuery) ||
                districtName.toLowerCase().includes(searchQuery.toLowerCase())
            )
        })

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
    }, [serviceAttendances, searchQuery, sortField, sortOrder, districts])

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

    const handleSort = (field: keyof AttendanceRecord) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortOrder('asc')
        }
    }

    const handleDeleteAttendance = (attendance: AttendanceRecord) => {
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

    const handleSaveAttendance = (data: AttendanceFormData) => {
        console.log("payload", data);

        if (dialogState.mode === 'add') {
            addAttendance(serviceType, data)
        } else if (dialogState.attendance) {
            updateAttendance(dialogState.attendance.id, data)
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
                <Suspense fallback={<HeaderLoading />}>
                    <AttendanceHeader
                        serviceName={serviceName}
                        serviceAttendances={serviceAttendances as any}
                        onAddAttendance={() => setDialogState({ isOpen: true, mode: 'add' })}
                        onSearch={handleSearch}
                        onNavigateBack={() => navigate("/admin/attendance")}
                    />
                </Suspense>

                {/* Totals Summary */}
                <Suspense fallback={<HeaderLoading />}>
                    <AttendanceTotals totals={totals} />
                </Suspense>

                <Card.Root bg={{ base: "transparent", _dark: "transparent" }} border={"none"}>
                    <Card.Body p={0}>
                        <VStack gap="4">
                            {/* Table */}
                            <Suspense fallback={<TableLoading />}>
                                <AttendanceTable
                                    paginatedAttendances={paginatedAttendances}
                                    selectedAttendances={selectedAttendances}
                                    sortField={sortField}
                                    sortOrder={sortOrder}
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    isAllSelectedOnPage={isAllSelectedOnPage}
                                    serviceType={serviceType}
                                    onSort={handleSort}
                                    onSelectAllOnPage={handleSelectAllOnPage}
                                    onSelectAttendance={handleSelectAttendance}
                                    onEditAttendance={(attendance) => setDialogState({
                                        isOpen: true,
                                        attendance,
                                        mode: 'edit'
                                    })}
                                    onDeleteAttendance={handleDeleteAttendance}
                                    onPageChange={setCurrentPage}
                                />
                            </Suspense>
                        </VStack>
                    </Card.Body>
                </Card.Root>
            </VStack>

            {/* Action Bar for selected items */}
            {isActionBarOpen && (
                <Suspense fallback={<ActionBarLoading />}>
                    <AttendanceActionBar
                        isOpen={isActionBarOpen}
                        selectedCount={selectedAttendances.length}
                        isAllSelected={isAllSelected}
                        onOpenChange={setIsActionBarOpen}
                        onSelectAll={handleSelectAll}
                        onBulkEdit={handleBulkEdit}
                        onBulkDelete={handleBulkDelete}
                        onClose={() => setSelectedAttendances([])}
                    />
                </Suspense>
            )}

            <Box>
                {/* Add/Edit Dialog */}
                {dialogState.isOpen && (
                    <Suspense fallback={<DialogLoading />}>
                        <AttendanceDialog
                            {...dialogState}
                            attendance={dialogState.attendance as any}
                            onClose={() => setDialogState({ isOpen: false, mode: 'add' })}
                            onSave={handleSaveAttendance}
                            serviceName={serviceName}
                            isLoading={createMutation.isPending || updateMutation.isPending}
                        />
                    </Suspense>
                )}

                {/* Single Delete Confirmation Dialog */}
                {deleteDialogState.isOpen && (
                    <Suspense fallback={<DialogLoading />}>
                        <DeleteConfirmationDialog
                            isOpen={deleteDialogState.isOpen}
                            attendance={deleteDialogState.attendance as any}
                            onClose={() => setDeleteDialogState({ isOpen: false })}
                            onConfirm={confirmDelete}
                            serviceName={serviceName}
                        />
                    </Suspense>
                )}

                {/* Bulk Delete Dialog */}
                {isBulkDeleteOpen && (
                    <Suspense fallback={<DialogLoading />}>
                        <BulkDeleteDialog
                            isOpen={isBulkDeleteOpen}
                            selectedAttendances={selectedAttendances}
                            attendances={serviceAttendances as any}
                            onClose={() => setIsBulkDeleteOpen(false)}
                            onConfirm={confirmBulkDelete}
                            serviceName={serviceName}
                        />
                    </Suspense>
                )}

                {/* Bulk Edit Dialog */}
                {isBulkEditOpen && (
                    <Suspense fallback={<DialogLoading />}>
                        <BulkEditDialog
                            isOpen={isBulkEditOpen}
                            selectedAttendances={selectedAttendances}
                            attendances={serviceAttendances as any}
                            onClose={handleBulkEditClose}
                            onUpdate={handleBulkUpdate}
                            serviceName={serviceName}
                        />
                    </Suspense>
                )}
            </Box>


            <Toaster />
        </>
    )
}

export default AttendanceContent