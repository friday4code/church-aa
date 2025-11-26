// components/districts/components/DistrictDialog.tsx
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
import { type DistrictFormData } from "../../../schemas/districts.schema"
import { z } from "zod"
import type { District } from "@/types/districts.type"
import { useEffect, useMemo, useRef, useState } from "react"
import { useMe } from "@/hooks/useMe"
import { useStates } from "@/modules/admin/hooks/useState"
import { adminApi } from "@/api/admin.api"
import StateIdCombobox from "@/modules/admin/components/StateIdCombobox"
import RegionIdCombobox from "@/modules/admin/components/RegionIdCombobox"

interface DistrictDialogProps {
    isLoading?: boolean
    isOpen: boolean
    district?: District
    mode: 'add' | 'edit'
    onClose: () => void
    onSave: (data: DistrictFormData) => void
}

const DistrictDialog = ({ isLoading, isOpen, district, mode, onClose, onSave }: DistrictDialogProps) => {
    const { user } = useMe()
    const { states } = useStates()
    const [existingCodes, setExistingCodes] = useState<string[]>([])
    const userStateId = user?.state_id ?? 0
    const isSuperAdmin = user?.roles?.some((role) => role.toLowerCase() === 'super admin') ?? false
    const generatedCodesCache = useRef<Set<string>>(new Set())

    const districtDialogSchema = z.object({
        state_id: z.number().min(1, 'State is required'),
        region_id: z.number().min(1, 'Region (LGA) is required'),
        name: z.string().min(1, 'District name is required'),
        leader: z.string().min(1, 'District leader is required'),
        code: z.string().min(1, 'District code is required'),
        state_name: z.string().optional(),
        region_name: z.string().optional(),
    })

    const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<DistrictFormData>({
        resolver: zodResolver(districtDialogSchema),
        defaultValues: {
            state_id: district?.state_id || userStateId || 0,
            region_id: district?.region_id || 0,
            name: district?.name || '',
            leader: district?.leader || '',
            code: district?.code || '',
            state_name: district?.state || '',
            region_name: district?.region || '',
        }
    })

    const currentStateName = watch('state_name')
    const currentRegionId = watch('region_id')
    const watchedStateId = watch('state_id')

    // Get state name for display
    const selectedStateName = useMemo(() => {
        if (currentStateName) {
            return currentStateName
        }
        if (district?.state) {
            return district.state
        }
        return ''
    }, [currentStateName, district?.state])


    // Handle state selection - convert name to ID
    const handleStateChange = (stateName: string) => {
        if (stateName) {
            const state = states?.find(s => s.name === stateName)
            if (state) {
                setValue('state_id', state.id, { shouldValidate: true })
                setValue('state_name', stateName)
                // Clear region when state changes
                setValue('region_id', 0, { shouldValidate: true })
                setValue('region_name', '')
            }
        } else {
            setValue('state_id', 0)
            setValue('state_name', '')
            setValue('region_id', 0)
            setValue('region_name', '')
        }
    }

    const handleRegionChange = (regionId?: number) => {
        setValue('region_id', regionId || 0, { shouldValidate: true })
        setValue('region_name', '')
    }



    // Helper function to generate district code from district name
    const generateDistrictCode = (districtName: string): string => {
        const prefix = districtName.trim().slice(0, 4).toUpperCase()
        const rand4 = () => Math.floor(1000 + Math.random() * 9000).toString()
        let code = `${prefix}_${rand4()}`
        let attempt = 0
        while (existingCodes.includes(code) || generatedCodesCache.current.has(code)) {
            code = `${prefix}_${rand4()}`
            attempt++
            if (attempt > 10) break
        }
        generatedCodesCache.current.add(code)
        return code
    }

    const handleDistrictNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const districtName = e.target.value
        setValue('name', districtName)

        if (mode === 'add' || !district?.code) {
            const districtCode = districtName ? generateDistrictCode(districtName) : ''
            setValue('code', districtCode)
        }
    }

    const onSubmit = (data: DistrictFormData) => {
        onSave(data)
        reset()
    }

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        handleSubmit(onSubmit)(e)
    }

    const handleClose = () => {
        onClose()
        reset()
    }

    // Reset form when dialog opens with district data or set from logged in user
    useEffect(() => {
        if (isOpen) {
            if (district) {
                // Derive missing state/region IDs from names
                let stateId = district.state_id || 0
                const regionId = district.region_id || 0
                if (!stateId && district.state && states?.length) {
                    const foundState = states.find(s => s.name === district.state)
                    stateId = foundState?.id || 0
                }
                // region name will be resolved by RegionIdCombobox

                reset({
                    state_id: stateId,
                    region_id: regionId,
                    name: district.name,
                    leader: district.leader || '',
                    code: district.code || '',
                    state_name: district.state || '',
                    region_name: '',
                })
            } else {
                // For new districts, use logged in user's state_id and region_id
                reset({
                    state_id: isSuperAdmin ? 0 : user?.state_id || 0,
                    region_id: user?.region_id || 0,
                    name: '',
                    leader: '',
                    code: '',
                    state_name: '',
                    region_name: '',
                })
            }
        }
    }, [isOpen, district, reset, mode, user, isSuperAdmin, states])

    // Load existing district codes for selected region to improve code uniqueness
    useEffect(() => {
        const rid = currentRegionId
        if (!isOpen || !rid || rid === 0) {
            setExistingCodes([])
            return
        }
        const fetchCodes = async () => {
            try {
                const data = await adminApi.getDistrictsByRegion(rid)
                const codes = ((data || []) as Array<{ code?: string }>).map((d) => d.code || '').filter(Boolean)
                setExistingCodes(codes)
            } catch {
                setExistingCodes([])
            }
        }
        fetchCodes()
    }, [isOpen, currentRegionId])

    useEffect(() => {
        if (!isOpen || isSuperAdmin) {
            return
        }

        if (userStateId) {
            setValue('state_id', userStateId, { shouldValidate: true })
        }

        if (!currentStateName && states?.length) {
            const matchedState = states.find((state) => state.id === userStateId)
            if (matchedState) {
                setValue('state_name', matchedState.name)
            }
        }
    }, [isOpen, isSuperAdmin, setValue, states, userStateId, currentStateName])

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
                                {mode === 'add' ? 'Add New District' : 'Update District'}
                            </Dialog.Title>
                        </Dialog.Header>

                        <Dialog.Body>
                            <form noValidate id="district-form" onSubmit={handleFormSubmit}>
                                <VStack gap="4" colorPalette={"accent"}>
                                    {isSuperAdmin && (
                                        <Field.Root required invalid={!!errors.state_id}>
                                            <StateIdCombobox
                                                value={selectedStateName}
                                                onChange={handleStateChange}
                                                invalid={!!errors.state_id}
                                            />
                                            <Field.ErrorText>{errors.state_id?.message}</Field.ErrorText>
                                        </Field.Root>
                                    )}

                                    <Field.Root required invalid={!!errors.region_id}>
                                        <RegionIdCombobox
                                            value={currentRegionId}
                                            onChange={handleRegionChange}
                                            invalid={!!errors.region_id}
                                            stateId={watchedStateId}
                                            disabled={!watchedStateId}
                                        />
                                        <Field.ErrorText>{errors.region_id?.message}</Field.ErrorText>
                                    </Field.Root>

                                    

                                    <Field.Root required invalid={!!errors.name}>
                                        <Field.Label>District Name
                                            <Field.RequiredIndicator />
                                        </Field.Label>
                                        <Input
                                            rounded="lg"
                                            placeholder="Enter district name"
                                            {...register('name')}
                                            onChange={handleDistrictNameChange}
                                        />
                                        <Field.ErrorText>{errors.name?.message}</Field.ErrorText>
                                    </Field.Root>

                                    <Field.Root required invalid={!!errors.code}>
                                        <Field.Label>District Code
                                            <Field.RequiredIndicator />
                                        </Field.Label>
                                        <Input
                                            rounded="lg"
                                            placeholder="District code will be auto-generated"
                                            value={watch('code')}
                                            readOnly={mode === 'add'}
                                            {...register('code')}
                                        />
                                        <Field.HelperText>
                                            {mode === 'add'
                                                ? "Auto-generated from district name"
                                                : "You can edit the district code in edit mode"}
                                        </Field.HelperText>
                                        <Field.ErrorText>{errors.code?.message}</Field.ErrorText>
                                    </Field.Root>

                                    <Field.Root required invalid={!!errors.leader}>
                                        <Field.Label>District Leader
                                            <Field.RequiredIndicator />
                                        </Field.Label>
                                        <Input
                                            rounded="lg"
                                            placeholder="Enter district leader name"
                                            {...register('leader')}
                                        />
                                        <Field.ErrorText>{errors.leader?.message}</Field.ErrorText>
                                    </Field.Root>

                                    <input type="hidden" {...register('state_id', { valueAsNumber: true })} />
                                    <input type="hidden" {...register('region_id', { valueAsNumber: true })} />
                                    <input type="hidden" {...register('state_name')} />
                                    <input type="hidden" {...register('region_name')} />
                                    
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
                                form="district-form"
                                colorPalette="accent"
                                loading={isLoading}
                                loadingText={mode === 'add' ? 'Adding District' : 'Updating District'}
                                disabled={isLoading}
                            >
                                {mode === 'add' ? 'Add District' : 'Update District'}
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

export default DistrictDialog;
