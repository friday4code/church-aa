// components/YouthAttendanceTable.tsx
"use client"

import {
    Table,
    HStack,
    IconButton,
    Skeleton,
    Text,
    VStack,
} from "@chakra-ui/react"
import { Edit, Trash } from "iconsax-reactjs"
import type { YouthAttendance } from "@/types/youthAttendance.type"
import { useGroups } from "@/modules/admin/hooks/useGroup"
import { useDistricts } from "@/modules/admin/hooks/useDistrict"

interface YouthAttendanceTableProps {
    data: YouthAttendance[]
    isLoading?: boolean
    onEdit?: (record: YouthAttendance) => void
    onDelete?: (id: number) => void
}

export const YouthAttendanceTable = ({ data, isLoading, onEdit, onDelete }: YouthAttendanceTableProps) => {
    const { groups } = useGroups()
    const { districts } = useDistricts()

    const getGroupName = (groupId: number) => {
        const group = groups?.find(g => g.id === groupId)
        return group?.name || `Group ${groupId}`
    }

    const getDistrictName = (districtId: number) => {
        const district = districts?.find(d => d.id === districtId)
        return district?.name || `District ${districtId}`
    }

    if (isLoading) {
        return (
            <VStack gap="2">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} height="40px" w="full" />
                ))}
            </VStack>
        )
    }

    if (!data || data.length === 0) {
        return (
            <VStack py="20" justify="center" gap="2">
                <Text color="gray.600">No records found</Text>
            </VStack>
        )
    }

    return (
        <Table.Root size="sm" striped>
            <Table.Header>
                <Table.Row>
                    <Table.ColumnHeader>Group</Table.ColumnHeader>
                    <Table.ColumnHeader>District</Table.ColumnHeader>
                    <Table.ColumnHeader>Date</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="right">Male</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="right">Female</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="right">Members</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="right">Visitors</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="center">Actions</Table.ColumnHeader>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {data.map((record) => (
                    <Table.Row key={record.id}>
                        <Table.Cell fontWeight="medium">{getGroupName(record.group_id)}</Table.Cell>
                        <Table.Cell fontSize="sm">{getDistrictName(record.district_id)}</Table.Cell>
                        <Table.Cell fontSize="sm">{record.month} {record.year}{record.week ? ` (Week ${record.week})` : ''}</Table.Cell>
                        <Table.Cell textAlign="right">{record.male}</Table.Cell>
                        <Table.Cell textAlign="right">{record.female}</Table.Cell>
                        <Table.Cell textAlign="right">{record.member_boys + record.member_girls}</Table.Cell>
                        <Table.Cell textAlign="right">{record.visitor_boys + record.visitor_girls}</Table.Cell>
                        <Table.Cell>
                            <HStack justify="center" gap="1">
                                <IconButton
                                    size="sm"
                                    variant="ghost"
                                    colorPalette="blue"
                                    onClick={() => onEdit?.(record)}
                                    aria-label="Edit"
                                >
                                    <Edit size={18} />
                                </IconButton>
                                <IconButton
                                    size="sm"
                                    variant="ghost"
                                    colorPalette="red"
                                    onClick={() => onDelete?.(record.id)}
                                    aria-label="Delete"
                                >
                                    <Trash size={18} />
                                </IconButton>
                            </HStack>
                        </Table.Cell>
                    </Table.Row>
                ))}
            </Table.Body>
        </Table.Root>
    )
}
