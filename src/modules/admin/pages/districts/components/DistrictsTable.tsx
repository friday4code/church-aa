// components/districts/components/DistrictsTable.tsx
"use client"

import { Table, Checkbox, IconButton, Menu, Portal, ButtonGroup, Pagination } from "@chakra-ui/react"
import { memo, useCallback } from "react"
import { More, Edit, Trash, ArrowLeft3, ArrowRight3 } from "iconsax-reactjs"
import type { District } from "@/types/districts.type"
import { useAuth } from "@/hooks/useAuth"

interface DistrictsTableProps {
    paginatedDistricts: District[]
    selectedDistricts: number[]
    sortField: keyof District
    sortOrder: 'asc' | 'desc'
    currentPage: number
    totalDistricts: number
    pageSize: number
    isLoading?: boolean
    isAllSelectedOnPage: boolean
    onSort: (field: keyof District) => void
    onSelectAllOnPage: () => void
    onSelectDistrict: (districtId: number) => void
    onEditDistrict: (district: District) => void
    onDeleteDistrict: (district: District) => void
    onPageChange: (page: number) => void
}

const Row = memo(({
    district,
    index,
    currentPage,
    totalDistricts,
    pageSize,
    isSuperAdmin,
    isSelected,
    onSelect,
    onEdit,
    onDelete
}: {
    district: District
    index: number
    currentPage: number
    totalDistricts: number
    pageSize: number
    isSuperAdmin: boolean
    isSelected: boolean
    onSelect: (id: number) => void
    onEdit: (d: District) => void
    onDelete: (d: District) => void
}) => (
    <Table.Row>
        {isSuperAdmin && (
            <Table.Cell>
                <Checkbox.Root
                    colorPalette={"accent"}
                    checked={isSelected}
                    onCheckedChange={() => onSelect(district.id)}
                >
                    <Checkbox.HiddenInput />
                    <Checkbox.Control cursor="pointer" rounded="md" />
                </Checkbox.Root>
            </Table.Cell>
        )}
        <Table.Cell>{(currentPage - 1) * pageSize + index + 1}</Table.Cell>
        <Table.Cell>{district.id}</Table.Cell>
        <Table.Cell fontWeight="medium">{district.group}</Table.Cell>
        <Table.Cell fontWeight="medium">{district.name}</Table.Cell>
        <Table.Cell>{district.leader}</Table.Cell>
        <Table.Cell>{district.leader_email}</Table.Cell>
        <Table.Cell>{district.leader_phone}</Table.Cell>
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
                                <Menu.Item value="edit" onClick={() => onEdit(district)}>
                                    <Edit /> Edit
                                </Menu.Item>
                                <Menu.Item color="red" value="delete" colorPalette="red" onClick={() => onDelete(district)}>
                                    <Trash /> Delete
                                </Menu.Item>
                            </Menu.Content>
                        </Menu.Positioner>
                    </Portal>
                </Menu.Root>
            </Table.Cell>
        )}
    </Table.Row>
), (prev, next) => (
    prev.district === next.district &&
    prev.index === next.index &&
    prev.currentPage === next.currentPage &&
    prev.totalDistricts === next.totalDistricts &&
    prev.pageSize === next.pageSize &&
    prev.isSuperAdmin === next.isSuperAdmin &&
    prev.isSelected === next.isSelected
))

const DistrictsTable = ({
    paginatedDistricts,
    selectedDistricts,
    sortField,
    sortOrder,
    currentPage,
    totalDistricts,
    pageSize,
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

    return (
        <>
            {/* Table */}
            <Table.ScrollArea borderWidth="1px" maxW="calc(100vw - 18rem)" h="calc(100vh - 5rem)" w="full" rounded="xl">
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
                            <Table.ColumnHeader
                                fontWeight={"bold"}
                                cursor="pointer"
                                onClick={() => onSort('leader_email' as keyof District)}
                            >
                                Leader Email {sortField === 'leader_email' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </Table.ColumnHeader>
                            <Table.ColumnHeader
                                fontWeight={"bold"}
                                cursor="pointer"
                                onClick={() => onSort('leader_phone' as keyof District)}
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
                        {paginatedDistricts.map((district, index) => (
                            <Row
                                key={district.id}
                                district={district}
                                index={index}
                                currentPage={currentPage}
                                totalDistricts={totalDistricts}
                                pageSize={pageSize}
                                isSuperAdmin={isSuperAdmin}
                                isSelected={selectedDistricts.includes(district.id)}
                                onSelect={handleSelect}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        ))}
                    </Table.Body>
                </Table.Root>
            </Table.ScrollArea>

            {/* Pagination */}
            {totalDistricts > pageSize && (
                <Pagination.Root
                    colorPalette={"accent"}
                    count={totalDistricts}
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

export default DistrictsTable;
