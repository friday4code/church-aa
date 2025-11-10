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
import type { State } from "../../../stores/states.store"

interface BulkDeleteDialogProps {
    isOpen: boolean
    selectedStates: number[]
    states: State[]
    onClose: () => void
    onConfirm: (ids: number[]) => void
}

const BulkDeleteDialog = ({ isOpen, selectedStates, states, onClose, onConfirm }: BulkDeleteDialogProps) => {
    const selectedStateNames = states
        .filter(state => selectedStates.includes(state.id))
        .map(state => state.stateName)

    const handleConfirm = () => {
        onConfirm(selectedStates)
        onClose()
    }

    return (
        <Dialog.Root role="alertdialog" open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content rounded="xl">
                        <Dialog.Header>
                            <Dialog.Title>Delete Multiple States</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body>
                            <VStack align="stretch" gap="3">
                                <Text>
                                    Are you sure you want to delete <strong>{selectedStates.length} state(s)</strong>?
                                    This action cannot be undone and will permanently remove these states from the system.
                                </Text>

                                {selectedStateNames.length > 0 && (
                                    <Box>
                                        <Text fontWeight="medium" mb="2">States to be deleted:</Text>
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
                                                {selectedStateNames.map((name, index) => (
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
                                Delete {selectedStates.length} State{selectedStates.length > 1 ? 's' : ''}
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