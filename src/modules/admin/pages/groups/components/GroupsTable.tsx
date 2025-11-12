// components/groups/components/GroupsTable.tsx
"use client"

import {
    Table,
    Checkbox,
    IconButton,
    Menu,
    Portal,
    ButtonGroup,
    Pagination,
} from "@chakra-ui/react"
import { More, Edit, Trash, ArrowLeft3, ArrowRight3 } from "iconsax-reactjs"
import TableLoading from "./GroupsTableLoading"
import type { Group } from "@/types/groups.type"

interface GroupsTableProps {
    paginatedGroups: Group[]
    selectedGroups: number[]
    sortField: keyof Group
    sortOrder: 'asc' | 'desc'
    currentPage: number
    totalPages: number
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
    totalPages,
    isAllSelectedOnPage,
    onSort,
    onSelectAllOnPage,
    onSelectGroup,
    onEditGroup,
    onDeleteGroup,
    onPageChange,
}: GroupsTableProps) => {
    if (isLoading) {
        return <TableLoading />;
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
                                onClick={() => onSort('group_name')}
                            >
                                Group Name {sortField === 'group_name' && (sortOrder === 'asc' ? '↑' : '↓')}
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
                                onClick={() => onSort('access_level')}
                            >
                                Access Level {sortField === 'access_level' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </Table.ColumnHeader>
                            <Table.ColumnHeader
                                fontWeight={"bold"}
                                textAlign="center">
                                Action
                            </Table.ColumnHeader>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {paginatedGroups.map((group, index) => (
                            <Table.Row key={group.id}>
                                <Table.Cell>
                                    <Checkbox.Root
                                        colorPalette={"accent"}
                                        checked={selectedGroups.includes(group.id)}
                                        onCheckedChange={() => onSelectGroup(group.id)}
                                    >
                                        <Checkbox.HiddenInput />
                                        <Checkbox.Control cursor="pointer" rounded="md" />
                                    </Checkbox.Root>
                                </Table.Cell>
                                <Table.Cell>{index + 1}</Table.Cell>
                                <Table.Cell fontWeight="medium">{group.group_name}</Table.Cell>
                                <Table.Cell>{group.leader}</Table.Cell>
                                <Table.Cell>
                                    <span style={{
                                        textTransform: 'capitalize',
                                        padding: '4px 8px',
                                        borderRadius: '6px',
                                        fontSize: '12px',
                                        fontWeight: '500',
                                        backgroundColor: getAccessLevelColor(group.access_level),
                                        color: 'white'
                                    }}>
                                        {group.access_level.replace('-', ' ')}
                                    </span>
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
                                                        onClick={() => onEditGroup(group)}
                                                    >
                                                        <Edit /> Edit
                                                    </Menu.Item>
                                                    <Menu.Item
                                                        color="red"
                                                        value="delete"
                                                        colorPalette="red"
                                                        onClick={() => onDeleteGroup(group)}
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

// Helper function to get color for access level badges
const getAccessLevelColor = (accessLevel: string): string => {
    const colors: { [key: string]: string } = {
        'state-admin': '#3182CE',
        'region-admin': '#38A169',
        'district-admin': '#D69E2E',
        'group-admin': '#805AD5',
        'user': '#718096'
    };
    return colors[accessLevel] || '#718096';
}

export default GroupsTable;