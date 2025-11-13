"use client"

import {
    Dialog,
    Portal,
    CloseButton,
    Button,
    VStack,
    Text,
    Box,
} from "@chakra-ui/react"
import { useDistricts } from "@/modules/admin/hooks/useDistrict"
import type { Attendance } from "@/types/attendance.type"

interface BulkDeleteDialogProps {
    isOpen: boolean
    selectedAttendances: number[]
    attendances: Attendance[]
    onClose: () => void
    onConfirm: (ids: number[]) => void
    serviceName: string
}

const BulkDeleteDialog = ({ isOpen, selectedAttendances, attendances, onClose, onConfirm, serviceName }: BulkDeleteDialogProps) => {
      const { districts = [] } = useDistricts()
        
        const getDistrictName = (districtId: number): string => {
            const district = districts.find(d => d.id === districtId)
            return district?.name || `District ${districtId}`
        }
    
    
    const selectedAttendanceDetails = attendances
        .filter(attendance => selectedAttendances.includes(attendance.id))
        .map(attendance => `${getDistrictName(attendance.district_id)} - ${attendance.month} Week ${attendance.week}`)

    const handleConfirm = () => {
        onConfirm(selectedAttendances)
        onClose()
    }

    return (
        <Dialog.Root role="alertdialog" open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content rounded="xl">
                        <Dialog.Header>
                            <Dialog.Title>Delete Multiple {serviceName} Attendance Records</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body>
                            <VStack align="stretch" gap="3">
                                <Text>
                                    Are you sure you want to delete <strong>{selectedAttendances.length} attendance record(s)</strong>?
                                    This action cannot be undone.
                                </Text>

                                {selectedAttendanceDetails.length > 0 && (
                                    <Box>
                                        <Text fontWeight="medium" mb="2">Records to be deleted:</Text>
                                        <Box
                                            maxH="200px"
                                            overflowY="auto"
                                            border="1px"
                                            borderColor="gray.200"
                                            rounded="md"
                                            p="3"
                                        >
                                            <VStack align="start" gap="1">
                                                {selectedAttendanceDetails.map((detail, index) => (
                                                    <Text key={index} fontSize="sm">• {detail}</Text>
                                                ))}
                                            </VStack>
                                        </Box>
                                    </Box>
                                )}
                            </VStack>
                        </Dialog.Body>
                        <Dialog.Footer>
                            <Dialog.ActionTrigger asChild>
                                <Button variant="outline" rounded="xl">Cancel</Button>
                            </Dialog.ActionTrigger>
                            <Button colorPalette="red" rounded="xl" onClick={handleConfirm}>
                                Delete {selectedAttendances.length} Record{selectedAttendances.length > 1 ? 's' : ''}
                            </Button>
                        </Dialog.Footer>
                        <Dialog.CloseTrigger asChild>
                            <CloseButton size="sm" />
                        </Dialog.CloseTrigger>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    )
}

export default BulkDeleteDialog