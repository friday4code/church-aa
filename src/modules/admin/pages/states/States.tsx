// components/states/States.tsx
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
import { useQueryClient, useQueryErrorResetBoundary } from "@tanstack/react-query"
import { ENV } from "@/config/env"
import { ErrorBoundary } from "react-error-boundary"
import ErrorFallback from "@/components/ErrorFallback"
import type { State } from "@/types/states.type"
import { useStates } from "../../hooks/useState"
import { Toaster } from "@/components/ui/toaster"
import { useAuth } from "@/hooks/useAuth"

// Lazy load components with proper loading states
const StatesHeader = lazy(() => import("./components/StatesHeader"))
const StatesTable = lazy(() => import("./components/StatesTable"))
const StatesActionBar = lazy(() => import("./components/StatesActionBar"))
const StateDialog = lazy(() => import("./components/StateDialog"))
const DeleteConfirmationDialog = lazy(() => import("./components/DeleteConfirmationDialog"))
const BulkDeleteDialog = lazy(() => import("./components/BulkDeleteDialog"))
const BulkEditDialog = lazy(() => import("./components/BulkEditDialog"))

// Loading components
const TableLoading = () => (
    <Center h="200px">
        <VStack gap="3">
            <Spinner size="lg" color="accent.500" />
            <Text color="gray.600">Loading states...</Text>
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

export const States: React.FC = () => {
    const { reset } = useQueryErrorResetBoundary();

    return (
        <>
            <title>States | {ENV.APP_NAME}</title>
            <meta
                name="description"
                content="track your States"
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

export default States;

const Content = () => {
    const { hasRole } = useAuth()
    const isSuperAdmin = hasRole('Super Admin')
    const [searchParams, setSearchParams] = useSearchParams()
    const [sortField, setSortField] = useState<keyof State>('name')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(50)
    const [selectedStates, setSelectedStates] = useState<number[]>([])
    const [isActionBarOpen, setIsActionBarOpen] = useState(false)
    const [isBulkEditOpen, setIsBulkEditOpen] = useState(false)
    const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false)

    const {
        states,
        isLoading,
        createState,
        updateState,
        deleteState,
        isCreating,
        isUpdating,
        isDeleting
    } = useStates({
        async onCreateSuccess() {
            setDialogState({ isOpen: false, mode: 'add' })
            
        },
        async onUpdateSuccess() {
            setDialogState({ isOpen: false, mode: 'edit' })
           
        },
    })

    const searchQuery = searchParams.get('search') || ''
    const [dialogState, setDialogState] = useState<{
        isOpen: boolean
        state?: State
        mode: 'add' | 'edit'
    }>({ isOpen: false, mode: 'add' })

    const [deleteDialogState, setDeleteDialogState] = useState<{
        isOpen: boolean
        state?: State
    }>({ isOpen: false })

    // Filter and sort states - use states directly
    const filteredAndSortedStates = useMemo(() => {
        let filtered = states.filter((state: State) =>
            state.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            state.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            state.leader.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (state.leader_email && state.leader_email.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (state.leader_phone && state.leader_phone.toLowerCase().includes(searchQuery.toLowerCase()))
        )

        // Sorting
        filtered.sort((a: State, b: State) => {
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
    }, [states, searchQuery, sortField, sortOrder])
    // Pagination
    const totalStates = useMemo(() => filteredAndSortedStates.length, [filteredAndSortedStates])
    const paginatedStates = useMemo(() => filteredAndSortedStates.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    ), [filteredAndSortedStates, currentPage, pageSize])

    // Selection logic
    const allIdsOnCurrentPage = paginatedStates.map((state: State) => state.id)
    const allIds = filteredAndSortedStates.map((state: State) => state.id)

    const isAllSelectedOnPage = paginatedStates.length > 0 &&
        paginatedStates.every((state: State) => selectedStates.includes(state.id))

    const isAllSelected = filteredAndSortedStates.length > 0 &&
        filteredAndSortedStates.every((state: State) => selectedStates.includes(state.id))

    const handleSelectAllOnPage = () => {
        if (isAllSelectedOnPage) {
            // Deselect all on current page
            setSelectedStates(prev => prev.filter(id => !allIdsOnCurrentPage.includes(id)))
        } else {
            // Select all on current page
            setSelectedStates(prev => [...new Set([...prev, ...allIdsOnCurrentPage])])
        }
    }

    const closeActionBar = useCallback(() => {
        setSelectedStates([]);
    }, [selectedStates]);

    const handleSelectAll = () => {
        if (isAllSelected) {
            setSelectedStates([])
        } else {
            setSelectedStates(allIds)
        }
    }

    const handleSelectState = (stateId: number) => {
        setSelectedStates(prev =>
            prev.includes(stateId)
                ? prev.filter(id => id !== stateId)
                : [...prev, stateId]
        )
    }

    const handleSearch = (value: string) => {
        setSearchParams(s => (s.set("search", value), s))
        setCurrentPage(1)
    }

    const handleSort = (field: keyof State) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortOrder('asc')
        }
    }

    const handleDeleteState = (state: State) => {
        setDeleteDialogState({ isOpen: true, state })
    }

    const confirmDelete = () => {
        if (deleteDialogState.state) {
            deleteState(deleteDialogState.state.id)
            setDeleteDialogState({ isOpen: false })
        }
    }

    // Bulk actions
    const handleBulkDelete = () => {
        setIsBulkDeleteOpen(true)
    }

    const confirmBulkDelete = (ids: number[]) => {
        ids.forEach(id => deleteState(id))
        setSelectedStates([])
        setIsActionBarOpen(false)
        setIsBulkDeleteOpen(false)
    }

    const handleBulkEdit = () => {
        setIsBulkEditOpen(true)
    }

    const handleBulkUpdate = (id: number, data: any) => {
        updateState({ id, data })
        // Remove from selected states after update
        setSelectedStates(prev => prev.filter(stateId => stateId !== id))
    }

    const handleBulkEditClose = () => {
        setIsBulkEditOpen(false)
        // If all states have been processed, close the action bar
        if (selectedStates.length === 0) {
            setIsActionBarOpen(false)
        }
    }

    const handleSaveState = (data: any) => {
        // Transform data to match API structure
        const apiData = {
            name: data.stateName,
            code: data.stateCode,
            leader: data.leader,
            leader_email: data.leader_email,
            leader_phone: data.leader_phone
        }

        if (dialogState.mode === 'add') {
            createState(apiData)
        } else if (dialogState.state) {
            updateState({ id: dialogState.state.id, data: apiData })
        }

    }

    // Close action bar when no items are selected
    useEffect(() => {
        if (selectedStates.length === 0 && isActionBarOpen) {
            setIsActionBarOpen(false)
        } else if (selectedStates.length > 0 && !isActionBarOpen) {
            setIsActionBarOpen(true)
        }
    }, [selectedStates, isActionBarOpen])


    return (
        <>
            <VStack gap="6" align="stretch">
                {/* Header */}
                <Suspense fallback={<HeaderLoading />}>
                    <StatesHeader
                        states={paginatedStates}
                        onAddState={() => setDialogState({ isOpen: true, mode: 'add' })}
                        onSearch={handleSearch}
                        pageSize={pageSize}
                        setPageSize={setPageSize}
                    />
                </Suspense>

                <Card.Root bg="transparent" border={"none"}>
                    <Card.Body p={0}>
                        <VStack gap="4">
                            {/* Table */}
                            <Suspense fallback={<TableLoading />}>
                                <StatesTable
                                    pageSize={pageSize}
                                    paginatedStates={paginatedStates}
                                    selectedStates={selectedStates}
                                    sortField={sortField}
                                    sortOrder={sortOrder}
                                    currentPage={currentPage}
                                    totalStates={totalStates}
                                    isAllSelectedOnPage={isAllSelectedOnPage}
                                    onSort={handleSort}
                                    onSelectAllOnPage={handleSelectAllOnPage}
                                    onSelectState={handleSelectState}
                                    onEditState={(state) => setDialogState({ isOpen: true, state, mode: 'edit' })}
                                    onDeleteState={handleDeleteState}
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
                    <StatesActionBar
                        close={closeActionBar}
                        isOpen={isActionBarOpen}
                        selectedCount={selectedStates.length}
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
                        <StateDialog
                            {...dialogState}
                            onClose={() => setDialogState({ isOpen: false, mode: 'add' })}
                            onSave={handleSaveState}
                            isLoading={isCreating || isUpdating}
                        />
                    </Suspense>
                )}

                {/* Single Delete Confirmation Dialog */}
                {deleteDialogState.isOpen && (
                    <Suspense fallback={<DialogLoading />}>
                        <DeleteConfirmationDialog
                            isOpen={deleteDialogState.isOpen}
                            state={deleteDialogState.state}
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
                            selectedStates={selectedStates}
                            states={paginatedStates}
                            onClose={() => setIsBulkDeleteOpen(false)}
                            onConfirm={confirmBulkDelete}
                        // isLoading={isDeleting}
                        />
                    </Suspense>
                )}

                {/* Bulk Edit Dialog */}
                {isBulkEditOpen && (
                    <Suspense fallback={<DialogLoading />}>
                        <BulkEditDialog
                            isOpen={isBulkEditOpen}
                            selectedStates={selectedStates}
                            states={paginatedStates}
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
