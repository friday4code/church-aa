// components/regions/components/BulkEditDialog.tsx
"use client"

import {
    Dialog,
    Portal,
    CloseButton,
    Button,
    Tabs,
} from "@chakra-ui/react"
import { useEffect, useState } from "react"
import type { RegionFormData } from "../../../schemas/region.schema"
import RegionEditForm from "./RegionEditForm"
import type { Region } from "@/types/regions.type"

interface BulkEditDialogProps {
    isLoading: boolean
    isOpen: boolean
    selectedRegions: number[]
    regions: Region[]
    onClose: () => void
    onUpdate: (id: number, data: Partial<RegionFormData>) => void
}

// UUID generator function
const uuid = () => {
    return Math.random().toString(36).substring(2, 15)
}

const BulkEditDialog = ({ isOpen, selectedRegions, regions, onClose, onUpdate }: BulkEditDialogProps) => {
    const [tabs, setTabs] = useState<Array<{ id: string; region: Region; title: string }>>([])
    const [selectedTab, setSelectedTab] = useState<string | null>(null)

    // Initialize tabs when dialog opens
    useEffect(() => {
        if (isOpen && selectedRegions.length > 0) {
            const initialTabs = selectedRegions.map(regionId => {
                const region = regions.find(r => r.id === regionId)
                return {
                    id: uuid(),
                    region: region!,
                    title: region?.name || 'Region'
                }
            })
            setTabs(initialTabs)
            setSelectedTab(initialTabs[0]?.id || null)
        }
    }, [isOpen, selectedRegions, regions])

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

    const handleTabUpdate = (tabId: string, data: Partial<RegionFormData>) => {
        const tab = tabs.find(t => t.id === tabId)
        if (tab) {
            onUpdate(tab.region.id, data)
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
                            <Dialog.Title>Bulk Edit Regions</Dialog.Title>
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
                                            <RegionEditForm
                                                region={tab.region}
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