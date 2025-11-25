// components/oldgroups/components/OldGroupsTable.tsx
"use client"

import { Table, Checkbox, IconButton, Menu, Portal, ButtonGroup, Pagination } from "@chakra-ui/react"
import { memo, useMemo, useCallback } from "react"
import { More, Edit, Trash, ArrowLeft3, ArrowRight3 } from "iconsax-reactjs"
import TableLoading from "./OldGroupsTableLoading"
import type { OldGroup } from "@/types/oldGroups.type"
import { useAuth } from "@/hooks/useAuth"

interface OldGroupsTableProps {
    paginatedGroups: OldGroup[]
    selectedGroups: number[]
    sortField: keyof OldGroup
    sortOrder: 'asc' | 'desc'
    currentPage: number
    totalPages: number
    isLoading?: boolean
    isAllSelectedOnPage: boolean
    onSort: (field: keyof OldGroup) => void
    onSelectAllOnPage: () => void
    onSelectGroup: (groupId: number) => void
    onEditGroup: (group: OldGroup) => void
    onDeleteGroup: (group: OldGroup) => void
    onPageChange: (page: number) => void
}

const OldGroupsTable = ({
    isLoading,
    paginatedGroups,
    selectedGroups,
    sortField,
    sortOrder,
    currentPage,
    totalPages,
    isAllSelectedOnPage,
    onSort,
    onSelectAllOnPage,
    onSelectGroup,
    onEditGroup,
    onDeleteGroup,
    onPageChange,
}: OldGroupsTableProps) => {
    const { hasRole } = useAuth()
    const isSuperAdmin = hasRole('Super Admin')
    const handleSelect = useCallback((id: number) => onSelectGroup(id), [onSelectGroup])
    const handleEdit = useCallback((g: OldGroup) => onEditGroup(g), [onEditGroup])
    const handleDelete = useCallback((g: OldGroup) => onDeleteGroup(g), [onDeleteGroup])

    const Row = memo(({ group, index }: { group: OldGroup; index: number }) => (
        <Table.Row key={group.id}>
            {isSuperAdmin && (
                <Table.Cell>
                    <Checkbox.Root colorPalette={"accent"} checked={selectedGroups.includes(group.id)} onCheckedChange={() => handleSelect(group.id)}>
                        <Checkbox.HiddenInput />
                        <Checkbox.Control cursor="pointer" rounded="md" />
                    </Checkbox.Root>
                </Table.Cell>
            )}
            <Table.Cell>{index + 1}</Table.Cell>
            <Table.Cell fontWeight="medium">{group.name}</Table.Cell>
            <Table.Cell>{group.code}</Table.Cell>
            <Table.Cell>{group.leader}</Table.Cell>
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
        paginatedGroups.map((group, index) => (
            <Row key={group.id} group={group} index={index} />
        ))
    ), [paginatedGroups, selectedGroups, handleSelect, handleEdit, handleDelete])
    return (
        <>
            {/* Table */}
            <Table.ScrollArea borderWidth="1px" maxW="full" w="full" rounded="xl">
                <Table.Root size="sm">
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
                                Group Name {sortField === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </Table.ColumnHeader>
                            <Table.ColumnHeader
                                fontWeight={"bold"}
                                cursor="pointer"
                                onClick={() => onSort('code')}
                            >
                                Group Code {sortField === 'code' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </Table.ColumnHeader>
                            <Table.ColumnHeader
                                fontWeight={"bold"}
                                cursor="pointer"
                                onClick={() => onSort('leader')}
                            >
                                Group Leader {sortField === 'leader' && (sortOrder === 'asc' ? '↑' : '↓')}
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

export default OldGroupsTable;
