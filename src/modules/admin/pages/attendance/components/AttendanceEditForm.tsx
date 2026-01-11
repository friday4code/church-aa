"use client"

import {
    VStack,
    HStack,
    Field,
    Button,
    Text,
    Select,
    NumberInput,
    Heading,
    InputGroup,
} from "@chakra-ui/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { AttendanceSchema, type AttendanceFormData } from "../../../schemas/attendance.schema"
import type { AttendanceRecord, ServiceType } from "@/types/attendance.type"
import { createListCollection } from "@chakra-ui/react"
import { getMonthOptions, getWeekOptions, getYearOptions } from "@/utils/attendance.utils"
import { useStates } from "../../../hooks/useState"
import { useRegions } from "../../../hooks/useRegion"
import { useDistricts } from "../../../hooks/useDistrict"
import { useGroups } from "../../../hooks/useGroup"
import { useOldGroups } from "../../../hooks/useOldGroup"
import StateIdCombobox from "../../../components/StateIdCombobox"
import RegionIdCombobox from "../../../components/RegionIdCombobox"
import DistrictIdCombobox from "../../../components/DistrictIdCombobox"
import GroupIdCombobox from "../../../components/GroupIdCombobox"
import OldGroupIdCombobox from "../../../components/OldGroupIdCombobox"
import type { S } from "vitest/dist/chunks/config.Cy0C388Z.js"
import { useMemo } from "react"
import { useParams } from "react-router"

// Collections for Select components
const monthCollection = createListCollection({
    items: getMonthOptions().map(month => ({
        label: month,
        value: month
    }))
});

const weekCollection = createListCollection({
    items: getWeekOptions().map(week => ({
        label: `Week ${week}`,
        value: week.toString()
    }))
});

const yearCollection = createListCollection({
    items: getYearOptions().map(year => ({
        label: year.toString(),
        value: year.toString()
    }))
});

interface AttendanceEditFormProps {
    attendance: AttendanceRecord
    onUpdate: (data: AttendanceFormData) => void
    onCancel: () => void
}

const AttendanceEditForm = ({ attendance, onUpdate, onCancel }: AttendanceEditFormProps) => {
    const { type } = useParams();
    const isMainServiceType = type === 'sunday-worship' || type === "thursday-revival" || type === "monday-bible";
    const extraFields = useMemo(() => isMainServiceType ? {
        new_comers: attendance?.new_comers || 0,
        tithe_offering: attendance?.tithe_offering || 0,
    } : {}, [attendance, isMainServiceType])

    const { register, handleSubmit, formState: { errors }, setValue, watch, trigger } = useForm<AttendanceFormData>({
        resolver: zodResolver(AttendanceSchema),
        defaultValues: {
            state_id: attendance.state_id,
            region_id: attendance.region_id,
            district_id: attendance.district_id,
            group_id: attendance.group_id,
            old_group_id: attendance.old_group_id || undefined,
            service_type: attendance.service_type,
            month: attendance.month,
            week: attendance.week,
            men: attendance.men,
            women: attendance.women,
            youth_boys: attendance.youth_boys,
            youth_girls: attendance.youth_girls,
            children_boys: attendance.children_boys,
            children_girls: attendance.children_girls,
            year: attendance.year,
            new_comers: attendance.new_comers,
            tithe_offering: attendance.tithe_offering,
            ...extraFields,
        }
    })

    // hooks for name lookup and display
    const { states } = useStates()
    const { regions } = useRegions()
    const { districts } = useDistricts()
    const { groups } = useGroups()
    const { oldGroups } = useOldGroups()

    const currentStateId = watch('state_id')
    const currentRegionId = watch('region_id')
    const currentDistrictId = watch('district_id')
    const currentGroupId = watch('group_id')
    const currentOldGroupId = watch('old_group_id')

    const getSelectedStateName = () => states?.find(s => s.id === currentStateId)?.name || ''

    const handleStateChange = (stateName: string) => {
        const state = states?.find(s => s.name === stateName)
        if (state) {
            setValue('state_id', state.id, { shouldValidate: true })
            trigger('state_id')
            // Reset children
            setValue('region_id', 0)
            setValue('district_id', 0)
            setValue('group_id', 0)
            setValue('old_group_id', 0)
        }
    }

    const onSubmit = (data: AttendanceFormData) => {
        onUpdate(data)
    }

    return (
        <VStack gap="4" align="stretch">
            <Text fontSize="sm" color="gray.600" mb="2">
                Editing: <strong>{watch('month')} Week {watch('week')}</strong>
            </Text>

            <form onSubmit={handleSubmit(onSubmit)}>
                <VStack gap="4" colorPalette={"accent"}>
                    <HStack gap="4" w="full">
                        <Field.Root required invalid={!!errors.state_id}>
                            <StateIdCombobox
                                value={getSelectedStateName()}
                                onChange={handleStateChange}
                                required
                                invalid={!!errors.state_id}
                            />
                            <Field.ErrorText>{errors.state_id?.message}</Field.ErrorText>
                        </Field.Root>

                        <Field.Root required invalid={!!errors.region_id}>
                            <RegionIdCombobox
                                value={currentRegionId}
                                onChange={(v) => {
                                    setValue('region_id', v || 0, { shouldValidate: true })
                                    trigger('region_id')
                                    // Reset children
                                    setValue('district_id', 0)
                                    setValue('group_id', 0)
                                    setValue('old_group_id', 0)
                                }}
                                required
                                invalid={!!errors.region_id}
                                stateId={currentStateId}
                            />
                            <Field.ErrorText>{errors.region_id?.message}</Field.ErrorText>
                        </Field.Root>
                    </HStack>

                    <HStack gap="4" w="full">
                        <Field.Root invalid={!!errors.old_group_id}>
                            <OldGroupIdCombobox
                                value={currentOldGroupId || undefined}
                                onChange={(v) => {
                                    setValue('old_group_id', v || 0, { shouldValidate: true })
                                    trigger('old_group_id')
                                    setValue('group_id', 0)
                                    setValue('district_id', 0)
                                }}
                                invalid={!!errors.old_group_id}
                                stateId={currentStateId}
                                regionId={currentRegionId}
                            />
                            <Field.ErrorText>{errors.old_group_id?.message}</Field.ErrorText>
                        </Field.Root>

                        <Field.Root required invalid={!!errors.group_id}>
                            <GroupIdCombobox
                                value={currentGroupId}
                                onChange={(v) => {
                                    setValue('group_id', v || 0, { shouldValidate: true })
                                    trigger('group_id')
                                    setValue('district_id', 0)
                                }}
                                required
                                invalid={!!errors.group_id}
                                oldGroupId={currentOldGroupId as number}
                            />
                            <Field.ErrorText>{errors.group_id?.message}</Field.ErrorText>
                        </Field.Root>
                    </HStack>

                    <HStack gap="4" w="full">
                        <Field.Root required invalid={!!errors.district_id}>
                            <DistrictIdCombobox
                                value={currentDistrictId}
                                onChange={(v) => {
                                    setValue('district_id', v || 0, { shouldValidate: true })
                                    trigger('district_id')
                                }}
                                required
                                invalid={!!errors.district_id}
                                groupId={currentGroupId}
                            />
                            <Field.ErrorText>{errors.district_id?.message}</Field.ErrorText>
                        </Field.Root>

                        <Field.Root required invalid={!!errors.month}>
                            <Field.Label>Month
                                <Field.RequiredIndicator />
                            </Field.Label>
                            <Select.Root
                                collection={monthCollection}
                                size="sm"
                            >
                                <Select.HiddenSelect />
                                <Select.Control>
                                    <Select.Trigger rounded="lg">
                                        <Select.ValueText placeholder="Select month" />
                                    </Select.Trigger>
                                    <Select.IndicatorGroup>
                                        <Select.Indicator />
                                    </Select.IndicatorGroup>
                                </Select.Control>
                                <Select.Positioner>
                                    <Select.Content>
                                        {monthCollection.items.map((item: Record<string, string>) => (
                                            <Select.Item item={item} key={item.value}>
                                                {item.label}
                                                <Select.ItemIndicator />
                                            </Select.Item>
                                        ))}
                                    </Select.Content>
                                </Select.Positioner>
                            </Select.Root>
                            <Field.ErrorText>{errors.month?.message}</Field.ErrorText>
                        </Field.Root>
                    </HStack>

                    {/* Hidden inputs for ID fields */}
                    <input type="hidden" {...register('state_id', { valueAsNumber: true })} />
                    <input type="hidden" {...register('region_id', { valueAsNumber: true })} />
                    <input type="hidden" {...register('district_id', { valueAsNumber: true })} />
                    <input type="hidden" {...register('group_id', { valueAsNumber: true })} />
                    <input type="hidden" {...register('old_group_id', { valueAsNumber: true })} />

                    <HStack gap="4" w="full">
                        <Field.Root required invalid={!!errors.week}>
                            <Field.Label>Week
                                <Field.RequiredIndicator />
                            </Field.Label>
                            <Select.Root
                                collection={weekCollection}
                                size="sm"
                            >
                                <Select.HiddenSelect />
                                <Select.Control>
                                    <Select.Trigger rounded="lg">
                                        <Select.ValueText placeholder="Select week" />
                                    </Select.Trigger>
                                    <Select.IndicatorGroup>
                                        <Select.Indicator />
                                    </Select.IndicatorGroup>
                                </Select.Control>
                                <Select.Positioner>
                                    <Select.Content>
                                        {weekCollection.items.map((item: Record<string, string>) => (
                                            <Select.Item item={item} key={item.value}>
                                                {item.label}
                                                <Select.ItemIndicator />
                                            </Select.Item>
                                        ))}
                                    </Select.Content>
                                </Select.Positioner>
                            </Select.Root>
                            <Field.ErrorText>{errors.week?.message}</Field.ErrorText>
                        </Field.Root>

                        <Field.Root required invalid={!!errors.year}>
                            <Field.Label>Year
                                <Field.RequiredIndicator />
                            </Field.Label>
                            <Select.Root
                                collection={yearCollection}
                                size="sm"
                            >
                                <Select.HiddenSelect />
                                <Select.Control>
                                    <Select.Trigger rounded="lg">
                                        <Select.ValueText placeholder="Select year" />
                                    </Select.Trigger>
                                    <Select.IndicatorGroup>
                                        <Select.Indicator />
                                    </Select.IndicatorGroup>
                                </Select.Control>
                                <Select.Positioner>
                                    <Select.Content>
                                        {yearCollection.items.map((item: Record<string, string>) => (
                                            <Select.Item item={item} key={item.value}>
                                                {item.label}
                                                <Select.ItemIndicator />
                                            </Select.Item>
                                        ))}
                                    </Select.Content>
                                </Select.Positioner>
                            </Select.Root>
                            <Field.ErrorText>{errors.year?.message}</Field.ErrorText>
                        </Field.Root>
                    </HStack>

                    <Heading size="md" w="full" mt="4">Attendance Numbers</Heading>

                    <HStack gap="4" w="full">
                        <Field.Root required invalid={!!errors.men}>
                            <Field.Label>Men</Field.Label>
                            <NumberInput.Root
                                min={0}
                                onValueChange={(e) => setValue('men', e.valueAsNumber)}
                            >
                                <NumberInput.Control />
                                <NumberInput.Input rounded="lg" {...register('men', { valueAsNumber: true })} />
                            </NumberInput.Root>
                            <Field.ErrorText>{errors.men?.message}</Field.ErrorText>
                        </Field.Root>

                        <Field.Root required invalid={!!errors.women}>
                            <Field.Label>Women</Field.Label>
                            <NumberInput.Root
                                min={0}
                                onValueChange={(e) => setValue('women', e.valueAsNumber)}
                            >
                                <NumberInput.Control />
                                <NumberInput.Input rounded="lg" {...register('women', { valueAsNumber: true })} />
                            </NumberInput.Root>
                            <Field.ErrorText>{errors.women?.message}</Field.ErrorText>
                        </Field.Root>
                    </HStack>

                    <HStack gap="4" w="full">
                        <Field.Root required invalid={!!errors.youth_boys}>
                            <Field.Label>Youth Boys</Field.Label>
                            <NumberInput.Root
                                min={0}
                                onValueChange={(e) => setValue('youth_boys', e.valueAsNumber)}
                            >
                                <NumberInput.Control />
                                <NumberInput.Input rounded="lg" {...register('youth_boys', { valueAsNumber: true })} />
                            </NumberInput.Root>
                            <Field.ErrorText>{errors.youth_boys?.message}</Field.ErrorText>
                        </Field.Root>

                        <Field.Root required invalid={!!errors.youth_girls}>
                            <Field.Label>Youth Girls</Field.Label>
                            <NumberInput.Root
                                min={0}
                                onValueChange={(e) => setValue('youth_girls', e.valueAsNumber)}
                            >
                                <NumberInput.Control />
                                <NumberInput.Input rounded="lg" {...register('youth_girls', { valueAsNumber: true })} />
                            </NumberInput.Root>
                            <Field.ErrorText>{errors.youth_girls?.message}</Field.ErrorText>
                        </Field.Root>
                    </HStack>

                    <HStack gap="4" w="full">
                        <Field.Root required invalid={!!errors.children_boys}>
                            <Field.Label>Children Boys</Field.Label>
                            <NumberInput.Root
                                min={0}
                                onValueChange={(e) => setValue('children_boys', e.valueAsNumber)}
                            >
                                <NumberInput.Control />
                                <NumberInput.Input rounded="lg" {...register('children_boys', { valueAsNumber: true })} />
                            </NumberInput.Root>
                            <Field.ErrorText>{errors.children_boys?.message}</Field.ErrorText>
                        </Field.Root>

                        <Field.Root required invalid={!!errors.children_girls}>
                            <Field.Label>Children Girls</Field.Label>
                            <NumberInput.Root
                                min={0}
                                onValueChange={(e) => setValue('children_girls', e.valueAsNumber)}
                            >
                                <NumberInput.Control />
                                <NumberInput.Input rounded="lg" {...register('children_girls', { valueAsNumber: true })} />
                            </NumberInput.Root>
                            <Field.ErrorText>{errors.children_girls?.message}</Field.ErrorText>
                        </Field.Root>
                    </HStack>

                    <HStack gap="4" w="full">
                        <Field.Root required invalid={!!errors.new_comers}>
                            <Field.Label>New Comers</Field.Label>
                            <NumberInput.Root
                                min={0}
                                onValueChange={(e) => setValue('new_comers', e.valueAsNumber)}
                            >
                                <NumberInput.Control />
                                <NumberInput.Input rounded="lg" {...register('new_comers', { valueAsNumber: true })} />
                            </NumberInput.Root>
                            <Field.ErrorText>{errors.new_comers?.message}</Field.ErrorText>
                        </Field.Root>

                        <Field.Root required invalid={!!errors.tithe_offering}>
                            <Field.Label>Tithe Offering</Field.Label>
                            <NumberInput.Root
                                min={0}
                                formatOptions={{
                                    style: 'decimal',
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                }}
                                onValueChange={(e) => setValue('tithe_offering', e.valueAsNumber)}
                            >
                                <InputGroup startElement={"₦"}>
                                    <NumberInput.Input placeholder="50000" rounded="lg" {...register('tithe_offering', { valueAsNumber: true })} />
                                </InputGroup>
                            </NumberInput.Root>
                            <Field.ErrorText>{errors.tithe_offering?.message}</Field.ErrorText>
                        </Field.Root>
                    </HStack>
                </VStack>
            </form>

            <HStack justify="flex-end" gap="2" mt="4">
                <Button rounded="xl" variant="outline" size="sm" onClick={onCancel}>
                    Cancel
                </Button>
                <Button
                    rounded="xl"
                    size="sm"
                    colorPalette="accent"
                    onClick={handleSubmit(onSubmit)}
                >
                    Update
                </Button>
            </HStack>
        </VStack>
    )
}

export default AttendanceEditForm