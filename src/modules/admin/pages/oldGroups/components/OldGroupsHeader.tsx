// components/oldgroups/components/OldGroupsHeader.tsx
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
import UploadOldGroupsFromFile from "../../../components/PortingFile"
import type { OldGroup } from "@/types/oldGroups.type"

interface OldGroupsHeaderProps {
    oldGroups: OldGroup[]
    onAddGroup: () => void
    onSearch: (value: string) => void
}

const OldGroupsHeader = ({ oldGroups, onAddGroup, onSearch }: OldGroupsHeaderProps) => {

    return (
        <Flex
            justify="space-between"
            align="center"
            pos="sticky"
            top={6}
            zIndex={"sticky"}
        >
            <HStack>
                <Heading size="3xl">All Old Groups</Heading>
                <Badge colorPalette={"accent"}>{oldGroups?.length}</Badge>
            </HStack>

            <HStack gap="4">
                <UploadOldGroupsFromFile data={oldGroups} />
                <InputGroup maxW="300px" colorPalette={"accent"} startElement={<SearchNormal1 />}>
                    <Input
                        bg="bg"
                        rounded="xl"
                        placeholder="Search old groups..."
                        onChange={(e) => onSearch(e.target.value)}
                    />
                </InputGroup>
                <Button
                    colorPalette="accent"
                    rounded="xl"
                    onClick={onAddGroup}
                >
                    <Add />
                    Add Old Group
                </Button>
            </HStack>
        </Flex>
    )
}

export default OldGroupsHeader;