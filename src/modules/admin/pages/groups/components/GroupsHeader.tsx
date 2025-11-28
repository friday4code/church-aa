// components/groups/components/GroupsHeader.tsx
"use client"

import { Heading, HStack, Button, Badge, Flex, InputGroup, Input, IconButton, CloseButton, VStack } from "@chakra-ui/react"
import { Add, SearchNormal1, ArrowLeft3 } from "iconsax-reactjs"
import type { Group } from "@/types/groups.type"
import UploadGroupsFromFile from "./PortingFile"
import { useAuth } from "@/hooks/useAuth"
import { useNavigate } from "react-router"

interface GroupsHeaderProps {
    groups: Group[]
    onAddGroup: () => void
    onSearch: (value: string) => void
}

import { useState, useCallback } from "react"

const GroupsHeader = ({ groups, onAddGroup, onSearch }: GroupsHeaderProps) => {
    const { hasRole } = useAuth()
    const navigate = useNavigate()
    const isSuperAdmin = hasRole('Super Admin')
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
        <VStack
            align="stretch"
            gap={{ base: 4, md: 6 }}
            pos="sticky"
            top={6}
            zIndex={"sticky"}
        >
            {/* First line: Go back button + All Groups title and count */}
            <Flex justify="flex-start" align="center">
                <IconButton 
                    aria-label="Go back" 
                    variant="outline" 
                    rounded="xl" 
                    onClick={() => navigate(-1)}
                    size={{ base: "md", md: "lg" }}
                    mr={4}
                >
                    <ArrowLeft3 />
                </IconButton>
                <HStack>
                    <Heading size={{ base: "2xl", md: "3xl" }}>All Groups</Heading>
                    <Badge colorPalette={"accent"} fontSize={{ base: "md", md: "lg" }}>{groups?.length}</Badge>
                </HStack>
            </Flex>

            {/* Second line: Search input (full width) */}
            <InputGroup 
                maxW="full" 
                colorPalette={"accent"} 
                startElement={<SearchNormal1 />} 
                endElement={search ? <CloseButton size="xs" onClick={clearSearch} /> : undefined}
            >
                <Input
                    bg="bg"
                    rounded="xl"
                    placeholder="Search groups..."
                    value={search}
                    onChange={handleChange}
                    size={{ base: "md", md: "lg" }}
                />
            </InputGroup>

            {/* Third line: Upload file + Add Group button (horizontal) */}
            {isSuperAdmin && (
                <HStack gap={{ base: 3, md: 4 }} align="center">
                    <UploadGroupsFromFile data={groups} />
                    <Button
                        colorPalette="accent"
                        rounded="xl"
                        onClick={onAddGroup}
                        size={{ base: "md", md: "lg" }}
                        flex={1}
                    >
                        <Add />
                        Add Group
                    </Button>
                </HStack>
            )}
        </VStack>
    )
}

export default GroupsHeader;
