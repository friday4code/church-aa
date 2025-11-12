// components/regions/components/BulkDeleteDialog.tsx
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
import type { Region } from "@/types/regions.type"

interface BulkDeleteDialogProps {
    isOpen: boolean
    selectedRegions: number[]
    regions: Region[]
    onClose: () => void
    onConfirm: (ids: number[]) => void
}

const BulkDeleteDialog = ({ isOpen, selectedRegions, regions, onClose, onConfirm }: BulkDeleteDialogProps) => {
    const selectedRegionNames = regions
        .filter(region => selectedRegions.includes(region.id))
        .map(region => `${region.name} (${region.state})`)

    const handleConfirm = () => {
        onConfirm(selectedRegions)
        onClose()
    }

    return (
        <Dialog.Root role="alertdialog" open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content rounded="xl">
                        <Dialog.Header>
                            <Dialog.Title>Delete Multiple Regions</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body>
                            <VStack align="stretch" gap="3">
                                <Text>
                                    Are you sure you want to delete <strong>{selectedRegions.length} region(s)</strong>?
                                    This action cannot be undone and will permanently remove these regions from the system.
                                </Text>

                                {selectedRegionNames.length > 0 && (
                                    <Box>
                                        <Text fontWeight="medium" mb="2">Regions to be deleted:</Text>
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
                                                {selectedRegionNames.map((name, index) => (
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
                                Delete {selectedRegions.length} Region{selectedRegions.length > 1 ? 's' : ''}
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