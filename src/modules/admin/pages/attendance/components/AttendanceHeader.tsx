"use client"

import { Heading, HStack, Button, Badge, Flex, InputGroup, Input, CloseButton, VStack, IconButton, Drawer, Portal, Box } from "@chakra-ui/react"
import { Add, SearchNormal1, ArrowLeft3, MoreSquare } from "iconsax-reactjs"
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
        <>
            <VStack
                align="stretch"
                gap={{ base: 4, md: 6 }}
                pos="sticky"
                top={6}
                zIndex={"sticky"}
                backdropFilter={"blur(20px)"}
            >
                {/* First line: Go back button + title on left, drawer on right */}
                <Flex justify="space-between" align="center">
                    {/* Go back button */}
                    <HStack justify="flex-start">
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
                    </HStack>

                    {/* Mobile Drawer - only on mobile */}
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
                                            {/* Add Attendance Button */}
                                            <Button
                                                colorPalette="accent"
                                                rounded="xl"
                                                onClick={() => {
                                                    onAddAttendance()
                                                }}
                                                size="lg"
                                                width="full"
                                            >
                                                <Add />
                                                Add Attendance
                                            </Button>
                                        </VStack>
                                    </Drawer.Body>
                                </Drawer.Content>
                            </Drawer.Positioner>
                        </Portal>
                    </Drawer.Root>

                    {/* desktop Add Attendance Button */}
                    <Button
                        colorPalette="accent"
                        rounded="xl"
                        w="fit"
                        hideBelow={"md"}
                        onClick={() => {
                            onAddAttendance()
                        }}
                        size="lg"
                    >
                        <Add />
                        Add Attendance
                    </Button>

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

            </VStack>
        </>
    )
}

export default AttendanceHeader