"use client"

import {
    Heading,
    HStack,
    Button,
    Badge,
    Flex,
    InputGroup,
    Input,
} from "@chakra-ui/react"
import { Add, ArrowLeft, SearchNormal1 } from "iconsax-reactjs"
import { useNavigate } from "react-router"

interface UsersHeaderProps {
    users: any[]
    onAddUser: () => void
    onSearch: (value: string) => void
}

const UsersHeader = ({ users, onAddUser, onSearch }: UsersHeaderProps) => {
    const navigate = useNavigate();
    return (
        <Flex
            justify="space-between"
            align="center"
            pos="sticky"
            top={6}
            zIndex={"sticky"}
        >
            <HStack>
                <HStack onClick={() => navigate(-1)} cursor={"pointer"} _hover={{ color: "accent" }}>
                    <ArrowLeft />
                    <Heading _hover={{ color: "accent" }} size="3xl">Users Data</Heading>
                </HStack>
                <Badge colorPalette={"accent"}>{users?.length}</Badge>
            </HStack>

            <HStack gap="4">
                <InputGroup maxW="300px" colorPalette={"accent"} startElement={<SearchNormal1 />}>
                    <Input
                        bg="bg"
                        rounded="xl"
                        placeholder="Search users..."
                        onChange={(e) => onSearch(e.target.value)}
                    />
                </InputGroup>
                <Button
                    colorPalette="accent"
                    rounded="xl"
                    onClick={onAddUser}
                >
                    <Add />
                    Add User
                </Button>
            </HStack>
        </Flex>
    )
}

export default UsersHeader;