// components/districts/components/DistrictsHeader.tsx
"use client"

import { Heading, HStack, Button, Badge, Flex, InputGroup, Input, IconButton, CloseButton, VStack } from "@chakra-ui/react"
import { Add, SearchNormal1, ArrowLeft3 } from "iconsax-reactjs"
import UploadDistrictsFromFile from "../../../components/PortingFile"
import type { District } from "@/types/districts.type"
import { useNavigate } from "react-router"

interface DistrictsHeaderProps {
    districts: District[]
    onAddDistrict: () => void
    onSearch: (value: string) => void
}

import { useState, useCallback } from "react"
import { useAuth } from "@/hooks/useAuth"

const DistrictsHeader = ({ districts, onAddDistrict, onSearch }: DistrictsHeaderProps) => {
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
            {/* First line: Go back button + Districts Data title and count */}
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
                    <Heading size={{ base: "2xl", md: "3xl" }}>Districts Data</Heading>
                    <Badge colorPalette={"accent"} fontSize={{ base: "md", md: "lg" }}>{districts?.length}</Badge>
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
                    placeholder="Search districts..."
                    value={search}
                    onChange={handleChange}
                    size={{ base: "md", md: "lg" }}
                />
            </InputGroup>

            {/* Third line: Upload file + Add District button (horizontal) */}
            {isSuperAdmin && (
                <HStack gap={{ base: 3, md: 4 }} align="center">
                    <UploadDistrictsFromFile data={districts} />
                    <Button
                        colorPalette="accent"
                        rounded="xl"
                        onClick={onAddDistrict}
                        size={{ base: "md", md: "lg" }}
                        flex={1}
                    >
                        <Add />
                        Add District
                    </Button>
                </HStack>
            )}
        </VStack>
    )
}

export default DistrictsHeader;
