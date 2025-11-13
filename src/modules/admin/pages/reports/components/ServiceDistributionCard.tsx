"use client"

import { Box, Card, Flex, VStack, Text, Badge, Heading } from "@chakra-ui/react"
import { Chart, useChart } from "@chakra-ui/charts"
import { Cell, Label, Pie, PieChart, Tooltip } from "recharts"

interface ServiceDistributionChartProps {
    data: Array<{
        name: string
        value: number
        color: string
    }>
}

export const ServiceDistributionCard = ({ data }: ServiceDistributionChartProps) => {
    const chart = useChart({
        data: data,
    })

    const totalRecords = data.reduce((sum, item) => sum + item.value, 0)

    return (
        <Card.Root bg={{ base: "white", _dark: "gray.800" }} border="1px" borderColor={{ base: "gray.200", _dark: "gray.700" }} rounded="xl">
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
                <Box display="flex" justifyContent="center" alignItems="center">
                    <Chart.Root boxSize="200px" chart={chart} mx="auto">
                        <PieChart>
                            <Tooltip
                                cursor={false}
                                animationDuration={100}
                                content={<Chart.Tooltip hideLabel />}
                            />
                            <Pie
                                innerRadius={60}
                                outerRadius={80}
                                isAnimationActive={true}
                                animationDuration={500}
                                data={chart.data}
                                dataKey={chart.key("value")}
                                nameKey="name"
                            >
                                <Label
                                    content={({ viewBox }) => (
                                        <Chart.RadialText
                                            viewBox={viewBox}
                                            title={totalRecords.toLocaleString()}
                                            description="total records"
                                        />
                                    )}
                                />
                                {chart.data.map((item) => (
                                    <Cell key={item.color} fill={chart.color(item.color)} />
                                ))}
                            </Pie>
                        </PieChart>
                    </Chart.Root>
                </Box>
            </Card.Body>
        </Card.Root>
    )
}

export default ServiceDistributionCard
