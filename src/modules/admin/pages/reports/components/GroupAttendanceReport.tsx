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
import { Tooltip } from "@/components/ui/tooltip"
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

interface GroupAttendanceReportProps {
    statesCollection: Array<{ label: string; value: string }>
    regionsCollection: Array<{ label: string; value: string }>
    oldGroupsCollection: Array<{ label: string; value: string }>
    groupsCollection: Array<{ label: string; value: string }>
    yearsCollection: Array<{ label: string; value: string }>
    monthsCollection: Array<{ label: string; value: string }>
    onDownload: (data: ReportFormValues) => void
    isLoading?: boolean
    onDownloadNewComers?: (data: ReportFormValues) => void
    onDownloadTitheOffering?: (data: ReportFormValues) => void
    onDownloadConsolidated?: (data: ReportFormValues) => void
}

export const GroupAttendanceReport = ({
    statesCollection,
    regionsCollection,
    oldGroupsCollection,
    groupsCollection,
    yearsCollection,
    monthsCollection,
    onDownload,
    isLoading = false,
    onDownloadNewComers,
    onDownloadTitheOffering,
    onDownloadConsolidated,
}: GroupAttendanceReportProps) => {
    const { user: authUser } = useAuth()
    const { user } = useMe()
    console.log("user", user);
    
    const { getRoles } = useAuth()
    const userRoles = getRoles()
    const roleVisibility = useMemo(() => getRoleBasedVisibility(userRoles), [JSON.stringify(userRoles)])


    const form = useForm<ReportFormValues>({
        resolver: zodResolver(reportFiltersSchema),
        defaultValues: {
            state: "",
            region: "",
            group: roleVisibility.showGroup ? "" : ((authUser as any)?.group_id ? String((authUser as any).group_id) : ""),
            oldGroup: roleVisibility.showOldGroup ? "" : ((authUser as any)?.old_group_id ? String((authUser as any).old_group_id) : ""),
            year: "",
            month: "",
        },
    })

    const { setValue, trigger, watch } = form
    const watchedYear = watch('year')
    const watchedMonth = watch('month')
    const watchedFromMonth = watch('fromMonth')
    const watchedToMonth = watch('toMonth')
    const isValidYear = useMemo(() => {
        const yr = parseInt(String(watchedYear || ''), 10)
        return !!yr && !Number.isNaN(yr) && yr >= 1900 && yr <= 2100
    }, [watchedYear])
    const isValidRange = useMemo(() => {
        const from = parseInt(String(watchedFromMonth || ''), 10)
        const to = parseInt(String(watchedToMonth || ''), 10)
        return !!from && !!to && !Number.isNaN(from) && !Number.isNaN(to) && from >= 1 && from <= 12 && to >= 1 && to <= 12 && from <= to
    }, [watchedFromMonth, watchedToMonth])
    const isReady = isValidYear && isValidRange
    const disabledReason = useMemo(() => {
        if (!isValidYear) return "Select a valid year"
        if (!isValidRange) return "Select a valid month range"
        return ""
    }, [isValidYear, isValidRange])

    useEffect(() => {
        trigger('year')
        trigger('fromMonth')
        trigger('toMonth')
    }, [watchedYear, watchedFromMonth, watchedToMonth, trigger])

    // Auto-populate hidden fields with user data
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

        if (!roleVisibility.showOldGroup && user.old_group_id) {
            setValue('oldGroup', user.old_group_id.toString(), { shouldValidate: true })
            trigger('oldGroup')
        }

        if (!roleVisibility.showDistrict && user.district_id) {
            setValue('district', user.district_id.toString(), { shouldValidate: true })
            trigger('district')
        }

        const gid = (user as User | null)?.group_id
        if (gid) {
            setValue('group', gid.toString(), { shouldValidate: true })
            trigger('group')
        } else {
            // toaster.error({ description: "Group ID missing. Cannot generate group report.", closable: true })
        }

        if (!roleVisibility.showOldGroup && (user as any)?.old_group_id) {
            setValue('oldGroup', (user as any).old_group_id.toString(), { shouldValidate: true })
            trigger('oldGroup')
        }
    }, [user, roleVisibility, setValue, trigger])

    const handleSubmit = (data: ReportFormValues) => {
        console.log("submit:start", { year: data.year, month: data.month, fromMonth: data.fromMonth, toMonth: data.toMonth, group: data.group })
        const yr = parseInt(String(data.year || ""), 10)
        const fromMn = parseInt(String(data.fromMonth || ""), 10)
        const toMn = parseInt(String(data.toMonth || ""), 10)

        if (!yr || Number.isNaN(yr) || yr < 1900 || yr > 2100) {
            toaster.error({ description: "Select a valid year", closable: true })
            return
        }

        const hasValidRange = !!fromMn && !!toMn && !Number.isNaN(fromMn) && !Number.isNaN(toMn) && fromMn >= 1 && fromMn <= 12 && toMn >= 1 && toMn <= 12 && fromMn <= toMn

        if (!hasValidRange) {
            toaster.error({ description: "Select a valid month range", closable: true })
            return
        }
        const gid = (user as User | null)?.group_id
        if (!gid || (String(data.group) !== String(gid) && !user?.roles.includes("Super Admin"))) {
            toaster.error({ description: "Unauthorized group selection", closable: true })
            return
        }
        try {
            onDownload(data)
            console.log("submit:success")
        } catch (err) {
            const e = err as unknown as { name?: string; message?: string; stack?: string }
            console.error("submit:error", { name: e?.name, message: e?.message, stack: e?.stack })
            toaster.error({ description: "Failed to submit report request", closable: true })
        }
    }

    const handleInvalid = (errors: unknown) => {
        console.error("submit:invalid", errors)
        toaster.error({ description: "Validation failed. Please review your selections.", closable: true })
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
                    Group Attendance Report
                </Heading>
                <Text
                    color={{ base: "gray.600", _dark: "gray.400" }}
                    mt={1}
                >
                    Generate group-level attendance reports
                </Text>
            </Card.Header>
            <Card.Body>
                <form onSubmit={form.handleSubmit(handleSubmit, handleInvalid)}>
                    <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={{ base: 3, md: 4 }} mb={4}>
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
                        {roleVisibility.showRegion && (
                            <GridItem>
                                <CustomComboboxField
                                    form={form}
                                    name="region"
                                    label="Region"
                                    items={regionsCollection}
                                    placeholder="Type to search region"
                                    required
                                />
                            </GridItem>
                        )}

                        {roleVisibility.showOldGroup && (
                            <GridItem>
                                <CustomComboboxField
                                    form={form}
                                    name="oldGroup"
                                    label="Old Group"
                                    items={oldGroupsCollection}
                                    placeholder="Type to search old group"
                                    required
                                />
                            </GridItem>
                        )}

                        {roleVisibility.showGroup && (
                            <GridItem>
                                <CustomComboboxField
                                    form={form}
                                    name="group"
                                    label="Group"
                                    items={groupsCollection}
                                    placeholder="Type to search group"
                                    disabled={!groupsCollection}
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
                                placeholder="Start month"
                            />
                        </GridItem>
                        <GridItem>
                            <CustomComboboxField
                                form={form}
                                name="toMonth"
                                label="To Month"
                                items={monthsCollection}
                                placeholder="End month"
                            />
                        </GridItem>
                    </Grid>
                    <Flex justify="end">
                        <Tooltip content={disabledReason} disabled={isReady} >
                            <Button
                                w={{ base: "100%", md: "auto" }}
                                type="submit"
                                colorPalette="accent"
                                disabled={isLoading || !isReady}
                                aria-disabled={!isReady}
                                rounded="xl"
                                textWrap={"balance"}
                                onClick={() => console.log("download:click")}
                            >
                                <DocumentDownload size="20" />
                                Download Report
                            </Button>
                        </Tooltip>
                    </Flex>
                    <Flex flexDir={{ base: "column", md: "row" }} justify="end" mt="3" gap="3">
                        <Button
                            type="button"
                            colorPalette="accent"
                            variant="surface"
                            disabled={isLoading || !isReady}
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
                            disabled={isLoading || !isReady}
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
                            disabled={isLoading || !isReady}
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

export default GroupAttendanceReport
