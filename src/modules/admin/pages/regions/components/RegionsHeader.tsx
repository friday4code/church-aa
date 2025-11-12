// components/regions/components/RegionsHeader.tsx
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
import UploadRegionsFromFile from "./UploadRegions"
import type { Region } from "@/types/regions.type"

interface RegionsHeaderProps {
    regions: Region[]
    onAddRegion: () => void
    onSearch: (value: string) => void
}

const RegionsHeader = ({ regions, onAddRegion, onSearch }: RegionsHeaderProps) => {

    return (
        <Flex
            justify="space-between"
            align="center"
            pos="sticky"
            top={6}
            zIndex={"sticky"}
        >
            <HStack>
                <Heading size="3xl">All Regions</Heading>
                <Badge colorPalette={"accent"}>{regions?.length}</Badge>
            </HStack>

            <HStack gap="4">
                <UploadRegionsFromFile data={regions} />
                <InputGroup maxW="300px" colorPalette={"accent"} startElement={<SearchNormal1 />}>
                    <Input
                        bg="bg"
                        rounded="xl"
                        placeholder="Search regions..."
                        onChange={(e) => onSearch(e.target.value)}
                    />
                </InputGroup>
                <Button
                    colorPalette="accent"
                    rounded="xl"
                    onClick={onAddRegion}
                >
                    <Add />
                    Add Region
                </Button>
            </HStack>
        </Flex>
    )
}

export default RegionsHeader;