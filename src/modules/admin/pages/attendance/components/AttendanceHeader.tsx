"use client"

import {
    Heading,
    HStack,
    Button,
    Badge,
    Flex,
    InputGroup,
    Input
} from "@chakra-ui/react"
import { Add, SearchNormal1, ArrowLeft } from "iconsax-reactjs"
import type { Attendance } from "../../../stores/attendance.store"

interface AttendanceHeaderProps {
    serviceName: string
    serviceAttendances: Attendance[]
    onAddAttendance: () => void
    onSearch: (value: string) => void
    onNavigateBack: () => void
}

const AttendanceHeader = ({
    serviceName,
    serviceAttendances,
    onAddAttendance,
    onSearch,
    onNavigateBack
}: AttendanceHeaderProps) => {
    return (
        <>
            <Flex
                justify="space-between"
                align="center"
                pos="sticky"
                top={6}
                zIndex={"sticky"}
                backdropFilter={"blur(20px)"}
            >
                <HStack>
                    <HStack onClick={onNavigateBack} cursor="pointer" _hover={{ color: "accent" }}>
                        <ArrowLeft />
                        <Heading _hover={{ color: "accent" }} size="3xl">{serviceName}</Heading>
                    </HStack>
                    <Badge colorPalette={"accent"}>{serviceAttendances.length}</Badge>
                </HStack>

                <HStack gap="4">
                    <InputGroup maxW="300px" colorPalette={"accent"} startElement={<SearchNormal1 />}>
                        <Input
                            bg="bg"
                            rounded="xl"
                            placeholder="Search attendance..."
                            onChange={(e) => onSearch(e.target.value)}
                        />
                    </InputGroup>
                    <Button
                        colorPalette="accent"
                        rounded="xl"
                        onClick={onAddAttendance}
                    >
                        <Add />
                        Add Attendance
                    </Button>
                </HStack>
            </Flex>
        </>
    )
}

export default AttendanceHeader