"use client"

import { Card, Heading, Text, Button, SimpleGrid, VStack, HStack, Spinner } from "@chakra-ui/react"
import { useAttendanceReminder } from "@/modules/admin/hooks/useReminder"
import { useAuth } from "@/hooks/useAuth"
import { toaster } from "@/components/ui/toaster"

const Reminder = () => {
    const state = useAttendanceReminder()
    const region = useAttendanceReminder()
    const district = useAttendanceReminder()
    const group = useAttendanceReminder()
    const oldGroup = useAttendanceReminder()
    const { hasRole } = useAuth()

    const isAllowed = (entityType: 'state' | 'region' | 'district' | 'group' | 'old_group') => {
        if (hasRole('Super Admin')) return true
        if (hasRole('State Admin')) return ['region', 'district', 'group', 'old_group'].includes(entityType)
        if (hasRole('Region Admin')) return ['district', 'group', 'old_group'].includes(entityType)
        if (hasRole('Group Admin')) return ['district'].includes(entityType)
        if (hasRole('District Admin')) return false
        return false
    }

    const guardedSend = (entityType: 'state' | 'region' | 'district' | 'group' | 'old_group', send: () => void) => {
        if (!isAllowed(entityType)) {
            console.warn(`Permission denied: cannot send reminder to ${entityType}`)
            toaster.create({ description: `You do not have permission to send ${entityType} reminders.`, type: 'error', closable: true })
            return
        }
        send()
    }

    const Item = ({ title, helper, onSend, isLoading, disabled }: { title: string; helper: string; onSend: () => void; isLoading: boolean; disabled: boolean }) => (
        <Card.Root bg="bg" border="1px" borderColor={{ base: "gray.200", _dark: "gray.700" }} rounded="xl">
            <Card.Header>
                <VStack align="start" gap="1">
                    <Heading size="md" color={{ base: "gray.900", _dark: "white" }}>{title}</Heading>
                    <Text color={{ base: "gray.600", _dark: "gray.400" }}>{helper}</Text>
                </VStack>
            </Card.Header>
            <Card.Body>
                <HStack>
                    <Button size="sm" onClick={onSend} colorPalette="accent" disabled={isLoading || disabled}>
                        {isLoading ? <Spinner size="sm" /> : "Send Reminder"}
                    </Button>
                </HStack>
            </Card.Body>
        </Card.Root>
    )

    return (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 5 }} gap="4">
            {isAllowed('state') && (
                <Item title="State" helper="Notify state admins" onSend={() => guardedSend('state', () => state.createReminder("state"))} isLoading={state.isCreating} disabled={!isAllowed('state')} />
            )}
            {isAllowed('region') && (
                <Item title="Region" helper="Notify region admins" onSend={() => guardedSend('region', () => region.createReminder("region"))} isLoading={region.isCreating} disabled={!isAllowed('region')} />
            )}
            {isAllowed('district') && (
                <Item title="District" helper="Notify district admins" onSend={() => guardedSend('district', () => district.createReminder("district"))} isLoading={district.isCreating} disabled={!isAllowed('district')} />
            )}
            {isAllowed('group') && (
                <Item title="Group" helper="Notify group admins" onSend={() => guardedSend('group', () => group.createReminder("group"))} isLoading={group.isCreating} disabled={!isAllowed('group')} />
            )}
            {isAllowed('old_group') && (
                <Item title="Old Group" helper="Notify old group admins" onSend={() => guardedSend('old_group', () => oldGroup.createReminder("old_group"))} isLoading={oldGroup.isCreating} disabled={!isAllowed('old_group')} />
            )}
        </SimpleGrid>
    )
}

export default Reminder
