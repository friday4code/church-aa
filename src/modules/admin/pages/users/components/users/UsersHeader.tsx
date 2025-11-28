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
} from "@chakra-ui/react"
import { Add, ArrowLeft3, SearchNormal1 } from "iconsax-reactjs"
import { useNavigate } from "react-router"
import { useSearchParams } from "react-router"

interface UsersHeaderProps {
    users: any[]
    onAddUser: () => void
    onSearch: (value: string) => void
}

const UsersHeader = ({ users, onAddUser, onSearch }: UsersHeaderProps) => {
    const navigate = useNavigate();
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
            >
                <Input
                    bg="bg"
                    rounded="xl"
                    placeholder="Search users..."
                    onChange={(e) => onSearch(e.target.value)}
                    size={{ base: "md", md: "lg" }}
                />
            </InputGroup>

            {/* Third line: Add User button */}
            <Flex justify={{ base: "flex-start", md: "flex-end" }}>
                <Button
                    colorPalette="accent"
                    rounded="xl"
                    onClick={onAddUser}
                    size={{ base: "md", md: "lg" }}
                    w={{ base: "full", md: "auto" }}
                >
                    <Add />
                    Add User
                </Button>
            </Flex>
        </VStack>
    )
}

export default UsersHeader;