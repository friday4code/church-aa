"use client"

import { Heading, HStack, Button, Badge, Flex, InputGroup, Input, IconButton, CloseButton } from "@chakra-ui/react"
import { Add, SearchNormal1, ArrowLeft3 } from "iconsax-reactjs"
import UploadStatesFromFile from "../../../components/PortingFile"
import type { State } from "@/types/states.type"
import { useAuth } from "@/hooks/useAuth"

interface StatesHeaderProps {
    states: State[]
    onAddState: () => void
    onSearch: (value: string) => void
}

import { useState, useCallback } from "react"

const StatesHeader = ({ states, onAddState, onSearch }: StatesHeaderProps) => {
    const { hasRole } = useAuth()
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
        <Flex
            justify="space-between"
            align="center"
            pos="sticky"
            top={6}
            zIndex={"sticky"}
        // backdropFilter={"blur(20px)"}
        >
            <HStack>
                <IconButton aria-label="Go back" variant="outline" rounded="xl" onClick={() => window.history.back()}>
                    <ArrowLeft3 />
                </IconButton>
                <Heading size="3xl">All States</Heading>
                <Badge colorPalette={"accent"}>{states?.length}</Badge>
            </HStack>

            <HStack gap="4">
                {isSuperAdmin && <UploadStatesFromFile data={states} />}
                <InputGroup maxW="300px" colorPalette={"accent"} startElement={<SearchNormal1 />} endElement={search ? <CloseButton size="xs" onClick={clearSearch} /> : undefined}>
                    <Input
                        bg="bg"
                        rounded="xl"
                        placeholder="Search states..."
                        value={search}
                        onChange={handleChange}
                    />
                </InputGroup>
                {isSuperAdmin && (
                    <Button
                        colorPalette="accent"
                        rounded="xl"
                        onClick={onAddState}
                    >
                        <Add />
                        Add State
                    </Button>
                )}
            </HStack>
        </Flex>
    )
}

export default StatesHeader;
