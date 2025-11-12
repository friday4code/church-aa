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
import { More, Edit, Trash, ArrowLeft3, ArrowRight3 } from "iconsax-reactjs"
import UsersTableLoading from "./UsersTableLoading"
import type { User } from "@/types/users.type"

interface UsersTableProps {
    paginatedUsers: any[]
    selectedUsers: number[]
    sortField: string
    sortOrder: 'asc' | 'desc'
    currentPage: number
    totalPages: number
    isLoading?: boolean
    isAllSelectedOnPage: boolean
    onSort: (field: keyof User) => void
    onSelectAllOnPage: () => void
    onSelectUser: (userId: number) => void
    onEditUser: (user: any) => void
    onDeleteUser: (user: any) => void
    onPageChange: (page: number) => void
}

const UsersTable = ({
    isLoading,
    paginatedUsers,
    selectedUsers,
    sortField,
    sortOrder,
    currentPage,
    totalPages,
    isAllSelectedOnPage,
    onSort,
    onSelectAllOnPage,
    onSelectUser,
    onEditUser,
    onDeleteUser,
    onPageChange,
}: UsersTableProps) => {
    if (isLoading) {
        return <UsersTableLoading />;
    }

    return (
        <>
            {/* Table */}
            <Table.ScrollArea borderWidth="1px" maxW="full" w="full" rounded="xl">
                <Table.Root size="sm">
                    <Table.Header>
                        <Table.Row fontSize={"md"}>
                            <Table.ColumnHeader w="50px">
                                <Checkbox.Root
                                    colorPalette={"accent"}
                                    checked={isAllSelectedOnPage}
                                    onCheckedChange={onSelectAllOnPage}
                                >
                                    <Checkbox.HiddenInput />
                                    <Checkbox.Control rounded="md" cursor={"pointer"} />
                                </Checkbox.Root>
                            </Table.ColumnHeader>
                            <Table.ColumnHeader
                                fontWeight={"bold"}
                                cursor="pointer"
                                onClick={() => onSort('id')}
                            >
                                S/N {sortField === 'id' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </Table.ColumnHeader>
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
                    <Table.Body >
                        {paginatedUsers.map((user, index) => (
                            <Table.Row key={user.id} >
                                <Table.Cell>
                                    <Checkbox.Root
                                        colorPalette={"accent"}
                                        checked={selectedUsers.includes(user.id)}
                                        onCheckedChange={() => onSelectUser(user.id)}
                                    >
                                        <Checkbox.HiddenInput />
                                        <Checkbox.Control cursor="pointer" rounded="md" />
                                    </Checkbox.Root>
                                </Table.Cell>
                                <Table.Cell>{index + 1}</Table.Cell>
                                <Table.Cell fontWeight="medium">
                                    {user.name}
                                </Table.Cell>
                                <Table.Cell>{user.email}</Table.Cell>
                                <Table.Cell>{user.phone}</Table.Cell>
                                <Table.Cell>
                                    {user.roles?.map((role: string, idx: number) => (
                                        <Badge key={idx} colorPalette="blue" variant="subtle" mr="1">
                                            {role}
                                        </Badge>
                                    ))}
                                </Table.Cell>
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
                                                        onClick={() => onEditUser(user)}
                                                    >
                                                        <Edit /> Edit
                                                    </Menu.Item>
                                                    <Menu.Item
                                                        color="red"
                                                        value="delete"
                                                        colorPalette="red"
                                                        onClick={() => onDeleteUser(user)}
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