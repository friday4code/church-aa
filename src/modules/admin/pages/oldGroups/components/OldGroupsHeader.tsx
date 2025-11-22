// components/oldgroups/components/OldGroupsHeader.tsx
"use client"

import { Heading, HStack, Button, Badge, Flex, InputGroup, Input, IconButton, CloseButton } from "@chakra-ui/react"
import { Add, SearchNormal1, ArrowLeft3 } from "iconsax-reactjs"
import UploadOldGroupsFromFile from "../../../components/PortingFile"
import type { OldGroup } from "@/types/oldGroups.type"

interface OldGroupsHeaderProps {
    oldGroups: OldGroup[]
    onAddGroup: () => void
    onSearch: (value: string) => void
}

import { useState, useCallback } from "react"

const OldGroupsHeader = ({ oldGroups, onAddGroup, onSearch }: OldGroupsHeaderProps) => {
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
                <Heading size="3xl">All Old Groups</Heading>
                <Badge colorPalette={"accent"}>{oldGroups?.length}</Badge>
            </HStack>

            <HStack gap="4">
                <UploadOldGroupsFromFile data={oldGroups} />
                <InputGroup maxW="300px" colorPalette={"accent"} startElement={<SearchNormal1 />} endElement={search ? <CloseButton size="xs" onClick={clearSearch} /> : undefined}>
                    <Input
                        bg="bg"
                        rounded="xl"
                        placeholder="Search old groups..."
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
                    Add Old Group
                </Button>
            </HStack>
        </Flex>
    )
}

export default OldGroupsHeader;