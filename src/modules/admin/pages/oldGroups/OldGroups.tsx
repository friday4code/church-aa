// components/oldgroups/OldGroups.tsx
"use client"

import { useState, useMemo, useEffect, lazy, Suspense, useCallback } from "react"
import { useSearchParams } from "react-router"
import {
    Box,
    VStack,
    Card,
    Spinner,
    Center,
    Text,
} from "@chakra-ui/react"
import { useQueryErrorResetBoundary } from "@tanstack/react-query"
import { ENV } from "@/config/env"
import { ErrorBoundary } from "react-error-boundary"
import ErrorFallback from "@/components/ErrorFallback"
import { toaster, Toaster } from "@/components/ui/toaster"
import { useOldGroups } from "../../hooks/useOldGroup"
import type { OldGroupFormData } from "../../schemas/oldgroups.schema"
import type { OldGroup } from "@/types/oldGroups.type"
import { useAuth } from "@/hooks/useAuth"
import { useStates } from "../../hooks/useState"
import { useRegions } from "../../hooks/useRegion"
import type { State } from "@/types/states.type"
import type { Region } from "@/types/regions.type"

// Lazy load components
const OldGroupsHeader = lazy(() => import("./components/OldGroupsHeader"))
// const ExportButtons = lazy(() => import("./components/ExportButtons"))
const OldGroupsTable = lazy(() => import("./components/OldGroupsTable"))
const OldGroupsActionBar = lazy(() => import("./components/OldGroupsActionBar"))
const OldGroupDialog = lazy(() => import("./components/OldGroupDialog"))
const DeleteConfirmationDialog = lazy(() => import("./components/DeleteConfirmationDialog"))
const BulkDeleteDialog = lazy(() => import("./components/BulkDeleteDialog"))
const BulkEditDialog = lazy(() => import("./components/BulkEditDialog"))

// Loading components
const TableLoading = () => (
    <Center h="200px">
        <VStack gap="3">
            <Spinner size="lg" color="accent.500" />
            <Text color="gray.600">Loading old groups...</Text>
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

export const OldGroups: React.FC = () => {
    const { reset } = useQueryErrorResetBoundary();

    return (
        <>
            <title>Old Groups | {ENV.APP_NAME}</title>
            <meta
                name="description"
                content="Manage old groups data"
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

export default OldGroups;

const Content = () => {
    const { hasRole } = useAuth()
    const isSuperAdmin = hasRole('Super Admin')
    const [searchParams, setSearchParams] = useSearchParams()
    const [sortField, setSortField] = useState<keyof OldGroup>('name')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
    const [currentPage, setCurrentPage] = useState(1)
    const pageSize = 50
    const [selectedGroups, setSelectedGroups] = useState<number[]>([])
    const [isActionBarOpen, setIsActionBarOpen] = useState(false)
    const [isBulkEditOpen, setIsBulkEditOpen] = useState(false)
    const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false)
    const [stateFilter, setStateFilter] = useState("")
    const [regionFilter, setRegionFilter] = useState("")

    const { states } = useStates()
    const { regions: allRegions } = useRegions()

    const {
        oldGroups,
        isLoading,
        createOldGroup,
        updateOldGroup,
        deleteOldGroup,
        isCreating,
        isUpdating,
        isDeleting
    } = useOldGroups({
        async onCreateSuccess() {
            setDialogState({ isOpen: false, mode: 'add' })
            toaster.success({ description: ` Old group created!` });
        },
        async onUpdateSuccess() {
            setDialogState({ isOpen: false, mode: 'edit' })
            toaster.success({ description: `Old group updated!` });
        },
    })


    const searchQuery = searchParams.get('search') || ''
    const [dialogState, setDialogState] = useState<{
        isOpen: boolean
        group?: OldGroup
        mode: 'add' | 'edit'
    }>({ isOpen: false, mode: 'add' })

    const [deleteDialogState, setDeleteDialogState] = useState<{
        isOpen: boolean
        group?: OldGroup
    }>({ isOpen: false })

    // Filter and sort groups
    const filteredAndSortedGroups = useMemo(() => {
        // components/oldgroups/OldGroups.tsx
        let filtered = oldGroups.filter((group: OldGroup) =>
            group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            group.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (group.leader && group.leader.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (group.leader_email && group.leader_email.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (group.leader_phone && group.leader_phone.toLowerCase().includes(searchQuery.toLowerCase()))
        )

        if (stateFilter) {
            const state = states?.find((s: State) => s.id.toString() == stateFilter)
            if (state) {
                filtered = filtered.filter((group: OldGroup) => group.state === state.name)
            }
        }

        if (regionFilter) {
            const region = allRegions?.find((r: Region) => r.id.toString() == regionFilter)
            if (region) {
                filtered = filtered.filter((group: OldGroup) => group.region === region.name)
            }
        }

        // Sorting
        filtered.sort((a: OldGroup, b: OldGroup) => {
            const aValue = a[sortField]
            const bValue = b[sortField]
            if (sortOrder === 'asc') {
                if (aValue == null && bValue == null) return 0;
                if (aValue == null) return -1;
                if (bValue == null) return 1;
                return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
            } else {
                if (aValue == null && bValue == null) return 0;
                if (aValue == null) return 1;
                if (bValue == null) return -1;
                return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
            }
        })

        return filtered
    }, [oldGroups, searchQuery, sortField, sortOrder, pageSize, stateFilter, regionFilter, states, allRegions])

    // Pagination
    const totalOldGroups = filteredAndSortedGroups.length
    const paginatedOldGroups = filteredAndSortedGroups.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    )

    // Selection logic
    const allIdsOnCurrentPage = useMemo(() => paginatedOldGroups.map((group: OldGroup) => group.id), [paginatedOldGroups])
    const allIds = useMemo(() => filteredAndSortedGroups.map((group: OldGroup) => group.id), [filteredAndSortedGroups])

    const isAllSelectedOnPage = useMemo(() => paginatedOldGroups.length > 0 &&
        paginatedOldGroups.every((group: OldGroup) => selectedGroups.includes(group.id)), [paginatedOldGroups, selectedGroups])

    const isAllSelected = filteredAndSortedGroups.length > 0 &&
        filteredAndSortedGroups.every((group: OldGroup) => selectedGroups.includes(group.id))

    const handleSelectAllOnPage = () => {
        if (isAllSelectedOnPage) {
            setSelectedGroups(prev => prev.filter(id => !allIdsOnCurrentPage.includes(id)))
        } else {
            setSelectedGroups(prev => [...new Set([...prev, ...allIdsOnCurrentPage])])
        }
    }

    const closeActionBar = useCallback(() => {
        setSelectedGroups([]);
    }, [selectedGroups]);

    const handleSelectAll = () => {
        if (isAllSelected) {
            setSelectedGroups([])
        } else {
            setSelectedGroups(allIds)
        }
    }

    const handleSelectGroup = (groupId: number) => {
        setSelectedGroups(prev =>
            prev.includes(groupId)
                ? prev.filter(id => id !== groupId)
                : [...prev, groupId]
        )
    }

    const handleSearch = (value: string) => {
        setSearchParams(s => (s.set("search", value), s))
        setCurrentPage(1)
    }

    const handleSort = (field: keyof OldGroup) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortOrder('asc')
        }
    }

    const handleDeleteGroup = (group: OldGroup) => {
        setDeleteDialogState({ isOpen: true, group })
    }

    const confirmDelete = () => {
        if (deleteDialogState.group) {
            deleteOldGroup(deleteDialogState.group.id)
            setDeleteDialogState({ isOpen: false })
        }
    }

    // Bulk actions
    const handleBulkDelete = () => {
        setIsBulkDeleteOpen(true)
    }

    const confirmBulkDelete = (ids: number[]) => {
        ids.forEach(id => deleteOldGroup(id))
        setSelectedGroups([])
        setIsActionBarOpen(false)
        setIsBulkDeleteOpen(false)
    }

    const handleBulkEdit = () => {
        setIsBulkEditOpen(true)
    }

    const handleBulkUpdate = (id: number, data: any) => {
        updateOldGroup({ id, data })
        setSelectedGroups(prev => prev.filter(groupId => groupId !== id))
    }

    const handleBulkEditClose = () => {
        setIsBulkEditOpen(false)
        if (selectedGroups.length === 0) {
            setIsActionBarOpen(false)
        }
    }
    const handleSaveGroup = (data: OldGroupFormData) => {
        // No transformation needed since form data matches API payload
        if (dialogState.mode === 'add') {
            createOldGroup(data);
        } else if (dialogState.group) {
            console.log(data);

            updateOldGroup({ id: dialogState.group.id, data })
        }
    }

    // Close action bar when no items are selected
    useEffect(() => {
        if (selectedGroups.length === 0 && isActionBarOpen) {
            setIsActionBarOpen(false)
        } else if (selectedGroups.length > 0 && !isActionBarOpen) {
            setIsActionBarOpen(true)
        }
    }, [selectedGroups, isActionBarOpen])

    if (isLoading && oldGroups.length === 0) {
        return (
            <Center h="400px">
                <VStack gap="4">
                    <Spinner size="xl" color="accent.500" />
                    <Text fontSize="lg" color="gray.600">Loading old groups...</Text>
                </VStack>
            </Center>
        )
    }

    return (
        <>
            <VStack gap="6" align="stretch">
                {/* Header */}
                <Suspense fallback={<HeaderLoading />}>
                    <OldGroupsHeader
                        oldGroups={paginatedOldGroups}
                        onAddGroup={() => setDialogState({ isOpen: true, mode: 'add' })}
                        onSearch={handleSearch}
                        states={states || []}
                        regions={allRegions || []}
                        stateFilter={stateFilter}
                        setStateFilter={setStateFilter}
                        regionFilter={regionFilter}
                        setRegionFilter={setRegionFilter}
                    />
                </Suspense>

                <Card.Root bg="transparent" border={"none"}>
                    <Card.Body p={0}>
                        <VStack gap="4">

                            {/* Table */}
                            <Suspense fallback={<TableLoading />}>
                                <OldGroupsTable
                                    paginatedOldGroups={paginatedOldGroups}
                                    selectedGroups={selectedGroups}
                                    sortField={sortField}
                                    sortOrder={sortOrder}
                                    currentPage={currentPage}
                                    pageSize={pageSize}
                                    totalOldGroups={totalOldGroups}
                                    isAllSelectedOnPage={isAllSelectedOnPage}
                                    onSort={handleSort}
                                    onSelectAllOnPage={handleSelectAllOnPage}
                                    onSelectGroup={handleSelectGroup}
                                    onEditGroup={(group: OldGroup) => setDialogState({ isOpen: true, group, mode: 'edit' })}
                                    onDeleteGroup={handleDeleteGroup}
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
                    <OldGroupsActionBar
                        close={closeActionBar}
                        isOpen={isActionBarOpen}
                        selectedCount={selectedGroups.length}
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
                        <OldGroupDialog
                            {...dialogState}
                            onClose={() => setDialogState({ isOpen: false, mode: 'add' })}
                            onSave={handleSaveGroup}
                            isLoading={isCreating || isUpdating}
                        />
                    </Suspense>
                )}

                {/* Single Delete Confirmation Dialog */}
                {deleteDialogState.isOpen && (
                    <Suspense fallback={<DialogLoading />}>
                        <DeleteConfirmationDialog
                            isOpen={deleteDialogState.isOpen}
                            group={deleteDialogState.group}
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
                            selectedGroups={selectedGroups}
                            groups={paginatedOldGroups}
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
                            selectedGroups={selectedGroups}
                            groups={paginatedOldGroups}
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
