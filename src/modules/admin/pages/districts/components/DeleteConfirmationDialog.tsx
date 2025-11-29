// components/districts/components/DeleteConfirmationDialog.tsx
"use client"

import type { District } from "@/types/districts.type";
import {
    Dialog,
    Portal,
    CloseButton,
    Button,
    Text,
} from "@chakra-ui/react";

interface DeleteConfirmationDialogProps {
    isOpen: boolean
    isLoading?: boolean
    district?: District
    onClose: () => void
    onConfirm: () => void
}

const DeleteConfirmationDialog = ({ isLoading, isOpen, district, onClose, onConfirm }: DeleteConfirmationDialogProps) => {
    return (
        <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content maxW={{ base: "sm", md: "md", lg: "3xl" }} rounded="xl">
                        <Dialog.Header>
                            <Dialog.Title>Delete District</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body>
                            <Text>
                                Are you sure you want to delete <strong>{district?.name}</strong>?
                                This action cannot be undone and will permanently remove this district from the system.
                            </Text>
                        </Dialog.Body>
                        <Dialog.Footer>
                            <Dialog.ActionTrigger asChild>
                                <Button variant="outline" rounded="xl">Cancel</Button>
                            </Dialog.ActionTrigger>
                            <Button
                                colorPalette="red"
                                rounded="xl"
                                onClick={onConfirm}
                                loading={isLoading}
                                disabled={isLoading}
                            >
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

export default DeleteConfirmationDialog;