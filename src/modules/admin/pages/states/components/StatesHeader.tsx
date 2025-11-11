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
import { Add, SearchNormal1 } from "iconsax-reactjs"
import UploadStatesFromFile from "../../../components/PortingFile"
import type { State } from "@/types/states.type"

interface StatesHeaderProps {
    states: State[]
    onAddState: () => void
    onSearch: (value: string) => void
}

const StatesHeader = ({ states, onAddState, onSearch }: StatesHeaderProps) => {
    
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
                <Heading size="3xl">All States</Heading>
                <Badge colorPalette={"accent"}>{states?.length}</Badge>
            </HStack>

            <HStack gap="4">
                <UploadStatesFromFile data={states} />
                <InputGroup maxW="300px" colorPalette={"accent"} startElement={<SearchNormal1 />}>
                    <Input
                        bg="bg"
                        rounded="xl"
                        placeholder="Search states..."
                        onChange={(e) => onSearch(e.target.value)}
                    />
                </InputGroup>
                <Button
                    colorPalette="accent"
                    rounded="xl"
                    onClick={onAddState}
                >
                    <Add />
                    Add State
                </Button>
            </HStack>
        </Flex>
    )
}

export default StatesHeader;