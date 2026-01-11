"use client"

import {
    Dialog,
    Portal,
    CloseButton,
    Button,
} from "@chakra-ui/react"
import type { Attendance } from "@/types/attendance.type"
import { useDistricts } from "@/modules/admin/hooks/useDistrict"

interface DeleteConfirmationDialogProps {
    isOpen: boolean
    attendance?: Attendance
    onClose: () => void
    onConfirm: () => void
    serviceName: string
}

const DeleteConfirmationDialog = ({ isOpen, attendance, onClose, onConfirm, serviceName }: DeleteConfirmationDialogProps) => {
    const {districts} = useDistricts();
    const district = districts.find(x => x.id === attendance?.district_id);
    return (
        <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content maxW={{ base: "sm", md: "md", lg: "3xl" }} rounded="xl">
                        <Dialog.Header>
                            <Dialog.Title>Delete {serviceName} Attendance Record</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body>
                            <p>
                                Are you sure you want to delete the attendance record for <strong>{district?.name} - {attendance?.month} Week {attendance?.week}</strong>?
                                This action cannot be undone.
                            </p>
                        </Dialog.Body>
                        <Dialog.Footer>
                            <Dialog.ActionTrigger asChild>
                                <Button variant="outline" rounded="xl">Cancel</Button>
                            </Dialog.ActionTrigger>
                            <Button colorPalette="red" rounded="xl" onClick={onConfirm}>
                                Delete
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

export default DeleteConfirmationDialog