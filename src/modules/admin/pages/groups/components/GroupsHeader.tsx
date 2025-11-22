// components/groups/components/GroupsHeader.tsx
"use client"

import { Heading, HStack, Button, Badge, Flex, InputGroup, Input, IconButton, CloseButton } from "@chakra-ui/react"
import { Add, SearchNormal1, ArrowLeft3 } from "iconsax-reactjs"
import type { Group } from "@/types/groups.type"
import UploadGroupsFromFile from "./PortingFile"

interface GroupsHeaderProps {
    groups: Group[]
    onAddGroup: () => void
    onSearch: (value: string) => void
}

import { useState, useCallback } from "react"

const GroupsHeader = ({ groups, onAddGroup, onSearch }: GroupsHeaderProps) => {
    const [search, setSearch] = useState("")
    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value)
        onSearch(e.target.value)
    }, [onSearch])
    const clearSearch = useCallback(() => {
        setSearch("")
        onSearch("")
    }, [onSearch])
    return (
        <Flex
            justify="space-between"
            align="center"
            pos="sticky"
            top={6}
            zIndex={"sticky"}
        >
            <HStack>
                <IconButton aria-label="Go back" variant="outline" rounded="xl" onClick={() => window.history.back()}>
                    <ArrowLeft3 />
                </IconButton>
                <Heading size="3xl">All Groups</Heading>
                <Badge colorPalette={"accent"}>{groups?.length}</Badge>
            </HStack>

            <HStack gap="4">
                <UploadGroupsFromFile data={groups} />
                <InputGroup maxW="300px" colorPalette={"accent"} startElement={<SearchNormal1 />} endElement={search ? <CloseButton size="xs" onClick={clearSearch} /> : undefined}>
                    <Input
                        bg="bg"
                        rounded="xl"
                        placeholder="Search groups..."
                        value={search}
                        onChange={handleChange}
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