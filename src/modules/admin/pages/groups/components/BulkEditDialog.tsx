// components/groups/components/BulkEditDialog.tsx
"use client"

import {
    Dialog,
    Portal,
    CloseButton,
    Button,
    Tabs,
} from "@chakra-ui/react"
import { useEffect, useState } from "react"
import type { GroupFormData } from "../../../schemas/group.schema"
import GroupEditForm from "./GroupEditForm"
import type { Group } from "@/types/groups.type"

interface BulkEditDialogProps {
    isLoading: boolean
    isOpen: boolean
    selectedGroups: number[]
    groups: Group[]
    onClose: () => void
    onUpdate: (id: number, data: Partial<GroupFormData>) => void
}

// UUID generator function
const uuid = () => {
    return Math.random().toString(36).substring(2, 15)
}

const BulkEditDialog = ({ isOpen, selectedGroups, groups, onClose, onUpdate }: BulkEditDialogProps) => {
    const [tabs, setTabs] = useState<Array<{ id: string; group: Group; title: string }>>([])
    const [selectedTab, setSelectedTab] = useState<string | null>(null)

    // Initialize tabs when dialog opens
    useEffect(() => {
        if (isOpen && selectedGroups.length > 0) {
            const initialTabs = selectedGroups.map(groupId => {
                const group = groups.find(g => g.id === groupId)
                return {
                    id: uuid(),
                    group: group!,
                    title: group?.name || 'Group'
                }
            })
            setTabs(initialTabs)
            setSelectedTab(initialTabs[0]?.id || null)
        }
    }, [isOpen, selectedGroups, groups])

    const removeTab = (id: string) => {
        if (tabs.length > 1) {
            const newTabs = tabs.filter(tab => tab.id !== id)
            setTabs(newTabs)

            // If the removed tab was selected, select the first tab
            if (selectedTab === id) {
                setSelectedTab(newTabs[0]?.id || null)
            }
        } else {
            // If it's the last tab, close the dialog
            onClose()
        }
    }

    const handleTabUpdate = (tabId: string, data: Partial<GroupFormData>) => {
        const tab = tabs.find(t => t.id === tabId)
        if (tab) {
            onUpdate(tab.group.id, data)
            // Remove the tab after successful update
            removeTab(tabId)
        }
    }

    return (
        <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content rounded="xl" maxW="4xl" w="full">
                        <Dialog.Header>
                            <Dialog.Title>Bulk Edit Groups</Dialog.Title>
                        </Dialog.Header>

                        <Dialog.Body>
                            <Tabs.Root
                                value={selectedTab}
                                variant="outline"
                                size="sm"
                                onValueChange={(e) => setSelectedTab(e.value)}
                            >
                                <Tabs.List flex="1 1 auto" overflowX="auto">
                                    {tabs.map((tab) => (
                                        <Tabs.Trigger value={tab.id} key={tab.id}>
                                            {tab.title}{" "}
                                            <CloseButton
                                                as="span"
                                                role="button"
                                                size="2xs"
                                                me="-2"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    removeTab(tab.id)
                                                }}
                                            />
                                        </Tabs.Trigger>
                                    ))}
                                </Tabs.List>

                                <Tabs.ContentGroup>
                                    {tabs.map((tab) => (
                                        <Tabs.Content value={tab.id} key={tab.id}>
                                            <GroupEditForm
                                                group={tab.group}
                                                onUpdate={(data) => handleTabUpdate(tab.id, data)}
                                                onCancel={() => removeTab(tab.id)}
                                            />
                                        </Tabs.Content>
                                    ))}
                                </Tabs.ContentGroup>
                            </Tabs.Root>
                        </Dialog.Body>

                        <Dialog.Footer>
                            <Dialog.ActionTrigger asChild>
                                <Button variant="outline" rounded="xl">Close</Button>
                            </Dialog.ActionTrigger>
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

export default BulkEditDialog;