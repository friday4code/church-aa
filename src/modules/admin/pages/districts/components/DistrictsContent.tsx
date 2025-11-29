// components/districts/DistrictsContent.tsx
"use client"

import { useState, useEffect, lazy, Suspense, useCallback, useMemo } from "react"
import { useSearchParams } from "react-router"
import {
    Box,
    VStack,
    Card,
    Spinner,
    Center,
    Text,
} from "@chakra-ui/react"
import { Toaster } from "@/components/ui/toaster"
import { useAuth } from "@/hooks/useAuth"
import type { District, Districts } from "@/types/districts.type"
import type { DistrictFormData } from "@/modules/admin/schemas/districts.schema"
import { useDistricts } from "@/modules/admin/hooks/useDistrict"

// Lazy load components
const DistrictsHeader = lazy(() => import("./DistrictsHeader"))
const DistrictsExport = lazy(() => import("./DistrictsExport"))
const DistrictsTable = lazy(() => import("./DistrictsTable"))
const DistrictsActionBar = lazy(() => import("./DistrictsActionBar"))
const DistrictDialog = lazy(() => import("./DistrictDialog"))
const DeleteConfirmationDialog = lazy(() => import("./DeleteConfirmationDialog"))
const BulkDeleteDialog = lazy(() => import("./BulkDeleteDialog"))
const BulkEditDialog = lazy(() => import("./BulkEditDialog"))

// Loading components
const TableLoading = () => (
    <Center h="200px">
        <VStack gap="3">
            <Spinner size="lg" color="accent.500" />
            <Text color="gray.600">Loading districts...</Text>
        </VStack>
    </Center>
)

const DialogLoading = () => (
    <Center h="100px">
        <Spinner size="md" color="accent.500" />
    </Center>
)

const HeaderLoading = () => (
    <Center h="80px">
        <Spinner size="md" color="accent.500" />
    </Center>
)

const ActionBarLoading = () => (
    <Center h="60px">
        <Spinner size="sm" color="accent.500" />
    </Center>
)

export const DistrictsContent = () => {
    const { hasRole } = useAuth()
    const isSuperAdmin = hasRole('Super Admin')
    const [searchParams, setSearchParams] = useSearchParams()
    const [sortField, setSortField] = useState<keyof District>('name')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
    const [currentPage, setCurrentPage] = useState(1)
    const pageSize = 10
    const [selectedDistricts, setSelectedDistricts] = useState<number[]>([])
    const [isActionBarOpen, setIsActionBarOpen] = useState(false)
    const [isBulkEditOpen, setIsBulkEditOpen] = useState(false)
    const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false)

    const {
        districts,
        isLoading,
        createDistrict,
        updateDistrict,
        deleteDistrict,
        isCreating,
        isUpdating,
        isDeleting
    } = useDistricts({
        onCreateSuccess() {
            setDialogState({ isOpen: false, mode: 'add' })
        },
        onUpdateSuccess() {
            setDialogState({ isOpen: false, mode: 'edit' })
        },
        onDeleteSuccess() {
            setDeleteDialogState({ isOpen: false })
        },
    })

    const searchQuery = searchParams.get('search') || ''
    const [dialogState, setDialogState] = useState<{
        isOpen: boolean
        district?: District
        mode: 'add' | 'edit'
    }>({ isOpen: false, mode: 'add' })

    const [deleteDialogState, setDeleteDialogState] = useState<{
        isOpen: boolean
        district?: District
    }>({ isOpen: false })

    // Filter and sort districts
    const filteredAndSortedDistricts = useMemo(() => {
        let filtered = (districts as Districts)?.filter(district =>
            district.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            district.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
            district.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
            district.leader.toLowerCase().includes(searchQuery.toLowerCase()) ||
            district.code.toLowerCase().includes(searchQuery.toLowerCase())
        )

        // Sorting
        filtered.sort((a, b) => {
            const aValue = a[sortField]
            const bValue = b[sortField]

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
    }, [districts, searchQuery, sortField, sortOrder])

    // Pagination
    const totalPages = Math.ceil(filteredAndSortedDistricts.length / pageSize)
    const paginatedDistricts = filteredAndSortedDistricts.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    )

    // Selection logic
    const allIdsOnCurrentPage = paginatedDistricts.map(district => district.id)
    const allIds = filteredAndSortedDistricts.map(district => district.id)

    const isAllSelectedOnPage = paginatedDistricts.length > 0 &&
        paginatedDistricts.every(district => selectedDistricts.includes(district.id))

    const isAllSelected = filteredAndSortedDistricts.length > 0 &&
        filteredAndSortedDistricts.every(district => selectedDistricts.includes(district.id))

    const handleSelectAllOnPage = () => {
        if (isAllSelectedOnPage) {
            setSelectedDistricts(prev => prev.filter(id => !allIdsOnCurrentPage.includes(id)))
        } else {
            setSelectedDistricts(prev => [...new Set([...prev, ...allIdsOnCurrentPage])])
        }
    }

    const closeActionBar = useCallback(() => {
        setSelectedDistricts([]);
    }, []);

    const handleSelectAll = () => {
        if (isAllSelected) {
            setSelectedDistricts([])
        } else {
            setSelectedDistricts(allIds)
        }
    }

    const handleSelectDistrict = (districtId: number) => {
        setSelectedDistricts(prev =>
            prev.includes(districtId)
                ? prev.filter(id => id !== districtId)
                : [...prev, districtId]
        )
    }

    const handleSearch = (value: string) => {
        setSearchParams(s => (s.set("search", value), s))
        setCurrentPage(1)
    }

    const handleSort = (field: keyof District) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortOrder('asc')
        }
    }

    const handleDeleteDistrict = (district: District) => {
        setDeleteDialogState({ isOpen: true, district })
    }

    const confirmDelete = () => {
        if (deleteDialogState.district) {
            deleteDistrict(deleteDialogState.district.id)
        }
    }

    // Bulk actions
    const handleBulkDelete = () => {
        setIsBulkDeleteOpen(true)
    }

    const confirmBulkDelete = (ids: number[]) => {
        ids.forEach(id => deleteDistrict(id))
        setSelectedDistricts([])
        setIsActionBarOpen(false)
        setIsBulkDeleteOpen(false)
    }

    const handleBulkEdit = () => {
        setIsBulkEditOpen(true)
    }

    const handleBulkUpdate = (id: number, data: Partial<DistrictFormData>) => {
        updateDistrict({ id, data })
        setSelectedDistricts(prev => prev.filter(districtId => districtId !== id))
    }

    const handleBulkEditClose = () => {
        setIsBulkEditOpen(false)
        if (selectedDistricts.length === 0) {
            setIsActionBarOpen(false)
        }
    }

    const handleSaveDistrict = (data: DistrictFormData) => {
        console.log("handleSaveDistrict called with data:", data);
        console.log("dialogState:", dialogState);

        // Remove temporary UI fields that are not part of the API payload
        const { old_group_name, group_name, ...apiData } = data
        console.log("Filtered API data:", apiData);

        if (dialogState.mode === 'add') {
            console.log("Creating district with data:", apiData);
            createDistrict(apiData as District)
        } else if (dialogState.district) {
            console.log("Updating district", dialogState.district.id, "with data:", apiData);
            updateDistrict({ id: dialogState.district.id, data: apiData })
        } else {
            console.error("No district to update - dialogState.district is undefined");
        }
    }

    // Close action bar when no items are selected
    useEffect(() => {
        if (selectedDistricts.length === 0 && isActionBarOpen) {
            setIsActionBarOpen(false)
        } else if (selectedDistricts.length > 0 && !isActionBarOpen) {
            setIsActionBarOpen(true)
        }
    }, [selectedDistricts, isActionBarOpen])

    // if (isLoading && districts.length === 0) {
    //     return (
    //         <Center h="400px">
    //             <VStack gap="4">
    //                 <Spinner size="xl" color="accent.500" />
    //                 <Text fontSize="lg" color="gray.600">Loading districts...</Text>
    //             </VStack>
    //         </Center>
    //     )
    // }

    return (
        <>
            <VStack gap="6" align="stretch">
                {/* Header */}
                <Suspense fallback={<HeaderLoading />}>
                    <DistrictsHeader
                        districts={districts}
                        onAddDistrict={() => setDialogState({ isOpen: true, mode: 'add' })}
                        onSearch={handleSearch}
                    />
                </Suspense>

                <Card.Root bg="transparent" border={"none"}>
                    <Card.Body p={0}>
                        <VStack gap="4">
                            {/* Table */}
                            <Suspense fallback={<TableLoading />}>
                                <DistrictsTable
                                    paginatedDistricts={paginatedDistricts}
                                    selectedDistricts={selectedDistricts}
                                    sortField={sortField}
                                    sortOrder={sortOrder}
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    isAllSelectedOnPage={isAllSelectedOnPage}
                                    onSort={handleSort}
                                    onSelectAllOnPage={handleSelectAllOnPage}
                                    onSelectDistrict={handleSelectDistrict}
                                    onEditDistrict={(district) => setDialogState({ isOpen: true, district, mode: 'edit' })}
                                    onDeleteDistrict={handleDeleteDistrict}
                                    onPageChange={setCurrentPage}
                                    isLoading={isLoading}
                                />
                            </Suspense>

                            {isLoading && <Center h="400px">
                                <VStack gap="4">
                                    <Spinner size="xl" color="accent.500" />
                                    <Text fontSize="lg" color="gray.600">Loading districts...</Text>
                                </VStack>
                            </Center>
                            }

                        </VStack>
                    </Card.Body>
                </Card.Root>
            </VStack>

            {/* Action Bar for selected items */}
            {isSuperAdmin && isActionBarOpen && (
                <Suspense fallback={<ActionBarLoading />}>
                    <DistrictsActionBar
                        close={closeActionBar}
                        isOpen={isActionBarOpen}
                        selectedCount={selectedDistricts.length}
                        isAllSelected={isAllSelected}
                        onOpenChange={setIsActionBarOpen}
                        onSelectAll={handleSelectAll}
                        onBulkEdit={handleBulkEdit}
                        onBulkDelete={handleBulkDelete}
                    />
                </Suspense>
            )}

            <Box>
                {/* Add/Edit Dialog */}
                {dialogState.isOpen && (
                    <Suspense fallback={<DialogLoading />}>
                        <DistrictDialog
                            {...dialogState}
                            onClose={() => setDialogState({ isOpen: false, mode: 'add' })}
                            onSave={handleSaveDistrict}
                            isLoading={isCreating || isUpdating}
                        />
                    </Suspense>
                )}

                {/* Single Delete Confirmation Dialog */}
                {deleteDialogState.isOpen && (
                    <Suspense fallback={<DialogLoading />}>
                        <DeleteConfirmationDialog
                            isOpen={deleteDialogState.isOpen}
                            district={deleteDialogState.district}
                            onClose={() => setDeleteDialogState({ isOpen: false })}
                            onConfirm={confirmDelete}
                            isLoading={isDeleting}
                        />
                    </Suspense>
                )}

                {/* Bulk Delete Dialog */}
                {isBulkDeleteOpen && (
                    <Suspense fallback={<DialogLoading />}>
                        <BulkDeleteDialog
                            isOpen={isBulkDeleteOpen}
                            selectedDistricts={selectedDistricts}
                            districts={paginatedDistricts}
                            onClose={() => setIsBulkDeleteOpen(false)}
                            onConfirm={confirmBulkDelete}
                        />
                    </Suspense>
                )}

                {/* Bulk Edit Dialog */}
                {isBulkEditOpen && (
                    <Suspense fallback={<DialogLoading />}>
                        <BulkEditDialog
                            isOpen={isBulkEditOpen}
                            selectedDistricts={selectedDistricts}
                            districts={paginatedDistricts}
                            onClose={handleBulkEditClose}
                            onUpdate={handleBulkUpdate}
                            isLoading={isUpdating}
                        />
                    </Suspense>
                )}
            </Box>

            <Toaster />
        </>
    )
}
