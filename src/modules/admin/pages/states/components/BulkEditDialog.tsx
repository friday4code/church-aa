"use client"

import {
    Dialog,
    Portal,
    CloseButton,
    Button,
    Tabs,
} from "@chakra-ui/react"
import { useEffect, useState } from "react"
import type { StateFormData } from "../../../schemas/states.schemas"
import StateEditForm from "./StateEditForm"
import type { State } from "@/types/states.type"

interface BulkEditDialogProps {
    isLoading: boolean
    isOpen: boolean
    selectedStates: number[]
    states: State[]
    onClose: () => void
    onUpdate: (id: number, data: Partial<StateFormData>) => void
}

// UUID generator function
const uuid = () => {
    return Math.random().toString(36).substring(2, 15)
}

const BulkEditDialog = ({ isLoading, isOpen, selectedStates, states, onClose, onUpdate }: BulkEditDialogProps) => {
    const [tabs, setTabs] = useState<Array<{ id: string; state: State; title: string }>>([])
    const [selectedTab, setSelectedTab] = useState<string | null>(null)

    // Initialize tabs when dialog opens
    useEffect(() => {
        if (isOpen && selectedStates.length > 0) {
            const initialTabs = selectedStates.map(stateId => {
                const state = states.find(s => s.id === stateId)
                return {
                    id: uuid(),
                    state: state!,
                    title: state?.name || 'State'
                }
            })
            setTabs(initialTabs)
            setSelectedTab(initialTabs[0]?.id || null)
        }
    }, [isOpen, selectedStates, states])

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

    const handleTabUpdate = (tabId: string, data: Partial<StateFormData>) => {
        const tab = tabs.find(t => t.id === tabId)
        if (tab) {
            onUpdate(tab.state.id, data)
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
                            <Dialog.Title>Bulk Edit States</Dialog.Title>
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
                                            <StateEditForm
                                                state={tab.state}
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