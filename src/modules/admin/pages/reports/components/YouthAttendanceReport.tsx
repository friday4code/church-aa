"use client"

import { Heading, Text, Card, Grid, GridItem, Button, Flex } from "@chakra-ui/react"
import { DocumentDownload } from "iconsax-reactjs"
import { useForm } from "react-hook-form"
import { useEffect, useState } from "react"
import { adminApi } from "@/api/admin.api"
import { toaster } from "@/components/ui/toaster"
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

interface YouthAttendanceReportProps {
    statesCollection: Array<{ label: string; value: string }>
    regionsCollection: Array<{ label: string; value: string }>
    yearsCollection: Array<{ label: string; value: string }>
    monthsCollection: Array<{ label: string; value: string }>
    onDownload: (data: ReportFormValues) => void
    isLoading?: boolean
}

export const YouthAttendanceReport = ({
    statesCollection,
    regionsCollection,
    yearsCollection,
    monthsCollection,
    onDownload,
    isLoading = false,
}: YouthAttendanceReportProps) => {
    const form = useForm<ReportFormValues>({
        resolver: zodResolver(reportFiltersSchema),
        defaultValues: {
            state: "",
            region: "",
            year: "",
            month: "",
        },
    })

    const [regionItems, setRegionItems] = useState<Array<{ label: string; value: string }>>([])
    const [regionsLoading, setRegionsLoading] = useState(false)
    const [regionDisabled, setRegionDisabled] = useState(true)

    const selectedState = form.watch("state")

    useEffect(() => {
        const sid = parseInt(selectedState || "", 10)
        if (!Number.isFinite(sid) || sid <= 0) {
            setRegionItems([])
            setRegionDisabled(true)
            form.setValue("region", "")
            return
        }
        setRegionsLoading(true)
        adminApi.getRegionsByStateId(sid)
            .then((data) => {
                const items = (data || []).map((r) => ({ label: r.name, value: String(r.id) }))
                setRegionItems(items)
                setRegionDisabled(false)
            })
            .catch(() => {
                setRegionItems([])
                setRegionDisabled(true)
                form.setValue("region", "")
                toaster.error({ description: "Failed to load regions for selected state", closable: true })
            })
            .finally(() => setRegionsLoading(false))
    }, [selectedState, form])

    const handleSubmit = (data: ReportFormValues) => {
        onDownload(data)
    }

    return (
        <Card.Root
            bg="bg"
            border="1px"
            borderColor="border"
            rounded="xl"
        >
            <Card.Header>
                <Heading
                    size="lg"
                    color={{ base: "gray.900", _dark: "white" }}
                >
                    Youth Attendance Report
                </Heading>
                <Text
                    color={{ base: "gray.600", _dark: "gray.400" }}
                    mt={1}
                >
                    Generate youth ministry attendance reports
                </Text>
            </Card.Header>
            <Card.Body>
                <form onSubmit={form.handleSubmit(handleSubmit)}>
                    <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={{ base: 3, md: 4 }} mb={4}>
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
                                name="region"
                                label="Region"
                                items={regionItems}
                                placeholder={regionDisabled ? "Select a state first" : "Type to search region"}
                                required
                                disabled={regionDisabled || isLoading}
                                isLoading={regionsLoading}
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
                                name="month"
                                label="Month"
                                items={monthsCollection}
                                placeholder="Type to search month"
                                required
                            />
                        </GridItem>
                    </Grid>
                    <Flex justify="end">
                        <Button
                            type="submit"
                            colorPalette="accent"
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

export default YouthAttendanceReport
