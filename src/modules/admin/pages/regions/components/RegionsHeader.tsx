// components/regions/components/RegionsHeader.tsx
"use client"

import { Heading, HStack, Button, Badge, Flex, InputGroup, Input, IconButton, CloseButton, VStack, Drawer, Portal, Box, SimpleGrid, createListCollection, Span, Stack } from "@chakra-ui/react"
import { Add, SearchNormal1, ArrowLeft3, MoreSquare, CloseCircle } from "iconsax-reactjs"
import { Select } from "@chakra-ui/react"
import UploadRegionsFromFile from "./UploadRegions"
import ExportButtons from "./ExportButtons"
import type { Region } from "@/types/regions.type"
import { useNavigate } from "react-router"
import type { State } from "@/types/states.type"

interface RegionsHeaderProps {
    regions: Region[]
    onAddRegion: () => void
    onSearch: (value: string) => void
    states: State[]
    stateFilter: string
    setStateFilter: (value: string) => void
}

import { useState, useCallback } from "react"
import { useAuth } from "@/hooks/useAuth"

const RegionsHeader = ({ regions, onAddRegion, onSearch, states, stateFilter, setStateFilter }: RegionsHeaderProps) => {
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

    return (
        <>
            <VStack
                bg={"bg"}
                border="xs"
                borderColor={"border"}
                rounded="xl"
                p="4"
                align="stretch"
                gap={{ base: 4, md: 6 }}
                pos="sticky"
                top={0}
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
                            <Heading size={{ base: "2xl", md: "3xl" }}>All Regions</Heading>
                            <Badge colorPalette={"accent"} fontSize={{ base: "md", md: "lg" }}>{regions?.length}</Badge>
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
                                                {/* Add Region Button */}
                                                <Button
                                                    colorPalette="accent"
                                                    rounded="xl"
                                                    onClick={() => {
                                                        onAddRegion()
                                                    }}
                                                    size="lg"
                                                    width="full"
                                                >
                                                    <Add />
                                                    Add Region
                                                </Button>

                                                {/* Upload File Button */}
                                                <UploadRegionsFromFile data={regions} />

                                                {/* Export Buttons */}
                                                <VStack gap={3} align="stretch">
                                                    <Heading size="sm" color="fg.muted">Export Data</Heading>
                                                    <ExportButtons regions={regions} />
                                                </VStack>
                                            </VStack>
                                        </Drawer.Body>
                                    </Drawer.Content>
                                </Drawer.Positioner>
                            </Portal>
                        </Drawer.Root>
                    )}

                    {isSuperAdmin && <HStack hideBelow={"md"}>
                        <UploadRegionsFromFile data={regions} />

                        {/* desktop Add Region Button */}
                        <Button
                            colorPalette="accent"
                            rounded="xl"
                            w="fit"
                            hideBelow={"md"}
                            onClick={() => {
                                onAddRegion()
                            }}
                            size="lg"
                        >
                            <Add />
                            Add Region
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
                            placeholder="Search regions..."
                            value={search}
                            onChange={handleChange}
                            size={{ base: "md", md: "lg" }}
                        />
                    </InputGroup>
                    <Box hideBelow={"md"}>
                        <ExportButtons regions={regions} />
                    </Box>
                </Flex>

                {/* Filters */}
                <SimpleGrid gap={20} overflowX="auto" pb={{ base: 2, md: 0 }} columns={{ base: 2, md: 5 }}>
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

                    <Button variant="surface" colorPalette={"red"} onClick={() => { setStateFilter("") }}>
                        <CloseCircle />   Reset Filters
                    </Button>
                </SimpleGrid>

            </VStack>
        </>
    )
}

export default RegionsHeader;
