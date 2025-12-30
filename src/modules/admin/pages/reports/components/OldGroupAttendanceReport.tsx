"use client"

import { Heading, Text, Card, Grid, GridItem, Button, Flex } from "@chakra-ui/react"
import { DocumentDownload } from "iconsax-reactjs"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useEffect, useMemo } from "react"
import { useAuth } from "@/hooks/useAuth"
import { getRoleBasedVisibility } from "@/utils/roleHierarchy"
import CustomComboboxField from "./CustomComboboxField"
import type { ReportFormValues } from "./ReportFilters"
import { useMe } from "@/hooks/useMe"
import { toaster } from "@/components/ui/toaster"
import type { User } from "@/types/users.type"
import { useOldGroups } from "@/modules/admin/hooks/useOldGroup"

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
    onDownloadNewComers?: (data: ReportFormValues) => void
    onDownloadTitheOffering?: (data: ReportFormValues) => void
}

export const OldGroupAttendanceReport = ({
    statesCollection,
    regionsCollection,
    // oldGroupsCollection,
    yearsCollection,
    monthsCollection,
    onDownload,
    isLoading = false,
    onDownloadNewComers,
    onDownloadTitheOffering,
}: OldGroupAttendanceReportProps) => {
    const { user: authUser } = useAuth()
    const { user } = useMe()
    const { getRoles } = useAuth()
    const userRoles = getRoles()
    const { oldGroups = [] } = useOldGroups();
    const roleVisibility = useMemo(() => getRoleBasedVisibility(userRoles), [JSON.stringify(userRoles)])

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
    const oldGroupId = (user as User | null)?.old_group_id ?? null
    const oldGroupsCollection = oldGroupId ? [oldGroups.find((og) => String(og.id) === String(oldGroupId))].map((og) => ({ label: og?.name || "", value: String(og?.id || "") })) : []
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
        if (!oldGroupId) {
            toaster.error({ description: 'Old Group not available. Cannot load.', closable: true })
        } else {
            setValue('oldGroup', String(oldGroupId), { shouldValidate: true })
            trigger('oldGroup')
        }

        if (!roleVisibility.showOldGroup && (user as User | null)?.old_group_id) {
            setValue('oldGroup', (user as User).old_group_id?.toString(), { shouldValidate: true })
            trigger('oldGroup')
        }
    }, [user, roleVisibility, setValue, trigger, oldGroupId])

    const handleSubmit = (data: ReportFormValues) => {
        try {
            const ogid = (user as User | null)?.old_group_id
            if (!ogid || String(data.oldGroup) !== String(ogid)) {
                toaster.error({ description: 'Unauthorized old group selection', closable: true })
                return
            }
            onDownload(data)
        } catch (err) {
            const e = err as unknown as { name?: string; message?: string; stack?: string }
            toaster.error({ description: e?.message || 'Failed to submit old group report', closable: true })
        }
    }

    return (
        <Card.Root bg="bg" border="xs" borderColor={"border"} rounded="xl">
            <Card.Header>
                <Heading size="lg" color={{ base: "gray.900", _dark: "white" }}>Old Group Attendance Report</Heading>
                <Text color={{ base: "gray.600", _dark: "gray.400" }} mt={1}>Generate old group-level attendance reports</Text>
            </Card.Header>
            <Card.Body>
                <form onSubmit={form.handleSubmit(handleSubmit)}>
                    <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={{ base: 3, md: 4 }} mb={4}>
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
                                <CustomComboboxField form={form} name="oldGroup" label="Old Group" items={oldGroupsCollection} placeholder="Type to search old group" required disabled={!oldGroupsCollection} />
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
                        <Button w={{ base: "100%", md: "auto" }} type="submit" colorPalette="accent" disabled={isLoading} rounded="xl">
                            <DocumentDownload size="20" />
                            Download Report
                        </Button>
                    </Flex>
                    <Flex flexDir={{ base: "column", md: "row" }} justify="end" mt="3" gap="3">
                        <Button
                            type="button"
                            bg="accent.100"
                            color={{ base: "white", _dark: "gray.900" }}
                            _hover={{ bg: "accent.200" }}
                            disabled={isLoading}
                            rounded="xl"
                            onClick={() => onDownloadNewComers?.(form.getValues() as ReportFormValues)}
                        >
                            <DocumentDownload size="20" />
                            Download New Comers Report
                        </Button>
                        <Button
                            type="button"
                            bg="accent.100"
                            color={{ base: "white", _dark: "gray.900" }}
                            _hover={{ bg: "accent.200" }}
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

export default OldGroupAttendanceReport
