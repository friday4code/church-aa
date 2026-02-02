"use client"

import {
    Table,
    Checkbox,
    IconButton,
    Menu,
    Portal,
    ButtonGroup,
    Pagination,
    Badge,
} from "@chakra-ui/react"
import { memo, useMemo, useCallback } from "react"
import { More, Edit, Trash, ArrowLeft3, ArrowRight3 } from "iconsax-reactjs"
import UsersTableLoading from "./UsersTableLoading"
import type { User } from "@/types/users.type"
import { useAuth } from "@/hooks/useAuth"
import { Tooltip } from "@/components/ui/tooltip"

type MinimalUser = { id: number; name: string; email: string; phone: string | null; roles?: string[] }

//Add totalUsers to UsersTableProps interface for proper pagination
interface UsersTableProps {
    paginatedUsers: MinimalUser[]
    selectedUsers: number[]
    sortField: string
    sortOrder: 'asc' | 'desc'
    currentPage: number
    totalUsers: number
    pageSize: number
    isLoading?: boolean
    isAllSelectedOnPage: boolean
    onSort: (field: keyof User) => void
    onSelectAllOnPage: () => void
    onSelectUser: (userId: number) => void
    onEditUser: (user: MinimalUser) => void
    onDeleteUser: (user: MinimalUser) => void
    onPageChange: (page: number) => void
}

interface UserRowProps {
    user: { id: number; name: string; email: string; phone: string | null; roles?: string[] }
    index: number
    selected: boolean
    onSelect: (id: number) => void
    onEdit: (user: { id: number; name: string; email: string; phone: string | null; roles?: string[] }) => void
    onDelete: (user: { id: number; name: string; email: string; phone: string | null; roles?: string[] }) => void
}

const UserRow = memo(({ user, index, selected, onSelect, onEdit, onDelete }: UserRowProps) => {
    const { hasRole } = useAuth()
    const isSuperAdmin = hasRole('Super Admin')
    return (
        <Table.Row key={user.id}>
            <Table.Cell>
                {isSuperAdmin ? (
                    <Checkbox.Root
                        colorPalette={"accent"}
                        checked={selected}
                        onCheckedChange={() => onSelect(user.id)}
                    >
                        <Checkbox.HiddenInput />
                        <Checkbox.Control cursor="pointer" rounded="md" />
                    </Checkbox.Root>
                ) : (
                    <Tooltip positioning={{ placement: 'top' }} content="View-only mode: selection disabled">
                        <Checkbox.Root colorPalette={"accent"} disabled checked={false}>
                            <Checkbox.HiddenInput />
                            <Checkbox.Control rounded="md" />
                        </Checkbox.Root>
                    </Tooltip>
                )}
            </Table.Cell>
            <Table.Cell>{index + 1}</Table.Cell>
            <Table.Cell fontWeight="medium">
                {user.name}
            </Table.Cell>
            <Table.Cell>{user.email}</Table.Cell>
            <Table.Cell>{user.phone}</Table.Cell>
            <Table.Cell>
                {(user.roles || []).map((role, idx) => (
                    <Badge key={idx} colorPalette="blue" variant="subtle" mr="1">
                        {role}
                    </Badge>
                ))}
            </Table.Cell>
            <Table.Cell textAlign="center">
                {isSuperAdmin ? (
                    <Menu.Root>
                        <Menu.Trigger asChild>
                            <IconButton rounded="xl" variant="ghost" size="sm">
                                <More />
                            </IconButton>
                        </Menu.Trigger>
                        <Portal>
                            <Menu.Positioner>
                                <Menu.Content rounded="lg">
                                    <Menu.Item value="edit" onClick={() => onEdit(user)}>
                                        <Edit /> Edit
                                    </Menu.Item>
                                    <Menu.Item color="red" value="delete" colorPalette="red" onClick={() => onDelete(user)}>
                                        <Trash /> Delete
                                    </Menu.Item>
                                </Menu.Content>
                            </Menu.Positioner>
                        </Portal>
                    </Menu.Root>
                ) : (
                    <Tooltip positioning={{ placement: 'top' }} content="View-only mode: actions disabled">
                        <IconButton rounded="xl" variant="ghost" size="sm" disabled>
                            <More />
                        </IconButton>
                    </Tooltip>
                )}
            </Table.Cell>
        </Table.Row>
    )
}, (prev, next) => {
    return prev.user === next.user && prev.selected === next.selected && prev.index === next.index
})

const UsersTable = ({
    isLoading,
    paginatedUsers,
    selectedUsers,
    sortField,
    sortOrder,
    currentPage,
    totalUsers,
    pageSize,
    isAllSelectedOnPage,
    onSort,
    onSelectAllOnPage,
    onSelectUser,
    onEditUser,
    onDeleteUser,
    onPageChange,
}: UsersTableProps) => {
    const { hasRole } = useAuth()
    const isSuperAdmin = hasRole('Super Admin')
    const handleSelect = useCallback((id: number) => onSelectUser(id), [onSelectUser])
    const handleEdit = useCallback((u: MinimalUser) => onEditUser(u), [onEditUser])
    const handleDelete = useCallback((u: MinimalUser) => onDeleteUser(u), [onDeleteUser])

    const rowItems = useMemo(() => (
        paginatedUsers.map((user, index) => (
            <UserRow
                key={user.id}
                user={user}
                index={(currentPage - 1) * pageSize + index}
                selected={selectedUsers.includes(user.id)}
                onSelect={handleSelect}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />
        ))
    ), [paginatedUsers, selectedUsers, handleSelect, handleEdit, handleDelete])

    return (
        <>
            {/* Table */}
            <Table.ScrollArea borderWidth="1px" maxW="calc(100vw - 18rem)" h="calc(100vh - 5rem)" w="full" rounded="xl">
                <Table.Root size="sm" stickyHeader>
                    <Table.Header>
                        <Table.Row fontSize={"md"}>
                            <Table.ColumnHeader w="50px">
                                {isSuperAdmin ? (
                                    <Checkbox.Root
                                        colorPalette={"accent"}
                                        checked={isAllSelectedOnPage}
                                        onCheckedChange={onSelectAllOnPage}
                                    >
                                        <Checkbox.HiddenInput />
                                        <Checkbox.Control rounded="md" cursor={"pointer"} />
                                    </Checkbox.Root>
                                ) : (
                                    <Tooltip positioning={{ placement: 'top' }} content="View-only mode: selection disabled">
                                        <Checkbox.Root colorPalette={"accent"} disabled checked={false}>
                                            <Checkbox.HiddenInput />
                                            <Checkbox.Control rounded="md" />
                                        </Checkbox.Root>
                                    </Tooltip>
                                )}
                            </Table.ColumnHeader>
                            <Table.ColumnHeader>S/N</Table.ColumnHeader>
                            <Table.ColumnHeader
                                fontWeight={"bold"}
                                cursor="pointer"
                                onClick={() => onSort('name')}
                            >
                                Full Name {sortField === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </Table.ColumnHeader>
                            <Table.ColumnHeader
                                fontWeight={"bold"}
                                cursor="pointer"
                                onClick={() => onSort('email')}
                            >
                                Email {sortField === 'email' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </Table.ColumnHeader>
                            <Table.ColumnHeader
                                fontWeight={"bold"}
                                cursor="pointer"
                                onClick={() => onSort('phone')}
                            >
                                Phone {sortField === 'phone' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </Table.ColumnHeader>
                            <Table.ColumnHeader
                                fontWeight={"bold"}
                                cursor="pointer"
                                onClick={() => onSort('roles')}
                            >
                                Roles {sortField === 'roles' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </Table.ColumnHeader>
                            <Table.ColumnHeader
                                fontWeight={"bold"}
                                textAlign="center">
                                Action
                            </Table.ColumnHeader>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {isLoading ? <UsersTableLoading /> : rowItems}
                    </Table.Body>
                </Table.Root>
            </Table.ScrollArea>

            {/* Pagination */}
            {totalUsers > pageSize && (
                <Pagination.Root
                    colorPalette={"accent"}
                    count={totalUsers}
                    pageSize={pageSize}
                    page={currentPage}
                    onPageChange={(d) => onPageChange(d.page)}
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
        </>
    )
}

export default UsersTable;