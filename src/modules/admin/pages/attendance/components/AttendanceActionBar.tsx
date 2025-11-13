"use client"

import {
    ActionBar,
    Button,
    CloseButton,
} from "@chakra-ui/react"
import { Edit, Trash } from "iconsax-reactjs"

interface AttendanceActionBarProps {
    isOpen: boolean
    selectedCount: number
    isAllSelected: boolean
    onOpenChange: (open: boolean) => void
    onSelectAll: () => void
    onBulkEdit: () => void
    onBulkDelete: () => void
    onClose: () => void
}

const AttendanceActionBar = ({
    isOpen,
    selectedCount,
    isAllSelected,
    onOpenChange,
    onSelectAll,
    onBulkEdit,
    onBulkDelete,
    onClose
}: AttendanceActionBarProps) => {
    return (
        <ActionBar.Root
            open={isOpen}
            onOpenChange={(s) => {
                onOpenChange(s.open)
                if (!s.open) onClose();
            }}
            closeOnInteractOutside={false}
        >
            <ActionBar.Positioner>
                <ActionBar.Content rounded="xl" shadow="2xl">
                    <ActionBar.SelectionTrigger>
                        {selectedCount} selected
                    </ActionBar.SelectionTrigger>
                    <ActionBar.Separator />
                    <Button
                        rounded="xl"
                        variant="outline"
                        size="sm"
                        onClick={onSelectAll}
                    >
                        {isAllSelected ? 'Deselect All' : 'Select All'}
                    </Button>
                    <Button
                        variant="outline"
                        rounded="xl"
                        size="sm"
                        onClick={onBulkEdit}
                    >
                        <Edit />
                        Edit
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        rounded="xl"
                        colorPalette="red"
                        onClick={onBulkDelete}
                    >
                        <Trash />
                        Delete
                    </Button>
                    <ActionBar.CloseTrigger asChild>
                        <CloseButton size="sm" rounded="xl" />
                    </ActionBar.CloseTrigger>
                </ActionBar.Content>
            </ActionBar.Positioner>
        </ActionBar.Root>
    )
}

export default AttendanceActionBar