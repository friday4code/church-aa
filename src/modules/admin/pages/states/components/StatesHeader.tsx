"use client"

import { Heading, HStack, Button, Badge, Flex, InputGroup, Input, IconButton, CloseButton, VStack } from "@chakra-ui/react"
import { Add, SearchNormal1, ArrowLeft3 } from "iconsax-reactjs"
import UploadStatesFromFile from "../../../components/PortingFile"
import type { State } from "@/types/states.type"
import { useAuth } from "@/hooks/useAuth"
import { useNavigate } from "react-router"

interface StatesHeaderProps {
    states: State[]
    onAddState: () => void
    onSearch: (value: string) => void
}

import { useState, useCallback } from "react"

const StatesHeader = ({ states, onAddState, onSearch }: StatesHeaderProps) => {
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
            {/* First line: Go back button + All States title and count */}
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
                    <Heading size={{ base: "2xl", md: "3xl" }}>All States</Heading>
                    <Badge colorPalette={"accent"} fontSize={{ base: "md", md: "lg" }}>{states?.length}</Badge>
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
                    placeholder="Search states..."
                    value={search}
                    onChange={handleChange}
                    size={{ base: "md", md: "lg" }}
                />
            </InputGroup>

            {/* Third line: Upload file + Add State button (horizontal) */}
            {isSuperAdmin && (
                <HStack gap={{ base: 3, md: 4 }} align="center">
                    <UploadStatesFromFile data={states} />
                    <Button
                        colorPalette="accent"
                        rounded="xl"
                        onClick={onAddState}
                        size={{ base: "md", md: "lg" }}
                        flex={1}
                    >
                        <Add />
                        Add State
                    </Button>
                </HStack>
            )}
        </VStack>
    )
}

export default StatesHeader;
