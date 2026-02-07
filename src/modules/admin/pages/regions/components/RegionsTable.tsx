// components/regions/components/RegionsTable.tsx
"use client"

import { Table, Checkbox, IconButton, Menu, Portal, ButtonGroup, Pagination } from "@chakra-ui/react"
import { memo, useMemo, useCallback } from "react"
import { More, Edit, Trash, ArrowLeft3, ArrowRight3 } from "iconsax-reactjs"
import type { Region } from "@/types/regions.type"
import { useAuth } from "@/hooks/useAuth"

interface RegionsTableProps {
    paginatedRegions: Region[]
    selectedRegions: number[]
    sortField: keyof Region
    sortOrder: 'asc' | 'desc'
    currentPage: number
    pageSize: number
    totalRegions: number
    isLoading?: boolean
    isAllSelectedOnPage: boolean
    onSort: (field: keyof Region) => void
    onSelectAllOnPage: () => void
    onSelectRegion: (regionId: number) => void
    onEditRegion: (region: Region) => void
    onDeleteRegion: (region: Region) => void
    onPageChange: (page: number) => void
}

const RegionsTable = ({
    pageSize,
    paginatedRegions,
    selectedRegions,
    sortField,
    sortOrder,
    currentPage,
    totalRegions,
    isAllSelectedOnPage,
    onSort,
    onSelectAllOnPage,
    onSelectRegion,
    onEditRegion,
    onDeleteRegion,
    onPageChange,
}: RegionsTableProps) => {
    const { hasRole } = useAuth()
    const isSuperAdmin = hasRole('Super Admin')
    const handleSelect = useCallback((id: number) => onSelectRegion(id), [onSelectRegion])
    const handleEdit = useCallback((r: Region) => onEditRegion(r), [onEditRegion])
    const handleDelete = useCallback((r: Region) => onDeleteRegion(r), [onDeleteRegion])

    const Row = memo(({ region, index, currentPage, pageSize }: { region: Region; index: number; currentPage: number; pageSize: number }) => (
        <Table.Row key={region.id}>
            {isSuperAdmin && (
                <Table.Cell>
                    <Checkbox.Root colorPalette={"accent"} checked={selectedRegions.includes(region.id)} onCheckedChange={() => handleSelect(region.id)}>
                        <Checkbox.HiddenInput />
                        <Checkbox.Control cursor="pointer" rounded="md" />
                    </Checkbox.Root>
                </Table.Cell>
            )}
            <Table.Cell>{(currentPage - 1) * pageSize + index + 1}</Table.Cell>
            <Table.Cell>{region.id}</Table.Cell>
            <Table.Cell fontWeight="medium">{region.name}</Table.Cell>
            <Table.Cell>{region.state}</Table.Cell>
            <Table.Cell>{region.code}</Table.Cell>
            <Table.Cell>{region.leader}</Table.Cell>
            <Table.Cell>{region.leader_email}</Table.Cell>
            <Table.Cell>{region.leader_phone}</Table.Cell>
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
                                    <Menu.Item value="edit" onClick={() => handleEdit(region)}>
                                        <Edit /> Edit
                                    </Menu.Item>
                                    <Menu.Item color="red" value="delete" colorPalette="red" onClick={() => handleDelete(region)}>
                                        <Trash /> Delete
                                    </Menu.Item>
                                </Menu.Content>
                            </Menu.Positioner>
                        </Portal>
                    </Menu.Root>
                </Table.Cell>
            )}
        </Table.Row>
    ), (a, b) => a.region === b.region && a.index === b.index)

    const rows = useMemo(() => (
        paginatedRegions.map((region, index) => (
            <Row key={region.id} currentPage={currentPage} pageSize={pageSize} region={region} index={index} />
        ))
    ), [paginatedRegions, selectedRegions, handleSelect, handleEdit, handleDelete])
    return (
        <>
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
                                onClick={() => onSort('id')}
                            >
                                ID {sortField === 'id' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </Table.ColumnHeader>
                            <Table.ColumnHeader
                                fontWeight={"bold"}
                                cursor="pointer"
                                onClick={() => onSort('name')}
                            >
                                Region Name {sortField === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </Table.ColumnHeader>
                            <Table.ColumnHeader
                                fontWeight={"bold"}
                                cursor="pointer"
                                onClick={() => onSort('state')}
                            >
                                State {sortField === 'state' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </Table.ColumnHeader>
                            <Table.ColumnHeader
                                fontWeight={"bold"}
                                cursor="pointer"
                                onClick={() => onSort('code')}
                            >
                                Region Code {sortField === 'code' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </Table.ColumnHeader>
                            <Table.ColumnHeader
                                fontWeight={"bold"}
                                cursor="pointer"
                                onClick={() => onSort('leader')}
                            >
                                Region Leader {sortField === 'leader' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </Table.ColumnHeader>
                            <Table.ColumnHeader
                                fontWeight={"bold"}
                                cursor="pointer"
                                onClick={() => onSort('leader_email' as keyof Region)}
                            >
                                Leader Email {sortField === 'leader_email' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </Table.ColumnHeader>
                            <Table.ColumnHeader
                                fontWeight={"bold"}
                                cursor="pointer"
                                onClick={() => onSort('leader_phone' as keyof Region)}
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
                        {rows}
                    </Table.Body>
                </Table.Root>
            </Table.ScrollArea>

            {/* Pagination */}
            {totalRegions > pageSize && (
                <Pagination.Root
                    colorPalette={"accent"}
                    count={totalRegions}
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

export default RegionsTable;
