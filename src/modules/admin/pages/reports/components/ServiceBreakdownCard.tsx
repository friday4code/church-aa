"use client"

import { Box, Flex, VStack, Text, Badge, HStack } from "@chakra-ui/react"

interface ServiceBreakdownProps {
    data: Array<{
        name: string
        value: number
        color: string
    }>
}

export const ServiceBreakdownCard = ({ data }: ServiceBreakdownProps) => {
    type Palette = 'blue' | 'green' | 'purple' | 'orange' | 'red'
    return (
        <VStack align="start" gap="4">
            <Text fontSize="lg" fontWeight="medium" color={{ base: "gray.700", _dark: "gray.200" }}>
                Service Breakdown
            </Text>

            <VStack align="start" gap="3" w="full">
                {data.map((item) => (
                    <Flex key={item.name} justify="space-between" align="center" w="full">
                        <HStack gap="3">
                            <Box
                                w="3"
                                h="3"
                                rounded="full"
                                bg={item.color.replace('.solid', '.500')}
                            />
                            <Text fontSize="sm" color={{ base: "gray.700", _dark: "gray.300" }}>
                                {item.name}
                            </Text>
                        </HStack>
                        <Badge
                            variant="subtle"
                            colorPalette={item.color.split('.')[0] as Palette}
                        >
                            {item.value}
                        </Badge>
                    </Flex>
                ))}
            </VStack>
        </VStack>
    )
}

export default ServiceBreakdownCard
