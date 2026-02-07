// components/groups/components/GroupsTable.tsx
"use client"

import { Table, Checkbox, IconButton, Menu, Portal, ButtonGroup, Pagination } from "@chakra-ui/react"
import { memo, useMemo, useCallback } from "react"
import { More, Edit, Trash, ArrowLeft3, ArrowRight3 } from "iconsax-reactjs"
import TableLoading from "./GroupsTableLoading"
import type { Group } from "@/types/groups.type"
import { useAuth } from "@/hooks/useAuth"

interface GroupsTableProps {
    paginatedGroups: Group[]
    selectedGroups: number[]
    sortField: keyof Group
    sortOrder: 'asc' | 'desc'
    currentPage: number
    totalGroups: number
    pageSize?: number
    isLoading?: boolean
    isAllSelectedOnPage: boolean
    onSort: (field: keyof Group) => void
    onSelectAllOnPage: () => void
    onSelectGroup: (groupId: number) => void
    onEditGroup: (group: Group) => void
    onDeleteGroup: (group: Group) => void
    onPageChange: (page: number) => void
}

const GroupsTable = ({
    isLoading,
    paginatedGroups,
    selectedGroups,
    sortField,
    sortOrder,
    currentPage,
    totalGroups,
    pageSize = 50,
    isAllSelectedOnPage,
    onSort,
    onSelectAllOnPage,
    onSelectGroup,
    onEditGroup,
    onDeleteGroup,
    onPageChange,
}: GroupsTableProps) => {
    const { hasRole } = useAuth()
    const isSuperAdmin = hasRole('Super Admin')
    const handleSelect = useCallback((id: number) => onSelectGroup(id), [onSelectGroup])
    const handleEdit = useCallback((g: Group) => onEditGroup(g), [onEditGroup])
    const handleDelete = useCallback((g: Group) => onDeleteGroup(g), [onDeleteGroup])

    const Row = memo(({ group, index, currentPage, pageSize }: { group: Group; index: number; currentPage: number; pageSize: number }) => (
        <Table.Row key={group.id}>
            {isSuperAdmin && (
                <Table.Cell>
                    <Checkbox.Root colorPalette={"accent"} checked={selectedGroups.includes(group.id)} onCheckedChange={() => handleSelect(group.id)}>
                        <Checkbox.HiddenInput />
                        <Checkbox.Control cursor="pointer" rounded="md" />
                    </Checkbox.Root>
                </Table.Cell>
            )}
            <Table.Cell>{(currentPage - 1) * pageSize + index + 1}</Table.Cell>
            <Table.Cell>{group.id}</Table.Cell>
            <Table.Cell>{group.old_group || '-'}</Table.Cell>
            <Table.Cell fontWeight="medium">{group.name}</Table.Cell>
            <Table.Cell>{group.leader || '-'}</Table.Cell>
            <Table.Cell>{group.leader_email || '-'}</Table.Cell>
            <Table.Cell>{group.leader_phone || '-'}</Table.Cell>
            {isSuperAdmin && (
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
                                    <Menu.Item value="edit" onClick={() => handleEdit(group)}>
                                        <Edit /> Edit
                                    </Menu.Item>
                                    <Menu.Item color="red" value="delete" colorPalette="red" onClick={() => handleDelete(group)}>
                                        <Trash /> Delete
                                    </Menu.Item>
                                </Menu.Content>
                            </Menu.Positioner>
                        </Portal>
                    </Menu.Root>
                </Table.Cell>
            )}
        </Table.Row>
    ), (a, b) => a.group === b.group && a.index === b.index)

    const rows = useMemo(() => (
        paginatedGroups?.map((group, index) => (
            <Row key={group.id} group={group} index={index} currentPage={currentPage} pageSize={pageSize} />
        ))
    ), [paginatedGroups, selectedGroups, handleSelect, handleEdit, handleDelete, currentPage, pageSize])

    return (
        <>
            {/* Table */}
            <Table.ScrollArea borderWidth="1px" maxW={{ base: "full", lg: "calc(100vw - 18rem)" }} h="calc(100vh - 5rem)" w="full" rounded="xl">
                <Table.Root size="sm" stickyHeader>
                    <Table.Header>
                        <Table.Row fontSize={"md"}>
                            {isSuperAdmin && (
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
                            )}
                            <Table.ColumnHeader fontWeight="bold">S/N</Table.ColumnHeader>
                            <Table.ColumnHeader
                                fontWeight="bold"
                                cursor="pointer"
                                onClick={() => onSort('id')}
                            >
                                ID {sortField === 'id' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </Table.ColumnHeader>
                            <Table.ColumnHeader
                                fontWeight={"bold"}
                                cursor="pointer"
                                onClick={() => onSort('old_group')}
                            >
                                Old Group Name {sortField === 'old_group' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </Table.ColumnHeader>
                            <Table.ColumnHeader
                                fontWeight={"bold"}
                                cursor="pointer"
                                onClick={() => onSort('name')}
                            >
                                Group Name {sortField === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </Table.ColumnHeader>
                            <Table.ColumnHeader
                                fontWeight={"bold"}
                                cursor="pointer"
                                onClick={() => onSort('leader')}
                            >
                                Group Leader {sortField === 'leader' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </Table.ColumnHeader>
                            <Table.ColumnHeader
                                fontWeight={"bold"}
                                cursor="pointer"
                                onClick={() => onSort('leader_email' as keyof Group)}
                            >
                                Leader Email {sortField === 'leader_email' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </Table.ColumnHeader>
                            <Table.ColumnHeader
                                fontWeight={"bold"}
                                cursor="pointer"
                                onClick={() => onSort('leader_phone' as keyof Group)}
                            >
                                Leader Phone {sortField === 'leader_phone' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </Table.ColumnHeader>
                            {isSuperAdmin && (
                                <Table.ColumnHeader
                                    fontWeight={"bold"}
                                    textAlign="center">
                                    Action
                                </Table.ColumnHeader>
                            )}
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {isLoading ? <TableLoading /> : rows}
                    </Table.Body>
                </Table.Root>
            </Table.ScrollArea>

            {/* Pagination */}
            {totalGroups > pageSize && (
                <Pagination.Root
                    colorPalette={"accent"}
                    count={totalGroups}
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


export default GroupsTable;
