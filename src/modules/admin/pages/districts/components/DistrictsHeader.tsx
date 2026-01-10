// components/districts/components/DistrictsHeader.tsx
"use client"

import { Heading, HStack, Button, Badge, Flex, InputGroup, Input, IconButton, CloseButton, VStack, Drawer, Portal, Box, NativeSelect } from "@chakra-ui/react"
import { Add, SearchNormal1, ArrowLeft3, MoreSquare } from "iconsax-reactjs"
import UploadDistrictsFromFile from "../../../components/PortingFile"
import DistrictsExport from "./DistrictsExport"
import type { District } from "@/types/districts.type"
import { useNavigate } from "react-router"
import type { State } from "@/modules/admin/hooks/useState"
import type { Region } from "@/modules/admin/hooks/useRegion"

interface DistrictsHeaderProps {
    districts: District[]
    onAddDistrict: () => void
    onSearch: (value: string) => void
    states: State[]
    regions: Region[]
    stateFilter: string
    setStateFilter: (value: string) => void
    regionFilter: string
    setRegionFilter: (value: string) => void
}

import { useState, useCallback } from "react"
import { useAuth } from "@/hooks/useAuth"

const DistrictsHeader = ({ 
    districts, 
    onAddDistrict, 
    onSearch,
    states,
    regions,
    stateFilter,
    setStateFilter,
    regionFilter,
    setRegionFilter
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
                        maxW={{ md: "320px" }}
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

                    {/* Filters */}
                    <HStack gap={2} overflowX="auto" pb={{ base: 2, md: 0 }}>
                        <NativeSelect.Root size="md" width="150px">
                            <NativeSelect.Field 
                                placeholder="All States" 
                                value={stateFilter} 
                                onChange={(e) => setStateFilter(e.target.value)}
                                rounded="xl"
                            >
                                {states?.map((state) => (
                                    <option key={state.id} value={state.id}>{state.name}</option>
                                ))}
                            </NativeSelect.Field>
                            <NativeSelect.Indicator />
                        </NativeSelect.Root>

                        <NativeSelect.Root size="md" width="150px">
                            <NativeSelect.Field 
                                placeholder="All Regions" 
                                value={regionFilter} 
                                onChange={(e) => setRegionFilter(e.target.value)}
                                rounded="xl"
                            >
                                {regions?.map((region) => (
                                    <option key={region.id} value={region.id}>{region.name}</option>
                                ))}
                            </NativeSelect.Field>
                            <NativeSelect.Indicator />
                        </NativeSelect.Root>
                    </HStack>

                    <Box hideBelow={"md"}>
                        <DistrictsExport districts={districts} />
                    </Box>
                </Flex>

            </VStack>
        </>
    )
}

export default DistrictsHeader;
