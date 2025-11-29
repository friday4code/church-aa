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
import { oldGroupSchema, type OldGroupFormData } from "../../../schemas/oldgroups.schema"
import type { OldGroup } from "@/types/oldGroups.type"
import { useEffect, useState } from "react"
import { useMe } from "@/hooks/useMe"
import { useStates } from "@/modules/admin/hooks/useState"
import { adminApi } from "@/api/admin.api"
import StateIdCombobox from "@/modules/admin/components/StateIdCombobox"
import RegionIdCombobox from "@/modules/admin/components/RegionIdCombobox"
interface OldGroupDialogProps {
    isLoading?: boolean
    isOpen: boolean
    group?: OldGroup
    mode: 'add' | 'edit'
    onClose: () => void
    onSave: (data: OldGroupFormData) => void
}
const OldGroupDialog = ({ isLoading, isOpen, group, mode, onClose, onSave }: OldGroupDialogProps) => {
    const { user } = useMe()
    const { states, isLoading: isStatesLoading } = useStates()
    const [selectedStateName, setSelectedStateName] = useState('')
    const [regionsByState, setRegionsByState] = useState<Array<{ id: number; name: string }>>([])
    const [regionsLoading, setRegionsLoading] = useState(false)
    const [apiOldGroups, setApiOldGroups] = useState<Array<{ id: number; name: string; code?: string }>>([])
    const userStateId = user?.state_id ?? 0
    const userRegionId = user?.region_id ?? 0
    const isSuperAdmin = user?.roles?.some((role) => role.toLowerCase() === 'super admin') ?? false
    const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<OldGroupFormData>({
        resolver: zodResolver(oldGroupSchema),
        defaultValues: {
            name: group?.name || '',
            code: group?.code || '',
            leader: group?.leader || '',
            state_id: group?.state_id ?? 0,
            region_id: group?.region_id ?? 0,
        }
    })
    const currentName = watch('name')
    const currentCode = watch('code')
    const watchedStateId = watch('state_id')
    const watchedRegionId = watch('region_id')
    const genUuidFragment = () => {
        const randomUUID = (globalThis.crypto as Crypto | undefined)?.randomUUID
        if (typeof randomUUID === 'function') {
            return randomUUID().slice(0, 4)
        }
        return Math.random().toString(16).slice(2, 6)
    }

    const generateGroupCode = (groupName: string): string => {
        const words = groupName.trim().split(/\s+/).filter(Boolean)
        const prefix = words.map(w => w.slice(0, 2).toUpperCase()).join('')
        let code = `${prefix}_${genUuidFragment()}`
        const existingCodes = (apiOldGroups || []).map(g => g.code || '')
        let attempt = 0
        while (existingCodes.includes(code)) {
            code = `${prefix}_${genUuidFragment()}`
            attempt++
            if (attempt > 10) break
        }
        return code
    }

    const handleNameChange = (value: string) => {
        setValue('name', value)
        const generatedCode = value ? generateGroupCode(value) : ''
        setValue('code', generatedCode)
    }

    const onSubmit = (data: OldGroupFormData) => {
        onSave(data)
    }
    const handleClose = () => {
        onClose()
        reset()
        setSelectedStateName('')
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
    const handleRegionIdChange = (regionId?: number) => {
        setValue('region_id', regionId || 0, { shouldValidate: true })
    }
    useEffect(() => {
        if (!isOpen) {
            return
        }
        if (group) {
            reset({
                name: group.name,
                code: group.code,
                leader: group.leader,
                state_id: (group.state_id ?? 0) as number,
                region_id: (group.region_id ?? 0) as number,
            })
            return
        }
        reset({
            name: '',
            code: '',
            leader: '',
            state_id: isSuperAdmin ? 0 : userStateId,
            region_id: isSuperAdmin ? 0 : userRegionId,
        })
    }, [group, isOpen, reset, isSuperAdmin, userStateId, userRegionId])
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
        if (!isOpen) return
        if (!watchedStateId || watchedStateId === 0) {
            setRegionsByState([])
            return
        }
        const fetchRegions = async () => {
            setRegionsLoading(true)
            try {
                const data = await adminApi.getRegionsByStateId(watchedStateId)
                const source = Array.isArray(data) ? (data as Array<{ id: number; name: string }>) : []
                const mapped = source.map(r => ({ id: r.id, name: r.name }))
                setRegionsByState(mapped)
            } catch {
                setRegionsByState([])
            } finally {
                setRegionsLoading(false)
            }
        }
        fetchRegions()
    }, [isOpen, watchedStateId])

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
        if (!isOpen || !group || !regionsByState.length) {
            return
        }
        if ((!watchedRegionId || watchedRegionId === 0) && group.region) {
            const matchedRegion = regionsByState.find(
                (region) => region.name.toLowerCase() === group.region.toLowerCase()
            )
            if (matchedRegion) {
                setValue('region_id', matchedRegion.id, { shouldValidate: true })
            }
        }
    }, [isOpen, group, regionsByState, setValue, watchedRegionId])

    useEffect(() => {
        if (!isOpen) return
        if (!watchedRegionId || watchedRegionId === 0) {
            return
        }
        const fetchOldGroups = async () => {
            try {
                const data = await adminApi.getOldGroupsByRegionId(watchedRegionId)
                const source = Array.isArray(data) ? (data as Array<{ id: number; name: string; code?: string }>) : []
                const mapped = source.map(g => ({ id: g.id, code: g.code, name: g.name }))
                setApiOldGroups(mapped)
            } catch {
                // ignore
            }
        }
        fetchOldGroups()
    }, [isOpen, watchedRegionId])

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

    return (
        <>
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
                                    {mode === 'add' ? 'Add New Old Group' : 'Update Old Group'}
                                </Dialog.Title>
                            </Dialog.Header>

                            <Dialog.Body>
                                <form noValidate id="oldgroup-form" onSubmit={handleSubmit(onSubmit)}>
                                    <VStack gap="4" colorPalette={"accent"}>
                                        <Field.Root required invalid={!!errors.name}>
                                            <Field.Label>Old Group Name
                                                <Field.RequiredIndicator />
                                            </Field.Label>
                                            <Input
                                                rounded="lg"
                                                placeholder="Enter old group name"
                                                value={currentName}
                                                onChange={(e) => handleNameChange(e.target.value)}
                                            />
                                            <Field.ErrorText>{errors.name?.message}</Field.ErrorText>
                                        </Field.Root>

                                        <Field.Root required invalid={!!errors.code}>
                                            <Field.Label>Old Group Code
                                                <Field.RequiredIndicator />
                                            </Field.Label>
                                            <Input
                                                rounded="lg"
                                                placeholder="Old group code will be auto-generated"
                                                value={currentCode}
                                                // readOnly
                                                {...register('code')}
                                            />
                                            <Field.HelperText>
                                                Auto-generated from old group name
                                            </Field.HelperText>
                                            <Field.ErrorText>{errors.code?.message}</Field.ErrorText>
                                        </Field.Root>

                                        <Field.Root required invalid={!!errors.leader}>
                                            <Field.Label>Old Group Leader
                                                <Field.RequiredIndicator />
                                            </Field.Label>
                                            <Input
                                                rounded="lg"
                                                placeholder="Enter old group leader name"
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
                                                    onChange={handleRegionIdChange}
                                                    invalid={!!errors.region_id}
                                                    disabled={!watchedStateId || regionsLoading || isLoading}
                                                    stateId={watchedStateId}
                                                />
                                                <Field.ErrorText>{errors.region_id?.message}</Field.ErrorText>
                                            </Field.Root>
                                        )}

                                        {/* Hidden inputs for state_id and region_id */}
                                        <input type="hidden" {...register('state_id', { valueAsNumber: true })} />
                                        <input type="hidden" {...register('region_id', { valueAsNumber: true })} />
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
                                    form="oldgroup-form"
                                    colorPalette="accent"
                                    loading={isLoading}
                                    loadingText={mode === 'add' ? 'Adding Old Group' : 'Updating Old Group'}
                                    disabled={isLoading}
                                >
                                    {mode === 'add' ? 'Add Old Group' : 'Update Old Group'}
                                </Button>
                            </Dialog.Footer>

                            <Dialog.CloseTrigger asChild>
                                <CloseButton size="sm" />
                            </Dialog.CloseTrigger>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>
        </>
    )
}

export default OldGroupDialog;
