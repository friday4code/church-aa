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
import { useEffect, useRef, useState } from "react"
import { useMe } from "@/hooks/useMe"
import { adminApi } from "@/api/admin.api"
import OldGroupIdCombobox from "@/modules/admin/components/OldGroupIdCombobox"
import { useStates } from "@/modules/admin/hooks/useState"
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
    const { states, isLoading: isStatesLoading } = useStates()
    const [selectedStateName, setSelectedStateName] = useState('')
    const isRegionAdmin = user?.roles?.some((role) => role.toLowerCase() === 'region admin') ?? false
    const [apiGroups, setApiGroups] = useState<Array<{ id: number; name: string; code?: string }>>([])
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

    const currentOldGroupId = watch('old_group_id')
    const currentGroupName = watch('group_name')
    const watchedStateId = watch('state_id')
    const watchedRegionId = watch('region_id')

    // state name is tracked via selectedStateName and watchedStateId

    const handleOldGroupChange = (oldGroupId?: number) => {
        setValue('old_group_id', oldGroupId ?? 0, { shouldValidate: true })
        setValue('old_group_name', '')
    }

    const handleStateChange = (stateName: string) => {
        setSelectedStateName(stateName)

        if (!stateName) {
            setValue('state_id', 0, { shouldValidate: true })
            setValue('region_id', 0, { shouldValidate: true })
            return
        }

        const selectedState = states?.find((state) => state.name === stateName)
        const nextStateId = selectedState?.id ?? 0

        setValue('state_id', nextStateId, { shouldValidate: true })
        setValue('region_id', 0, { shouldValidate: true })
    }

    const handleRegionChange = (regionId?: number) => {
        setValue('region_id', regionId ?? 0, { shouldValidate: true })
        // Clearing old group when region changes to enforce cascading
        setValue('old_group_id', 0, { shouldValidate: true })
    }

    const onSubmit = (data: GroupFormData) => {
        onSave(data)
        reset()
    }

    const handleClose = () => {
        onClose()
        reset()
        setSelectedStateName('')
    }

    // Reset form when dialog opens with group data or set from logged in user
    useEffect(() => {
        if (isOpen) {
            if (group) {
                reset({
                    group_name: group.name,
                    leader: group.leader || '',
                    state_id: group.state_id || 0,
                    region_id: group.region_id || 0,
                    old_group_id: group.old_group_id || 0,
                    old_group_name: '',
                })
            } else {
                // For new groups, use logged in user's state_id and region_id
                reset({
                    group_name: '',
                    leader: '',
                    state_id: isSuperAdmin ? 0 : userStateId,
                    region_id: isSuperAdmin ? 0 : userRegionId,
                    old_group_id: 0,
                    old_group_name: '',
                })
            }
        }
    }, [isOpen, group, reset, user, isSuperAdmin, userStateId, userRegionId])

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

    // Load existing groups for code generation uniqueness when old group changes
    useEffect(() => {
        const ogId = currentOldGroupId
        if (!isOpen || !ogId || ogId === 0) {
            setApiGroups([])
            return
        }
        const fetchGroups = async () => {
            try {
                const data = await adminApi.getGroupsByOldGroupId(ogId)
                const source = Array.isArray(data) ? data : []
                setApiGroups(source)
            } catch {
                setApiGroups([])
            }
        }
        fetchGroups()
    }, [isOpen, currentOldGroupId])

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
        const resolveRegionIdFromName = async () => {
            if (!isOpen || !group || !group.region) return
            const stateId = watchedStateId || group.state_id || 0
            if (!stateId) return
            try {
                const data = await adminApi.getRegionsByStateId(stateId)
                const found = (data || []).find(r => r.name?.toLowerCase() === group.region!.toLowerCase())
                if (found) {
                    setValue('region_id', found.id, { shouldValidate: true })
                }
            } catch {
                // ignore
            }
        }
        if (!watchedRegionId || watchedRegionId === 0) {
            resolveRegionIdFromName()
        }
    }, [isOpen, group, watchedStateId, watchedRegionId, setValue])

    const genUuidFragment = () => {
        const cryptoObj = (typeof globalThis !== 'undefined' ? (globalThis as unknown as { crypto?: { randomUUID?: () => string } }) : undefined)?.crypto
        const uuid = cryptoObj?.randomUUID?.()
        return uuid ? uuid.slice(0, 4) : Math.random().toString(16).slice(2, 6)
    }

    const generateUniqueGroupCode = (name: string) => {
        const words = name.trim().split(/\s+/).filter(Boolean)
        const prefix = words.map(w => w.slice(0, 2).toUpperCase()).join('')
        let code = `${prefix}_${genUuidFragment()}`
        const existingCodes = (apiGroups || []).map(g => g.code || '').filter(Boolean)
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
    }, [currentGroupName, mode, setValue, generateUniqueGroupCode])

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
                    <Dialog.Content rounded="xl" maxW={{ base: "sm", sm: "sm", md: "md", lg: "2xl" }}>
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
                                                value={watchedRegionId}
                                                onChange={handleRegionChange}
                                                invalid={!!errors.region_id}
                                                stateId={watchedStateId}
                                                disabled={!watchedStateId || isLoading}
                                            />
                                            <Field.ErrorText>{errors.region_id?.message}</Field.ErrorText>
                                        </Field.Root>
                                    )}

                                    {/* Old Group Selection */}
                                    <Field.Root invalid={!!errors.old_group_id}>
                                        <OldGroupIdCombobox
                                            value={currentOldGroupId as number}
                                            onChange={handleOldGroupChange}
                                            invalid={!!errors.old_group_id}
                                            stateId={watchedStateId}
                                            regionId={watchedRegionId}
                                            isRegionAdmin={isRegionAdmin}
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
