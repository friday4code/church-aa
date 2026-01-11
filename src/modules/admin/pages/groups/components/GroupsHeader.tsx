// components/groups/components/GroupsHeader.tsx
"use client"

import { Heading, HStack, Button, Badge, Flex, InputGroup, Input, IconButton, CloseButton, VStack, Drawer, Portal, Box, SimpleGrid, createListCollection, Span, Stack } from "@chakra-ui/react"
import { Add, SearchNormal1, ArrowLeft3, MoreSquare, CloseCircle } from "iconsax-reactjs"
import { Select } from "@chakra-ui/react"
import type { Group } from "@/types/groups.type"
import UploadGroupsFromFile from "./PortingFile"
import ExportButtons from "./ExportButtons"
import { useAuth } from "@/hooks/useAuth"
import { useNavigate } from "react-router"
import type { State } from "@/types/states.type"
import type { Region } from "@/types/regions.type"
import type { OldGroup } from "@/types/oldGroups.type"

interface GroupsHeaderProps {
    groups: Group[]
    onAddGroup: () => void
    onSearch: (value: string) => void
    states: State[]
    regions: Region[]
    oldGroups: OldGroup[]
    stateFilter: string
    setStateFilter: (value: string) => void
    regionFilter: string
    setRegionFilter: (value: string) => void
    oldGroupFilter: string
    setOldGroupFilter: (value: string) => void
}

import { useState, useCallback } from "react"

const GroupsHeader = ({
    groups,
    onAddGroup,
    onSearch,
    states,
    regions,
    oldGroups,
    stateFilter,
    setStateFilter,
    regionFilter,
    setRegionFilter,
    oldGroupFilter,
    setOldGroupFilter
}: GroupsHeaderProps) => {
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

    const stateCollection = createListCollection({
        items: [{ label: "All States", value: "" }, ...states.map(state => ({ label: state.name, value: state.id.toString() }))]
    })

    const filteredRegions = regions.filter(region => !stateFilter || region.state === states.find(state => state.id.toString() === stateFilter)?.name)
    const regionCollection = createListCollection({
        items: [{ label: "All Regions", value: "" }, ...filteredRegions.map(region => ({ label: region.name, value: region.id.toString() }))]
    })

    const filteredOldGroups = oldGroups.filter(og => !regionFilter || og.region === regions.find(region => region.id.toString() === regionFilter)?.name)
    const oldGroupCollection = createListCollection({
        items: [{ label: "All Old Groups", value: "" }, ...filteredOldGroups.map(og => ({ label: og.name, value: og.id.toString() }))]
    })

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

                {/* Second line: Search + Filters + Actions */}
                <Flex
                    direction={{ base: "column", md: "row" }}
                    gap={4}
                    justify="space-between"
                    align={{ base: "stretch", md: "center" }}
                >
                    <InputGroup
                        flex="1"
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
                </Flex>

                {/* Filters */}
                <SimpleGrid gap={8} overflowX="auto" pb={{ base: 2, md: 0 }} columns={{ base: 2, md: 5 }}>
                    <Select.Root size="md" onValueChange={(e) => setStateFilter(e.value[0])} value={[stateFilter]} collection={stateCollection} width="200px">
                        <Select.HiddenSelect />
                        <Select.Control>
                            <Select.Trigger bg="bg" rounded="lg">
                                <Stack gapY="0" justify="center" w="full">
                                    <Span color="fg.subtle" fontSize="xs">State</Span>
                                    <Select.ValueText mt="-1.5" placeholder="Select state" />
                                </Stack>
                            </Select.Trigger>
                            <Select.IndicatorGroup>
                                <Select.Indicator />
                            </Select.IndicatorGroup>
                        </Select.Control>
                        <Portal>
                            <Select.Positioner>
                                <Select.Content>
                                    {stateCollection.items.map((state) => (
                                        <Select.Item item={state} key={state.value}>
                                            {state.label}
                                            <Select.ItemIndicator />
                                        </Select.Item>
                                    ))}
                                </Select.Content>
                            </Select.Positioner>
                        </Portal>
                    </Select.Root>

                    <Select.Root disabled={!stateFilter} onValueChange={(e) => setRegionFilter(e.value[0])} value={[regionFilter]} collection={regionCollection} size="md" width="200px">
                        <Select.HiddenSelect />
                        <Select.Control>
                            <Select.Trigger bg="bg" rounded="lg">
                                <Stack gapY="0" justify="center" w="full">
                                    <Span color="fg.subtle" fontSize="xs">Region</Span>
                                    <Select.ValueText mt="-1.5" placeholder="All Regions" />
                                </Stack>
                            </Select.Trigger>
                            <Select.IndicatorGroup>
                                <Select.Indicator />
                            </Select.IndicatorGroup>
                        </Select.Control>
                        <Portal>
                            <Select.Positioner>
                                <Select.Content>
                                    {regionCollection.items.map((region) => (
                                        <Select.Item item={region} key={region.value}>
                                            {region.label}
                                            <Select.ItemIndicator />
                                        </Select.Item>
                                    ))}
                                </Select.Content>
                            </Select.Positioner>
                        </Portal>
                    </Select.Root>

                    <Select.Root onValueChange={(e) => setOldGroupFilter(e.value[0])} value={[oldGroupFilter]} collection={oldGroupCollection} size="md" width="200px" disabled={!regionFilter}>
                        <Select.HiddenSelect />
                        <Select.Control>
                            <Select.Trigger bg="bg" rounded="lg">
                                <Stack gapY="0" justify="center" w="full">
                                    <Span color="fg.subtle" fontSize="xs"> Old Group</Span>
                                    <Select.ValueText mt="-1.5" placeholder="All Old Groups" />
                                </Stack>
                            </Select.Trigger>
                            <Select.IndicatorGroup>
                                <Select.Indicator />
                            </Select.IndicatorGroup>
                        </Select.Control>
                        <Portal>
                            <Select.Positioner>
                                <Select.Content>
                                    {oldGroupCollection.items.map((og) => (
                                        <Select.Item item={og} key={og.value}>
                                            {og.label}
                                            <Select.ItemIndicator />
                                        </Select.Item>
                                    ))}
                                </Select.Content>
                            </Select.Positioner>
                        </Portal>
                    </Select.Root>

                    <Button variant="surface" colorPalette={"red"} onClick={() => { setStateFilter(""); setRegionFilter(""); setOldGroupFilter(""); }}>
                        <CloseCircle />   Reset Filters
                    </Button>
                </SimpleGrid>

            </VStack>
        </>
    )
}

export default GroupsHeader;
