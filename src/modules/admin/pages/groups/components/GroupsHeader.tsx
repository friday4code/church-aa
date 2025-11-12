// components/groups/components/GroupsHeader.tsx
"use client"

import {
    Heading,
    HStack,
    Button,
    Badge,
    Flex,
    InputGroup,
    Input,
} from "@chakra-ui/react"
import { Add, SearchNormal1 } from "iconsax-reactjs"
import type { Group } from "@/types/groups.type"
import UploadGroupsFromFile from "./PortingFile"

interface GroupsHeaderProps {
    groups: Group[]
    onAddGroup: () => void
    onSearch: (value: string) => void
}

const GroupsHeader = ({ groups, onAddGroup, onSearch }: GroupsHeaderProps) => {
    return (
        <Flex
            justify="space-between"
            align="center"
            pos="sticky"
            top={6}
            zIndex={"sticky"}
        >
            <HStack>
                <Heading size="3xl">All Groups</Heading>
                <Badge colorPalette={"accent"}>{groups?.length}</Badge>
            </HStack>

            <HStack gap="4">
                <UploadGroupsFromFile data={groups} />
                <InputGroup maxW="300px" colorPalette={"accent"} startElement={<SearchNormal1 />}>
                    <Input
                        bg="bg"
                        rounded="xl"
                        placeholder="Search groups..."
                        onChange={(e) => onSearch(e.target.value)}
                    />
                </InputGroup>
                <Button
                    colorPalette="accent"
                    rounded="xl"
                    onClick={onAddGroup}
                >
                    <Add />
                    Add Group
                </Button>
            </HStack>
        </Flex>
    )
}

export default GroupsHeader;