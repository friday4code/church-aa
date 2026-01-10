// components/districts/components/DistrictsHeader.tsx
"use client"

import { Heading, HStack, Button, Badge, Flex, InputGroup, Input, IconButton, CloseButton, VStack, Drawer, Portal, Box, Select, useListCollection, createListCollection, SimpleGrid } from "@chakra-ui/react"
import { Add, SearchNormal1, ArrowLeft3, MoreSquare, CloseCircle } from "iconsax-reactjs"
import UploadDistrictsFromFile from "./UploadDistricts"
import DistrictsExport from "./DistrictsExport"
import type { District } from "@/types/districts.type"
import { useNavigate } from "react-router"

import { useState, useCallback, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import type { Region } from "@/types/regions.type"
import type { State } from "@/types/states.type"
import type { OldGroup } from "@/types/oldGroups.type"
import type { Group } from "@/types/groups.type"


interface DistrictsHeaderProps {
    districts: District[]
    onAddDistrict: () => void
    onSearch: (value: string) => void
    states: State[]
    regions: Region[]
    oldGroups: OldGroup[]
    groups: Group[]
    stateFilter: string
    setStateFilter: (value: string) => void
    regionFilter: string
    setRegionFilter: (value: string) => void
    oldGroupFilter: string
    setOldGroupFilter: (value: string) => void
    groupFilter: string
    setGroupFilter: (value: string) => void
}


const DistrictsHeader = ({
    districts,
    onAddDistrict,
    onSearch,
    states,
    regions,
    oldGroups,
    groups,
    stateFilter,
    setStateFilter,
    regionFilter,
    setRegionFilter,
    oldGroupFilter,
    setOldGroupFilter,
    groupFilter,
    setGroupFilter
}: DistrictsHeaderProps) => {
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
            value: state.id
        })) as { label: string, value: number }[]]
    })

    // region
    const { collection: regionCollection, set: setRegionCollection } = useListCollection({
        initialItems: [{
            label: "All Regions",
            value: ""
        }] as { label: string, value: number | string }[]
    })

    useEffect(() => {
        const r = regions.filter(region => region.state === states.find(state => state.id.toString() == stateFilter)?.name)
        setRegionCollection([{
            label: "All Regions",
            value: ""
        }, ...r.map(region => ({
            label: region.name,
            value: region.id
        })) as { label: string, value: number | string }[]])
    }, [stateFilter, regions]);

    // oldgroup
    const { collection: oldGroupCollection, set: setOldGroupCollection } = useListCollection({
        initialItems: [{
            label: "All Old Groups",
            value: ""
        }] as { label: string, value: number | string }[]
    })
    useEffect(() => {
        console.log("oldGroups", oldGroups)
        const o = oldGroups.filter(oldgroup => oldgroup.state == states.find(state => state.id.toString() == stateFilter)?.name)
        setOldGroupCollection([{
            label: "All Old Groups",
            value: ""
        }, ...o.map(oldgroup => ({
            label: oldgroup.name,
            value: oldgroup.id
        })) as { label: string, value: number | string }[]])
    }, [stateFilter, oldGroups]);



    // group
    const { collection: groupCollection, set: setGroupCollection } = useListCollection({
        initialItems: [{
            label: "All Groups",
            value: ""
        }] as { label: string, value: number | string }[]
    })
    useEffect(() => {
        console.log("groups", groups)
        const g = groups.filter(group => group.old_group === oldGroups.find(oldgroup => oldgroup.id.toString() == oldGroupFilter)?.name)
        setGroupCollection([{
            label: "All Groups",
            value: ""
        }, ...g.map(group => ({
            label: group.name,
            value: group.id
        })) as { label: string, value: number | string }[]])
    }, [oldGroupFilter, groups]);



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
                            <Heading size={{ base: "2xl", md: "3xl" }}>Districts Data</Heading>
                            <Badge colorPalette={"accent"} fontSize={{ base: "md", md: "lg" }}>{districts?.length}</Badge>
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
                                                {/* Add District Button */}
                                                <Button
                                                    colorPalette="accent"
                                                    rounded="xl"
                                                    onClick={() => {
                                                        onAddDistrict()
                                                    }}
                                                    size="lg"
                                                    width="full"
                                                >
                                                    <Add />
                                                    Add District
                                                </Button>

                                                {/* Upload File Button */}
                                                <UploadDistrictsFromFile data={districts} />

                                                {/* Export Buttons */}
                                                <VStack gap={3} align="stretch">
                                                    <Heading size="sm" color="fg.muted">Export Data</Heading>
                                                    <DistrictsExport districts={districts} />
                                                </VStack>
                                            </VStack>
                                        </Drawer.Body>
                                    </Drawer.Content>
                                </Drawer.Positioner>
                            </Portal>
                        </Drawer.Root>
                    )}

                    {isSuperAdmin && <HStack hideBelow={"md"}>
                        {/* <DistrictsExport districts={districts} /> */}
                        <UploadDistrictsFromFile data={districts} />

                        {/* desktop Add District Button */}
                        <Button
                            colorPalette="accent"
                            rounded="xl"
                            w="fit"
                            hideBelow={"md"}
                            onClick={() => {
                                onAddDistrict()
                            }}
                            size="lg"
                        >
                            <Add />
                            Add District
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
                        // maxW={{ md: "320px" }}
                        colorPalette={"accent"}
                        startElement={<SearchNormal1 />}
                        endElement={search ? <CloseButton size="xs" onClick={clearSearch} /> : undefined}
                    >
                        <Input
                            bg="bg"
                            rounded="xl"
                            placeholder="Search districts..."
                            value={search}
                            onChange={handleChange}
                            size={{ base: "md", md: "lg" }}
                        />
                    </InputGroup>

                    <Box hideBelow={"md"}>
                        <DistrictsExport districts={districts} />
                    </Box>
                </Flex>


                {/* Filters */}
                <SimpleGrid gap={8} overflowX="auto" pb={{ base: 2, md: 0 }} columns={{ base: 2, md: 5 }}>

                    <Select.Root size="md" onValueChange={(e) => setStateFilter(e.value[0])} value={[stateFilter]} collection={stateCollection} width="200px">
                        <Select.HiddenSelect />
                        <Select.Control>
                            <Select.Trigger bg="bg" rounded="lg">
                                <Select.ValueText placeholder="Select state" />
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

                    <Select.Root onValueChange={(e) => setRegionFilter(e.value[0])} value={[regionFilter]} collection={regionCollection} size="md" width="200px">
                        <Select.HiddenSelect />
                        <Select.Control>
                            <Select.Trigger bg="bg" rounded="lg">
                                <Select.ValueText placeholder="All Regions" />
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

                    <Select.Root onValueChange={(e) => setOldGroupFilter(e.value[0])} value={[oldGroupFilter]} collection={oldGroupCollection} size="md" width="200px">
                        <Select.HiddenSelect />
                        <Select.Control>
                            <Select.Trigger bg="bg" rounded="lg">
                                <Select.ValueText placeholder="All Old Groups" />
                            </Select.Trigger>
                            <Select.IndicatorGroup>
                                <Select.Indicator />
                            </Select.IndicatorGroup>
                        </Select.Control>
                        <Portal>
                            <Select.Positioner>
                                <Select.Content>
                                    {oldGroupCollection.items.map((oldGroup) => (
                                        <Select.Item item={oldGroup} key={oldGroup.value}>
                                            {oldGroup.label}
                                            <Select.ItemIndicator />
                                        </Select.Item>
                                    ))}
                                </Select.Content>
                            </Select.Positioner>
                        </Portal>
                    </Select.Root>

                    <Select.Root onValueChange={(e) => setGroupFilter(e.value[0])} value={[groupFilter]} collection={groupCollection} size="md" width="200px">
                        <Select.HiddenSelect />
                        <Select.Control>
                            <Select.Trigger bg="bg" rounded="lg">
                                <Select.ValueText placeholder="All Groups" />
                            </Select.Trigger>
                            <Select.IndicatorGroup>
                                <Select.Indicator />
                            </Select.IndicatorGroup>
                        </Select.Control>
                        <Portal>
                            <Select.Positioner>
                                <Select.Content>
                                    {groupCollection.items.map((group) => (
                                        <Select.Item item={group} key={group.value}>
                                            {group.label}
                                            <Select.ItemIndicator />
                                        </Select.Item>
                                    ))}
                                </Select.Content>
                            </Select.Positioner>
                        </Portal>
                    </Select.Root>

                    <Button variant="surface" colorPalette={"red"} onClick={() => { setStateFilter(""); setRegionFilter(""); setOldGroupFilter(""); setGroupFilter(""); }}>
                        <CloseCircle />   Reset Filters
                    </Button>
                </SimpleGrid>

            </VStack>
        </>
    )
}

export default DistrictsHeader;
