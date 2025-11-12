// components/groups/components/BulkDeleteDialog.tsx
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
import type { Group } from "@/types/groups.type"

interface BulkDeleteDialogProps {
    isOpen: boolean
    selectedGroups: number[]
    groups: Group[]
    onClose: () => void
    onConfirm: (ids: number[]) => void
}

const BulkDeleteDialog = ({ isOpen, selectedGroups, groups, onClose, onConfirm }: BulkDeleteDialogProps) => {
    const selectedGroupNames = groups
        .filter(group => selectedGroups.includes(group.id))
        .map(group => group.group_name)

    const handleConfirm = () => {
        onConfirm(selectedGroups)
        onClose()
    }

    return (
        <Dialog.Root role="alertdialog" open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content rounded="xl">
                        <Dialog.Header>
                            <Dialog.Title>Delete Multiple Groups</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body>
                            <VStack align="stretch" gap="3">
                                <Text>
                                    Are you sure you want to delete <strong>{selectedGroups.length} group(s)</strong>?
                                    This action cannot be undone and will permanently remove these groups from the system.
                                </Text>

                                {selectedGroupNames.length > 0 && (
                                    <Box>
                                        <Text fontWeight="medium" mb="2">Groups to be deleted:</Text>
                                        <Box
                                            maxH="200px"
                                            overflowY="auto"
                                            border="1px"
                                            borderColor="gray.200"
                                            rounded="md"
                                            p="3"
                                            bg="gray.50"
                                        >
                                            <VStack align="start" gap="1">
                                                {selectedGroupNames.map((name, index) => (
                                                    <Text key={index} fontSize="sm">• {name}</Text>
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
                                Delete {selectedGroups.length} Group{selectedGroups.length > 1 ? 's' : ''}
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

export default BulkDeleteDialog;