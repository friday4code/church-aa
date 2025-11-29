"use client"

import {
    Dialog,
    Portal,
    CloseButton,
    Button,
    Text,
} from "@chakra-ui/react"

interface DeleteConfirmationDialogProps {
    isOpen: boolean
    isLoading?: boolean
    user?: any
    onClose: () => void
    onConfirm: () => void
}

const DeleteConfirmationDialog = ({ isLoading, isOpen, user, onClose, onConfirm }: DeleteConfirmationDialogProps) => {
    return (
        <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content rounded="xl" maxW={{ base: "sm", sm: "sm", md: "md" }}>
                        <Dialog.Header>
                            <Dialog.Title>Delete User</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body>
                            <Text>
                                Are you sure you want to delete <strong>{user?.firstName} {user?.lastName}</strong>?
                                This action cannot be undone and will permanently remove this user from the system.
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