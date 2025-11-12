// components/districts/components/DistrictsHeader.tsx
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
import UploadDistrictsFromFile from "../../../components/PortingFile"
import type { District } from "@/types/districts.type"

interface DistrictsHeaderProps {
    districts: District[]
    onAddDistrict: () => void
    onSearch: (value: string) => void
}

const DistrictsHeader = ({ districts, onAddDistrict, onSearch }: DistrictsHeaderProps) => {

    return (
        <Flex
            justify="space-between"
            align="center"
            pos="sticky"
            top={6}
            zIndex={"sticky"}
        >
            <HStack>
                <Heading size="3xl">Districts Data</Heading>
                <Badge colorPalette={"accent"}>{districts?.length}</Badge>
            </HStack>

            <HStack gap="4">
                <UploadDistrictsFromFile data={districts} />
                <InputGroup maxW="300px" colorPalette={"accent"} startElement={<SearchNormal1 />}>
                    <Input
                        bg="bg"
                        rounded="xl"
                        placeholder="Search districts..."
                        onChange={(e) => onSearch(e.target.value)}
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