"use client"

import { Heading, HStack, Button, Badge, Flex, InputGroup, Input, CloseButton, VStack, IconButton } from "@chakra-ui/react"
import { Add, SearchNormal1, ArrowLeft3 } from "iconsax-reactjs"
import type { Attendance } from "../../../stores/attendance.store"
import { useState, useCallback } from "react"
import { useNavigate } from "react-router"

interface AttendanceHeaderProps {
    serviceName: string
    serviceAttendances: Attendance[]
    onAddAttendance: () => void
    onSearch: (value: string) => void
    onNavigateBack?: () => void
}

const AttendanceHeader = ({
    serviceName,
    serviceAttendances,
    onAddAttendance,
    onSearch,
    onNavigateBack
}: AttendanceHeaderProps) => {
    const navigate = useNavigate()
    const [search, setSearch] = useState("")
    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value)
        onSearch(e.target.value)
    }, [onSearch])
    const clearSearch = useCallback(() => {
        setSearch("")
        onSearch("")
    }, [onSearch])

    const handleNavigateBack = useCallback(() => {
        if (onNavigateBack) {
            onNavigateBack()
        } else {
            navigate(-1)
        }
    }, [onNavigateBack, navigate])

    return (
        <VStack
            align="stretch"
            gap={{ base: 4, md: 6 }}
            pos="sticky"
            top={6}
            zIndex={"sticky"}
            backdropFilter={"blur(20px)"}
        >
            {/* First line: Go back button + title and count */}
            <Flex justify="flex-start" align="center">
                <IconButton 
                    aria-label="Go back" 
                    variant="outline" 
                    rounded="xl" 
                    onClick={handleNavigateBack}
                    size={{ base: "md", md: "lg" }}
                    mr={4}
                >
                    <ArrowLeft3 />
                </IconButton>
                <HStack>
                    <Heading size={{ base: "2xl", md: "3xl" }}>{serviceName}</Heading>
                    <Badge colorPalette={"accent"} fontSize={{ base: "md", md: "lg" }}>{serviceAttendances.length}</Badge>
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
                    placeholder="Search attendance..."
                    value={search}
                    onChange={handleChange}
                    size={{ base: "md", md: "lg" }}
                />
            </InputGroup>

            {/* Third line: Add Attendance button */}
            <Button
                colorPalette="accent"
                rounded="xl"
                onClick={onAddAttendance}
                size={{ base: "md", md: "lg" }}
                w="full"
            >
                <Add />
                Add Attendance
            </Button>
        </VStack>
    )
}

export default AttendanceHeader