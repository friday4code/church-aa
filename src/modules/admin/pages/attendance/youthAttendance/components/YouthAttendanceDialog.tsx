// components/YouthAttendanceDialog.tsx
"use client"

import {
    Dialog,
    Portal,
    Field,
    CloseButton,
    Button,
    VStack,
    HStack,
    NumberInput,
    Select,
    Textarea,
    useListCollection,
} from "@chakra-ui/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { youthAttendanceSchema, type YouthAttendanceFormData } from "@/modules/admin/schemas/youthMinistry/youthAttendance.schema"
import { useStates } from "@/modules/admin/hooks/useState"
// removed region/old group hooks in favor of API-driven comboboxes
import StateIdCombobox from "@/modules/admin/components/StateIdCombobox"
import RegionIdCombobox from "@/modules/admin/components/RegionIdCombobox"
import DistrictIdCombobox from "@/modules/admin/components/DistrictIdCombobox"
import GroupIdCombobox from "@/modules/admin/components/GroupIdCombobox"
import OldGroupIdCombobox from "@/modules/admin/components/OldGroupIdCombobox"
import { useEffect, useMemo } from "react"
// removed districts/groups hooks in favor of API-driven comboboxes
import type { YouthAttendance } from "@/types/youthAttendance.type"
// removed useAuth (hasRole not used)
import { useMe } from "@/hooks/useMe"
import { getRoleBasedVisibility, type RoleType } from "@/utils/roleHierarchy"

interface YouthAttendanceDialogProps {
    isOpen: boolean
    isLoading?: boolean
    mode: 'add' | 'edit'
    attendanceType: 'weekly' | 'revival'
    onClose: () => void
    onSave: (data: YouthAttendanceFormData) => void
    attendance?: YouthAttendance
}

const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
]

const currentYear = new Date().getFullYear()
const years = Array.from({ length: 10 }, (_, i) => currentYear - i)

export const YouthAttendanceDialog = ({
    isOpen,
    isLoading,
    mode,
    attendanceType,
    onClose,
    onSave,
    attendance,
}: YouthAttendanceDialogProps) => {
    const { states } = useStates()
    // lists no longer needed here; comboboxes fetch via adminApi
    const { user } = useMe()
    
    // Get role-based visibility configuration
    const roleVisibility = useMemo(() => {
        if (!user?.roles) return getRoleBasedVisibility([])
        return getRoleBasedVisibility(user.roles as RoleType[])
    }, [user?.roles])

    const { register, handleSubmit, formState: { errors }, setValue, watch, reset, trigger } = useForm<YouthAttendanceFormData>({
        resolver: zodResolver(youthAttendanceSchema),
        defaultValues: {
            attendance_type: attendanceType,
            state_id: 0,
            region_id: 0,
            district_id: 0,
            group_id: 0,
            old_group_id: undefined,
            year: currentYear,
            month: '',
            male: 0,
            female: 0,
            member_boys: 0,
            member_girls: 0,
            visitor_boys: 0,
            visitor_girls: 0,
        }
    })

    useEffect(() => {
        if (isOpen && attendance && mode === 'edit') {
            reset({
                attendance_type: attendance.attendance_type,
                state_id: attendance.state_id,
                region_id: attendance.region_id,
                district_id: attendance.district_id,
                group_id: attendance.group_id,
                old_group_id: attendance.old_group_id ?? undefined,
                year: attendance.year,
                month: attendance.month,
                week: attendance.week,
                male: attendance.male,
                female: attendance.female,
                member_boys: attendance.member_boys,
                member_girls: attendance.member_girls,
                visitor_boys: attendance.visitor_boys,
                visitor_girls: attendance.visitor_girls,
                challenges: attendance.challenges,
                solutions: attendance.solutions,
                testimony: attendance.testimony,
                remarks: attendance.remarks,
            })
        } else if (isOpen && mode === 'add') {
            reset({
                attendance_type: attendanceType,
                state_id: 0,
                region_id: 0,
                district_id: 0,
                group_id: 0,
                old_group_id: undefined,
                year: currentYear,
                month: '',
                week: attendanceType === 'weekly' ? 1 : undefined,
                male: 0,
                female: 0,
                member_boys: 0,
                member_girls: 0,
                visitor_boys: 0,
                visitor_girls: 0,
                challenges: '',
                solutions: '',
                testimony: '',
                remarks: '',
            })
        }
    }, [isOpen, attendance, mode, attendanceType, reset])

    // Auto-populate hidden fields based on user's role and data
    useEffect(() => {
        if (!user) return
        
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
        
        // Auto-populate district_id if District combobox is hidden
        if (!roleVisibility.showDistrict && user.district_id) {
            setValue('district_id', user.district_id, { shouldValidate: true })
            trigger('district_id')
        }
    }, [user, roleVisibility, setValue, trigger])

    const currentStateId = watch('state_id')
    const currentRegionId = watch('region_id')
    const currentDistrictId = watch('district_id')
    const currentGroupId = watch('group_id')
    const currentOldGroupId = watch('old_group_id')

    // Setup month and year collections for Select
    const { collection: monthCollection } = useListCollection({
        initialItems: months.map(m => ({ label: m, value: m })),
        itemToString: (item) => item.label,
        itemToValue: (item) => item.value,
    })

    const { collection: yearCollection } = useListCollection({
        initialItems: years.map(y => ({ label: String(y), value: String(y) })),
        itemToString: (item) => item.label,
        itemToValue: (item) => item.value,
    })

    // state name is read directly when rendering combobox value
    // Region/OldGroup/Group names are now resolved by API-driven comboboxes

    // Lists and name resolvers are no longer needed with API-driven comboboxes

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
        setValue('old_group_id', 0, { shouldValidate: true })
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

    const handleRegionChange = (regionId?: number) => {
        setValue('region_id', regionId || 0, { shouldValidate: true })
        trigger('region_id')
        clearBelowOldGroup()
    }

    const handleOldGroupChange = (oldGroupId?: number) => {
        setValue('old_group_id', oldGroupId || 0, { shouldValidate: true })
        trigger('old_group_id')
        clearBelowGroup()
    }

    const handleGroupChange = (groupId?: number) => {
        setValue('group_id', groupId || 0, { shouldValidate: true })
        trigger('group_id')
        clearBelowDistrict()
    }

    const handleDistrictChange = (districtId?: number) => {
        setValue('district_id', districtId || 0, { shouldValidate: true })
        trigger('district_id')
    }

    const onSubmit = (data: YouthAttendanceFormData) => {
        onSave(data)

        console.log("pyload",data)
        // reset()
    }

    const handleClose = () => {
        onClose()
        reset()
    }

    const getSelectedStateName = () => states?.find(s => s.id === watch('state_id'))?.name || ''
    // Names are resolved internally by combobox components

    return (
        <Dialog.Root
            role="alertdialog"
            open={isOpen}
            onOpenChange={(e) => !e.open && handleClose()}
        >
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content rounded="xl" maxW={{ base: "sm", md: "md", lg: "3xl" }}>
                        <Dialog.Header>
                            <Dialog.Title>
                                {mode === 'add' ? 'Add' : 'Edit'} Youth {attendanceType === 'weekly' ? 'Weekly' : 'Revival'} Attendance
                            </Dialog.Title>
                        </Dialog.Header>

                        <Dialog.Body>
                            <form noValidate id="youth-attendance-form" onSubmit={handleSubmit(onSubmit)}>
                                <VStack gap="4">
                                    {/* Location Selection */}
                                    {roleVisibility.showState && (
                                        <Field.Root required invalid={!!errors.state_id}>
                                            <StateIdCombobox
                                                value={getSelectedStateName()}
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
                                                stateId={currentStateId}
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
                                                stateId={user?.state_id as number | undefined}
                                                regionId={currentRegionId}
                                                disabled={!currentRegionId}
                                            />
                                            <Field.ErrorText>{errors.old_group_id?.message}</Field.ErrorText>
                                        </Field.Root>
                                    )}

                                    {roleVisibility.showGroup && (
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
                                                groupId={currentGroupId}
                                                disabled={!currentGroupId}
                                            />
                                            <Field.ErrorText>{errors.district_id?.message}</Field.ErrorText>
                                        </Field.Root>
                                    )}

                                    {/* Date Selection */}
                                    <HStack gap="4" w="full">
                                        <Field.Root required invalid={!!errors.month} flex="1">
                                            <Field.Label>Month</Field.Label>
                                            <Select.Root
                                                collection={monthCollection}
                                                size="md"
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
                                                        {monthCollection.items.map(m => (
                                                            <Select.Item item={m} key={m.value}>
                                                                {m.label}
                                                                <Select.ItemIndicator />
                                                            </Select.Item>
                                                        ))}
                                                    </Select.Content>
                                                </Select.Positioner>
                                            </Select.Root>
                                            <Field.ErrorText>{errors.month?.message}</Field.ErrorText>
                                        </Field.Root>
                                        <Field.Root required invalid={!!errors.year} flex="1">
                                            <Field.Label>Year</Field.Label>
                                            <Select.Root
                                                collection={yearCollection}
                                                size="md"
                                                value={watch('year') ? [watch('year').toString()] : []}
                                                onValueChange={(value) => setValue('year', parseInt(value.value[0] || currentYear.toString(), 10), { shouldValidate: true })}
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
                                                        {yearCollection.items.map(y => (
                                                            <Select.Item item={y} key={y.value}>
                                                                {y.label}
                                                                <Select.ItemIndicator />
                                                            </Select.Item>
                                                        ))}
                                                    </Select.Content>
                                                </Select.Positioner>
                                            </Select.Root>
                                            <Field.ErrorText>{errors.year?.message}</Field.ErrorText>
                                        </Field.Root>

                                        {attendanceType === 'weekly' && (
                                            <Field.Root invalid={!!errors.week} flex="1">
                                                <Field.Label>Week</Field.Label>
                                                <NumberInput.Root
                                                    min={1}
                                                    defaultValue={"1"}
                                                    onValueChange={(e) => setValue('week', e.valueAsNumber)}
                                                >
                                                    <NumberInput.Control />
                                                    <NumberInput.Input rounded="lg" {...register('week', { valueAsNumber: true })} />
                                                </NumberInput.Root>
                                                <Field.ErrorText>{errors.week?.message}</Field.ErrorText>
                                            </Field.Root>
                                        )}
                                    </HStack>

                                    {/* Attendance Numbers */}
                                    <HStack gap="4" w="full">
                                        <Field.Root required invalid={!!errors.male} flex="1">
                                            <Field.Label>Male</Field.Label>
                                            <NumberInput.Root min={0} onValueChange={(e) => setValue('male', e.valueAsNumber)}>
                                                <NumberInput.Control />
                                                <NumberInput.Input rounded="lg" {...register('male', { valueAsNumber: true })} />
                                            </NumberInput.Root>
                                            <Field.ErrorText>{errors.male?.message}</Field.ErrorText>
                                        </Field.Root>

                                        <Field.Root required invalid={!!errors.female} flex="1">
                                            <Field.Label>Female</Field.Label>
                                            <NumberInput.Root min={0} onValueChange={(e) => setValue('female', e.valueAsNumber)}>
                                                <NumberInput.Control />
                                                <NumberInput.Input rounded="lg" {...register('female', { valueAsNumber: true })} />
                                            </NumberInput.Root>
                                            <Field.ErrorText>{errors.female?.message}</Field.ErrorText>
                                        </Field.Root>
                                    </HStack>

                                    {/* Member Numbers */}
                                    <HStack gap="4" w="full">
                                        <Field.Root required invalid={!!errors.member_boys} flex="1">
                                            <Field.Label>Member Boys</Field.Label>
                                            <NumberInput.Root min={0} onValueChange={(e) => setValue('member_boys', e.valueAsNumber)}>
                                                <NumberInput.Control />
                                                <NumberInput.Input rounded="lg" {...register('member_boys', { valueAsNumber: true })} />
                                            </NumberInput.Root>
                                            <Field.ErrorText>{errors.member_boys?.message}</Field.ErrorText>
                                        </Field.Root>

                                        <Field.Root required invalid={!!errors.member_girls} flex="1">
                                            <Field.Label>Member Girls</Field.Label>
                                            <NumberInput.Root min={0} onValueChange={(e) => setValue('member_girls', e.valueAsNumber)}>
                                                <NumberInput.Control />
                                                <NumberInput.Input rounded="lg" {...register('member_girls', { valueAsNumber: true })} />
                                            </NumberInput.Root>
                                            <Field.ErrorText>{errors.member_girls?.message}</Field.ErrorText>
                                        </Field.Root>
                                    </HStack>

                                    {/* Visitor Numbers */}
                                    <HStack gap="4" w="full">
                                        <Field.Root required invalid={!!errors.visitor_boys} flex="1">
                                            <Field.Label>Visitor Boys</Field.Label>
                                            <NumberInput.Root min={0} onValueChange={(e) => setValue('visitor_boys', e.valueAsNumber)}>
                                                <NumberInput.Control />
                                                <NumberInput.Input rounded="lg" {...register('visitor_boys', { valueAsNumber: true })} />
                                            </NumberInput.Root>
                                            <Field.ErrorText>{errors.visitor_boys?.message}</Field.ErrorText>
                                        </Field.Root>

                                        <Field.Root required invalid={!!errors.visitor_girls} flex="1">
                                            <Field.Label>Visitor Girls</Field.Label>
                                            <NumberInput.Root min={0} onValueChange={(e) => setValue('visitor_girls', e.valueAsNumber)}>
                                                <NumberInput.Control />
                                                <NumberInput.Input rounded="lg" {...register('visitor_girls', { valueAsNumber: true })} />
                                            </NumberInput.Root>
                                            <Field.ErrorText>{errors.visitor_girls?.message}</Field.ErrorText>
                                        </Field.Root>
                                    </HStack>

                                    {/* Text Fields */}
                                    <Field.Root invalid={!!errors.challenges} w="full">
                                        <Field.Label>Challenges</Field.Label>
                                        <Textarea placeholder="Challenges" variant="subtle" minH="80px" {...register('challenges')} />
                                        <Field.ErrorText>{errors.challenges?.message}</Field.ErrorText>
                                    </Field.Root>

                                    <Field.Root invalid={!!errors.solutions} w="full">
                                        <Field.Label>Solutions</Field.Label>
                                        <Textarea placeholder="Solutions" variant="subtle" minH="80px" {...register('solutions')} />
                                        <Field.ErrorText>{errors.solutions?.message}</Field.ErrorText>
                                    </Field.Root>

                                    <Field.Root invalid={!!errors.testimony} w="full">
                                        <Field.Label>Testimony</Field.Label>
                                        <Textarea placeholder="Testimony" variant="subtle" minH="80px" {...register('testimony')} />
                                        <Field.ErrorText>{errors.testimony?.message}</Field.ErrorText>
                                    </Field.Root>

                                    <Field.Root invalid={!!errors.remarks} w="full">
                                        <Field.Label>Remarks</Field.Label>
                                        <Textarea placeholder="Remarks" variant="subtle" minH="80px" {...register('remarks')} />
                                        <Field.ErrorText>{errors.remarks?.message}</Field.ErrorText>
                                    </Field.Root>

                                    <input type="hidden" {...register('attendance_type')} />
                                    <input type="hidden" {...register('state_id', { valueAsNumber: true })} />
                                    <input type="hidden" {...register('region_id', { valueAsNumber: true })} />
                                    <input type="hidden" {...register('district_id', { valueAsNumber: true })} />
                                    <input type="hidden" {...register('group_id', { valueAsNumber: true })} />
                                    <input type="hidden" {...register('old_group_id', { valueAsNumber: true })} />
                                </VStack>
                            </form>
                        </Dialog.Body>

                        <Dialog.Footer>
                            <Dialog.ActionTrigger asChild>
                                <Button variant="outline">Cancel</Button>
                            </Dialog.ActionTrigger>
                            <Button
                                type="submit"
                                form="youth-attendance-form"
                                colorPalette="accent"
                                loading={isLoading}
                                disabled={isLoading}
                            >
                                {mode === 'add' ? 'Add Record' : 'Update Record'}
                            </Button>
                        </Dialog.Footer>

                        <Dialog.CloseTrigger asChild>
                            <CloseButton />
                        </Dialog.CloseTrigger>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    )
}
