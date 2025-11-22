// components/districts/components/DistrictsHeader.tsx
"use client"

import { Heading, HStack, Button, Badge, Flex, InputGroup, Input, IconButton, CloseButton } from "@chakra-ui/react"
import { Add, SearchNormal1, ArrowLeft3 } from "iconsax-reactjs"
import UploadDistrictsFromFile from "../../../components/PortingFile"
import type { District } from "@/types/districts.type"

interface DistrictsHeaderProps {
    districts: District[]
    onAddDistrict: () => void
    onSearch: (value: string) => void
}

import { useState, useCallback } from "react"

const DistrictsHeader = ({ districts, onAddDistrict, onSearch }: DistrictsHeaderProps) => {
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
                <Heading size="3xl">Districts Data</Heading>
                <Badge colorPalette={"accent"}>{districts?.length}</Badge>
            </HStack>

            <HStack gap="4">
                <UploadDistrictsFromFile data={districts} />
                <InputGroup maxW="300px" colorPalette={"accent"} startElement={<SearchNormal1 />} endElement={search ? <CloseButton size="xs" onClick={clearSearch} /> : undefined}>
                    <Input
                        bg="bg"
                        rounded="xl"
                        placeholder="Search districts..."
                        value={search}
                        onChange={handleChange}
                    />
                </InputGroup>
                <Button
                    colorPalette="accent"
                    rounded="xl"
                    onClick={onAddDistrict}
                >
                    <Add />
                    Add District
                </Button>
            </HStack>
        </Flex>
    )
}

export default DistrictsHeader;