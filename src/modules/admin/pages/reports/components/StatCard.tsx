"use client"

import { Box, Card, Flex, VStack, Text, Heading, Badge } from "@chakra-ui/react"

interface StatCardProps {
    title: string
    value: number | string
    icon: any
    color: string
    description?: string
    trend?: number
}

export const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
    description,
    trend
}: StatCardProps) => (
    <Card.Root
        bg={{ base: "white", _dark: "gray.800" }}
        border="1px"
        borderColor={{ base: "gray.200", _dark: "gray.700" }}
        rounded="xl"
        p="6"
        transition="all 0.2s"
        _hover={{
            transform: 'translateY(-2px)',
            shadow: 'lg',
            borderColor: `${color}.500`
        }}
    >
        <Card.Body p="0">
            <Flex justify="space-between" align="start">
                <VStack align="start" gap="2">
                    <Text fontSize="sm" color={{ base: "gray.600", _dark: "gray.400" }} fontWeight="medium">
                        {title}
                    </Text>
                    <Heading size="2xl" color={color}>
                        {typeof value === 'number' ? value.toLocaleString() : value}
                    </Heading>
                    {description && (
                        <Text fontSize="xs" color={{ base: "gray.500", _dark: "gray.500" }}>
                            {description}
                        </Text>
                    )}
                    {trend !== undefined && (
                        <Badge
                            colorPalette={trend >= 0 ? 'green' : 'red'}
                            variant="subtle"
                            fontSize="xs"
                        >
                            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
                        </Badge>
                    )}
                </VStack>
                <Box
                    p="3"
                    bg={`${color}.50`}
                    rounded="lg"
                    color={color}
                    _dark={{ bg: `${color}.900/20` }}
                >
                    <Icon size="20" />
                </Box>
            </Flex>
        </Card.Body>
    </Card.Root>
)

export default StatCard
