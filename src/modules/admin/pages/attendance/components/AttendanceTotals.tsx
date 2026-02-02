"use client"

import type { AttendanceTotals } from "@/utils/attendance.utils"
import {
    Card,
    HStack,
    VStack,
    Text,
    Span,
} from "@chakra-ui/react"

interface AttendanceTotalsProps {
    totals: AttendanceTotals
}

const AttendanceTotals = ({ totals }: AttendanceTotalsProps) => {
    return (
        <Card.Root bg={{ base: "bg", _dark: "gray.800" }} rounded="xl" border="1px" borderColor={{ base: "accent.200", _dark: "gray.700" }}>
            <Card.Body>
                <HStack justify="space-around" textAlign="center">
                    <VStack>
                        <Text fontWeight="bold" color={{ base: "accent.700", _dark: "accent.200" }}>Men</Text>
                        <Text fontSize="xl" fontWeight="bold" color={{ base: "gray.800", _dark: "white" }}>{totals.men}</Text>
                    </VStack>
                    <VStack>
                        <Text fontWeight="bold" color={{ base: "accent.700", _dark: "accent.200" }}>Women</Text>
                        <Text fontSize="xl" fontWeight="bold" color={{ base: "gray.800", _dark: "white" }}>{totals.women}</Text>
                    </VStack>
                    <VStack>
                        <Text fontWeight="bold" color={{ base: "accent.700", _dark: "accent.200" }}>Youth</Text>
                        <Text fontSize="xl" fontWeight="bold" color={{ base: "gray.800", _dark: "white" }}>{totals.youth_boys + totals.youth_girls}</Text>
                    </VStack>
                    <VStack>
                        <Text fontWeight="bold" color={{ base: "accent.700", _dark: "accent.200" }}>Children</Text>
                        <Text fontSize="xl" fontWeight="bold" color={{ base: "gray.800", _dark: "white" }}>{totals.children_boys + totals.children_girls}</Text>
                    </VStack>
                    <VStack>
                        <Text fontWeight="bold" color={{ base: "accent.700", _dark: "accent.200" }}>New Comers</Text>
                        <Text fontSize="xl" fontWeight="bold" color={{ base: "gray.800", _dark: "white" }}>{totals.new_comers}</Text>
                    </VStack>
                    <VStack>
                        <Text fontWeight="bold" color={{ base: "accent.700", _dark: "accent.200" }}>Tithe &amp; Offering</Text>
                        <Text fontSize="xl" fontWeight="bold" color={{ base: "gray.800", _dark: "white" }}><Span fontWeight={"normal"}>₦</Span>{totals.tithe_offering.toLocaleString()}</Text>
                    </VStack>
                    <VStack>
                        <Text fontWeight="bold" color={{ base: "accent.700", _dark: "accent.200" }}>Total</Text>
                        <Text fontSize="xl" fontWeight="bold" color={{ base: "gray.800", _dark: "white" }}>{totals.total}</Text>
                    </VStack>
                </HStack>
            </Card.Body>
        </Card.Root>
    )
}

export default AttendanceTotals