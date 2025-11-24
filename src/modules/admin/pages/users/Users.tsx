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
import { Toaster } from "@/components/ui/toaster"
import { toaster } from "@/components/ui/toaster"
import type { UserFormData } from "../../schemas/users.schema"
import { useUserMutations, useUsers } from "../../hooks/useUser"
import type { User } from "@/types/users.type"
import { useAuth } from "@/hooks/useAuth"
import { Badge, HStack, Text as CText } from "@chakra-ui/react"

// Lazy load components
const UsersHeader = lazy(() => import("./components/users/UsersHeader"))
const ExportButtons = lazy(() => import("./components/users/ExportButtons"))
const UsersTable = lazy(() => import("./components/users/UsersTable"))
const UsersActionBar = lazy(() => import("./components/users/UsersActionBar"))
const UserDialog = lazy(() => import("./components/users/UserDialog"))
const DeleteConfirmationDialog = lazy(() => import("./components/users/DeleteConfirmationDialog"))
const BulkDeleteDialog = lazy(() => import("./components/users/BulkDeleteDialog"))
const BulkEditDialog = lazy(() => import("./components/users/BulkEditDialog"))

// Loading components
const TableLoading = () => (
    <Center h="200px">
        <VStack gap="3">
            <Spinner size="lg" color="accent.500" />
            <Text color="gray.600">Loading users...</Text>
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

export const Users: React.FC = () => {
    const { reset } = useQueryErrorResetBoundary();

    return (
        <>
            <title>Users Data | {ENV.APP_NAME}</title>
            <meta
                name="description"
                content="Manage users data"
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

export default Users;

const Content = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const [sortField, setSortField] = useState<keyof User>('name')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
    const [currentPage, setCurrentPage] = useState(1)
    const pageSize = 10
    const [selectedUsers, setSelectedUsers] = useState<number[]>([])
    const [isActionBarOpen, setIsActionBarOpen] = useState(false)
    const [isBulkEditOpen, setIsBulkEditOpen] = useState(false)
    const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false)

    const { data, isLoading } = useUsers();
    const users = data?.users || [];
    const { createUser, updateUser, deleteUser, isCreating, isUpdating, isDeleting } = useUserMutations()
    const { user: authUser, hasRole } = useAuth()

    const searchQuery = searchParams.get('search') || ''
    const [dialogState, setDialogState] = useState<{
        isOpen: boolean
        user?: any
        mode: 'add' | 'edit'
    }>({ isOpen: false, mode: 'add' })

    const [deleteDialogState, setDeleteDialogState] = useState<{
        isOpen: boolean
        user?: any
    }>({ isOpen: false })

    // Filter and sort users with hierarchical restrictions
    const filteredAndSortedUsers = useMemo(() => {
        const isSuperAdmin = hasRole('Super Admin')
        const isStateAdmin = hasRole('State Admin')
        const isRegionAdmin = hasRole('Region Admin')
        const isDistrictAdmin = hasRole('District Admin')

        const byHierarchy = users.filter((u: any) => {
            if (isSuperAdmin) return true
            if (isStateAdmin) {
                return u.state_id === authUser?.state_id && !(u.roles || []).includes('Super Admin')
            }
            if (isRegionAdmin) {
                const roles = u.roles || []
                const allowed = ['Region Admin', 'District Admin', 'Group Admin', 'Viewer']
                return u.region_id === authUser?.region_id && roles.some((r: any) => allowed.includes(r))
            }
            if (isDistrictAdmin) {
                const roles = u.roles || []
                const allowed = ['District Admin', 'Group Admin', 'Viewer']
                return u.district_id === authUser?.district_id && roles.some((r: any) => allowed.includes(r))
            }
            return false
        })

        let filtered = byHierarchy.filter((user: any) =>
            user?.firstName?.toLowerCase()?.includes(searchQuery.toLowerCase()) ||
            user?.lastName?.toLowerCase()?.includes(searchQuery.toLowerCase()) ||
            user?.email?.toLowerCase()?.includes(searchQuery.toLowerCase()) ||
            user?.phone?.toLowerCase()?.includes(searchQuery.toLowerCase()) ||
            `${user?.firstName} ${user?.lastName}`?.toLowerCase()?.includes(searchQuery.toLowerCase())
        )

        // Sorting
        filtered.sort((a: any, b: any) => {
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
    }, [users, searchQuery, sortField, sortOrder, hasRole, authUser])

    // Pagination
    const totalPages = Math.ceil(filteredAndSortedUsers.length / pageSize)
    const paginatedUsers = filteredAndSortedUsers.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    )

    // Selection logic
    const allIdsOnCurrentPage = paginatedUsers.map((user: any) => user.id)
    const allIds = filteredAndSortedUsers.map((user: any) => user.id)

    const isAllSelectedOnPage = paginatedUsers.length > 0 &&
        paginatedUsers.every((user: any) => selectedUsers.includes(user.id))

    const isAllSelected = filteredAndSortedUsers.length > 0 &&
        filteredAndSortedUsers.every((user: any) => selectedUsers.includes(user.id))

    const handleSelectAllOnPage = () => {
        if (isAllSelectedOnPage) {
            setSelectedUsers(prev => prev.filter(id => !allIdsOnCurrentPage.includes(id)))
        } else {
            setSelectedUsers(prev => [...new Set([...prev, ...allIdsOnCurrentPage])])
        }
    }

    const closeActionBar = useCallback(() => {
        setSelectedUsers([]);
    }, []);

    const handleSelectAll = () => {
        if (isAllSelected) {
            setSelectedUsers([])
        } else {
            setSelectedUsers(allIds)
        }
    }

    const handleSelectUser = (userId: number) => {
        setSelectedUsers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        )
    }

    const handleSearch = (value: string) => {
        setSearchParams(s => (s.set("search", value), s))
        setCurrentPage(1)
    }

    const handleSort = (field: keyof User) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortOrder('asc')
        }
    }

    const handleDeleteUser = (user: any) => {
        setDeleteDialogState({ isOpen: true, user })
    }

    const confirmDelete = () => {
        if (deleteDialogState.user) {
            deleteUser.mutate(deleteDialogState.user.id, {
                onSuccess: () => {
                    toaster.create({ description: 'User deleted successfully', type: 'success', closable: true })
                    setDeleteDialogState({ isOpen: false })
                },
                onError: (error: any) => {
                    const msg = error?.message || 'Failed to delete user'
                    toaster.create({ description: msg, type: 'error', closable: true })
                }
            })
        }
    }

    // Bulk actions
    const handleBulkDelete = () => {
        setIsBulkDeleteOpen(true)
    }

    const confirmBulkDelete = (ids: number[]) => {
        ids.forEach(id => deleteUser.mutate(id))
        setSelectedUsers([])
        setIsActionBarOpen(false)
        setIsBulkDeleteOpen(false)
    }

    const handleBulkEdit = () => {
        setIsBulkEditOpen(true)
    }

    const handleBulkUpdate = (id: number, data: any) => {
        updateUser.mutate({ id, data })
        setSelectedUsers(prev => prev.filter(userId => userId !== id))
    }

    const handleBulkEditClose = () => {
        setIsBulkEditOpen(false)
        if (selectedUsers.length === 0) {
            setIsActionBarOpen(false)
        }
    }
    const handleSaveUser = (data: UserFormData) => {
        // Transform data to match API structure
        const apiData = {
            name: data.name,
            email: data.email,
            phone: data.phone,
            password: data.password,
            state_id: data.state_id,
            region_id: data.region_id,
            district_id: data.district_id,
            group_id: data.group_id,
            old_group_id: data.old_group_id,
            roles: data.roles
        }

        if (dialogState.mode === 'add') {
            createUser.mutate(apiData, {
                onSuccess: () => {
                    toaster.create({ description: 'User added successfully', type: 'success', closable: true })
                    setDialogState({ isOpen: false, mode: 'add' })
                },
                onError: (error: any) => {
                    const msg = error?.message || 'Failed to add user'
                    toaster.create({ description: msg, type: 'error', closable: true })
                }
            })
        } else if (dialogState.user) {
            // For update, only include password if provided
            const updateData = { ...apiData }
            if (!updateData.password) {
                delete updateData.password
            }

            // Ensure roles are numeric IDs when possible
            const coercedRoles = (Array.isArray(updateData.roles) ? updateData.roles : []).map((r: any) => {
                if (typeof r === 'number') return r
                if (typeof r === 'string') {
                    const n = parseInt(r, 10)
                    return Number.isFinite(n) ? n : r
                }
                return r
            })
            updateData.roles = coercedRoles

            updateUser.mutate({ id: dialogState.user.id, data: updateData }, {
                onSuccess: () => {
                    toaster.create({ description: 'User updated successfully', type: 'success', closable: true })
                    setDialogState({ isOpen: false, mode: 'add' })
                },
                onError: (error: any) => {
                    const msg = error?.message || 'Failed to update user'
                    toaster.create({ description: msg, type: 'error', closable: true })
                }
            })
        }
    }
    // Close action bar when no items are selected
    useEffect(() => {
        if (selectedUsers.length === 0 && isActionBarOpen) {
            setIsActionBarOpen(false)
        } else if (selectedUsers.length > 0 && !isActionBarOpen) {
            setIsActionBarOpen(true)
        }
    }, [selectedUsers, isActionBarOpen])

    if (isLoading && users.length === 0) {
        return (
            <Center h="400px">
                <VStack gap="4">
                    <Spinner size="xl" color="accent.500" />
                    <Text fontSize="lg" color="gray.600">Loading users...</Text>
                </VStack>
            </Center>
        )
    }

    return (
        <>
            <VStack gap="6" align="stretch">
                {/* Header */}
                <Suspense fallback={<HeaderLoading />}>
                    <UsersHeader
                        users={users}
                        onAddUser={() => setDialogState({ isOpen: true, mode: 'add' })}
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
                                <ExportButtons users={users} />
                            </Suspense>

                            {/* Table */}
                            <Suspense fallback={<TableLoading />}>
                                {!hasRole('Super Admin') && (
                                    <HStack mb="3">
                                        <Badge colorPalette="blue" variant="solid">
                                            {hasRole('State Admin') && (
                                                <CText>Scope: State-only users</CText>
                                            )}
                                            {hasRole('Region Admin') && (
                                                <CText>Scope: Region-only users</CText>
                                            )}
                                            {hasRole('District Admin') && (
                                                <CText>Scope: District-only users</CText>
                                            )}
                                        </Badge>
                                    </HStack>
                                )}
                                <UsersTable
                                    paginatedUsers={paginatedUsers}
                                    selectedUsers={selectedUsers}
                                    sortField={sortField}
                                    sortOrder={sortOrder}
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    isAllSelectedOnPage={isAllSelectedOnPage}
                                    onSort={handleSort}
                                    onSelectAllOnPage={handleSelectAllOnPage}
                                    onSelectUser={handleSelectUser}
                                    onEditUser={(user) => setDialogState({ isOpen: true, user, mode: 'edit' })}
                                    onDeleteUser={handleDeleteUser}
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
                    <UsersActionBar
                        close={closeActionBar}
                        isOpen={isActionBarOpen}
                        selectedCount={selectedUsers.length}
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
                        <UserDialog
                            {...dialogState}
                            onClose={() => setDialogState({ isOpen: false, mode: 'add' })}
                            onSave={handleSaveUser}
                            isLoading={isCreating || isUpdating}
                        />
                    </Suspense>
                )}

                {/* Single Delete Confirmation Dialog */}
                {deleteDialogState.isOpen && (
                    <Suspense fallback={<DialogLoading />}>
                        <DeleteConfirmationDialog
                            isOpen={deleteDialogState.isOpen}
                            user={deleteDialogState.user}
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
                            selectedUsers={selectedUsers}
                            users={paginatedUsers}
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
                            selectedUsers={selectedUsers}
                            users={paginatedUsers}
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