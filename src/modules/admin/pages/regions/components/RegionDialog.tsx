// components/regions/components/RegionDialog.tsx
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
import { regionSchema, type RegionFormData } from "../../../schemas/region.schema"
import type { Region } from "@/types/regions.type"
import { useEffect, useMemo } from "react"
import { useMe } from "@/hooks/useMe"
import { useStates } from "@/modules/admin/hooks/useState"
import StateIdCombobox from "@/modules/admin/components/StateIdCombobox"

interface RegionDialogProps {
    isLoading?: boolean
    isOpen: boolean
    region?: Region
    mode: 'add' | 'edit'
    onClose: () => void
    onSave: (data: RegionFormData) => void
}

const RegionDialog = ({ isLoading, isOpen, region, mode, onClose, onSave }: RegionDialogProps) => {
    const { user } = useMe()
    const { states } = useStates()

    const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<RegionFormData>({
        resolver: zodResolver(regionSchema),
        defaultValues: {
            name: region?.name || '',
            state_id: user?.state_id || 0,
            leader: region?.leader || '',
            code: region?.code || ''
        }
    })

    const currentName = watch('name')
    const currentCode = watch('code')
    const currentStateId = watch('state_id')

    const isSuperAdmin = user?.roles?.includes('Super Admin')

    const selectedStateName = useMemo(() => {
        if (states && currentStateId) {
            const match = states.find(state => state.id === currentStateId)
            if (match) {
                return match.name
            }
        }
        if (region?.state) {
            return region.state
        }
        return ''
    }, [states, currentStateId, region?.state])

    // Helper function to generate state code from state name
    const generateRegionCode = (stateName: string): string => {
        if (!stateName) return ''

        // Remove "State" from the name if present and take first 3 letters in uppercase
        const cleanName = stateName.replace(/state/gi, '').trim()
        return cleanName.substring(0, 3).toUpperCase()
    }

    const handleStateChange = (stateName: string) => {
        if (!stateName) {
            setValue('state_id', 0, { shouldValidate: true })
            return
        }

        const selectedState = states?.find(state => state.name === stateName)
        if (selectedState) {
            setValue('state_id', selectedState.id, { shouldValidate: true })
        }
    }

    const onSubmit = (data: RegionFormData) => {
        onSave(data)
        reset()
    }

    const handleClose = () => {
        onClose()
        reset()
    }

    // Auto-generate code when name changes
    useEffect(() => {
        if (mode === 'add' && currentName) {
            const generatedCode = generateRegionCode(currentName)
            setValue('code', generatedCode)
        }
    }, [currentName, mode, setValue, currentCode])

    // Reset form when dialog opens with region data
    useEffect(() => {
        if (isOpen) {
            if (region) {
                reset({
                    name: region.name,
                    state_id: region.state_id ?? 0,
                    leader: region.leader,
                    code: region.code
                })
            } else {
                reset({
                    name: '',
                    state_id: user?.state_id || 0,
                    leader: '',
                    code: ''
                })
            }
        }
    }, [isOpen, region, reset, user])

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
                                    {mode === 'add' ? 'Add New Region' : 'Update Region'}
                                </Dialog.Title>
                            </Dialog.Header>

                            <Dialog.Body>
                                <form noValidate id="region-form" onSubmit={handleSubmit(onSubmit)}>
                                    <VStack gap="4" colorPalette={"accent"}>
                                        <Field.Root required invalid={!!errors.name}>
                                            <Field.Label>Region Name
                                                <Field.RequiredIndicator />
                                            </Field.Label>
                                            <Input
                                                rounded="lg"
                                                placeholder="Enter region name"
                                                {...register('name')}
                                            />
                                            <Field.ErrorText>{errors.name?.message}</Field.ErrorText>
                                        </Field.Root>

                                        {isSuperAdmin ? (
                                            <Field.Root required invalid={!!errors.state_id}>
                                                <StateIdCombobox
                                                    value={selectedStateName}
                                                    onChange={handleStateChange}
                                                    invalid={!!errors.state_id}
                                                />
                                                <Field.ErrorText>{errors.state_id?.message}</Field.ErrorText>
                                            </Field.Root>
                                        ) : (
                                            <Field.Root required invalid={!!errors.state_id}>
                                                <Field.Label>
                                                    State
                                                    <Field.RequiredIndicator />
                                                </Field.Label>
                                                <Input
                                                    rounded="lg"
                                                    value={selectedStateName || 'State will be auto-selected'}
                                                    readOnly
                                                    disabled
                                                />
                                                {!selectedStateName && (
                                                    <Field.HelperText>
                                                        State will be taken from your profile
                                                    </Field.HelperText>
                                                )}
                                                <Field.ErrorText>{errors.state_id?.message}</Field.ErrorText>
                                            </Field.Root>
                                        )}

                                        {/* Hidden input for state_id that React Hook Form can validate */}
                                        <input
                                            type="hidden"
                                            {...register('state_id', {
                                                valueAsNumber: true,
                                                validate: (value) => value > 0 || 'State is required'
                                            })}
                                        />

                                        <Field.Root required invalid={!!errors.code}>
                                            <Field.Label>Region Code
                                                <Field.RequiredIndicator />
                                            </Field.Label>
                                            <Input
                                                rounded="lg"
                                                placeholder="Region code will be auto-generated"
                                                {...register('code')}
                                            />
                                            <Field.HelperText>
                                                Auto-generated from region name
                                            </Field.HelperText>
                                            <Field.ErrorText>{errors.code?.message}</Field.ErrorText>
                                        </Field.Root>

                                        <Field.Root required invalid={!!errors.leader}>
                                            <Field.Label>Region Leader
                                                <Field.RequiredIndicator />
                                            </Field.Label>
                                            <Input
                                                rounded="lg"
                                                placeholder="Enter region leader name"
                                                {...register('leader')}
                                            />
                                            <Field.ErrorText>{errors.leader?.message}</Field.ErrorText>
                                        </Field.Root>
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
                                    form="region-form"
                                    colorPalette="accent"
                                    loading={isLoading}
                                    loadingText={mode === 'add' ? 'Adding Region' : 'Updating Region'}
                                    disabled={isLoading}
                                >
                                    {mode === 'add' ? 'Add Region' : 'Update Region'}
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

export default RegionDialog;