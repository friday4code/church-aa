"use client"

import { Heading, Text, Card, Grid, GridItem, Button, Flex } from "@chakra-ui/react"
import { DocumentDownload } from "iconsax-reactjs"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useEffect, useMemo } from "react"
import { getRoleBasedVisibility } from "@/utils/roleHierarchy"
import CustomComboboxField from "./CustomComboboxField"
import type { ReportFormValues } from "./ReportFilters"
import { useMe } from "@/hooks/useMe"
import { useAuth } from "@/hooks/useAuth"

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
    onDownloadNewComers?: (data: ReportFormValues) => void
    onDownloadTitheOffering?: (data: ReportFormValues) => void
    onDownloadConsolidated?: (data: ReportFormValues) => void
}

export const StateAttendanceReport = ({
    statesCollection,
    yearsCollection,
    monthsCollection,
    onDownload,
    isLoading = false,
    onDownloadNewComers,
    onDownloadTitheOffering,
}: StateAttendanceReportProps) => {
    const { user } = useMe()
    const { getRoles } = useAuth()
    const userRoles = getRoles()
    const roleVisibility = useMemo(() => getRoleBasedVisibility(userRoles), [JSON.stringify(userRoles)])

    const form = useForm<ReportFormValues>({
        resolver: zodResolver(reportFiltersSchema),
        defaultValues: {
            state: "",
            year: "",
            fromMonth: "",
            toMonth: "",
        },
    })

    const { setValue, trigger } = form

    // Auto-populate hidden fields with user data
    useEffect(() => {
        if (!user) return

        if (!roleVisibility.showState && user.state_id) {
            setValue('state', user.state_id.toString(), { shouldValidate: true })
            trigger('state')
        }
    }, [user, roleVisibility, setValue, trigger])

    const handleSubmit = (data: ReportFormValues) => {
        console.log("data",data)
        onDownload(data)
    }

    return (
        <Card.Root
            bg="bg"
            border="xs"
            borderColor={"border"}
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
                    <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={{ base: 3, md: 4 }} mb={4}>
                        {roleVisibility.showState && (
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
                        )}
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
                            colorPalette="accent"
                            disabled={isLoading}
                            rounded="xl"
                            w={{ base: "100%", md: "auto" }}
                        >
                            <DocumentDownload size="20" />
                            Download Report
                        </Button>
                    </Flex>
                    <Flex flexDir={{ base: "column", md: "row" }} justify="end" mt="3" gap="3">
                        <Button
                            type="button"
                            colorPalette="accent"
                            variant="surface"
                            disabled={isLoading}
                            rounded="xl"
                            onClick={() => onDownloadConsolidated?.(form.getValues() as ReportFormValues)}
                        >
                            <DocumentDownload size="20" />
                            Download Consolidated Report
                        </Button>
                        <Button
                            type="button"
                            colorPalette="accent"
                            variant="surface"
                            disabled={isLoading}
                            rounded="xl"
                            onClick={() => onDownloadNewComers?.(form.getValues() as ReportFormValues)}
                        >
                            <DocumentDownload size="20" />
                            Download New Comers Report
                        </Button>
                        <Button
                            type="button"
                            colorPalette="accent"
                            variant="surface"
                            disabled={isLoading}
                            rounded="xl"
                            onClick={() => onDownloadTitheOffering?.(form.getValues() as ReportFormValues)}
                        >
                            <DocumentDownload size="20" />
                            Download Tithe & Offering Report
                        </Button>
                    </Flex>
                </form>
            </Card.Body>
        </Card.Root>
    )
}

export default StateAttendanceReport
