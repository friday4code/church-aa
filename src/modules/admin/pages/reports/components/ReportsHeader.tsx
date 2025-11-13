"use client"

import { Flex, Heading, VStack, Text } from "@chakra-ui/react"

export const ReportsHeader = () => {
    return (
        <Flex justify="space-between" align="center">
            <VStack align="start" gap="1">
                <Heading size="3xl" color={{ base: "gray.800", _dark: "white" }}>
                    Reports Dashboard
                </Heading>
                <Text color={{ base: "gray.600", _dark: "gray.300" }} fontSize="lg">
                    Generate comprehensive attendance reports and analytics
                </Text>
            </VStack>
        </Flex>
    )
}

export default ReportsHeader
