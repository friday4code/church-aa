// components/districts/components/BulkDeleteDialog.tsx
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
import type { District } from "@/types/districts.type"

interface BulkDeleteDialogProps {
    isOpen: boolean
    selectedDistricts: number[]
    districts: District[]
    onClose: () => void
    onConfirm: (ids: number[]) => void
}

const BulkDeleteDialog = ({ isOpen, selectedDistricts, districts, onClose, onConfirm }: BulkDeleteDialogProps) => {
    const selectedDistrictNames = districts
        .filter(district => selectedDistricts.includes(district.id))
        .map(district => district.name)

    const handleConfirm = () => {
        onConfirm(selectedDistricts)
        onClose()
    }

    return (
        <Dialog.Root role="alertdialog" open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content rounded="xl">
                        <Dialog.Header>
                            <Dialog.Title>Delete Multiple Districts</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body>
                            <VStack align="stretch" gap="3">
                                <Text>
                                    Are you sure you want to delete <strong>{selectedDistricts.length} district(s)</strong>?
                                    This action cannot be undone and will permanently remove these districts from the system.
                                </Text>

                                {selectedDistrictNames.length > 0 && (
                                    <Box>
                                        <Text fontWeight="medium" mb="2">Districts to be deleted:</Text>
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
                                                {selectedDistrictNames.map((name, index) => (
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
                                Delete {selectedDistricts.length} District{selectedDistricts.length > 1 ? 's' : ''}
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