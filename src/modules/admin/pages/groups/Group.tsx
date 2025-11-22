// components/groups/Groups.tsx
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
import type { Group } from "@/types/groups.type"
import { useGroups } from "../../hooks/useGroup"
import { Toaster } from "@/components/ui/toaster"

// Lazy load components with proper loading states
const GroupsHeader = lazy(() => import("./components/GroupsHeader"))
const ExportButtons = lazy(() => import("./components/ExportButtons"))
const GroupsTable = lazy(() => import("./components/GroupsTable"))
const GroupsActionBar = lazy(() => import("./components/GroupsActionBar"))
const GroupDialog = lazy(() => import("./components/GroupDialog"))
const DeleteConfirmationDialog = lazy(() => import("./components/DeleteConfirmationDialog"))
const BulkDeleteDialog = lazy(() => import("./components/BulkDeleteDialog"))
const BulkEditDialog = lazy(() => import("./components/BulkEditDialog"))

// Loading components
const TableLoading = () => (
    <Center h="200px">
        <VStack gap="3">
            <Spinner size="lg" color="accent.500" />
            <Text color="gray.600">Loading groups...</Text>
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

export const Groups: React.FC = () => {
    const { reset } = useQueryErrorResetBoundary();

    return (
        <>
            <title>Groups | {ENV.APP_NAME}</title>
            <meta
                name="description"
                content="Manage your groups"
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

export default Groups;

const Content = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const [sortField, setSortField] = useState<keyof Group>('name')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
    const [currentPage, setCurrentPage] = useState(1)
    const pageSize = 10
    const [selectedGroups, setSelectedGroups] = useState<number[]>([])
    const [isActionBarOpen, setIsActionBarOpen] = useState(false)
    const [isBulkEditOpen, setIsBulkEditOpen] = useState(false)
    const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false)

    const {
        groups,
        isLoading,
        createGroup,
        updateGroup,
        deleteGroup,
        isCreating,
        isUpdating,
        isDeleting
    } = useGroups({
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
        group?: Group
        mode: 'add' | 'edit'
    }>({ isOpen: false, mode: 'add' })

    const [deleteDialogState, setDeleteDialogState] = useState<{
        isOpen: boolean
        group?: Group
    }>({ isOpen: false })

    // Filter and sort groups
    const filteredAndSortedGroups = useMemo(() => {
        let filtered = groups.filter(group =>
            group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            group.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            group.leader?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            group.old_group?.toLowerCase().includes(searchQuery.toLowerCase())
        )

        // Sorting
        filtered.sort((a, b) => {
            const aValue = a[sortField]
            const bValue = b[sortField]
            if (sortOrder === 'asc') {
                return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
            } else {
                return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
            }
        })

        return filtered
    }, [groups, searchQuery, sortField, sortOrder])

    // Pagination
    const totalPages = Math.ceil(filteredAndSortedGroups.length / pageSize)
    const paginatedGroups = filteredAndSortedGroups.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    )

    // Selection logic
    const allIdsOnCurrentPage = paginatedGroups.map(group => group.id)
    const allIds = filteredAndSortedGroups.map(group => group.id)

    const isAllSelectedOnPage = paginatedGroups.length > 0 &&
        paginatedGroups.every(group => selectedGroups.includes(group.id))

    const isAllSelected = filteredAndSortedGroups.length > 0 &&
        filteredAndSortedGroups.every(group => selectedGroups.includes(group.id))

    const handleSelectAllOnPage = () => {
        if (isAllSelectedOnPage) {
            // Deselect all on current page
            setSelectedGroups(prev => prev.filter(id => !allIdsOnCurrentPage.includes(id)))
        } else {
            // Select all on current page
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

    const handleSort = (field: keyof Group) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortOrder('asc')
        }
    }

    const handleDeleteGroup = (group: Group) => {
        setDeleteDialogState({ isOpen: true, group })
    }

    const confirmDelete = () => {
        if (deleteDialogState.group) {
            deleteGroup(deleteDialogState.group.id)
            setDeleteDialogState({ isOpen: false })
        }
    }

    // Bulk actions
    const handleBulkDelete = () => {
        setIsBulkDeleteOpen(true)
    }

    const confirmBulkDelete = (ids: number[]) => {
        ids.forEach(id => deleteGroup(id))
        setSelectedGroups([])
        setIsActionBarOpen(false)
        setIsBulkDeleteOpen(false)
    }

    const handleBulkEdit = () => {
        setIsBulkEditOpen(true)
    }

    const handleBulkUpdate = (id: number, data: any) => {
        updateGroup({ id, data })
        // Remove from selected groups after update
        setSelectedGroups(prev => prev.filter(groupId => groupId !== id))
    }

    const handleBulkEditClose = () => {
        setIsBulkEditOpen(false)
        // If all groups have been processed, close the action bar
        if (selectedGroups.length === 0) {
            setIsActionBarOpen(false)
        }
    }

    const handleSaveGroup = (data: any) => {
        // Transform data to match API structure
        const apiData: any = {
            group_name: data.group_name,
            leader: data.leader,
            state_id: data.state_id,
            region_id: data.region_id,
        }

        // Add old_group_id if provided
        if (data.old_group_id) {
            apiData.old_group_id = data.old_group_id
        }

        if (dialogState.mode === 'add') {
            createGroup(apiData)
        } else if (dialogState.group) {
            updateGroup({ id: dialogState.group.id, data: apiData as any })
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

    if (isLoading && groups.length === 0) {
        return (
            <Center h="400px">
                <VStack gap="4">
                    <Spinner size="xl" color="accent.500" />
                    <Text fontSize="lg" color="gray.600">Loading groups...</Text>
                </VStack>
            </Center>
        )
    }

    return (
        <>
            <VStack gap="6" align="stretch">
                {/* Header */}
                <Suspense fallback={<HeaderLoading />}>
                    <GroupsHeader
                        groups={groups}
                        onAddGroup={() => setDialogState({ isOpen: true, mode: 'add' })}
                        onSearch={handleSearch}
                    />
                </Suspense>

                <Card.Root bg="transparent" border={"none"}>
                    <Card.Body p={0}>
                        <VStack gap="4">
                            {/* Export Buttons */}
                            <Suspense fallback={
                                <Center h="40px">
                                    <Spinner size="sm" color="accent.500" />
                                </Center>
                            }>
                                <ExportButtons groups={groups} />
                            </Suspense>

                            {/* Table */}
                            <Suspense fallback={<TableLoading />}>
                                <GroupsTable
                                    paginatedGroups={paginatedGroups}
                                    selectedGroups={selectedGroups}
                                    sortField={sortField}
                                    sortOrder={sortOrder}
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    isAllSelectedOnPage={isAllSelectedOnPage}
                                    onSort={handleSort}
                                    onSelectAllOnPage={handleSelectAllOnPage}
                                    onSelectGroup={handleSelectGroup}
                                    onEditGroup={(group) => setDialogState({ isOpen: true, group, mode: 'edit' })}
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
            {isActionBarOpen && (
                <Suspense fallback={<ActionBarLoading />}>
                    <GroupsActionBar
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
                        <GroupDialog
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
                            groups={paginatedGroups}
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
                            groups={paginatedGroups}
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