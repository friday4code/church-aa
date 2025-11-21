"use client"

import { Card, Heading, Text, Button, SimpleGrid, VStack, HStack, Spinner } from "@chakra-ui/react"
import { useAttendanceReminder } from "@/modules/admin/hooks/useReminder"

const Reminder = () => {
    const state = useAttendanceReminder()
    const region = useAttendanceReminder()
    const district = useAttendanceReminder()
    const group = useAttendanceReminder()
    const oldGroup = useAttendanceReminder()

    const Item = ({ title, helper, onSend, isLoading }: { title: string; helper: string; onSend: () => void; isLoading: boolean }) => (
        <Card.Root bg="bg" border="1px" borderColor={{ base: "gray.200", _dark: "gray.700" }} rounded="xl">
            <Card.Header>
                <VStack align="start" gap="1">
                    <Heading size="md" color={{ base: "gray.900", _dark: "white" }}>{title}</Heading>
                    <Text color={{ base: "gray.600", _dark: "gray.400" }}>{helper}</Text>
                </VStack>
            </Card.Header>
            <Card.Body>
                <HStack>
                    <Button size="sm" onClick={onSend} colorPalette="accent" disabled={isLoading}>
                        {isLoading ? <Spinner size="sm" /> : "Send Reminder"}
                    </Button>
                </HStack>
            </Card.Body>
        </Card.Root>
    )

    return (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 5 }} gap="4">
            <Item title="State" helper="Notify state admins" onSend={() => state.createReminder("state")} isLoading={state.isCreating} />
            <Item title="Region" helper="Notify region admins" onSend={() => region.createReminder("region")} isLoading={region.isCreating} />
            <Item title="District" helper="Notify district admins" onSend={() => district.createReminder("district")} isLoading={district.isCreating} />
            <Item title="Group" helper="Notify group admins" onSend={() => group.createReminder("group")} isLoading={group.isCreating} />
            <Item title="Old Group" helper="Notify old group admins" onSend={() => oldGroup.createReminder("old_group")} isLoading={oldGroup.isCreating} />
        </SimpleGrid>
    )
}

export default Reminder