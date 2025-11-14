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
import { useRegions } from "@/modules/admin/hooks/useRegion"
import { useOldGroups } from "@/modules/admin/hooks/useOldGroup"
import StateIdCombobox from "@/modules/admin/components/StateIdCombobox"
import RegionIdCombobox from "@/modules/admin/components/RegionIdCombobox"
import OldGroupIdCombobox from "@/modules/admin/components/OldGroupIdCombobox"
import { useMemo } from "react"

interface YouthAttendanceDialogProps {
    isOpen: boolean
    isLoading?: boolean
    mode: 'add' | 'edit'
    attendanceType: 'weekly' | 'revival'
    onClose: () => void
    onSave: (data: YouthAttendanceFormData) => void
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
}: YouthAttendanceDialogProps) => {
    const { states } = useStates()
    const { regions } = useRegions()

    const { register, handleSubmit, formState: { errors }, setValue, watch, reset, trigger } = useForm<YouthAttendanceFormData>({
        resolver: zodResolver(youthAttendanceSchema),
        defaultValues: {
            attendance_type: attendanceType,
            state_id: 0,
            region_id: 0,
            old_group_id: 0,
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

    const currentStateId = watch('state_id')
    const currentRegionId = watch('region_id')
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

    const getStateNameById = (stateId: number) => {
        return states?.find(s => s.id === stateId)?.name || ''
    }

    const filteredRegions = useMemo(() => {
        if (!currentStateId || currentStateId === 0) return []
        const stateName = getStateNameById(currentStateId)
        if (!stateName) return []
        return regions?.filter(r => r.state === stateName) || []
    }, [regions, currentStateId, states])



    const { oldGroups } = useOldGroups()

    const getOldGroupNameById = (oldGroupId?: number | null) => {
        if (!oldGroupId) return ''
        return oldGroups?.find(g => g.id === oldGroupId)?.name || ''
    }

    const handleStateChange = (stateName: string) => {
        const state = states?.find(s => s.name === stateName)
        if (state) {
            setValue('state_id', state.id, { shouldValidate: true })
            trigger('state_id')
            setValue('region_id', 0)
            setValue('old_group_id', 0)
        }
    }

    const handleRegionChange = (regionName: string) => {
        const region = filteredRegions?.find(r => r.name === regionName)
        if (region) {
            setValue('region_id', region.id, { shouldValidate: true })
            trigger('region_id')
            setValue('old_group_id', 0)
        }
    }

    const handleOldGroupChange = (oldGroupName: string) => {
        if (!oldGroupName) {
            setValue('old_group_id', 0)
            return
        }

        const selected = oldGroups?.find(g => g.name === oldGroupName)
        if (selected) {
            setValue('old_group_id', selected.id, { shouldValidate: true })
            // also ensure state/region reflect selected old group
            setValue('state_id', selected.state_id)
            setValue('region_id', selected.region_id)
            trigger('old_group_id')
        }
    }

    const onSubmit = (data: YouthAttendanceFormData) => {
        onSave(data)
        reset()
    }

    const handleClose = () => {
        onClose()
        reset()
    }

    const getSelectedStateName = () => states?.find(s => s.id === watch('state_id'))?.name || ''
    const getSelectedRegionName = () => regions?.find(r => r.id === watch('region_id'))?.name || ''

    return (
        <Dialog.Root
            open={isOpen}
            onOpenChange={(e) => !e.open && handleClose()}
        >
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content rounded="xl" maxW="3xl">
                        <Dialog.Header>
                            <Dialog.Title>
                                {mode === 'add' ? 'Add' : 'Edit'} Youth {attendanceType === 'weekly' ? 'Weekly' : 'Revival'} Attendance
                            </Dialog.Title>
                        </Dialog.Header>

                        <Dialog.Body>
                            <form noValidate id="youth-attendance-form" onSubmit={handleSubmit(onSubmit)}>
                                <VStack gap="4">
                                    {/* Location Selection */}
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
                                            value={getSelectedRegionName()}
                                            onChange={handleRegionChange}
                                            required
                                            invalid={!!errors.region_id}
                                            items={filteredRegions}
                                            disabled={!currentStateId || currentStateId === 0}
                                        />
                                        <Field.ErrorText>{errors.region_id?.message}</Field.ErrorText>
                                    </Field.Root>

                                    <Field.Root invalid={!!errors.old_group_id}>
                                        <OldGroupIdCombobox
                                            value={getOldGroupNameById(currentOldGroupId)}
                                            onChange={handleOldGroupChange}
                                            invalid={!!errors.old_group_id}
                                            disabled={!currentStateId || currentStateId === 0 || !currentRegionId || currentRegionId === 0}
                                        />
                                        <Field.ErrorText>{errors.old_group_id?.message}</Field.ErrorText>
                                    </Field.Root>

                                    {/* Date Selection */}
                                    <HStack gap="4" w="full">
                                        <Field.Root required invalid={!!errors.month} flex="1">
                                            <Field.Label>Month</Field.Label>
                                            <Select.Root
                                                collection={monthCollection}
                                                size="md"
                                                {...register('month')}
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
                                                {...register('year', { valueAsNumber: true })}
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
