// components/groups/components/GroupDialog.tsx
"use client"

import {
    Dialog,
    Portal,
    Field,
    CloseButton,
    Button,
    VStack,
    Input,
    Select,
    createListCollection,
} from "@chakra-ui/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { groupSchema, type GroupFormData } from "../../../schemas/group.schema"
import type { Group } from "@/types/groups.type"
import { useEffect } from "react"
import { useStates } from "../../../hooks/useState"
import { useRegions } from "../../../hooks/useRegion"
import { useDistricts } from "../../../hooks/useDistrict"
import DistrictIdCombobox from "@/modules/admin/components/DistrictIdCombobox"
import RegionIdCombobox from "@/modules/admin/components/RegionIdCombobox"
import StateIdCombobox from "@/modules/admin/components/StateIdCombobox"

interface GroupDialogProps {
    isLoading?: boolean
    isOpen: boolean
    group?: Group
    mode: 'add' | 'edit'
    onClose: () => void
    onSave: (data: GroupFormData) => void
}

// Access level options
const ACCESS_LEVELS = createListCollection({
    items: [
        { label: 'State Admin', value: 'state-admin' },
        { label: 'Region Admin', value: 'region-admin' },
        { label: 'District Admin', value: 'district-admin' },
        { label: 'Group Admin', value: 'group-admin' },
        { label: 'User', value: 'user' },
    ],
})

const GroupDialog = ({ isLoading, isOpen, group, mode, onClose, onSave }: GroupDialogProps) => {
    const { states } = useStates()
    const { regions } = useRegions()
    const { districts } = useDistricts()

    const { register, handleSubmit, formState: { errors }, setValue, watch, reset, trigger } = useForm<GroupFormData>({
        resolver: zodResolver(groupSchema),
        defaultValues: {
            group_name: group?.group_name || '',
            leader: group?.leader || '',
            access_level: group?.access_level || 'user',
            state_id: group?.state_id || 0,
            region_id: group?.region_id || 0,
            district_id: group?.district_id || 0,
        }
    })

    const currentStateId = watch('state_id')
    const currentRegionId = watch('region_id')
    const currentDistrictId = watch('district_id')
    const currentAccessLevel = watch('access_level')

    const handleStateChange = (stateName: string) => {
        const state = states?.find(s => s.name === stateName)
        if (state) {
            setValue('state_id', state.id, { shouldValidate: true })
            trigger('state_id')
        }
    }

    const handleRegionChange = (regionName: string) => {
        const region = regions?.find(r => r.name === regionName)
        if (region) {
            setValue('region_id', region.id, { shouldValidate: true })
            trigger('region_id')
        }
    }

    const handleDistrictChange = (districtName: string) => {
        const district = districts?.find(d => d.name === districtName)
        if (district) {
            setValue('district_id', district.id, { shouldValidate: true })
            trigger('district_id')
        }
    }

    const handleAccessLevelChange = (value: string[]) => {
        if (value.length > 0) {
            setValue('access_level', value[0], { shouldValidate: true })
            trigger('access_level')
        }
    }

    const onSubmit = (data: GroupFormData) => {
        onSave(data)
        reset()
    }

    const handleClose = () => {
        onClose()
        reset()
    }

    // Reset form when dialog opens with group data
    useEffect(() => {
        if (isOpen && group) {
            reset({
                group_name: group.group_name,
                leader: group.leader,
                access_level: group.access_level,
                state_id: group.state_id,
                region_id: group.region_id,
                district_id: group.district_id,
            })
        }
    }, [isOpen, group, reset])

    // Get display names for selected IDs
    const getSelectedStateName = () => {
        return states?.find(s => s.id === currentStateId)?.name || ''
    }

    const getSelectedRegionName = () => {
        return regions?.find(r => r.id === currentRegionId)?.name || ''
    }

    const getSelectedDistrictName = () => {
        return districts?.find(d => d.id === currentDistrictId)?.name || ''
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
                    <Dialog.Content rounded="xl" maxW="2xl">
                        <Dialog.Header>
                            <Dialog.Title>
                                {mode === 'add' ? 'Add New Group' : 'Update Group'}
                            </Dialog.Title>
                        </Dialog.Header>

                        <Dialog.Body>
                            <form noValidate id="group-form" onSubmit={handleSubmit(onSubmit)}>
                                <VStack gap="4" colorPalette={"accent"}>
                                    <Field.Root required invalid={!!errors.group_name}>
                                        <Field.Label>Group Name
                                            <Field.RequiredIndicator />
                                        </Field.Label>
                                        <Input
                                            rounded="lg"
                                            placeholder="Enter group name"
                                            {...register('group_name')}
                                        />
                                        <Field.ErrorText>{errors.group_name?.message}</Field.ErrorText>
                                    </Field.Root>

                                    <Field.Root required invalid={!!errors.leader}>
                                        <Field.Label>Group Leader
                                            <Field.RequiredIndicator />
                                        </Field.Label>
                                        <Input
                                            rounded="lg"
                                            placeholder="Enter group leader name"
                                            {...register('leader')}
                                        />
                                        <Field.ErrorText>{errors.leader?.message}</Field.ErrorText>
                                    </Field.Root>

                                    <Field.Root required invalid={!!errors.access_level}>
                                        <Field.Label>Access Level
                                            <Field.RequiredIndicator />
                                        </Field.Label>
                                        <Select.Root
                                            collection={ACCESS_LEVELS}
                                            value={currentAccessLevel ? [currentAccessLevel] : []}
                                            onValueChange={(e) => handleAccessLevelChange(e.value)}
                                            size="md"
                                        >
                                            <Select.HiddenSelect {...register('access_level')} />
                                            <Select.Label>Select Access Level</Select.Label>
                                            <Select.Control>
                                                <Select.Trigger cursor={"pointer"} rounded="lg">
                                                    <Select.ValueText placeholder="Select access level" />
                                                </Select.Trigger>
                                                <Select.IndicatorGroup>
                                                    <Select.Indicator />
                                                </Select.IndicatorGroup>
                                            </Select.Control>
                                            {/* <Portal> */}
                                            <Select.Positioner>
                                                <Select.Content rounded="xl">
                                                    {ACCESS_LEVELS.items.map((level) => (
                                                        <Select.Item cursor="pointer" item={level} key={level.value}>
                                                            {level.label}
                                                            <Select.ItemIndicator />
                                                        </Select.Item>
                                                    ))}
                                                </Select.Content>
                                            </Select.Positioner>
                                            {/* </Portal> */}
                                        </Select.Root>
                                        <Field.ErrorText>{errors.access_level?.message}</Field.ErrorText>
                                    </Field.Root>

                                    {/* State Selection */}
                                    <Field.Root required invalid={!!errors.state_id}>
                                        <StateIdCombobox
                                            value={getSelectedStateName()}
                                            onChange={handleStateChange}
                                            required
                                            invalid={!!errors.state_id}
                                        />
                                        <Field.ErrorText>{errors.state_id?.message}</Field.ErrorText>
                                    </Field.Root>

                                    {/* Region Selection */}
                                    <Field.Root required invalid={!!errors.region_id}>
                                        <RegionIdCombobox
                                            value={getSelectedRegionName()}
                                            onChange={handleRegionChange}
                                            required
                                            invalid={!!errors.region_id}
                                        />
                                        <Field.ErrorText>{errors.region_id?.message}</Field.ErrorText>
                                    </Field.Root>

                                    {/* District Selection */}
                                    <Field.Root required invalid={!!errors.district_id}>
                                        <DistrictIdCombobox
                                            value={getSelectedDistrictName()}
                                            onChange={handleDistrictChange}
                                            required
                                            invalid={!!errors.district_id}
                                        />
                                        <Field.ErrorText>{errors.district_id?.message}</Field.ErrorText>
                                    </Field.Root>

                                    {/* Hidden inputs for React Hook Form validation */}
                                    <input type="hidden" {...register('state_id', { valueAsNumber: true })} />
                                    <input type="hidden" {...register('region_id', { valueAsNumber: true })} />
                                    <input type="hidden" {...register('district_id', { valueAsNumber: true })} />
                                </VStack>
                            </form>
                        </Dialog.Body>

                        <Dialog.Footer>
                            <Dialog.ActionTrigger asChild>
                                <Button rounded="xl" variant="outline">Cancel</Button>
                            </Dialog.ActionTrigger>

                            <Button
                                rounded="xl"
                                type="submit"
                                form="group-form"
                                colorPalette="accent"
                                loading={isLoading}
                                loadingText={mode === 'add' ? 'Adding Group' : 'Updating Group'}
                                disabled={isLoading}
                            >
                                {mode === 'add' ? 'Add Group' : 'Update Group'}
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

export default GroupDialog;