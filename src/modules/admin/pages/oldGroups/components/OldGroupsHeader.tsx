// components/oldgroups/components/OldGroupsHeader.tsx
"use client"

import { Heading, HStack, Button, Badge, Flex, InputGroup, Input, IconButton, CloseButton, VStack, Drawer, Portal, Box, SimpleGrid, Select, createListCollection, useListCollection, Stack, Span } from "@chakra-ui/react"
import { useState, useCallback, useEffect } from "react"
import { Add, SearchNormal1, ArrowLeft3, MoreSquare, CloseCircle } from "iconsax-reactjs"
import UploadOldGroupsFromFile from "./UploadOldGroups"
import ExportButtons from "./ExportButtons"
import type { OldGroup } from "@/types/oldGroups.type"
import { useAuth } from "@/hooks/useAuth"
import { useNavigate } from "react-router"
import type { State } from "@/types/states.type"
import type { Region } from "@/types/regions.type"

interface OldGroupsHeaderProps {
    oldGroups: OldGroup[]
    onAddGroup: () => void
    onSearch: (value: string) => void
    states: State[]
    regions: Region[]
    stateFilter: string
    setStateFilter: (value: string) => void
    regionFilter: string
    setRegionFilter: (value: string) => void
}

const OldGroupsHeader = ({ oldGroups, onAddGroup, onSearch, states, regions, stateFilter, setStateFilter, regionFilter, setRegionFilter }: OldGroupsHeaderProps) => {
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

    // collections
    const stateCollection = createListCollection({
        items: [{
            label: "All States",
            value: ""
        }, ...states.map(state => ({
            label: state.name,
            value: state.id.toString()
        }))]
    })

    const { collection: regionCollection, set: setRegionItems } = useListCollection({
        initialItems: [{
            label: "All Regions",
            value: ""
        }]
    })

    useEffect(() => {
        const filteredRegions = regions.filter(region => region.state === states.find(state => state.id.toString() === stateFilter)?.name)

        setRegionItems([{
            label: "All Regions",
            value: ""
        }, ...filteredRegions.map(region => ({
            label: region.name,
            value: region.id.toString()
        }))])
    }, [stateFilter, regions])


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
                            <Heading size={{ base: "2xl", md: "3xl" }}>All Old Groups</Heading>
                            <Badge colorPalette={"accent"} fontSize={{ base: "md", md: "lg" }}>{oldGroups?.length}</Badge>
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
                                                {/* Add Old Group Button */}
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
                                                    Add Old Group
                                                </Button>

                                                {/* Upload File Button */}
                                                <UploadOldGroupsFromFile data={oldGroups} />

                                                {/* Export Buttons */}
                                                <VStack gap={3} align="stretch">
                                                    <Heading size="sm" color="fg.muted">Export Data</Heading>
                                                    <ExportButtons oldGroups={oldGroups} />
                                                </VStack>
                                            </VStack>
                                        </Drawer.Body>
                                    </Drawer.Content>
                                </Drawer.Positioner>
                            </Portal>
                        </Drawer.Root>
                    )}

                    {isSuperAdmin && <HStack hideBelow={"md"}>
                        <UploadOldGroupsFromFile data={oldGroups} />

                        {/* desktop Add Old Group Button */}
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
                            Add Old Group
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
                            placeholder="Search old groups..."
                            value={search}
                            onChange={handleChange}
                            size={{ base: "md", md: "lg" }}
                        />
                    </InputGroup>
                    <Box hideBelow={"md"}>
                        <ExportButtons oldGroups={oldGroups} />
                    </Box>
                </Flex>

                {/* Filters */}
                <SimpleGrid gap={8} overflowX="auto" pb={{ base: 2, md: 0 }} columns={{ base: 2, md: 5 }}>
                    {/* State Select */}
                    <Select.Root size="md" onValueChange={(e) => setStateFilter(e.value[0])} value={[stateFilter]} collection={stateCollection} width="200px">
                        <Select.HiddenSelect />
                        <Select.Control>
                            <Select.Trigger bg="bg" rounded="lg">
                                <Stack gapY="0" justify="center" w="full">
                                    <Span color="fg.subtle" fontSize="xs">State</Span>
                                    <Select.ValueText mt="-1.5" placeholder="All States" />
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

                    <Select.Root size="md" onValueChange={(e) => setRegionFilter(e.value[0])} value={[regionFilter]} collection={regionCollection} width="200px" disabled={!stateFilter}>
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

                    <Button variant="surface" colorPalette={"red"} onClick={() => { setStateFilter(""); setRegionFilter("") }}>
                        <CloseCircle />   Reset Filters
                    </Button>
                </SimpleGrid>

            </VStack>
        </>
    )
}

export default OldGroupsHeader;
