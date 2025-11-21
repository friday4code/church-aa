"use client"

import { Box, Card, Flex, VStack, Text, Badge, Heading } from "@chakra-ui/react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, Tooltip } from "recharts"

interface MonthlyTrendChartProps {
    data: Array<{
        month: string
        attendance: number
        youth: number
    }>
}

export const MonthlyTrendCard = ({ data }: MonthlyTrendChartProps) => {
    return (
        <Card.Root bg="bg" border="1px" borderColor={{ base: "gray.200", _dark: "gray.700" }} rounded="xl">
            <Card.Header pb="4">
                <Flex justify="space-between" align="center">
                    <VStack align="start" gap="1">
                        <Heading size="lg" color={{ base: "gray.800", _dark: "white" }}>Monthly Trend</Heading>
                        <Text color={{ base: "gray.600", _dark: "gray.300" }}>
                            Attendance trends over time
                        </Text>
                    </VStack>
                    <Badge colorPalette="green" variant="subtle" fontSize="sm">
                        Last 6 Months
                    </Badge>
                </Flex>
            </Card.Header>

            <Card.Body pt="0">
                <Box width="100%" height="300px">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="month" fontSize={12} />
                            <YAxis fontSize={12} />
                            <Tooltip
                                formatter={(value) => [value.toLocaleString(), 'Attendance']}
                            />
                            <Legend />
                            <Bar
                                dataKey="attendance"
                                name="Total Attendance"
                                fill="#3182CE"
                                radius={[4, 4, 0, 0]}
                            />
                            <Bar
                                dataKey="youth"
                                name="Youth"
                                fill="#38A169"
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </Box>
            </Card.Body>
        </Card.Root>
    )
}

export default MonthlyTrendCard
