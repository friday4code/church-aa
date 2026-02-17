"use client"

import { Heading, Text, Card, Grid, GridItem, Button, Flex } from "@chakra-ui/react"
import { DocumentDownload } from "iconsax-reactjs"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { getRoleBasedVisibility, getRoleBasedVisibilityFromAny } from "@/utils/roleHierarchy"
import CustomComboboxField from "./CustomComboboxField"
import type { ReportFormValues } from "./ReportFilters"
import { useMe } from "@/hooks/useMe"
import type { User } from "@/types/users.type"
import { toaster } from "@/components/ui/toaster"
import { useDistricts } from "@/modules/admin/hooks/useDistrict"
import { adminApi } from "@/api/admin.api"
import { getRoleNames } from "@/utils/role.utils";



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

interface DistrictAttendanceReportProps {
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

export const DistrictAttendanceReport = ({
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
}: DistrictAttendanceReportProps) => {
    const { user } = useMe()
    // const { getRoles } = useAuth()
    const {  user: authUser } = useAuth();
    // const userRoles = getRoles()
    const userRoles = useMemo(() => {
        if (!authUser?.roles) return [];
        // If roles are Role objects, extract names; if they're strings, use as is
        return authUser.roles.map(role => {
            if (typeof role === 'object' && role !== null && 'name' in role) {
                return role.name;
            }
            return String(role);
        });
    }, [authUser]);
    const { districts } = useDistricts();
    // const roleVisibility = useMemo(() => getRoleBasedVisibility(userRoles), [JSON.stringify(userRoles)])
    const roleVisibility = useMemo(() => getRoleBasedVisibilityFromAny(userRoles), [userRoles]);
    const form = useForm<ReportFormValues>({
        resolver: zodResolver(reportFiltersSchema),
        defaultValues: {
            state: "",
            region: "",
            district: roleVisibility.showDistrict ? "" : ((user as User | null)?.district_id?.toString() ? String((user as User).district_id) : ""),
            group: roleVisibility.showGroup ? "" : ((user as User | null)?.group_id?.toString() ? String((user as User).group_id) : ""),
            year: "",
            fromMonth: "",
            toMonth: "",
        },
    })

    const districtsCollection = useMemo(() => {
        const did = (user as User | null)?.district_id
        const data = districts.find(item => Number(item.id) === Number(did));
        return did ? [{ label: data?.name || "", value: String(did) }] : []
    }, [user, districts])

    const { setValue, trigger, watch } = form
    const [districtItems, setDistrictItems] = useState<Array<{ label: string; value: string }>>([])
    const [districtsLoading, setDistrictsLoading] = useState(false)
    const watchedGroup = watch('group')

    useEffect(() => {
        if (!watchedGroup) {
            setDistrictItems([])
            if (roleVisibility.showDistrict) setValue('district', '')
            return
        }

        if (!roleVisibility.showDistrict) return

        setDistrictsLoading(true)
        const groupId = parseInt(watchedGroup, 10)
        if (isNaN(groupId)) {
            setDistrictsLoading(false)
            return
        }

        adminApi.getDistrictsByGroupId(groupId)
            .then((list) => {
                setDistrictItems(list.map(d => ({ label: d.name, value: String(d.id) })))
            })
            .catch((err) => {
                toaster.create({ title: 'Failed to load districts', description: err?.message || 'Please try again', type: 'error' })
                setDistrictItems([])
            })
            .finally(() => setDistrictsLoading(false))
    }, [watchedGroup, roleVisibility.showDistrict, setValue])

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

        if (!roleVisibility.showGroup && (user as User | null)?.group_id) {
            setValue('group', (user as User).group_id!.toString(), { shouldValidate: true })
            trigger('group')
        }
    }, [user, roleVisibility, setValue, trigger])

    const handleSubmit = (data: ReportFormValues) => {
        const did = (user as User | null)?.district_id
        if (did && String(data.district) !== String(did)) {
            toaster.error({ description: 'Unauthorized district selection', closable: true })
            return
        }
        onDownload(data)
    }

    return (
        <Card.Root bg="bg" border="xs" borderColor={"border"} rounded="xl">
            <Card.Header>
                <Heading size="lg" color={{ base: "gray.900", _dark: "white" }}>District Attendance Report</Heading>
                <Text color={{ base: "gray.600", _dark: "gray.400" }} mt={1}>Generate district-level attendance reports</Text>
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
                                <CustomComboboxField form={form} name="group" label="Group" items={groupsCollection} placeholder="Type to search group" required />
                            </GridItem>
                        )}

                        {roleVisibility.showDistrict && (
                            <GridItem>
                                <CustomComboboxField
                                    form={form}
                                    name="district"
                                    label="District"
                                    items={districtItems.length ? districtItems : districtsCollection}
                                    placeholder="Type to search district"
                                    disabled={!watchedGroup || districtsLoading}
                                    isLoading={districtsLoading}
                                    required
                                />
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
                        <Button w={{ base: "100%", md: "auto" }} type="submit" colorPalette="accent" disabled={isLoading} rounded="xl" textWrap="balance">
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
                            textWrap="balance"
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
                            textWrap="balance"
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
                            textWrap="balance"
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

export default DistrictAttendanceReport
