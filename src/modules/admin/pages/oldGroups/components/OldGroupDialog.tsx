// components/oldgroups/components/OldGroupDialog.tsx
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
import { useEffect, useMemo } from "react"
import { useMe } from "@/hooks/useMe"
import { useStates } from "@/modules/admin/hooks/useState"
import { useRegions } from "@/modules/admin/hooks/useRegion"
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
    const { states } = useStates()
    const { regions } = useRegions()

    const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<OldGroupFormData>({
        resolver: zodResolver(oldGroupSchema),
        defaultValues: {
            name: group?.name || '',
            code: group?.code || '',
            leader: group?.leader || '',
            state_id: group?.state_id || 0,
            region_id: group?.region_id || 0,
        }
    })

    const currentName = watch('name')
    const currentCode = watch('code')
    const currentStateId = watch('state_id')
    const currentRegionId = watch('region_id')

    const isSuperAdmin = user?.roles?.includes('Super Admin')

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

    const handleNameChange = (value: string) => {
        setValue('name', value)
        // Generate code from name
        const generatedCode = value ? generateGroupCode(value) : ''
        setValue('code', generatedCode)
    }

    const handleStateChange = (stateName: string) => {
        if (!stateName) {
            setValue('state_id', 0, { shouldValidate: true })
            setValue('region_id', 0)
            return
        }

        const selectedState = states?.find(state => state.name === stateName)
        if (selectedState) {
            setValue('state_id', selectedState.id, { shouldValidate: true })
            // Reset region when state changes
            setValue('region_id', 0, { shouldValidate: true })
        }
    }

    const handleRegionChange = (regionName: string) => {
        if (!regionName) {
            setValue('region_id', 0, { shouldValidate: true })
            return
        }

        const selectedRegion = regions?.find(region => region.name === regionName)
        if (selectedRegion) {
            setValue('region_id', selectedRegion.id, { shouldValidate: true })
        }
    }

    const generateGroupCode = (groupName: string): string => {
        if (!groupName) return ''
        const cleanName = groupName.replace(/group/gi, '').trim()
        return `GRP-${cleanName.substring(0, 3).toUpperCase()}`
    }

    const onSubmit = (data: OldGroupFormData) => {
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
                reset({
                    name: group.name,
                    code: group.code,
                    leader: group.leader,
                    state_id: group.state_id,
                    region_id: group.region_id,
                })
            } else {
                // For new groups, use logged in user's state_id and region_id
                reset({
                    name: '',
                    code: '',
                    leader: '',
                    state_id: user?.state_id || 0,
                    region_id: user?.region_id || 0,
                })
            }
        }
    }, [isOpen, group, reset, user])

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
                        <Dialog.Content rounded="xl" maxW="2xl">
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
                                                readOnly
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
                                            </>
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