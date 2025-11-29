"use client"

import { useState } from "react"
import { Box, VStack, useDisclosure } from "@chakra-ui/react"
import { useYouthAttendance, useCreateYouthAttendance, useDeleteYouthAttendance } from "@/modules/admin/hooks/useYouthAttendance"
import type { YouthAttendanceFilters } from "@/types/youthAttendance.type"
import { YouthAttendanceHeader } from "./components/YouthAttendanceHeader"
import { YouthAttendanceDialog } from "./components/YouthAttendanceDialog"
import { YouthAttendanceTable } from "./components/YouthAttendanceTable"
import { YouthAttendanceFilter as FilterComponent } from "./components/YouthAttendanceFilters"
import { Toaster, toaster } from "@/components/ui/toaster"

const WeeklyPage: React.FC = () => {
    const { open, onOpen, onClose } = useDisclosure()
    const [filters, setFilters] = useState<YouthAttendanceFilters>({ attendance_type: 'weekly' })
    const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add')

    const { data: attendanceData, isLoading } = useYouthAttendance(filters)
    const createMutation = useCreateYouthAttendance()
    const deleteMutation = useDeleteYouthAttendance()

    const handleAddClick = () => { setDialogMode('add'); onOpen() }
    const handleExportClick = () => { toaster.create({ description: 'Export not implemented', type: 'info' }) }

    const handleSave = async (data: any) => {
        try {
            await createMutation.mutateAsync(data)
            toaster.create({ description: 'Record added successfully', type: 'success' })
            onClose()
        } catch (err) {
            toaster.create({ description: (err as any)?.message || 'Failed to add', type: 'error' })
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this record?')) return
        try {
            await deleteMutation.mutateAsync(id)
            toaster.create({ description: 'Record deleted', type: 'success' })
        } catch (err) {
            toaster.create({ description: (err as any)?.message || 'Failed to delete', type: 'error' })
        }
    }

    return (
        <Box>
            <VStack align="stretch" gap="6">
                <YouthAttendanceHeader onAddClick={handleAddClick} onExportClick={handleExportClick} attendanceType="weekly" showBackButton attendanceData={attendanceData?.data || []} />
                <FilterComponent onFilter={setFilters} attendanceType="weekly" />
                <YouthAttendanceTable data={attendanceData?.data || []} isLoading={isLoading} onDelete={handleDelete} />
            </VStack>
            <Toaster />
            <YouthAttendanceDialog isOpen={open} isLoading={createMutation.isPending} mode={dialogMode} attendanceType="weekly" onClose={onClose} onSave={handleSave} />
        </Box>
    )
}

export default WeeklyPage
