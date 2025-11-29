"use client"

import {
    Heading,
    HStack,
    Button,
    Badge,
    Flex,
    InputGroup,
    Input,
    VStack,
    IconButton,
    CloseButton
} from "@chakra-ui/react"
import { Add, ArrowLeft3, SearchNormal1 } from "iconsax-reactjs"
import { useNavigate } from "react-router"
import { useSearchParams } from "react-router"
import { useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import ExportButtons from "./ExportButtons"

interface UsersHeaderProps {
    users: any[]
    onAddUser: () => void
    onSearch: (value: string) => void
}

const UsersHeader = ({ users, onAddUser, onSearch }: UsersHeaderProps) => {
    const navigate = useNavigate();
    const { hasRole } = useAuth();
    const isSuperAdmin = hasRole('Super Admin');
    const [search, setSearch] = useState("");
    
    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        onSearch(e.target.value);
    }, [onSearch]);
    
    const clearSearch = useCallback(() => {
        setSearch("");
        onSearch("");
    }, [onSearch]);

    return (
        <VStack
            align="stretch"
            gap={{ base: 4, md: 6 }}
            pos="sticky"
            top={6}
            zIndex={"sticky"}
        >
            {/* First line: Go back button + Users Data title and count */}
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
                    <Heading size={{ base: "2xl", md: "3xl" }}>Users Data</Heading>
                    <Badge colorPalette={"accent"} fontSize={{ base: "md", md: "lg" }}>{users?.length}</Badge>
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
                    placeholder="Search users..."
                    value={search}
                    onChange={handleChange}
                    size={{ base: "md", md: "lg" }}
                />
            </InputGroup>

            {/* Third line: Export buttons (left) + Add User button (right) */}
            {isSuperAdmin && (
                <VStack gap={{ base: 3, md: 4 }} align="stretch">
                    {/* Export buttons grouped on the left */}
                    <ExportButtons users={users} />
                    
                    {/* Add User button on its own line on mobile, right-aligned on desktop */}
                    <Flex justify={{ base: "stretch", md: "flex-end" }}>
                        <Button
                            colorPalette="accent"
                            rounded="xl"
                            onClick={onAddUser}
                            size={{ base: "md", md: "lg" }}
                            width={{ base: "full", md: "auto" }}
                            minW={{ base: "auto", md: "120px" }}
                        >
                            <Add />
                            Add User
                        </Button>
                    </Flex>
                </VStack>
            )}
        </VStack>
    )
}

export default UsersHeader;