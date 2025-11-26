"use client"

import { Heading, Text, Card, Grid, GridItem, Button, Flex } from "@chakra-ui/react"
import { DocumentDownload } from "iconsax-reactjs"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { getRoleBasedVisibility } from "@/utils/roleHierarchy"
import CustomComboboxField from "./CustomComboboxField"
import type { ReportFormValues } from "./ReportFilters"
import { useMe } from "@/hooks/useMe"
import type { User } from "@/types/users.type"

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

interface OldGroupAttendanceReportProps {
    statesCollection: Array<{ label: string; value: string }>
    regionsCollection: Array<{ label: string; value: string }>
    oldGroupsCollection: Array<{ label: string; value: string }>
    yearsCollection: Array<{ label: string; value: string }>
    monthsCollection: Array<{ label: string; value: string }>
    onDownload: (data: ReportFormValues) => void
    isLoading?: boolean
}

export const OldGroupAttendanceReport = ({
    statesCollection,
    regionsCollection,
    oldGroupsCollection,
    yearsCollection,
    monthsCollection,
    onDownload,
    isLoading = false,
}: OldGroupAttendanceReportProps) => {
    const { user: authUser } = useAuth()
    const { user } = useMe()
    const { getRoles } = useAuth()
    const userRoles = getRoles()
    const roleVisibility = getRoleBasedVisibility(userRoles)

    const form = useForm<ReportFormValues>({
        resolver: zodResolver(reportFiltersSchema),
        defaultValues: {
            state: "",
            region: "",
            oldGroup: roleVisibility.showOldGroup ? "" : ((authUser as User | null)?.old_group_id ? String((authUser as User).old_group_id) : ""),
            year: "",
            fromMonth: "",
            toMonth: "",
        },
    })

    const { setValue, trigger } = form

    useEffect(() => {
        if (!user) return

        if (!roleVisibility.showState && user.state_id) {
            setValue('state', user.state_id.toString(), { shouldValidate: true })
            trigger('state')
        }

        if (!roleVisibility.showRegion && user.region_id) {
            setValue('region', user.region_id.toString(), { shouldValidate: true })
            trigger('region')
        }

        if (!roleVisibility.showOldGroup && (user as User | null)?.old_group_id) {
            setValue('oldGroup', (user as User).old_group_id!, { shouldValidate: true })
            trigger('oldGroup')
        }
    }, [user, roleVisibility, setValue, trigger])

    const handleSubmit = (data: ReportFormValues) => {
        onDownload(data)
    }

    return (
        <Card.Root bg="bg" border="xs" borderColor={"border"} rounded="xl">
            <Card.Header>
                <Heading size="lg" color={{ base: "gray.900", _dark: "white" }}>Old Group Attendance Report</Heading>
                <Text color={{ base: "gray.600", _dark: "gray.400" }} mt={1}>Generate old group-level attendance reports</Text>
            </Card.Header>
            <Card.Body>
                <form onSubmit={form.handleSubmit(handleSubmit)}>
                    <Grid templateColumns="repeat(4, 1fr)" gap="4" mb={4}>
                        {roleVisibility.showState && (
                            <GridItem>
                                <CustomComboboxField form={form} name="state" label="State" items={statesCollection} placeholder="Type to search state" required />
                            </GridItem>
                        )}
                        {roleVisibility.showRegion && (
                            <GridItem>
                                <CustomComboboxField form={form} name="region" label="Region" items={regionsCollection} placeholder="Type to search region" required />
                            </GridItem>
                        )}
                        {roleVisibility.showOldGroup && (
                            <GridItem>
                                <CustomComboboxField form={form} name="oldGroup" label="Old Group" items={oldGroupsCollection} placeholder="Type to search old group" required />
                            </GridItem>
                        )}
                        <GridItem>
                            <CustomComboboxField form={form} name="year" label="Year" items={yearsCollection} placeholder="Type to search year" required />
                        </GridItem>
                        <GridItem>
                            <CustomComboboxField form={form} name="fromMonth" label="From Month" items={monthsCollection} placeholder="Type to search month" required />
                        </GridItem>
                        <GridItem>
                            <CustomComboboxField form={form} name="toMonth" label="To Month" items={monthsCollection} placeholder="Type to search month" required />
                        </GridItem>
                    </Grid>
                    <Flex justify="end">
                        <Button type="submit" bg={{ base: "accent.100", _dark: "accent.200" }} color={{ base: "white", _dark: "gray.900" }} _hover={{ bg: { base: "accent.200", _dark: "accent.300" } }} disabled={isLoading} rounded="xl">
                            <DocumentDownload size="20" />
                            Download Report
                        </Button>
                    </Flex>
                </form>
            </Card.Body>
        </Card.Root>
    )
}

export default OldGroupAttendanceReport
