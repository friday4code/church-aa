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
    InputGroup,
    Show,
} from "@chakra-ui/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { AttendanceSchema, type AttendanceFormData } from "../../../schemas/attendance.schema"
import type { AttendanceRecord } from "@/types/attendance.type"
import { useEffect, useMemo } from "react"
import { createListCollection } from "@chakra-ui/react"
import { getMonthOptions, getWeekOptions, getYearOptions } from "@/utils/attendance.utils"
import { useStates } from "../../../hooks/useState"
import StateIdCombobox from "../../../components/StateIdCombobox"
import RegionIdCombobox from "../../../components/RegionIdCombobox"
import DistrictIdCombobox from "../../../components/DistrictIdCombobox"
import GroupIdCombobox from "../../../components/GroupIdCombobox"
import OldGroupIdCombobox from "../../../components/OldGroupIdCombobox"
import { useMe } from "@/hooks/useMe"
import { getRoleBasedVisibility, type RoleType } from "@/utils/roleHierarchy"
import { useLocation, useParams } from "react-router"
import { toaster } from "@/components/ui/toaster"

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

    // rest toasts
    const loc = useLocation();
    useEffect(() => {
        toaster.dismiss()
        toaster.remove();
    }, [loc.pathname]);


    const { user } = useMe()




    // Get role-based visibility configuration
    const roleVisibility = useMemo(() => {
        if (!user?.roles) return getRoleBasedVisibility([])
        return getRoleBasedVisibility(user.roles as RoleType[])
    }, [user?.roles])

    const isStateAdmin = useMemo(() => {
        const roles = user?.roles || []
        return roles.includes("State Admin")
    }, [user?.roles])


    const isRegionAdmin = useMemo(() => {
        const roles = user?.roles || []
        return roles.includes("Region Admin")
    }, [user?.roles])

    const isGroupAdmin = useMemo(() => {
        const roles = user?.roles || []
        return roles.includes("Group Admin")
    }, [user?.roles])

    const { type } = useParams();
    const isMainServiceType = type === 'sunday-worship' || type === "thursday-revival" || type === "monday-bible";
    const extraFields = useMemo(() => isMainServiceType ? {
        new_comers: attendance?.new_comers || 0,
        tithe_offering: attendance?.tithe_offering || 0,
    } : {}, [attendance, isMainServiceType])

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
            ...extraFields,
        }
    })

    // Auto-populate hidden fields based on user's role and data
    useEffect(() => {
        if (!user || !isOpen) return

        // Auto-populate state_id if State combobox is hidden
        if (!roleVisibility.showState && user.state_id) {
            setValue('state_id', user.state_id, { shouldValidate: true })
            trigger('state_id')
        }

        // Auto-populate region_id if Region combobox is hidden
        if (!roleVisibility.showRegion && user.region_id) {
            setValue('region_id', user.region_id, { shouldValidate: true })
            trigger('region_id')
        }

        // Auto-populate old_group_id if Old Group combobox is hidden
        if (!roleVisibility.showOldGroup && user.old_group_id) {
            setValue('old_group_id', user.old_group_id, { shouldValidate: true })
            trigger('old_group_id')
        }


        // Auto-populate group_id if Group combobox is hidden
        if (!roleVisibility.showGroup && user.group_id) {
            setValue('group_id', user.group_id, { shouldValidate: true })
            trigger('group_id')
        }

        // Auto-populate district_id if District combobox is hidden
        if (!roleVisibility.showDistrict && user.district_id) {
            setValue('district_id', user.district_id, { shouldValidate: true })
            trigger('district_id')
        }

    }, [user, roleVisibility, setValue, trigger, isOpen])

    const onSubmit = (data: AttendanceFormData) => {
        console.log("payload", data)
        onSave(data)
    }

    const onInvalid = (err: unknown) => {
        console.log("validation_errors", err, {
            state_id: watch('state_id'),
            region_id: watch('region_id'),
            group_id: watch('group_id'),
            district_id: watch('district_id'),
        })
        toaster.create({ title: 'Please fix validation errors', type: 'error' })
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
                ...extraFields,
            })
        } else if (isOpen && !attendance) {
            reset({
                state_id: roleVisibility.showState ? 0 : (user?.state_id ?? 0),
                region_id: roleVisibility.showRegion ? 0 : (user?.region_id ?? 0),
                district_id: roleVisibility.showDistrict ? 0 : (user?.district_id ?? 0),
                group_id: roleVisibility.showGroup ? 0 : (user?.group_id ?? 0),
                old_group_id: roleVisibility.showOldGroup ? undefined : (user?.old_group_id ?? undefined),
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
                ...extraFields,
            })
        }
    }, [isOpen, attendance, reset, serviceName, user?.state_id, user?.region_id, user?.district_id, user?.group_id, user?.old_group_id, roleVisibility, extraFields])

    // hooks for name lookup and display
    const { states } = useStates()

    const currentStateId = watch('state_id')
    const currentRegionId = watch('region_id')
    const currentDistrictId = watch('district_id')
    const currentGroupId = watch('group_id')
    const currentOldGroupId = watch('old_group_id')

    const selectedStateName = useMemo(
        () => states?.find(s => s.id === currentStateId)?.name || '',
        [states, currentStateId]
    )

    useEffect(() => {
        if (isRegionAdmin && isOpen) {
            console.log("region_admin_scope", {
                user_state_id: user?.state_id,
                user_region_id: user?.region_id,
                state_id: currentStateId,
                region_id: currentRegionId,
                group_id: currentGroupId,
                district_id: currentDistrictId,
                has_errors: !!Object.keys(errors || {}).length,
            })
        }
    }, [isRegionAdmin, isOpen, user?.state_id, user?.region_id, currentStateId, currentRegionId, currentGroupId, currentDistrictId, errors])

    const clearBelowDistrict = () => {
        setValue('district_id', 0, { shouldValidate: false })
        trigger('district_id')
    }

    const clearBelowGroup = () => {
        setValue('group_id', 0, { shouldValidate: false })
        trigger('group_id')
        clearBelowDistrict()
    }

    const clearBelowOldGroup = () => {
        setValue('old_group_id', undefined, { shouldValidate: false })
        trigger('old_group_id')
        clearBelowGroup()
    }

    const clearBelowRegion = () => {
        setValue('region_id', 0, { shouldValidate: false })
        trigger('region_id')
        clearBelowOldGroup()
    }

    const handleStateChange = (stateName: string) => {
        const state = states?.find(s => s.name === stateName)
        setValue('state_id', state?.id || 0, { shouldValidate: false })
        trigger('state_id')
        clearBelowRegion()
    }

    const handleRegionChange = (regionId?: number) => {
        setValue('region_id', regionId || 0, { shouldValidate: false })
        trigger('region_id')
        clearBelowOldGroup()
    }

    const handleOldGroupChange = (oldGroupId?: number) => {
        setValue('old_group_id', oldGroupId, { shouldValidate: false })
        trigger('old_group_id')
        clearBelowGroup()
    }

    const handleGroupChange = (groupId?: number) => {
        setValue('group_id', groupId || 0, { shouldValidate: false })
        trigger('group_id')
        clearBelowDistrict()
    }

    const handleDistrictChange = (districtId?: number) => {
        setValue('district_id', districtId || 0, { shouldValidate: false })
        trigger('district_id')
    }

    return (
        <Dialog.Root
            role="alertdialog"
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
                    <Dialog.Content rounded="xl" maxW={{ base: "sm", md: "md", lg: "3xl" }} >
                        <Dialog.Header>
                            <Dialog.Title color={{ base: "gray.800", _dark: "white" }}>
                                {mode === 'add' ? `Add ${serviceName} Attendance` : 'Update Attendance Record'}
                            </Dialog.Title>
                        </Dialog.Header>

                        <Dialog.Body>
                            <form noValidate id="attendance-form" onSubmit={handleSubmit(onSubmit, onInvalid)}>
                                <VStack gap="4" colorPalette={"accent"}>
                                    {roleVisibility.showState && (
                                        <Field.Root required invalid={!!errors.state_id}>
                                            <StateIdCombobox
                                                value={selectedStateName}
                                                onChange={handleStateChange}
                                                required
                                                invalid={!!errors.state_id}
                                            />
                                            <Field.ErrorText>{errors.state_id?.message}</Field.ErrorText>
                                        </Field.Root>
                                    )}

                                    {roleVisibility.showRegion && (
                                        <Field.Root required invalid={!!errors.region_id}>
                                            <RegionIdCombobox
                                                value={currentRegionId}
                                                onChange={handleRegionChange}
                                                required
                                                invalid={!!errors.region_id}
                                                stateId={isStateAdmin ? user?.state_id as number : currentStateId}
                                                disabled={!currentStateId}
                                            />
                                            <Field.ErrorText>{errors.region_id?.message}</Field.ErrorText>
                                        </Field.Root>
                                    )}

                                    {roleVisibility.showOldGroup && (
                                        <Field.Root invalid={!!errors.old_group_id}>
                                            <OldGroupIdCombobox
                                                value={currentOldGroupId as number}
                                                onChange={handleOldGroupChange}
                                                invalid={!!errors.old_group_id}
                                                disabled={isRegionAdmin ? false : !currentRegionId}
                                                stateId={user?.state_id as number | undefined}
                                                regionId={isRegionAdmin ? (user?.region_id as number | undefined) : currentRegionId}
                                                isRegionAdmin={isRegionAdmin}
                                            />
                                            <Field.ErrorText>{errors.old_group_id?.message}</Field.ErrorText>
                                        </Field.Root>
                                    )}

                                    {roleVisibility.showGroup && !isGroupAdmin && (
                                        <Field.Root required invalid={!!errors.group_id}>
                                            <GroupIdCombobox
                                                value={currentGroupId}
                                                onChange={handleGroupChange}
                                                required
                                                invalid={!!errors.group_id}
                                                oldGroupId={currentOldGroupId as number}
                                                disabled={!currentOldGroupId}
                                            />
                                            <Field.ErrorText>{errors.group_id?.message}</Field.ErrorText>
                                        </Field.Root>
                                    )}

                                    {roleVisibility.showDistrict && (
                                        <Field.Root required invalid={!!errors.district_id}>
                                            <DistrictIdCombobox
                                                value={currentDistrictId}
                                                onChange={handleDistrictChange}
                                                required
                                                invalid={!!errors.district_id}
                                                disabled={isGroupAdmin ? false : !currentGroupId}
                                                stateId={user?.state_id as number | undefined}
                                                regionId={user?.region_id as number | undefined}
                                                oldGroupId={user?.old_group_id ?? undefined}
                                                groupId={currentGroupId || user?.group_id as number | undefined}
                                                isGroupAdmin={isGroupAdmin}
                                            />
                                            <Field.ErrorText>{errors.district_id?.message}</Field.ErrorText>
                                        </Field.Root>
                                    )}

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
                                                    {monthCollection.items.map((item) => (
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

                                    {/* Hidden inputs for ID fields so react-hook-form validates them */}
                                    <input type="hidden" {...register('state_id', { valueAsNumber: true })} />
                                    <input type="hidden" {...register('region_id', { valueAsNumber: true })} />
                                    <input type="hidden" {...register('district_id', { valueAsNumber: true })} />
                                    <input type="hidden" {...register('group_id', { valueAsNumber: true })} />
                                    <input type="hidden" {...register('old_group_id')} />
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
                                                        {weekCollection.items.map((item) => (
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
                                                        {yearCollection.items.map((item) => (
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

                                    <Show when={isMainServiceType}>
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
                                    </Show>

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
        </Dialog.Root >
    )
}

export default AttendanceDialog;
