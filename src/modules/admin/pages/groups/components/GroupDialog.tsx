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
} from "@chakra-ui/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { groupSchema, type GroupFormData } from "../../../schemas/group.schema"
import type { Group } from "@/types/groups.type"
import { useEffect, useMemo, useRef, useState } from "react"
import { useMe } from "@/hooks/useMe"
import { useOldGroups } from "@/modules/admin/hooks/useOldGroup"
import { useGroups } from "@/modules/admin/hooks/useGroup"
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

const GroupDialog = ({ isLoading, isOpen, group, mode, onClose, onSave }: GroupDialogProps) => {
    const { user } = useMe()
    const { oldGroups } = useOldGroups()
    const { groups } = useGroups()
    const { states, isLoading: isStatesLoading } = useStates()
    const { regions, isLoading: isRegionsLoading } = useRegions()
    const [selectedStateName, setSelectedStateName] = useState('')
    const [selectedRegionName, setSelectedRegionName] = useState('')
    const generatedCodesCache = useRef<Set<string>>(new Set())
    const userStateId = user?.state_id ?? 0
    const userRegionId = user?.region_id ?? 0
    const isSuperAdmin = user?.roles?.some((role) => role.toLowerCase() === 'super admin') ?? false

    const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<GroupFormData>({
        resolver: zodResolver(groupSchema),
        defaultValues: {
            group_name: group?.name || '',
            leader: group?.leader || '',
            state_id: group?.state_id || 0,
            region_id: group?.region_id || 0,
            old_group_id: group?.old_group_id || undefined,
            code: group?.code || '',
        }
    })

    const currentOldGroupName = watch('old_group_name')
    const currentGroupName = watch('group_name')
    const watchedStateId = watch('state_id')
    const watchedRegionId = watch('region_id')

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

    const derivedStateName = useMemo(() => {
        if (selectedStateName) {
            return selectedStateName
        }

        if (watchedStateId && states?.length) {
            const matchedState = states.find((state) => state.id === watchedStateId)
            if (matchedState) {
                return matchedState.name
            }
        }

        return group?.state ?? ''
    }, [selectedStateName, states, watchedStateId, group?.state])

    const filteredRegions = useMemo(() => {
        if (!regions || regions.length === 0 || (!watchedStateId && !derivedStateName)) {
            return []
        }

        return regions.filter((region) => {
            if (region.state_id !== undefined && region.state_id !== null && watchedStateId) {
                return Number(region.state_id) === Number(watchedStateId)
            }

            if (derivedStateName && region.state) {
                return region.state.toLowerCase() === derivedStateName.toLowerCase()
            }

            return false
        })
    }, [regions, watchedStateId, derivedStateName])

    // Handle old group selection - convert name to ID
    const handleOldGroupChange = (oldGroupName: string) => {
        if (oldGroupName) {
            const oldGroup = oldGroups?.find(og => og.name === oldGroupName)
            if (oldGroup) {
                setValue('old_group_id', oldGroup.id, { shouldValidate: true })
                setValue('old_group_name', oldGroupName)
            }
        } else {
            setValue('old_group_id', undefined)
            setValue('old_group_name', '')
        }
    }

    const handleStateChange = (stateName: string) => {
        setSelectedStateName(stateName)

        if (!stateName) {
            setValue('state_id', 0, { shouldValidate: true })
            setSelectedRegionName('')
            setValue('region_id', 0, { shouldValidate: true })
            return
        }

        const selectedState = states?.find((state) => state.name === stateName)
        const nextStateId = selectedState?.id ?? 0

        setValue('state_id', nextStateId, { shouldValidate: true })
        setSelectedRegionName('')
        setValue('region_id', 0, { shouldValidate: true })
    }

    const handleRegionChange = (regionName: string) => {
        setSelectedRegionName(regionName)

        if (!regionName) {
            setValue('region_id', 0, { shouldValidate: true })
            return
        }

        const selectedRegion = regions?.find((region) => region.name === regionName)
        setValue('region_id', selectedRegion?.id ?? 0, { shouldValidate: true })
    }

    const onSubmit = (data: GroupFormData) => {
        onSave(data)
        reset()
    }

    const handleClose = () => {
        onClose()
        reset()
        setSelectedStateName('')
        setSelectedRegionName('')
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
                    state_id: isSuperAdmin ? 0 : userStateId,
                    region_id: isSuperAdmin ? 0 : userRegionId,
                    old_group_id: undefined,
                    old_group_name: '',
                })
            }
        }
    }, [isOpen, group, reset, user, oldGroups, isSuperAdmin, userStateId, userRegionId])

    useEffect(() => {
        if (!isSuperAdmin || !isOpen) {
            return
        }

        if (watchedStateId && states?.length) {
            const matchedState = states.find((state) => state.id === watchedStateId)
            if (matchedState) {
                setSelectedStateName(matchedState.name)
                return
            }
        }

        if (group?.state && states?.length) {
            const matchedState = states.find(
                (state) => state.name.toLowerCase() === group.state.toLowerCase()
            )

            if (matchedState) {
                setSelectedStateName(matchedState.name)
                setValue('state_id', matchedState.id, { shouldValidate: true })
            } else {
                setSelectedStateName(group.state)
            }
        }
    }, [isSuperAdmin, isOpen, states, watchedStateId, group?.state, setValue])

    useEffect(() => {
        if (!isSuperAdmin || !isOpen) {
            return
        }

        if (watchedRegionId && regions?.length) {
            const matchedRegion = regions.find((region) => region.id === watchedRegionId)
            if (matchedRegion) {
                setSelectedRegionName(matchedRegion.name)
            }
        }
    }, [isSuperAdmin, isOpen, regions, watchedRegionId])

    useEffect(() => {
        if (!isSuperAdmin || !isOpen) {
            return
        }

        if (watchedRegionId && regions?.length) {
            const matchedRegion = regions.find((region) => region.id === watchedRegionId)
            if (matchedRegion) {
                setSelectedRegionName(matchedRegion.name)
                return
            }
        }

        if (group?.region && regions?.length) {
            const matchedRegion = regions.find(
                (region) => region.name.toLowerCase() === group.region.toLowerCase()
            )

            if (matchedRegion) {
                setSelectedRegionName(matchedRegion.name)
                setValue('region_id', matchedRegion.id, { shouldValidate: true })
            } else {
                setSelectedRegionName(group.region)
            }
        }
    }, [isSuperAdmin, isOpen, regions, watchedRegionId, group?.region, setValue])

    useEffect(() => {
        if (!isOpen || isSuperAdmin) {
            return
        }

        if (userStateId) {
            setValue('state_id', userStateId, { shouldValidate: true })
        }

        if (userRegionId) {
            setValue('region_id', userRegionId, { shouldValidate: true })
        }
    }, [isOpen, isSuperAdmin, setValue, userRegionId, userStateId])

    useEffect(() => {
        if (!isOpen || !group || !states?.length) {
            return
        }

        if ((!watchedStateId || watchedStateId === 0) && group.state) {
            const matchedState = states.find(
                (state) => state.name.toLowerCase() === group.state.toLowerCase()
            )

            if (matchedState) {
                setValue('state_id', matchedState.id, { shouldValidate: true })
            }
        }
    }, [isOpen, group, states, setValue, watchedStateId])

    useEffect(() => {
        if (!isOpen || !group || !regions?.length) {
            return
        }

        if ((!watchedRegionId || watchedRegionId === 0) && group.region) {
            const matchedRegion = regions.find(
                (region) => region.name.toLowerCase() === group.region.toLowerCase()
            )

            if (matchedRegion) {
                setValue('region_id', matchedRegion.id, { shouldValidate: true })
            }
        }
    }, [isOpen, group, regions, setValue, watchedRegionId])

    const genUuidFragment = () => {
        if (typeof crypto !== 'undefined' && typeof (crypto as any).randomUUID === 'function') {
            return (crypto as any).randomUUID().slice(0, 4)
        }
        return Math.random().toString(16).slice(2, 6)
    }

    const generateUniqueGroupCode = (name: string) => {
        const words = name.trim().split(/\s+/).filter(Boolean)
        const prefix = words.map(w => w.slice(0, 2).toUpperCase()).join('')
        let code = `${prefix}_${genUuidFragment()}`
        const existingCodes = (groups || []).map(g => g.code)
        let attempt = 0
        while (existingCodes.includes(code) || generatedCodesCache.current.has(code)) {
            code = `${prefix}_${genUuidFragment()}`
            attempt++
            if (attempt > 10) break
        }
        generatedCodesCache.current.add(code)
        return code
    }

    useEffect(() => {
        if (mode !== 'add') return
        if (!currentGroupName) {
            setValue('code', '')
            return
        }
        const code = generateUniqueGroupCode(currentGroupName)
        setValue('code', code)
    }, [currentGroupName, mode])

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

                                    {isSuperAdmin && (
                                        <Field.Root required invalid={!!errors.state_id}>
                                            <StateIdCombobox
                                                required
                                                value={selectedStateName}
                                                onChange={handleStateChange}
                                                invalid={!!errors.state_id}
                                                disabled={isStatesLoading || isLoading}
                                            />
                                            <Field.ErrorText>{errors.state_id?.message}</Field.ErrorText>
                                        </Field.Root>
                                    )}

                                    {isSuperAdmin && (
                                        <Field.Root required invalid={!!errors.region_id}>
                                            <RegionIdCombobox
                                                required
                                                value={selectedRegionName}
                                                onChange={handleRegionChange}
                                                invalid={!!errors.region_id}
                                                disabled={(!watchedStateId && !derivedStateName) || isRegionsLoading || isLoading}
                                                items={filteredRegions}
                                            />
                                            <Field.ErrorText>{errors.region_id?.message}</Field.ErrorText>
                                        </Field.Root>
                                    )}

                                    {/* Old Group Selection */}
                                    <Field.Root invalid={!!errors.old_group_id}>
                                        <OldGroupIdCombobox
                                            value={selectedOldGroupName}
                                            onChange={handleOldGroupChange}
                                            invalid={!!errors.old_group_id}
                                        />
                                        <Field.ErrorText>{errors.old_group_id?.message}</Field.ErrorText>
                                    </Field.Root>

                                    <Field.Root required invalid={!!errors.code}>
                                        <Field.Label>Group Code
                                            <Field.RequiredIndicator />
                                        </Field.Label>
                                        <Input
                                            rounded="lg"
                                            placeholder="Group code will be auto-generated"
                                            readOnly
                                            {...register('code')}
                                        />
                                        <Field.ErrorText>{errors.code?.message}</Field.ErrorText>
                                    </Field.Root>

                                    {/* Hidden inputs for state_id, region_id, and old_group_id */}
                                    <input type="hidden" {...register('state_id', { valueAsNumber: true })} />
                                    <input type="hidden" {...register('region_id', { valueAsNumber: true })} />
                                    <input type="hidden" {...register('old_group_id', { valueAsNumber: true })} />
                                    <input type="hidden" {...register('old_group_name')} />
                                    <input type="hidden" {...register('code')} />
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