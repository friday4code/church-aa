"use client"

import { Heading, HStack, Button, Badge, Flex, InputGroup, Input, IconButton, CloseButton, VStack, Drawer, Portal, Box, createListCollection, Select } from "@chakra-ui/react"
import { Add, SearchNormal1, ArrowLeft3, MoreSquare } from "iconsax-reactjs"
import UploadStatesFromFile from "../../../components/PortingFile"
import ExportButtons from "./ExportButtons"
import type { State } from "@/types/states.type"
import { useAuth } from "@/hooks/useAuth"
import { useNavigate } from "react-router"

interface StatesHeaderProps {
    states: State[]
    onAddState: () => void
    onSearch: (value: string) => void;
    pageSize: number;
    setPageSize: (size: number) => void;
}

const pageSizes = createListCollection({
    items: [
        { label: "10 rows", value: 10 },
        { label: "30 rows", value: 30 },
        { label: "50 rows", value: 50 },
        { label: "70 rows", value: 70 },
        { label: "100 rows", value: 100 },
        { label: "150 rows", value: 150 },
        { label: "200 rows", value: 200 },
        { label: "250 rows", value: 250 },
    ],
})

import { useState, useCallback } from "react"

const StatesHeader = ({ states, onAddState, onSearch, pageSize, setPageSize }: StatesHeaderProps) => {
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
                {/* First line: Go back button + title on left */}
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
                            <Heading size={{ base: "2xl", md: "3xl" }}>All States</Heading>
                            <Badge colorPalette={"accent"} fontSize={{ base: "md", md: "lg" }}>{states?.length}</Badge>
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
                                                {/* Add State Button */}
                                                <Button
                                                    colorPalette="accent"
                                                    rounded="xl"
                                                    onClick={() => {
                                                        onAddState()
                                                    }}
                                                    size="lg"
                                                    width="full"
                                                >
                                                    <Add />
                                                    Add State
                                                </Button>

                                                {/* Upload File Button */}
                                                <UploadStatesFromFile data={states} />

                                                {/* Export Buttons */}
                                                <VStack gap={3} align="stretch">
                                                    <Heading size="sm" color="fg.muted">Export Data</Heading>
                                                    <ExportButtons states={states} />
                                                </VStack>
                                            </VStack>
                                        </Drawer.Body>
                                    </Drawer.Content>
                                </Drawer.Positioner>
                            </Portal>
                        </Drawer.Root>
                    )}

                    {isSuperAdmin && <HStack hideBelow={"md"}>
                        <UploadStatesFromFile data={states} />

                        {/* desktop Add State Button */}
                        <Button
                            colorPalette="accent"
                            rounded="xl"
                            w="fit"
                            hideBelow={"md"}
                            onClick={() => {
                                onAddState()
                            }}
                            size="lg"
                        >
                            <Add />
                            Add State
                        </Button>
                    </HStack>}

                </Flex>

                {/* Second line: Search input (full width) */}
                <HStack w="full" justify={"space-between"}>

                    {/* Page Size Selector */}
                    <Box width="150px" hideBelow="md">
                        <Select.Root
                            collection={pageSizes}
                            size="sm"
                            value={[pageSize.toString()]}
                            onValueChange={(e) => setPageSize(Number(e.value[0]))}
                        >
                            <Select.HiddenSelect />
                            <Select.Control>
                                <Select.Trigger w="28">
                                    <Select.ValueText placeholder={`${pageSize} rows`} />
                                </Select.Trigger>
                                <Select.IndicatorGroup>
                                    <Select.Indicator />
                                </Select.IndicatorGroup>
                            </Select.Control>
                            <Portal>
                                <Select.Positioner>
                                    <Select.Content>
                                        {pageSizes.items.map((size) => (
                                            <Select.Item item={size} key={size.value}>
                                                {size.label}
                                                <Select.ItemIndicator />
                                            </Select.Item>
                                        ))}
                                    </Select.Content>
                                </Select.Positioner>
                            </Portal>
                        </Select.Root>
                    </Box>

                    <InputGroup
                        maxW="full"
                        colorPalette={"accent"}
                        startElement={<SearchNormal1 />}
                        endElement={search ? <CloseButton size="xs" onClick={clearSearch} /> : undefined}
                    >
                        <Input
                            bg="bg"
                            rounded="xl"
                            placeholder="Search states..."
                            value={search}
                            onChange={handleChange}
                            size={{ base: "md", md: "lg" }}
                        />
                    </InputGroup>
                    <Box hideBelow={"md"}>
                        <ExportButtons states={states} />
                    </Box>
                </HStack>

            </VStack>


        </>
    )
}

export default StatesHeader;
