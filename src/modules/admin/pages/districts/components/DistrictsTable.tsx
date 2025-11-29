// components/districts/components/DistrictsTable.tsx
"use client"

import { Table, Checkbox, IconButton, Menu, Portal, ButtonGroup, Pagination } from "@chakra-ui/react"
import { memo, useMemo, useCallback } from "react"
import { More, Edit, Trash, ArrowLeft3, ArrowRight3 } from "iconsax-reactjs"
import type { District } from "@/types/districts.type"
import { useAuth } from "@/hooks/useAuth"

interface DistrictsTableProps {
    paginatedDistricts: District[]
    selectedDistricts: number[]
    sortField: keyof District
    sortOrder: 'asc' | 'desc'
    currentPage: number
    totalPages: number
    isLoading?: boolean
    isAllSelectedOnPage: boolean
    onSort: (field: keyof District) => void
    onSelectAllOnPage: () => void
    onSelectDistrict: (districtId: number) => void
    onEditDistrict: (district: District) => void
    onDeleteDistrict: (district: District) => void
    onPageChange: (page: number) => void
}

const DistrictsTable = ({
    paginatedDistricts,
    selectedDistricts,
    sortField,
    sortOrder,
    currentPage,
    totalPages,
    isAllSelectedOnPage,
    onSort,
    onSelectAllOnPage,
    onSelectDistrict,
    onEditDistrict,
    onDeleteDistrict,
    onPageChange,
}: DistrictsTableProps) => {
    const { hasRole } = useAuth()
    const isSuperAdmin = hasRole('Super Admin')
    const handleSelect = useCallback((id: number) => onSelectDistrict(id), [onSelectDistrict])
    const handleEdit = useCallback((d: District) => onEditDistrict(d), [onEditDistrict])
    const handleDelete = useCallback((d: District) => onDeleteDistrict(d), [onDeleteDistrict])

    const Row = memo(({ district, index }: { district: District; index: number }) => (
        <Table.Row key={district.id}>
            {isSuperAdmin && (
                <Table.Cell>
                    <Checkbox.Root colorPalette={"accent"} checked={selectedDistricts.includes(district.id)} onCheckedChange={() => handleSelect(district.id)}>
                        <Checkbox.HiddenInput />
                        <Checkbox.Control cursor="pointer" rounded="md" />
                    </Checkbox.Root>
                </Table.Cell>
            )}
            <Table.Cell>{index + 1}</Table.Cell>
            <Table.Cell fontWeight="medium">{district.group}</Table.Cell>
            <Table.Cell fontWeight="medium">{district.name}</Table.Cell>
            <Table.Cell>{district.leader}</Table.Cell>
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
                                    <Menu.Item value="edit" onClick={() => handleEdit(district)}>
                                        <Edit /> Edit
                                    </Menu.Item>
                                    <Menu.Item color="red" value="delete" colorPalette="red" onClick={() => handleDelete(district)}>
                                        <Trash /> Delete
                                    </Menu.Item>
                                </Menu.Content>
                            </Menu.Positioner>
                        </Portal>
                    </Menu.Root>
                </Table.Cell>
            )}
        </Table.Row>
    ), (a, b) => a.district === b.district && a.index === b.index)

    const rows = useMemo(() => (
        paginatedDistricts.map((district, index) => (
            <Row key={district.id} district={district} index={index} />
        ))
    ), [paginatedDistricts, selectedDistricts, handleSelect, handleEdit, handleDelete])

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
                                Group Name {sortField === 'group' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </Table.ColumnHeader>
                            <Table.ColumnHeader
                                fontWeight={"bold"}
                                cursor="pointer"
                                onClick={() => onSort('name')}
                            >
                                District Name {sortField === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </Table.ColumnHeader>
                            <Table.ColumnHeader
                                fontWeight={"bold"}
                                cursor="pointer"
                                onClick={() => onSort('leader')}
                            >
                                District Leader {sortField === 'leader' && (sortOrder === 'asc' ? '↑' : '↓')}
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
                        {rows}
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

export default DistrictsTable;
