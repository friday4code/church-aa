"use client"

import { Heading, Text, Card, Grid, GridItem, Button, Flex } from "@chakra-ui/react"
import { DocumentDownload } from "iconsax-reactjs"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import CustomComboboxField from "./CustomComboboxField"
import type { ReportFormValues } from "./ReportFilters"

const reportFiltersSchema = z.object({
    year: z.string().optional(),
    month: z.string().optional(),
    fromMonth: z.string().optional(),
    toMonth: z.string().optional(),
    state: z.string().optional(),
    region: z.string().optional(),
    district: z.string().optional(),
    group: z.string().optional(),
    oldGroup: z.string().optional(),
})

interface StateAttendanceReportProps {
    statesCollection: Array<{ label: string; value: string }>
    yearsCollection: Array<{ label: string; value: string }>
    monthsCollection: Array<{ label: string; value: string }>
    onDownload: (data: ReportFormValues) => void
    isLoading?: boolean
}

export const StateAttendanceReport = ({
    statesCollection,
    yearsCollection,
    monthsCollection,
    onDownload,
    isLoading = false,
}: StateAttendanceReportProps) => {
    const form = useForm<ReportFormValues>({
        resolver: zodResolver(reportFiltersSchema),
        defaultValues: {
            state: "",
            year: "",
            fromMonth: "",
            toMonth: "",
        },
    })

    const handleSubmit = (data: ReportFormValues) => {
        onDownload(data)
    }

    return (
        <Card.Root
            bg={{ base: "white", _dark: "gray.800" }}
            border="1px"
            borderColor={{ base: "gray.200", _dark: "gray.700" }}
            rounded="xl"
        >
            <Card.Header>
                <Heading
                    size="lg"
                    color={{ base: "gray.900", _dark: "white" }}
                >
                    State Attendance Report
                </Heading>
                <Text
                    color={{ base: "gray.600", _dark: "gray.400" }}
                    mt={1}
                >
                    Generate state-level attendance reports
                </Text>
            </Card.Header>
            <Card.Body>
                <form onSubmit={form.handleSubmit(handleSubmit)}>
                    <Grid templateColumns="repeat(4, 1fr)" gap="4" mb={4}>
                        <GridItem>
                            <CustomComboboxField
                                form={form}
                                name="state"
                                label="State"
                                items={statesCollection}
                                placeholder="Type to search state"
                                required
                            />
                        </GridItem>
                        <GridItem>
                            <CustomComboboxField
                                form={form}
                                name="year"
                                label="Year"
                                items={yearsCollection}
                                placeholder="Type to search year"
                                required
                            />
                        </GridItem>
                        <GridItem>
                            <CustomComboboxField
                                form={form}
                                name="fromMonth"
                                label="From Month"
                                items={monthsCollection}
                                placeholder="Type to search month"
                                required
                            />
                        </GridItem>
                        <GridItem>
                            <CustomComboboxField
                                form={form}
                                name="toMonth"
                                label="To Month"
                                items={monthsCollection}
                                placeholder="Type to search month"
                                required
                            />
                        </GridItem>
                    </Grid>
                    <Flex justify="end">
                        <Button
                            type="submit"
                            bg={{ base: "accent.100", _dark: "accent.200" }}
                            color={{ base: "white", _dark: "gray.900" }}
                            _hover={{ bg: { base: "accent.200", _dark: "accent.300" } }}
                            disabled={isLoading}
                            rounded="xl"
                        >
                            <DocumentDownload size="20" />
                            Download Report
                        </Button>
                    </Flex>
                </form>
            </Card.Body>
        </Card.Root>
    )
}

export default StateAttendanceReport
