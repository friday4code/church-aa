// components/regions/components/RegionsHeader.tsx
"use client"

import { Heading, HStack, Button, Badge, Flex, InputGroup, Input, IconButton, CloseButton } from "@chakra-ui/react"
import { Add, SearchNormal1, ArrowLeft3 } from "iconsax-reactjs"
import UploadRegionsFromFile from "./UploadRegions"
import type { Region } from "@/types/regions.type"

interface RegionsHeaderProps {
    regions: Region[]
    onAddRegion: () => void
    onSearch: (value: string) => void
}

import { useState, useCallback } from "react"

const RegionsHeader = ({ regions, onAddRegion, onSearch }: RegionsHeaderProps) => {
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
                <Heading size="3xl">All Regions</Heading>
                <Badge colorPalette={"accent"}>{regions?.length}</Badge>
            </HStack>

            <HStack gap="4">
                <UploadRegionsFromFile data={regions} />
                <InputGroup maxW="300px" colorPalette={"accent"} startElement={<SearchNormal1 />} endElement={search ? <CloseButton size="xs" onClick={clearSearch} /> : undefined}>
                    <Input
                        bg="bg"
                        rounded="xl"
                        placeholder="Search regions..."
                        value={search}
                        onChange={handleChange}
                    />
                </InputGroup>
                <Button
                    colorPalette="accent"
                    rounded="xl"
                    onClick={onAddRegion}
                >
                    <Add />
                    Add Region
                </Button>
            </HStack>
        </Flex>
    )
}

export default RegionsHeader;