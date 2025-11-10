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

interface StatesHeaderProps {
    statesCount: number
    onAddState: () => void
    onSearch: (value: string) => void
}

const StatesHeader = ({ statesCount, onAddState, onSearch }: StatesHeaderProps) => {
    return (
        <Flex
            justify="space-between"
            align="center"
            pos="sticky"
            top={6}
            zIndex={"sticky"}
            backdropFilter={"blur(20px)"}
        >
            <HStack>
                <Heading size="3xl">All States</Heading>
                <Badge colorPalette={"accent"}>{statesCount}</Badge>
            </HStack>

            <HStack gap="4">
                <UploadStatesFromFile />
                <InputGroup bg="whiteAlpha.600" maxW="300px" colorPalette={"accent"} startElement={<SearchNormal1 />}>
                    <Input
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