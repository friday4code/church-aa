"use client"

import { Box, Button, Grid, SimpleGrid } from "@chakra-ui/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import CustomComboboxField from "./CustomComboboxField"
import { z } from "zod"
import { useRegions } from "@/modules/admin/hooks/useRegion"
import { useStates } from "@/modules/admin/hooks/useState"
import { useDistricts } from "@/modules/admin/hooks/useDistrict"
import { useGroups } from "@/modules/admin/hooks/useGroup"
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

export type ReportFormValues = z.infer<typeof reportFiltersSchema>

interface ReportFiltersProps {
    onFiltersChange: (filters: ReportFormValues) => void
    isLoading?: boolean
}

export const ReportFilters = ({ onFiltersChange, isLoading = false }: ReportFiltersProps) => {
    const { states = [] } = useStates()
    const { regions = [] } = useRegions()
    const { districts = [] } = useDistricts()
    const { groups = [] } = useGroups()
    const { oldGroups = [] } = useOldGroups()

    const form = useForm<ReportFormValues>({
        resolver: zodResolver(reportFiltersSchema),
        defaultValues: {
            year: "",
            month: "",
            fromMonth: "",
            toMonth: "",
            state: "",
            region: "",
            district: "",
            group: "",
            oldGroup: "",
        },
    })

    const handleSubmit = (filters: ReportFormValues) => {
        onFiltersChange(filters)
    }

    const yearOptions = Array.from({ length: 10 }, (_, i) => {
        const year = new Date().getFullYear() - i
        return { label: year.toString(), value: year.toString() }
    })

    const monthOptions = [
        { label: "January", value: "1" },
        { label: "February", value: "2" },
        { label: "March", value: "3" },
        { label: "April", value: "4" },
        { label: "May", value: "5" },
        { label: "June", value: "6" },
        { label: "July", value: "7" },
        { label: "August", value: "8" },
        { label: "September", value: "9" },
        { label: "October", value: "10" },
        { label: "November", value: "11" },
        { label: "December", value: "12" },
    ]

    const stateOptions = states.map((state: any) => ({
        label: state.name || "",
        value: state.id,
    }))

    const regionOptions = regions.map((region: any) => ({
        label: region.name || "",
        value: region.id,
    }))

    const districtOptions = districts.map((district: any) => ({
        label: district.name || "",
        value: district.id,
    }))

    const groupOptions = groups.map((group: any) => ({
        label: group.name || "",
        value: group.id,
    }))

    const oldGroupOptions = oldGroups.map((oldGroup: any) => ({
        label: oldGroup.name || "",
        value: oldGroup.id,
    }))

    return (
        <Box
            as="form"
            onSubmit={form.handleSubmit(handleSubmit)}
            bg={{ base: "white", _dark: "gray.800" }}
            p={6}
            rounded="xl"
            boxShadow={{ base: "sm", _dark: "0 1px 3px rgba(0, 0, 0, 0.3)" }}
            mb={6}
        >
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4} mb={6}>
                {/* Year Filter */}
                <CustomComboboxField
                    form={form}
                    name="year"
                    label="Year"
                    items={yearOptions}
                    placeholder="Select year"
                />

                {/* Month Filter */}
                <CustomComboboxField
                    form={form}
                    name="month"
                    label="Month"
                    items={monthOptions}
                    placeholder="Select month"
                />

                {/* State Filter */}
                <CustomComboboxField
                    form={form}
                    name="state"
                    label="State"
                    items={stateOptions}
                    placeholder="Select state"
                />

                {/* Region Filter */}
                <CustomComboboxField
                    form={form}
                    name="region"
                    label="Region"
                    items={regionOptions}
                    placeholder="Select region"
                />

                {/* District Filter */}
                <CustomComboboxField
                    form={form}
                    name="district"
                    label="District"
                    items={districtOptions}
                    placeholder="Select district"
                />

                {/* Group Filter */}
                <CustomComboboxField
                    form={form}
                    name="group"
                    label="Group"
                    items={groupOptions}
                    placeholder="Select group"
                />

                {/* Old Group Filter */}
                <CustomComboboxField
                    form={form}
                    name="oldGroup"
                    label="Old Group"
                    items={oldGroupOptions}
                    placeholder="Select old group"
                />

                {/* From Month Filter */}
                <CustomComboboxField
                    form={form}
                    name="fromMonth"
                    label="From Month"
                    items={monthOptions}
                    placeholder="Select start month"
                />

                {/* To Month Filter */}
                <CustomComboboxField
                    form={form}
                    name="toMonth"
                    label="To Month"
                    items={monthOptions}
                    placeholder="Select end month"
                />
            </SimpleGrid>

            <Grid templateColumns={{ base: "1fr", md: "auto auto" }} gap={4} justifyContent="flex-start">
                <Button
                    type="submit"
                    bg={{ base: "accent.100", _dark: "accent.200" }}
                    color={{ base: "white", _dark: "gray.900" }}
                    _hover={{ bg: { base: "accent.200", _dark: "accent.300" } }}
                    disabled={isLoading}
                >
                    Apply Filters
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    borderColor={{ base: "gray.300", _dark: "gray.600" }}
                    color={{ base: "gray.700", _dark: "gray.300" }}
                    _hover={{ bg: { base: "gray.100", _dark: "gray.700" } }}
                    onClick={() => form.reset()}
                >
                    Clear Filters
                </Button>
            </Grid>
        </Box>
    )
}

export default ReportFilters
