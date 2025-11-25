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
import TableLoading from "./StatesTableLoading"
import type { State } from "@/types/states.type"
import { useAuth } from "@/hooks/useAuth"

interface StatesTableProps {
    paginatedStates: State[]
    selectedStates: number[]
    sortField: keyof State
    sortOrder: 'asc' | 'desc'
    currentPage: number
    totalPages: number
    isLoading?: boolean
    isAllSelectedOnPage: boolean
    onSort: (field: keyof State) => void
    onSelectAllOnPage: () => void
    onSelectState: (stateId: number) => void
    onEditState: (state: State) => void
    onDeleteState: (state: State) => void
    onPageChange: (page: number) => void
}

const StatesTable = ({
    isLoading,
    paginatedStates,
    selectedStates,
    sortField,
    sortOrder,
    currentPage,
    totalPages,
    isAllSelectedOnPage,
    onSort,
    onSelectAllOnPage,
    onSelectState,
    onEditState,
    onDeleteState,
    onPageChange,
}: StatesTableProps) => {
    const { hasRole } = useAuth()
    const isSuperAdmin = hasRole('Super Admin')
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
                                State Name {sortField === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </Table.ColumnHeader>
                            <Table.ColumnHeader
                                fontWeight={"bold"}
                                cursor="pointer"
                                onClick={() => onSort('code')}
                            >
                                State Code {sortField === 'code' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </Table.ColumnHeader>
                            <Table.ColumnHeader
                                fontWeight={"bold"}
                                cursor="pointer"
                                onClick={() => onSort('leader')}
                            >
                                State Leader {sortField === 'leader' && (sortOrder === 'asc' ? '↑' : '↓')}
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
                    <Table.Body >
                        {paginatedStates.map((state, index) => (
                            <Table.Row key={state.id} >
                                {isSuperAdmin && (
                                    <Table.Cell>
                                        <Checkbox.Root
                                            colorPalette={"accent"}
                                            checked={selectedStates.includes(state.id)}
                                            onCheckedChange={() => onSelectState(state.id)}
                                        >
                                            <Checkbox.HiddenInput />
                                            <Checkbox.Control cursor="pointer" rounded="md" />
                                        </Checkbox.Root>
                                    </Table.Cell>
                                )}
                                <Table.Cell>{index + 1}</Table.Cell>
                                <Table.Cell fontWeight="medium">{state.name}</Table.Cell>
                                <Table.Cell>{state.code}</Table.Cell>
                                <Table.Cell>{state.leader}</Table.Cell>
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
                                                        <Menu.Item
                                                            value="edit"
                                                            onClick={() => onEditState(state)}
                                                        >
                                                            <Edit /> Edit
                                                        </Menu.Item>
                                                        <Menu.Item
                                                            color="red"
                                                            value="delete"
                                                            colorPalette="red"
                                                            onClick={() => onDeleteState(state)}
                                                        >
                                                            <Trash /> Delete
                                                        </Menu.Item>
                                                    </Menu.Content>
                                                </Menu.Positioner>
                                            </Portal>
                                        </Menu.Root>
                                    </Table.Cell>
                                )}
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

export default StatesTable;
