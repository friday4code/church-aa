// components/groups/components/GroupsHeader.tsx
"use client"

import { Heading, HStack, Button, Badge, Flex, InputGroup, Input, IconButton, CloseButton, VStack, Drawer, Portal, Box } from "@chakra-ui/react"
import { Add, SearchNormal1, ArrowLeft3, MoreSquare } from "iconsax-reactjs"
import type { Group } from "@/types/groups.type"
import UploadGroupsFromFile from "./PortingFile"
import ExportButtons from "./ExportButtons"
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
        <>
            <VStack
                align="stretch"
                gap={{ base: 4, md: 6 }}
                pos="sticky"
                top={6}
                zIndex={"sticky"}
            >
                {/* First line: Go back button + title on left, drawer on right */}
                <Flex justify="space-between" align="center">
                    {/* Go back button */}
                    <HStack justify="flex-start">
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
                    </HStack>

                    {/* Mobile Drawer - only on mobile */}
                    {isSuperAdmin && (
                        <Drawer.Root placement="bottom" size="full">
                            <Drawer.Trigger asChild>
                                <IconButton
                                    aria-label="More options"
                                    variant="ghost"
                                    rounded="xl"
                                    size="md"
                                    hideFrom={"md"}
                                >
                                    <MoreSquare variant="Outline" />
                                </IconButton>
                            </Drawer.Trigger>
                            <Portal>
                                <Drawer.Backdrop />
                                <Drawer.Positioner>
                                    <Drawer.Content h='fit' bg="bg" borderTopRadius="xl">
                                        <Drawer.Header p={4} borderBottom="1px solid" borderColor="border">
                                            <Flex justify="space-between" align="center">
                                                <Heading size="lg">Actions</Heading>
                                                <Drawer.CloseTrigger asChild>
                                                    <IconButton
                                                        aria-label="Close drawer"
                                                        variant="ghost"
                                                        size="sm"
                                                    >
                                                        <CloseButton />
                                                    </IconButton>
                                                </Drawer.CloseTrigger>
                                            </Flex>
                                        </Drawer.Header>
                                        <Drawer.Body p={4}>
                                            <VStack gap={4} align="stretch">
                                                {/* Add Group Button */}
                                                <Button
                                                    colorPalette="accent"
                                                    rounded="xl"
                                                    onClick={() => {
                                                        onAddGroup()
                                                    }}
                                                    size="lg"
                                                    width="full"
                                                >
                                                    <Add />
                                                    Add Group
                                                </Button>

                                                {/* Upload File Button */}
                                                <UploadGroupsFromFile data={groups} />

                                                {/* Export Buttons */}
                                                <VStack gap={3} align="stretch">
                                                    <Heading size="sm" color="fg.muted">Export Data</Heading>
                                                    <ExportButtons groups={groups} />
                                                </VStack>
                                            </VStack>
                                        </Drawer.Body>
                                    </Drawer.Content>
                                </Drawer.Positioner>
                            </Portal>
                        </Drawer.Root>
                    )}

                    {isSuperAdmin && <HStack hideBelow={"md"}>
                        <UploadGroupsFromFile data={groups} />

                        {/* desktop Add Group Button */}
                        <Button
                            colorPalette="accent"
                            rounded="xl"
                            w="fit"
                            hideBelow={"md"}
                            onClick={() => {
                                onAddGroup()
                            }}
                            size="lg"
                        >
                            <Add />
                            Add Group
                        </Button>
                    </HStack>}

                </Flex>

                {/* Second line: Search input (full width) */}
                <HStack w="full" justify={"space-between"}>

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
                    <Box hideBelow={"md"}>
                        <ExportButtons groups={groups} />
                    </Box>
                </HStack>

            </VStack>
        </>
    )
}

export default GroupsHeader;
