// components/users/UsersPage.tsx
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
    InputGroup, Table,
    IconButton,
    Menu,
    Portal, Dialog,
    CloseButton,
    Field,
    Card,
    Flex, Pagination,
    ButtonGroup,
    Checkbox,
    ActionBar,
    Tabs,
    Text,
    Badge,
} from "@chakra-ui/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Add, ArrowLeft3, ArrowRight3, Copy, DocumentDownload, DocumentText, Edit, More, ReceiptText, SearchNormal1, Trash, Eye, EyeSlash } from "iconsax-reactjs"
import { useQueryErrorResetBoundary } from "@tanstack/react-query"
import { ENV } from "@/config/env"
import { ErrorBoundary } from "react-error-boundary"
import ErrorFallback from "@/components/ErrorFallback"

import { type UserFormData, userSchema } from "../../schemas/users.schema"
import { useUsersStore, type User } from "../../stores/users.store"
import { copyUsersToClipboard, exportUsersToCSV, exportUsersToExcel, exportUsersToPDF } from "@/utils/users.utils"

// UUID generator function
const uuid = () => {
    return Math.random().toString(36).substring(2, 15)
}

// Bulk Edit Dialog Component
interface BulkEditDialogProps {
    isOpen: boolean
    selectedUsers: number[]
    users: User[]
    onClose: () => void
    onUpdate: (id: number, data: Partial<UserFormData>) => void
}

const BulkEditDialog = ({ isOpen, selectedUsers, users, onClose, onUpdate }: BulkEditDialogProps) => {
    const [tabs, setTabs] = useState<Array<{ id: string; user: User; title: string }>>([])
    const [selectedTab, setSelectedTab] = useState<string | null>(null)

    useEffect(() => {
        if (isOpen && selectedUsers.length > 0) {
            const initialTabs = selectedUsers.map(userId => {
                const user = users.find(u => u.id === userId)
                return {
                    id: uuid(),
                    user: user!,
                    title: user?.firstName || 'User'
                }
            })
            setTabs(initialTabs)
            setSelectedTab(initialTabs[0]?.id || null)
        }
    }, [isOpen, selectedUsers, users])

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

    const handleTabUpdate = (tabId: string, data: Partial<UserFormData>) => {
        const tab = tabs.find(t => t.id === tabId)
        if (tab) {
            onUpdate(tab.user.id, data)
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
                            <Dialog.Title>Update Users</Dialog.Title>
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
                                            <UserEditForm
                                                user={tab.user}
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
    selectedUsers: number[]
    users: User[]
    onClose: () => void
    onConfirm: (ids: number[]) => void
}

const BulkDeleteDialog = ({ isOpen, selectedUsers, users, onClose, onConfirm }: BulkDeleteDialogProps) => {
    const selectedUserNames = users
        .filter(user => selectedUsers.includes(user.id))
        .map(user => `${user.firstName} ${user.lastName}`)

    const handleConfirm = () => {
        onConfirm(selectedUsers)
        onClose()
    }

    return (
        <Dialog.Root role="alertdialog" open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content rounded="xl">
                        <Dialog.Header>
                            <Dialog.Title>Delete Multiple Users</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body>
                            <VStack align="stretch" gap="3">
                                <Text>
                                    Are you sure you want to delete <strong>{selectedUsers.length} user(s)</strong>?
                                    This action cannot be undone.
                                </Text>

                                {selectedUserNames.length > 0 && (
                                    <Box>
                                        <Text fontWeight="medium" mb="2">Users to be deleted:</Text>
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
                                                {selectedUserNames.map((name, index) => (
                                                    <Text key={index} fontSize="sm">• {name}</Text>
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
                                Delete {selectedUsers.length} User{selectedUsers.length > 1 ? 's' : ''}
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

// Individual User Edit Form
interface UserEditFormProps {
    user: User
    onUpdate: (data: Partial<UserFormData>) => void
    onCancel: () => void
}

const UserEditForm = ({ user, onUpdate, onCancel }: UserEditFormProps) => {
    const [showPassword, setShowPassword] = useState(false)

    const { register, handleSubmit, formState: { errors } } = useForm<UserFormData>({
        resolver: zodResolver(userSchema("edit")),
        defaultValues: {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            password: '' // Don't pre-fill password for security
        }
    })

    const onSubmit = (data: UserFormData) => {
        onUpdate(data)
    }

    return (
        <VStack gap="4" align="stretch">
            <Text fontSize="sm" color="gray.600" mb="2">
                Editing: <strong>{user.firstName} {user.lastName}</strong>
            </Text>

            <form id={`user-form-${user.id}`} onSubmit={handleSubmit(onSubmit)}>
                <VStack gap="4" colorPalette={"accent"}>
                    <HStack gap="4" w="full">
                        <Field.Root required invalid={!!errors.firstName}>
                            <Field.Label>First Name
                                <Field.RequiredIndicator />
                            </Field.Label>
                            <Input
                                rounded="lg"
                                placeholder="Enter first name"
                                {...register('firstName')}
                            />
                            <Field.ErrorText>{errors.firstName?.message}</Field.ErrorText>
                        </Field.Root>

                        <Field.Root required invalid={!!errors.lastName}>
                            <Field.Label>Last Name
                                <Field.RequiredIndicator />
                            </Field.Label>
                            <Input
                                rounded="lg"
                                placeholder="Enter last name"
                                {...register('lastName')}
                            />
                            <Field.ErrorText>{errors.lastName?.message}</Field.ErrorText>
                        </Field.Root>
                    </HStack>

                    <Field.Root required invalid={!!errors.email}>
                        <Field.Label>Email or Username
                            <Field.RequiredIndicator />
                        </Field.Label>
                        <Input
                            rounded="lg"
                            placeholder="Enter email or username"
                            {...register('email')}
                        />
                        <Field.ErrorText>{errors.email?.message}</Field.ErrorText>
                    </Field.Root>

                    <Field.Root required invalid={!!errors.phone}>
                        <Field.Label>Phone
                            <Field.RequiredIndicator />
                        </Field.Label>
                        <Input
                            rounded="lg"
                            placeholder="Enter phone number"
                            {...register('phone')}
                        />
                        <Field.ErrorText>{errors.phone?.message}</Field.ErrorText>
                    </Field.Root>

                    <Field.Root invalid={!!errors.password}>
                        <Field.Label>Password</Field.Label>
                        <InputGroup
                            endElement={
                                <IconButton
                                    variant="ghost"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeSlash /> : <Eye />}
                                </IconButton>
                            }
                        >
                            <Input
                                rounded="lg"
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter new password (leave blank to keep current)"
                                {...register('password')}
                            />
                        </InputGroup>
                        <Field.HelperText>Leave blank to keep current password</Field.HelperText>
                        <Field.ErrorText>{errors.password?.message}</Field.ErrorText>
                    </Field.Root>
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
                    form={`user-form-${user.id}`}
                >
                    Update & Close
                </Button>
            </HStack>
        </VStack>
    )
}

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
    const [sortField, setSortField] = useState<keyof User>('firstName')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
    const [currentPage, setCurrentPage] = useState(1)
    const pageSize = 10
    const [selectedUsers, setSelectedUsers] = useState<number[]>([])
    const [isActionBarOpen, setIsActionBarOpen] = useState(false)
    const [isBulkEditOpen, setIsBulkEditOpen] = useState(false)
    const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false)

    const { users, addUser, updateUser, deleteUser } = useUsersStore()

    const searchQuery = searchParams.get('search') || ''
    const [dialogState, setDialogState] = useState<{
        isOpen: boolean
        user?: User
        mode: 'add' | 'edit'
    }>({ isOpen: false, mode: 'add' })

    const [deleteDialogState, setDeleteDialogState] = useState<{
        isOpen: boolean
        user?: User
    }>({ isOpen: false })

    // Filter and sort users
    const filteredAndSortedUsers = useMemo(() => {
        let filtered = users.filter(user =>
            user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
            `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
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
    }, [users, searchQuery, sortField, sortOrder])

    // Pagination
    const totalPages = Math.ceil(filteredAndSortedUsers.length / pageSize)
    const paginatedUsers = filteredAndSortedUsers.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    )

    // Selection logic
    const allIdsOnCurrentPage = paginatedUsers.map(user => user.id)
    const allIds = filteredAndSortedUsers.map(user => user.id)

    const isAllSelectedOnPage = paginatedUsers.length > 0 &&
        paginatedUsers.every(user => selectedUsers.includes(user.id))

    const isAllSelected = filteredAndSortedUsers.length > 0 &&
        filteredAndSortedUsers.every(user => selectedUsers.includes(user.id))

    const handleSelectAllOnPage = () => {
        if (isAllSelectedOnPage) {
            setSelectedUsers(prev => prev.filter(id => !allIdsOnCurrentPage.includes(id)))
        } else {
            setSelectedUsers(prev => [...new Set([...prev, ...allIdsOnCurrentPage])])
        }
    }

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

    const handleDeleteUser = (user: User) => {
        setDeleteDialogState({ isOpen: true, user })
    }

    const confirmDelete = () => {
        if (deleteDialogState.user) {
            deleteUser(deleteDialogState.user.id)
            setDeleteDialogState({ isOpen: false })
        }
    }

    // Bulk actions
    const handleBulkDelete = () => {
        setIsBulkDeleteOpen(true)
    }

    const confirmBulkDelete = (ids: number[]) => {
        ids.forEach(id => deleteUser(id))
        setSelectedUsers([])
        setIsActionBarOpen(false)
        setIsBulkDeleteOpen(false)
    }

    const handleBulkEdit = () => {
        setIsBulkEditOpen(true)
    }

    const handleBulkUpdate = (id: number, data: Partial<UserFormData>) => {
        updateUser(id, data)
        setSelectedUsers(prev => prev.filter(userId => userId !== id))
    }

    const handleBulkEditClose = () => {
        setIsBulkEditOpen(false)
        if (selectedUsers.length === 0) {
            setIsActionBarOpen(false)
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
                        <Heading size="3xl">Users Data</Heading>
                        <Badge colorPalette={"accent"}>{users.length}</Badge>
                    </HStack>

                    <HStack gap="4">
                        <Button
                            colorPalette="accent"
                            rounded="xl"
                            onClick={() => setDialogState({ isOpen: true, mode: 'add' })}
                        >
                            <Add />
                            Add User
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
                                        onClick={async () => await copyUsersToClipboard(users)}
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
                                        onClick={() => exportUsersToExcel(users)}
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
                                        onClick={() => exportUsersToCSV(users)}
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
                                        onClick={() => exportUsersToPDF(users)}
                                    >
                                        <ReceiptText />
                                        PDF
                                    </Button>
                                </HStack>

                                {/* Search */}
                                <InputGroup bg="whiteAlpha.600" maxW="300px" colorPalette={"accent"} startElement={<SearchNormal1 />}>
                                    <Input
                                        rounded="xl"
                                        placeholder="Search users..."
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
                                                onClick={() => handleSort('firstName')}
                                            >
                                                Full Name {sortField === 'firstName' && (sortOrder === 'asc' ? '↑' : '↓')}
                                            </Table.ColumnHeader>
                                            <Table.ColumnHeader
                                                fontWeight={"bold"}
                                                cursor="pointer"
                                                onClick={() => handleSort('email')}
                                            >
                                                Email {sortField === 'email' && (sortOrder === 'asc' ? '↑' : '↓')}
                                            </Table.ColumnHeader>
                                            <Table.ColumnHeader
                                                fontWeight={"bold"}
                                                cursor="pointer"
                                                onClick={() => handleSort('phone')}
                                            >
                                                Phone {sortField === 'phone' && (sortOrder === 'asc' ? '↑' : '↓')}
                                            </Table.ColumnHeader>
                                            <Table.ColumnHeader
                                                fontWeight={"bold"}
                                                textAlign="center">
                                                Action
                                            </Table.ColumnHeader>
                                        </Table.Row>
                                    </Table.Header>
                                    <Table.Body>
                                        {paginatedUsers.map((user) => (
                                            <Table.Row key={user.id} bg="whiteAlpha.500">
                                                <Table.Cell>
                                                    <Checkbox.Root
                                                        colorPalette={"accent"}
                                                        checked={selectedUsers.includes(user.id)}
                                                        onCheckedChange={() => handleSelectUser(user.id)}
                                                    >
                                                        <Checkbox.HiddenInput />
                                                        <Checkbox.Control cursor="pointer" rounded="md" />
                                                    </Checkbox.Root>
                                                </Table.Cell>
                                                <Table.Cell>{user.id}</Table.Cell>
                                                <Table.Cell fontWeight="medium">
                                                    {user.firstName} {user.lastName}
                                                </Table.Cell>
                                                <Table.Cell>{user.email}</Table.Cell>
                                                <Table.Cell>{user.phone}</Table.Cell>
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
                                                                            user,
                                                                            mode: 'edit'
                                                                        })}
                                                                    >
                                                                        <Edit /> Edit
                                                                    </Menu.Item>
                                                                    <Menu.Item
                                                                        color="red"
                                                                        value="delete"
                                                                        colorPalette="red"
                                                                        onClick={() => handleDeleteUser(user)}
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
                        setSelectedUsers([]);
                    }
                }}
                closeOnInteractOutside={false}
            >
                <ActionBar.Positioner>
                    <ActionBar.Content rounded="xl" shadow="2xl">
                        <ActionBar.SelectionTrigger>
                            {selectedUsers.length} selected
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
                <UserDialog
                    {...dialogState}
                    onClose={() => setDialogState({ isOpen: false, mode: 'add' })}
                    onSave={(data) => {
                        if (dialogState.mode === 'add') {
                            addUser(data)
                        } else if (dialogState.user) {
                            updateUser(dialogState.user.id, data)
                        }
                        setDialogState({ isOpen: false, mode: 'add' })
                    }}
                />

                {/* Single Delete Confirmation Dialog */}
                <DeleteConfirmationDialog
                    isOpen={deleteDialogState.isOpen}
                    user={deleteDialogState.user}
                    onClose={() => setDeleteDialogState({ isOpen: false })}
                    onConfirm={confirmDelete}
                />

                {/* Bulk Delete Dialog */}
                <BulkDeleteDialog
                    isOpen={isBulkDeleteOpen}
                    selectedUsers={selectedUsers}
                    users={users}
                    onClose={() => setIsBulkDeleteOpen(false)}
                    onConfirm={confirmBulkDelete}
                />

                {/* Bulk Edit Dialog */}
                <BulkEditDialog
                    isOpen={isBulkEditOpen}
                    selectedUsers={selectedUsers}
                    users={users}
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
    user?: User
    onClose: () => void
    onConfirm: () => void
}

const DeleteConfirmationDialog = ({ isOpen, user, onClose, onConfirm }: DeleteConfirmationDialogProps) => {
    return (
        <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content rounded="xl">
                        <Dialog.Header>
                            <Dialog.Title>Delete User</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body>
                            <p>
                                Are you sure you want to delete <strong>{user?.firstName} {user?.lastName}</strong>?
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

// User Form Dialog Component
interface UserDialogProps {
    isOpen: boolean
    user?: User
    mode: 'add' | 'edit'
    onClose: () => void
    onSave: (data: UserFormData) => void
}

const UserDialog = ({ isOpen, user, mode, onClose, onSave }: UserDialogProps) => {
    const [showPassword, setShowPassword] = useState(false)

    const { register, handleSubmit, formState: { errors }, reset } = useForm<UserFormData>({
        resolver: zodResolver(userSchema(mode)),
        defaultValues: {
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
            email: user?.email || '',
            phone: user?.phone || '',
            password: ''
        }
    })

    const onSubmit = (data: UserFormData) => {
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
                    <Dialog.Content rounded="xl">
                        <Dialog.Header>
                            <Dialog.Title>
                                {mode === 'add' ? 'Add User' : 'Update User'}
                            </Dialog.Title>
                        </Dialog.Header>

                        <Dialog.Body>
                            <form noValidate id="user-form" onSubmit={handleSubmit(onSubmit)}>
                                <VStack gap="4" colorPalette={"accent"}>
                                    <HStack gap="4" w="full">
                                        <Field.Root required invalid={!!errors.firstName}>
                                            <Field.Label>First Name
                                                <Field.RequiredIndicator />
                                            </Field.Label>
                                            <Input
                                                rounded="lg"
                                                placeholder="Enter first name"
                                                {...register('firstName')}
                                            />
                                            <Field.ErrorText>{errors.firstName?.message}</Field.ErrorText>
                                        </Field.Root>

                                        <Field.Root required invalid={!!errors.lastName}>
                                            <Field.Label>Last Name
                                                <Field.RequiredIndicator />
                                            </Field.Label>
                                            <Input
                                                rounded="lg"
                                                placeholder="Enter last name"
                                                {...register('lastName')}
                                            />
                                            <Field.ErrorText>{errors.lastName?.message}</Field.ErrorText>
                                        </Field.Root>
                                    </HStack>

                                    <Field.Root required invalid={!!errors.email}>
                                        <Field.Label>Email or Username
                                            <Field.RequiredIndicator />
                                        </Field.Label>
                                        <Input
                                            rounded="lg"
                                            placeholder="Enter email or username"
                                            {...register('email')}
                                        />
                                        <Field.ErrorText>{errors.email?.message}</Field.ErrorText>
                                    </Field.Root>

                                    <Field.Root required invalid={!!errors.phone}>
                                        <Field.Label>Phone
                                            <Field.RequiredIndicator />
                                        </Field.Label>
                                        <Input
                                            rounded="lg"
                                            placeholder="Enter phone number"
                                            {...register('phone')}
                                        />
                                        <Field.ErrorText>{errors.phone?.message}</Field.ErrorText>
                                    </Field.Root>

                                    <Field.Root required={mode === 'add'} invalid={!!errors.password}>
                                        <Field.Label>Password
                                            {mode === 'add' && <Field.RequiredIndicator />}
                                        </Field.Label>
                                        <InputGroup
                                            endElement={
                                                <IconButton
                                                    variant="ghost"
                                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                                    onClick={() => setShowPassword(!showPassword)}
                                                >
                                                    {showPassword ? <EyeSlash /> : <Eye />}
                                                </IconButton>
                                            }
                                        >
                                            <Input
                                                rounded="lg"
                                                type={showPassword ? "text" : "password"}
                                                placeholder={mode === 'add' ? "Enter password" : "Enter new password (leave blank to keep current)"}
                                                {...register('password')}
                                            />
                                        </InputGroup>
                                        {mode === 'edit' && (
                                            <Field.HelperText>Leave blank to keep current password</Field.HelperText>
                                        )}
                                        <Field.ErrorText>{errors.password?.message}</Field.ErrorText>
                                    </Field.Root>
                                </VStack>
                            </form>
                        </Dialog.Body>

                        <Dialog.Footer>
                            <Dialog.ActionTrigger asChild>
                                <Button rounded="xl" variant="outline">Cancel</Button>
                            </Dialog.ActionTrigger>
                            <Button rounded="xl" type="submit" form="user-form" colorPalette="accent">
                                {mode === 'add' ? 'Add User' : 'Update User'}
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