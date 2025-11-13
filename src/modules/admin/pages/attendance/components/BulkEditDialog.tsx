"use client"

import {
    Dialog,
    Portal,
    CloseButton,
    Button,
    Tabs,
} from "@chakra-ui/react"
import { useEffect, useState } from "react"
import type { AttendanceFormData } from "../../../schemas/attendance.schema"
import AttendanceEditForm from "./AttendanceEditForm"
import type { Attendance } from "@/types/attendance.type"
import { useDistricts } from "../../../hooks/useDistrict"

interface BulkEditDialogProps {
    isOpen: boolean
    selectedAttendances: number[]
    attendances: Attendance[]
    onClose: () => void
    onUpdate: (id: number, data: Partial<AttendanceFormData>) => void
    serviceName: string
}

// UUID generator function
const uuid = () => {
    return Math.random().toString(36).substring(2, 15)
}

const BulkEditDialog = ({ isOpen, selectedAttendances, attendances, onClose, onUpdate, serviceName }: BulkEditDialogProps) => {
    const [tabs, setTabs] = useState<Array<{ id: string; attendance: Attendance; title: string }>>([])
    const [selectedTab, setSelectedTab] = useState<string | null>(null)

    const { districts = [] } = useDistricts()

    useEffect(() => {
        if (isOpen && selectedAttendances.length > 0) {
            const initialTabs = selectedAttendances
                .map(attendanceId => {
                    const attendance = attendances.find(a => a.id === attendanceId)
                    if (!attendance) return null

                    const districtName = districts.find(d => d.id === attendance.district_id)?.name || `District ${attendance.district_id}`

                    return {
                        id: uuid(),
                        attendance,
                        title: `${districtName} - ${attendance.month}`
                    }
                })
                .filter(Boolean) as Array<{ id: string; attendance: Attendance; title: string }>

            setTabs(initialTabs)
            setSelectedTab(initialTabs[0]?.id || null)
        }
    }, [isOpen, selectedAttendances, attendances, districts])

    const removeTab = (id: string) => {
        if (tabs.length > 1) {
            const newTabs = tabs.filter(tab => tab.id !== id)
            setTabs(newTabs)

            if (selectedTab === id) {
                setSelectedTab(newTabs[0]?.id || null)
            }
        } else {
            onClose()
        }
    }

    const handleTabUpdate = (tabId: string, data: Partial<AttendanceFormData>) => {
        const tab = tabs.find(t => t.id === tabId)
        if (tab) {
            onUpdate(tab.attendance.id, data)
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
                            <Dialog.Title>Update {serviceName} Attendance</Dialog.Title>
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
                                            <AttendanceEditForm
                                                attendance={tab.attendance}
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

export default BulkEditDialog