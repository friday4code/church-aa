"use client"

import { Heading, Text, Card, Grid, GridItem, Button, Flex } from "@chakra-ui/react"
import { DocumentDownload } from "iconsax-reactjs"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useEffect, useMemo, useState } from "react"
import { getRoleBasedVisibility } from "@/utils/roleHierarchy"
import CustomComboboxField from "./CustomComboboxField"
import type { ReportFormValues } from "./ReportFilters"
import { useAuth } from "@/hooks/useAuth"
import { useMe } from "@/hooks/useMe"
import { adminApi } from "@/api/admin.api"
import { toaster } from "@/components/ui/toaster"
import { useStates } from "@/modules/admin/hooks/useState"
import { resolveStateIdFromValue } from "./regionFilters"

/**
 * Resolve a state ID from a combobox value.
 * The value may be a numeric string (ID) or an exact state name.
 * Returns 0 when not resolvable.
 * Example: "3" -> 3, "Rivers Central" -> state.id, "" -> 0
 */
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

interface RegionAttendanceReportProps {
    statesCollection: Array<{ label: string; value: string }>
    regionsCollection: Array<{ label: string; value: string }>
    yearsCollection: Array<{ label: string; value: string }>
    monthsCollection: Array<{ label: string; value: string }>
    onDownload: (data: ReportFormValues) => void
    isLoading?: boolean
    onDownloadNewComers?: (data: ReportFormValues) => void
    onDownloadTitheOffering?: (data: ReportFormValues) => void
}

export const RegionAttendanceReport = ({
    statesCollection,
    regionsCollection,
    yearsCollection,
    monthsCollection,
    onDownload,
    isLoading = false,
    onDownloadNewComers,
    onDownloadTitheOffering,
}: RegionAttendanceReportProps) => {
    const { user: authUser } = useAuth()
    const { user } = useMe()
    const { getRoles } = useAuth()
    const userRoles = getRoles()
    const roleVisibility = useMemo(() => getRoleBasedVisibility(userRoles), [JSON.stringify(userRoles)])

    const form = useForm<ReportFormValues>({
        resolver: zodResolver(reportFiltersSchema),
        defaultValues: {
            state: "",
            region: roleVisibility.showRegion ? "" : (authUser?.region_id ? String(authUser.region_id) : ""),
            year: "",
            fromMonth: "",
            toMonth: "",
        },
    })

    const { setValue, trigger, watch } = form
    const [regionItems, setRegionItems] = useState<Array<{ label: string; value: string }>>([])
    const [regionsLoading, setRegionsLoading] = useState(false)
    const watchedState = watch('state')
    const { states } = useStates()

    useEffect(() => {
        const selectedStateId = resolveStateIdFromValue(watchedState as string, (states || []).map(s => ({ id: s.id, name: s.name || s.stateName } as { id: number; name: string })))
        setRegionItems([])
        setValue('region', '', { shouldValidate: true })
        if (!selectedStateId) return
        setRegionsLoading(true)
        adminApi.getRegionsByStateId(selectedStateId)
            .then((list) => {
                setRegionItems(list.map(r => ({ label: r.name, value: String(r.id) })))
            })
            .catch((err) => {
                toaster.create({ title: 'Failed to load regions', description: err?.message || 'Please try again', type: 'error' })
                setRegionItems([])
            })
            .finally(() => setRegionsLoading(false))
    }, [watchedState, setValue, states])

    // Auto-populate hidden fields with user data
    useEffect(() => {
        if (!user) return

        if (!roleVisibility.showState && user.state_id) {
            setValue('state', String(user.state_id), { shouldValidate: true })
            trigger('state')
        }

        if (!roleVisibility.showRegion && user.region_id) {
            setValue('region', String(user.region_id), { shouldValidate: true })
            trigger('region')
        }
    }, [user, roleVisibility, setValue, trigger])

    const handleSubmit = (data: ReportFormValues) => {
        onDownload(data)
    }

    return (
        <Card.Root
            bg="bg"
            border="xs"
            borderColor="border"
            rounded="xl"
        >
            <Card.Header>
                <Heading
                    size="lg"
                    color={{ base: "gray.900", _dark: "white" }}
                >
                    Region Attendance Report
                </Heading>
                <Text
                    color={{ base: "gray.600", _dark: "gray.400" }}
                    mt={1}
                >
                    Generate region-level attendance reports
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
                        {roleVisibility.showRegion && (
                            <GridItem>
                                <CustomComboboxField
                                    form={form}
                                    name="region"
                                    label="Region"
                                    items={regionItems.length ? regionItems : regionsCollection}
                                    placeholder="Type to search region"
                                    required
                                    disabled={!watchedState || regionsLoading}
                                    isLoading={regionsLoading}
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

export default RegionAttendanceReport
