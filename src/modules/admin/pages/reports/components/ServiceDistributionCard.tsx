"use client"

import { Box, Card, Flex, VStack, Text, Badge, Heading } from "@chakra-ui/react"
import { Cell, Label, Pie, PieChart, Tooltip, ResponsiveContainer } from "recharts"

interface ServiceDistributionChartProps {
    data: Array<{
        name: string
        value: number
        color: string
    }>
}

export const ServiceDistributionCard = ({ data }: ServiceDistributionChartProps) => {
    const totalRecords = data.reduce((sum, item) => sum + item.value, 0)

    const colorMap: Record<string, string> = {
        "blue.solid": "#3182CE",
        "green.solid": "#38A169",
        "purple.solid": "#805AD5",
        "orange.solid": "#DD6B20",
        "red.solid": "#E53E3E",
    }

    return (
        <Card.Root bg="bg" border="1px" borderColor={{ base: "gray.200", _dark: "gray.700" }} rounded="xl">
            <Card.Header pb="4">
                <Flex justify="space-between" align="center">
                    <VStack align="start" gap="1">
                        <Heading size="lg" color={{ base: "gray.800", _dark: "white" }}>Service Distribution</Heading>
                        <Text color={{ base: "gray.600", _dark: "gray.300" }}>
                            Records by service type
                        </Text>
                    </VStack>
                    <Badge colorPalette="blue" variant="subtle" fontSize="sm">
                        All Time
                    </Badge>
                </Flex>
            </Card.Header>

            <Card.Body pt="0">
                <Box display="flex" justifyContent="center" alignItems="center" width="100%" height="220px">
                    <ResponsiveContainer width="200px" height="200px">
                        <PieChart>
                            <Tooltip cursor={false} animationDuration={100} />
                            <Pie innerRadius={60} outerRadius={80} isAnimationActive={true} animationDuration={500} data={data} dataKey="value" nameKey="name">
                                <Label content={({ viewBox }: { viewBox: { cx: number; cy: number } }) => {
                                    const { cx, cy } = viewBox
                                    return (
                                        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fill="#4A5568">
                                            <tspan fontSize="18" fontWeight="600">{totalRecords.toLocaleString()}</tspan>
                                            <tspan x={cx} dy="20" fontSize="12" fill="#718096">total records</tspan>
                                        </text>
                                    )
                                }} />
                                {data.map((item) => (
                                    <Cell key={item.name} fill={colorMap[item.color] || item.color} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                </Box>
            </Card.Body>
        </Card.Root>
    )
}

export default ServiceDistributionCard
