"use client"

import {
    Dialog,
    Portal,
    Field,
    CloseButton,
    Button,
    VStack,
    HStack,
    Select,
    NumberInput,
    Heading,
} from "@chakra-ui/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { AttendanceSchema, type AttendanceFormData } from "../../../schemas/attendance.schema"
import type { AttendanceRecord } from "@/types/attendance.type"
import { useEffect, useMemo } from "react"
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

interface AttendanceDialogProps {
    isOpen: boolean
    attendance?: AttendanceRecord
    mode: 'add' | 'edit'
    onClose: () => void
    onSave: (data: AttendanceFormData) => void
    serviceName: string
    isLoading?: boolean
}

const AttendanceDialog = ({ isOpen, attendance, mode, onClose, onSave, serviceName, isLoading }: AttendanceDialogProps) => {
    const { register, handleSubmit, formState: { errors }, reset, setValue, watch, trigger } = useForm<AttendanceFormData>({
        resolver: zodResolver(AttendanceSchema),
        defaultValues: {
            state_id: attendance?.state_id || 0,
            region_id: attendance?.region_id || 0,
            district_id: attendance?.district_id || 0,
            group_id: attendance?.group_id || 0,
            old_group_id: attendance?.old_group_id || undefined,
            service_type: attendance?.service_type || serviceName.toLowerCase(),
            month: attendance?.month || '',
            week: attendance?.week || 1,
            men: attendance?.men || 0,
            women: attendance?.women || 0,
            youth_boys: attendance?.youth_boys || 0,
            youth_girls: attendance?.youth_girls || 0,
            children_boys: attendance?.children_boys || 0,
            children_girls: attendance?.children_girls || 0,
            year: attendance?.year || new Date().getFullYear(),
        }
    })

    const onSubmit = (data: AttendanceFormData) => {
        onSave(data)
        console.log("payload", data);

        reset()
    }

    const handleClose = () => {
        onClose()
        reset()
    }

    // Reset form when dialog opens with attendance data
    useEffect(() => {
        if (isOpen && attendance) {
            reset({
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
            })
        } else if (isOpen && !attendance) {
            reset({
                state_id: 0,
                region_id: 0,
                district_id: 0,
                group_id: 0,
                old_group_id: undefined,
                service_type: serviceName.toLowerCase(),
                month: '',
                week: 1,
                men: 0,
                women: 0,
                youth_boys: 0,
                youth_girls: 0,
                children_boys: 0,
                children_girls: 0,
                year: new Date().getFullYear(),
            })
        }
    }, [isOpen, attendance, reset, serviceName])

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

    const selectedStateName = useMemo(
        () => states?.find(s => s.id === currentStateId)?.name || '',
        [states, currentStateId]
    )
    const selectedRegionName = useMemo(
        () => regions?.find(r => r.id === currentRegionId)?.name || '',
        [regions, currentRegionId]
    )
    const selectedDistrictName = useMemo(
        () => districts?.find(d => d.id === currentDistrictId)?.name || '',
        [districts, currentDistrictId]
    )
    const selectedOldGroupName = useMemo(
        () => oldGroups?.find(g => g.id === currentOldGroupId)?.name || '',
        [oldGroups, currentOldGroupId]
    )
    const selectedGroupName = useMemo(
        () => groups?.find(g => g.id === currentGroupId)?.name || '',
        [groups, currentGroupId]
    )

    const filteredRegions = useMemo(() => {
        if (!regions || regions.length === 0) return []
        if (!currentStateId) return regions
        return regions.filter(region => {
            if (region.state_id != null) {
                return Number(region.state_id) === Number(currentStateId)
            }
            if (!selectedStateName) return false
            return region.state?.toLowerCase() === selectedStateName.toLowerCase()
        })
    }, [regions, currentStateId, selectedStateName])

    const filteredOldGroups = useMemo(() => {
        if (!oldGroups || oldGroups.length === 0) return []
        return oldGroups.filter(oldGroup => {
            const matchesState = currentStateId
                ? oldGroup.state_id != null
                    ? Number(oldGroup.state_id) === Number(currentStateId)
                    : oldGroup.state?.toLowerCase() === selectedStateName.toLowerCase()
                : true

            const matchesRegion = currentRegionId
                ? oldGroup.region_id != null
                    ? Number(oldGroup.region_id) === Number(currentRegionId)
                    : oldGroup.region?.toLowerCase() === selectedRegionName.toLowerCase()
                : true

            return matchesState && matchesRegion
        })
    }, [oldGroups, currentStateId, currentRegionId, selectedStateName, selectedRegionName])

    const filteredGroups = useMemo(() => {
        if (!groups || groups.length === 0) return []
        return groups.filter(group => {
            const matchesState = currentStateId
                ? group.state_id != null
                    ? Number(group.state_id) === Number(currentStateId)
                    : group.state?.toLowerCase() === selectedStateName.toLowerCase()
                : true

            const matchesRegion = currentRegionId
                ? group.region_id != null
                    ? Number(group.region_id) === Number(currentRegionId)
                    : group.region?.toLowerCase() === selectedRegionName.toLowerCase()
                : true

            const matchesOldGroup = currentOldGroupId
                ? group.old_group_id != null
                    ? Number(group.old_group_id) === Number(currentOldGroupId)
                    : group.old_group?.toLowerCase() === selectedOldGroupName.toLowerCase()
                : true

            return matchesState && matchesRegion && matchesOldGroup
        })
    }, [groups, currentStateId, currentRegionId, currentOldGroupId, selectedStateName, selectedRegionName, selectedOldGroupName])

    const filteredDistricts = useMemo(() => {
        if (!districts || districts.length === 0) return []
        return districts.filter(district => {
            const matchesState = currentStateId
                ? district.state_id != null
                    ? Number(district.state_id) === Number(currentStateId)
                    : district.state?.toLowerCase() === selectedStateName.toLowerCase()
                : true

            const matchesRegion = currentRegionId
                ? district.region_id != null
                    ? Number(district.region_id) === Number(currentRegionId)
                    : district.region?.toLowerCase() === selectedRegionName.toLowerCase()
                : true

            const matchesGroup = currentGroupId
                ? district.group_id != null
                    ? Number(district.group_id) === Number(currentGroupId)
                    : district.group?.toLowerCase() === selectedGroupName.toLowerCase()
                : true

            return matchesState && matchesRegion && matchesGroup
        })
    }, [districts, currentStateId, currentRegionId, currentGroupId, selectedStateName, selectedRegionName, selectedGroupName])

    const clearBelowDistrict = () => {
        setValue('district_id', 0, { shouldValidate: true })
        trigger('district_id')
    }

    const clearBelowGroup = () => {
        setValue('group_id', 0, { shouldValidate: true })
        trigger('group_id')
        clearBelowDistrict()
    }

    const clearBelowOldGroup = () => {
        setValue('old_group_id', undefined, { shouldValidate: true })
        trigger('old_group_id')
        clearBelowGroup()
    }

    const clearBelowRegion = () => {
        setValue('region_id', 0, { shouldValidate: true })
        trigger('region_id')
        clearBelowOldGroup()
    }

    const handleStateChange = (stateName: string) => {
        const state = states?.find(s => s.name === stateName)
        setValue('state_id', state?.id || 0, { shouldValidate: true })
        trigger('state_id')
        clearBelowRegion()
    }

    const handleRegionChange = (regionName: string) => {
        const region = regions?.find(r => r.name === regionName)
        setValue('region_id', region?.id || 0, { shouldValidate: true })
        trigger('region_id')
        clearBelowOldGroup()
    }

    const handleOldGroupChange = (oldGroupName: string) => {
        const oldGroup = oldGroups?.find(g => g.name === oldGroupName)
        setValue('old_group_id', oldGroup?.id, { shouldValidate: true })
        trigger('old_group_id')
        clearBelowGroup()
    }

    const handleGroupChange = (groupName: string) => {
        const group = groups?.find(g => g.name === groupName)
        setValue('group_id', group?.id || 0, { shouldValidate: true })
        trigger('group_id')
        clearBelowDistrict()
    }

    const handleDistrictChange = (districtName: string) => {
        const district = districts?.find(d => d.name === districtName)
        setValue('district_id', district?.id || 0, { shouldValidate: true })
        trigger('district_id')
    }

    return (
        <Dialog.Root
            open={isOpen}
            onOpenChange={(e) => {
                if (!e.open) {
                    handleClose()
                }
            }}
        >
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content rounded="xl" maxW="2xl" >
                        <Dialog.Header>
                            <Dialog.Title color={{ base: "gray.800", _dark: "white" }}>
                                {mode === 'add' ? `Add ${serviceName} Attendance` : 'Update Attendance Record'}
                            </Dialog.Title>
                        </Dialog.Header>

                        <Dialog.Body>
                            <form noValidate id="attendance-form" onSubmit={handleSubmit(onSubmit)}>
                                <VStack gap="4" colorPalette={"accent"}>
                                    <HStack gap="4" w="full">
                                        <Field.Root required invalid={!!errors.state_id}>
                                            <StateIdCombobox
                                                value={selectedStateName}
                                                onChange={handleStateChange}
                                                required
                                                invalid={!!errors.state_id}
                                            />
                                            <Field.ErrorText>{errors.state_id?.message}</Field.ErrorText>
                                        </Field.Root>

                                        <Field.Root required invalid={!!errors.region_id}>
                                            <RegionIdCombobox
                                                value={selectedRegionName}
                                                onChange={handleRegionChange}
                                                required
                                                invalid={!!errors.region_id}
                                                items={filteredRegions}
                                                disabled={!currentStateId}
                                            />
                                            <Field.ErrorText>{errors.region_id?.message}</Field.ErrorText>
                                        </Field.Root>
                                    </HStack>

                                    <HStack gap="4" w="full">
                                        <Field.Root invalid={!!errors.old_group_id}>
                                            <OldGroupIdCombobox
                                                value={selectedOldGroupName}
                                                onChange={handleOldGroupChange}
                                                invalid={!!errors.old_group_id}
                                                items={filteredOldGroups}
                                                disabled={!currentRegionId}
                                            />
                                            <Field.ErrorText>{errors.old_group_id?.message}</Field.ErrorText>
                                        </Field.Root>

                                        <Field.Root required invalid={!!errors.group_id}>
                                            <GroupIdCombobox
                                                value={selectedGroupName}
                                                onChange={handleGroupChange}
                                                required
                                                invalid={!!errors.group_id}
                                                items={filteredGroups}
                                                disabled={!currentOldGroupId}
                                            />
                                            <Field.ErrorText>{errors.group_id?.message}</Field.ErrorText>
                                        </Field.Root>
                                    </HStack>

                                    <HStack gap="4" w="full">
                                        <Field.Root required invalid={!!errors.district_id}>
                                            <DistrictIdCombobox
                                                value={selectedDistrictName}
                                                onChange={handleDistrictChange}
                                                required
                                                invalid={!!errors.district_id}
                                                items={filteredDistricts}
                                                disabled={!currentGroupId}
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
                                                value={watch('month') ? [watch('month')] : []}
                                                onValueChange={(value) => setValue('month', value.value[0] || '', { shouldValidate: true })}
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
                                                        {monthCollection.items.map((item: any) => (
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

                                    {/* Hidden inputs for ID fields so react-hook-form validates them */}
                                    <input type="hidden" {...register('state_id', { valueAsNumber: true })} />
                                    <input type="hidden" {...register('region_id', { valueAsNumber: true })} />
                                    <input type="hidden" {...register('district_id', { valueAsNumber: true })} />
                                    <input type="hidden" {...register('group_id', { valueAsNumber: true })} />
                                    <input type="hidden" {...register('old_group_id', { valueAsNumber: true })} />
                                    <input type="hidden" {...register('service_type')} />

                                    <HStack gap="4" w="full">
                                        <Field.Root required invalid={!!errors.week}>
                                            <Field.Label>Week
                                                <Field.RequiredIndicator />
                                            </Field.Label>
                                            <Select.Root
                                                collection={weekCollection}
                                                size="sm"
                                                value={watch('week') ? [watch('week').toString()] : []}
                                                onValueChange={(value) => setValue('week', parseInt(value.value[0], 10), { shouldValidate: true })}
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
                                                        {weekCollection.items.map((item: any) => (
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
                                                value={watch('year') ? [watch('year').toString()] : []}
                                                onValueChange={(value) => setValue('year', parseInt(value.value[0], 10), { shouldValidate: true })}
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
                                                        {yearCollection.items.map((item: any) => (
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
                                </VStack>
                            </form>
                        </Dialog.Body>

                        <Dialog.Footer>
                            <Dialog.ActionTrigger asChild>
                                <Button rounded="xl" variant="outline" disabled={isLoading}>Cancel</Button>
                            </Dialog.ActionTrigger>
                            <Button
                                rounded="xl"
                                type="submit"
                                form="attendance-form"
                                colorPalette="accent"
                                loading={isLoading}
                                loadingText={mode === 'add' ? 'Adding Attendance' : 'Updating Attendance'}
                                disabled={isLoading}
                            >
                                {mode === 'add' ? 'Add Attendance' : 'Update Attendance'}
                            </Button>
                        </Dialog.Footer>

                        <Dialog.CloseTrigger asChild>
                            <CloseButton size="sm" />
                        </Dialog.CloseTrigger>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    )
}

export default AttendanceDialog