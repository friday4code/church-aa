// components/regions/RegionsContent.tsx
"use client"

import { useState, useMemo, useEffect, useCallback, lazy, Suspense } from "react"
import { useSearchParams } from "react-router"
import {
    Box,
    VStack,
    Card,
    Spinner,
    Center,
} from "@chakra-ui/react"
import { useRegions } from "@/modules/admin/hooks/useRegion"
import type { Region } from "@/types/regions.type"
import RegionsTableLoading from "./RegionsTableLoading"
import { Toaster } from "@/components/ui/toaster"
import { useAuth } from "@/hooks/useAuth"
import { useStates } from "@/modules/admin/hooks/useState"
import type { State } from "@/types/states.type"


// Import lazy loaded components
const RegionsHeader = lazy(() => import("./RegionsHeader"))
const RegionsTable = lazy(() => import("./RegionsTable"))
const RegionsActionBar = lazy(() => import("./RegionsActionBar"))
const RegionDialog = lazy(() => import("./RegionDialog"))
const DeleteConfirmationDialog = lazy(() => import("./DeleteConfirmationDialog"))
const BulkDeleteDialog = lazy(() => import("./BulkDeleteDialog"))
const BulkEditDialog = lazy(() => import("./BulkEditDialog"))

// Loading components

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


const RegionsContent = () => {
    const { hasRole } = useAuth()
    const isSuperAdmin = hasRole('Super Admin')
    const [searchParams, setSearchParams] = useSearchParams()
    const [sortField, setSortField] = useState<keyof Region>('name')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(50)
    const [selectedRegions, setSelectedRegions] = useState<number[]>([])
    const [isActionBarOpen, setIsActionBarOpen] = useState(false)
    const [isBulkEditOpen, setIsBulkEditOpen] = useState(false)
    const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false)
    const [stateFilter, setStateFilter] = useState<string>("")
    const { states } = useStates()

    const {
        regions,
        isLoading,
        createRegion,
        updateRegion,
        deleteRegion,
        isCreating,
        isUpdating,
        isDeleting
    } = useRegions({
        onCreateSuccess() {
            setDialogState({ isOpen: false, mode: 'add' })
        },
        onUpdateSuccess() {
            setDialogState({ isOpen: false, mode: 'edit' })
        },
    })

    const searchQuery = searchParams.get('search') || ''
    const [dialogState, setDialogState] = useState<{
        isOpen: boolean
        region?: Region
        mode: 'add' | 'edit'
    }>({ isOpen: false, mode: 'add' })

    const [deleteDialogState, setDeleteDialogState] = useState<{
        isOpen: boolean
        region?: Region
    }>({ isOpen: false })

    // Filter and sort regions
    const filteredAndSortedRegions = useMemo(() => {
        let filtered = regions.filter((region: Region) =>
            region.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            region.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
            region.leader.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (region.leader_email && region.leader_email.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (region.leader_phone && region.leader_phone.toLowerCase().includes(searchQuery.toLowerCase()))
        )

        if (stateFilter) {
            const state = states?.find((s: State) => s.id.toString() == stateFilter)
            if (state) {
                filtered = filtered.filter((region: Region) => region.state === state.name)
            }
        }

        // Sorting
        filtered.sort((a: Region, b: Region) => {
            const aValue = a[sortField]
            const bValue = b[sortField]
            if (sortOrder === 'asc') {
                return aValue != null && bValue != null
                    ? aValue < bValue ? -1 : aValue > bValue ? 1 : 0
                    : (aValue == null ? 1 : -1) // treat undefined/null as greater than any other value
            } else {
                return aValue != null && bValue != null
                    ? aValue > bValue ? -1 : aValue < bValue ? 1 : 0
                    : (aValue == null ? 1 : -1) // treat undefined/null as greater than any other value
            }
        })

        return filtered
    }, [regions, searchQuery, sortField, sortOrder, stateFilter, states])

    // Pagination
    const totalRegions = filteredAndSortedRegions.length
    const paginatedRegions = filteredAndSortedRegions.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    )

    // Selection logic
    const allIdsOnCurrentPage = paginatedRegions.map((region: Region) => region.id)
    const allIds = filteredAndSortedRegions.map((region: Region) => region.id)

    const isAllSelectedOnPage = paginatedRegions.length > 0 &&
        paginatedRegions.every((region: Region) => selectedRegions.includes(region.id))

    const isAllSelected = filteredAndSortedRegions.length > 0 &&
        filteredAndSortedRegions.every((region: Region) => selectedRegions.includes(region.id))

    const handleSelectAllOnPage = () => {
        if (isAllSelectedOnPage) {
            // Deselect all on current page
            setSelectedRegions(prev => prev.filter(id => !allIdsOnCurrentPage.includes(id)))
        } else {
            // Select all on current page
            setSelectedRegions(prev => [...new Set([...prev, ...allIdsOnCurrentPage])])
        }
    }

    const closeActionBar = useCallback(() => {
        setSelectedRegions([]);
    }, []);

    const handleSelectAll = () => {
        if (isAllSelected) {
            setSelectedRegions([])
        } else {
            setSelectedRegions(allIds)
        }
    }

    const handleSelectRegion = (regionId: number) => {
        setSelectedRegions(prev =>
            prev.includes(regionId)
                ? prev.filter(id => id !== regionId)
                : [...prev, regionId]
        )
    }

    const handleSearch = (value: string) => {
        setSearchParams(s => (s.set("search", value), s))
        setCurrentPage(1)
    }

    const handleSort = (field: keyof Region) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortOrder('asc')
        }
    }

    const handleDeleteRegion = (region: Region) => {
        setDeleteDialogState({ isOpen: true, region })
    }

    const confirmDelete = () => {
        if (deleteDialogState.region) {
            deleteRegion(deleteDialogState.region.id)
            setDeleteDialogState({ isOpen: false })
        }
    }

    // Bulk actions
    const handleBulkDelete = () => {
        setIsBulkDeleteOpen(true)
    }

    const confirmBulkDelete = (ids: number[]) => {
        ids.forEach(id => deleteRegion(id))
        setSelectedRegions([])
        setIsActionBarOpen(false)
        setIsBulkDeleteOpen(false)
    }

    const handleBulkEdit = () => {
        setIsBulkEditOpen(true)
    }

    const handleBulkUpdate = (id: number, data: any) => {
        updateRegion({ id, data })
        // Remove from selected regions after update
        setSelectedRegions(prev => prev.filter(regionId => regionId !== id))
    }

    const handleBulkEditClose = () => {
        setIsBulkEditOpen(false)
        // If all regions have been processed, close the action bar
        if (selectedRegions.length === 0) {
            setIsActionBarOpen(false)
        }
    }

    const handleSaveRegion = (data: any) => {
        console.log("save", data);

        if (dialogState.mode === 'add') {
            createRegion(data)
        } else if (dialogState.region) {
            updateRegion({ id: dialogState.region.id, data: data })
        }
    }

    // Close action bar when no items are selected
    useEffect(() => {
        if (selectedRegions.length === 0 && isActionBarOpen) {
            setIsActionBarOpen(false)
        } else if (selectedRegions.length > 0 && !isActionBarOpen) {
            setIsActionBarOpen(true)
        }
    }, [selectedRegions, isActionBarOpen])



    return (
        <>
            <VStack gap="6" align="stretch">
                {/* Header */}
                <Suspense fallback={<HeaderLoading />}>
                    <RegionsHeader
                        regions={filteredAndSortedRegions}
                        onAddRegion={() => setDialogState({ isOpen: true, mode: 'add' })}
                        onSearch={handleSearch}
                        states={states || []}
                        stateFilter={stateFilter}
                        setStateFilter={setStateFilter}
                        pageSize={pageSize}
                        setPageSize={setPageSize}
                        totalCount={totalRegions}
                    />
                </Suspense>

                <Card.Root bg="transparent" border={"none"}>
                    <Card.Body p={0}>
                        <VStack gap="4">
                            {/* Table */}
                            <Suspense fallback={<RegionsTableLoading />}>
                                <RegionsTable
                                    pageSize={pageSize}
                                    paginatedRegions={paginatedRegions}
                                    selectedRegions={selectedRegions}
                                    sortField={sortField}
                                    sortOrder={sortOrder}
                                    currentPage={currentPage}
                                    totalRegions={totalRegions}
                                    isAllSelectedOnPage={isAllSelectedOnPage}
                                    onSort={handleSort}
                                    onSelectAllOnPage={handleSelectAllOnPage}
                                    onSelectRegion={handleSelectRegion}
                                    onEditRegion={(region: Region) => setDialogState({ isOpen: true, region, mode: 'edit' })}
                                    onDeleteRegion={handleDeleteRegion}
                                    onPageChange={setCurrentPage}
                                    isLoading={isLoading}
                                />
                            </Suspense>
                        </VStack>
                    </Card.Body>
                </Card.Root>
            </VStack>

            {/* Action Bar for selected items */}
            {isSuperAdmin && isActionBarOpen && (
                <Suspense fallback={<ActionBarLoading />}>
                    <RegionsActionBar
                        close={closeActionBar}
                        isOpen={isActionBarOpen}
                        selectedCount={selectedRegions.length}
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
                        <RegionDialog
                            {...dialogState}
                            onClose={() => setDialogState({ isOpen: false, mode: 'add' })}
                            onSave={handleSaveRegion}
                            isLoading={isCreating || isUpdating}
                        />
                    </Suspense>
                )}

                {/* Single Delete Confirmation Dialog */}
                {deleteDialogState.isOpen && (
                    <Suspense fallback={<DialogLoading />}>
                        <DeleteConfirmationDialog
                            isOpen={deleteDialogState.isOpen}
                            region={deleteDialogState.region}
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
                            selectedRegions={selectedRegions}
                            regions={paginatedRegions}
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
                            selectedRegions={selectedRegions}
                            regions={paginatedRegions}
                            onClose={handleBulkEditClose}
                            onUpdate={handleBulkUpdate}
                            isLoading={isUpdating}
                        />
                    </Suspense>
                )}
            </Box>

            
        </>
    )
}

export default RegionsContent;
