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
    CloseButton,
    Drawer,
    Portal,
    Box
} from "@chakra-ui/react"
import { Add, ArrowLeft3, SearchNormal1, MoreSquare } from "iconsax-reactjs"
import { useNavigate } from "react-router"
import { useSearchParams } from "react-router"
import { useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import ExportButtons from "./ExportButtons"
// import UploadUsersFromFile from "../../../components/PortingFile"

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
                            <Heading size={{ base: "2xl", md: "3xl" }}>Users Data</Heading>
                            <Badge colorPalette={"accent"} fontSize={{ base: "md", md: "lg" }}>{users?.length}</Badge>
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
                                                {/* Add User Button */}
                                                <Button
                                                    colorPalette="accent"
                                                    rounded="xl"
                                                    onClick={() => {
                                                        onAddUser()
                                                    }}
                                                    size="lg"
                                                    width="full"
                                                >
                                                    <Add />
                                                    Add User
                                                </Button>

                                                {/* Export Buttons */}
                                                <VStack gap={3} align="stretch">
                                                    <Heading size="sm" color="fg.muted">Export Data</Heading>
                                                    <ExportButtons users={users} />
                                                </VStack>
                                            </VStack>
                                        </Drawer.Body>
                                    </Drawer.Content>
                                </Drawer.Positioner>
                            </Portal>
                        </Drawer.Root>
                    )}

                    {isSuperAdmin && <HStack hideBelow={"md"}>
                        {/* desktop Add User Button */}
                        <Button
                            colorPalette="accent"
                            rounded="xl"
                            w="fit"
                            hideBelow={"md"}
                            onClick={() => {
                                onAddUser()
                            }}
                            size="lg"
                        >
                            <Add />
                            Add User
                        </Button>
                    </HStack>}

                </Flex>

                {/* Second line: Search input (full width) */}
                <HStack w="full" justify={"space-between"}>

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
                </HStack>

            </VStack>
        </>
    )
}

export default UsersHeader;