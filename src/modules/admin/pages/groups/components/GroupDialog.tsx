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
import { useEffect, useMemo } from "react"
import { useMe } from "@/hooks/useMe"
import { useOldGroups } from "@/modules/admin/hooks/useOldGroup"
import OldGroupIdCombobox from "@/modules/admin/components/OldGroupIdCombobox"
import { useStates } from "@/modules/admin/hooks/useState"
import { useRegions } from "@/modules/admin/hooks/useRegion"
import StateIdCombobox from "@/modules/admin/components/StateIdCombobox"
import RegionIdCombobox from "@/modules/admin/components/RegionIdCombobox"

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
    const { user } = useMe()
    const { oldGroups } = useOldGroups()
    const { states } = useStates()
    const { regions } = useRegions()

    const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<GroupFormData>({
        resolver: zodResolver(groupSchema),
        defaultValues: {
            group_name: group?.name || '',
            leader: group?.leader || '',
            access_level: 'user',
            state_id: group?.state_id || 0,
            region_id: group?.region_id || 0,
            old_group_id: group?.old_group_id || undefined,
        }
    })

    const currentAccessLevel = watch('access_level')
    const currentOldGroupName = watch('old_group_name')
    const currentStateId = watch('state_id')
    const currentRegionId = watch('region_id')
    const currentOldGroupId = watch('old_group_id')

    const isSuperAdmin = user?.roles?.includes('Super Admin')

    // Get old group name for display
    const selectedOldGroupName = useMemo(() => {
        // Prioritize the form value (user's current selection)
        if (currentOldGroupName) {
            return currentOldGroupName
        }
        // If no form value, use group's old_group directly
        if (group?.old_group) {
            return group.old_group
        }
        return ''
    }, [currentOldGroupName, group?.old_group])

    const selectedStateName = useMemo(() => {
        if (states && currentStateId) {
            const match = states.find(state => state.id === currentStateId)
            if (match) return match.name
        }
        return ''
    }, [states, currentStateId])

    const selectedRegionName = useMemo(() => {
        if (regions && currentRegionId) {
            const match = regions.find(region => region.id === currentRegionId)
            if (match) return match.name
        }
        return ''
    }, [regions, currentRegionId])

    const availableOldGroups = useMemo(() => {
        if (!oldGroups || oldGroups.length === 0) return []
        if (currentRegionId) {
            return oldGroups.filter(og => og.region_id === currentRegionId)
        }
        if (currentStateId) {
            return oldGroups.filter(og => og.state_id === currentStateId)
        }
        return oldGroups
    }, [oldGroups, currentRegionId, currentStateId])

    // Handle old group selection - convert name to ID
    const handleOldGroupChange = (oldGroupName: string) => {
        if (oldGroupName) {
            const oldGroup = availableOldGroups?.find(og => og.name === oldGroupName) || oldGroups?.find(og => og.name === oldGroupName)
            if (oldGroup) {
                setValue('old_group_id', oldGroup.id, { shouldValidate: true })
                setValue('old_group_name', oldGroupName)
            }
        } else {
            setValue('old_group_id', undefined)
            setValue('old_group_name', '')
        }
    }

    const handleAccessLevelChange = (value: string[]) => {
        if (value.length > 0) {
            setValue('access_level', value[0], { shouldValidate: true })
        }
    }

    const handleStateChange = (stateName: string) => {
        if (!stateName) {
            setValue('state_id', 0, { shouldValidate: true })
            setValue('region_id', 0)
            setValue('old_group_id', undefined)
            setValue('old_group_name', '')
            return
        }

        const selectedState = states?.find(state => state.name === stateName)
        if (selectedState) {
            setValue('state_id', selectedState.id, { shouldValidate: true })
            setValue('region_id', 0, { shouldValidate: true })
            setValue('old_group_id', undefined)
            setValue('old_group_name', '')
        }
    }

    const handleRegionChange = (regionName: string) => {
        if (!regionName) {
            setValue('region_id', 0, { shouldValidate: true })
            setValue('old_group_id', undefined)
            setValue('old_group_name', '')
            return
        }

        const selectedRegion = regions?.find(region => region.name === regionName)
        if (selectedRegion) {
            setValue('region_id', selectedRegion.id, { shouldValidate: true })
            setValue('old_group_id', undefined)
            setValue('old_group_name', '')
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

    // Reset form when dialog opens with group data or set from logged in user
    useEffect(() => {
        if (isOpen) {
            if (group) {
                // Find old_group_id from old_group name if needed
                let oldGroupId: number | undefined = undefined
                if (group.old_group && oldGroups) {
                    const foundOldGroup = oldGroups.find(og => og.name === group.old_group)
                    oldGroupId = foundOldGroup?.id
                }
                
                reset({
                    group_name: group.name,
                    leader: group.leader || '',
                    access_level: group.access_level || 'user',
                    state_id: group.state_id || 0,
                    region_id: group.region_id || 0,
                    old_group_id: oldGroupId,
                    old_group_name: group.old_group || '',
                })
            } else {
                // For new groups, use logged in user's state_id and region_id
                reset({
                    group_name: '',
                    leader: '',
                    access_level: 'user',
                    state_id: user?.state_id || 0,
                    region_id: user?.region_id || 0,
                    old_group_id: undefined,
                    old_group_name: '',
                })
            }
        }
    }, [isOpen, group, reset, user, oldGroups])

    // Auto-select old group for non super admins during creation
    useEffect(() => {
        if (isSuperAdmin || mode !== 'add' || group) return
        if (!currentRegionId || !oldGroups || oldGroups.length === 0) return

        const matchingOldGroup = oldGroups.find(og => og.region_id === currentRegionId)
        if (matchingOldGroup && currentOldGroupId !== matchingOldGroup.id) {
            setValue('old_group_id', matchingOldGroup.id, { shouldValidate: true })
            setValue('old_group_name', matchingOldGroup.name)
        }
    }, [isSuperAdmin, mode, group, currentRegionId, oldGroups, currentOldGroupId, setValue])

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

                                    {isSuperAdmin ? (
                                        <>
                                            <Field.Root required invalid={!!errors.state_id}>
                                                <StateIdCombobox
                                                    value={selectedStateName}
                                                    onChange={handleStateChange}
                                                    invalid={!!errors.state_id}
                                                />
                                                <Field.ErrorText>{errors.state_id?.message}</Field.ErrorText>
                                            </Field.Root>

                                            <Field.Root required invalid={!!errors.region_id}>
                                                <RegionIdCombobox
                                                    value={selectedRegionName}
                                                    onChange={handleRegionChange}
                                                    invalid={!!errors.region_id}
                                                    items={regions?.filter(region => region.state_id === currentStateId) || []}
                                                    disabled={!currentStateId}
                                                />
                                                <Field.ErrorText>{errors.region_id?.message}</Field.ErrorText>
                                            </Field.Root>

                                            <Field.Root invalid={!!errors.old_group_id}>
                                                <OldGroupIdCombobox
                                                    value={selectedOldGroupName}
                                                    onChange={handleOldGroupChange}
                                                    invalid={!!errors.old_group_id}
                                                    items={availableOldGroups}
                                                    disabled={!currentRegionId}
                                                />
                                                <Field.ErrorText>{errors.old_group_id?.message}</Field.ErrorText>
                                            </Field.Root>
                                        </>
                                    ) : (
                                        <>
                                            <Field.Root required invalid={!!errors.state_id}>
                                                <Field.Label>State</Field.Label>
                                                <Input
                                                    rounded="lg"
                                                    value={selectedStateName || 'State will be auto-selected'}
                                                    readOnly
                                                    disabled
                                                />
                                                <Field.ErrorText>{errors.state_id?.message}</Field.ErrorText>
                                            </Field.Root>

                                            <Field.Root required invalid={!!errors.region_id}>
                                                <Field.Label>Region</Field.Label>
                                                <Input
                                                    rounded="lg"
                                                    value={selectedRegionName || 'Region will be auto-selected'}
                                                    readOnly
                                                    disabled
                                                />
                                                <Field.ErrorText>{errors.region_id?.message}</Field.ErrorText>
                                            </Field.Root>

                                            <Field.Root invalid={!!errors.old_group_id}>
                                                <Field.Label>Old Group</Field.Label>
                                                <Input
                                                    rounded="lg"
                                                    value={selectedOldGroupName || 'Old group will be auto-selected'}
                                                    readOnly
                                                    disabled
                                                />
                                                <Field.ErrorText>{errors.old_group_id?.message}</Field.ErrorText>
                                            </Field.Root>
                                        </>
                                    )}

                                    {/* Hidden inputs for state_id, region_id, and old_group_id */}
                                    <input type="hidden" {...register('state_id', { valueAsNumber: true })} />
                                    <input type="hidden" {...register('region_id', { valueAsNumber: true })} />
                                    <input type="hidden" {...register('old_group_id', { valueAsNumber: true })} />
                                    <input type="hidden" {...register('old_group_name')} />
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