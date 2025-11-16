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
import { districtSchema, type DistrictFormData } from "../../../schemas/districts.schema"
import type { District } from "@/types/districts.type"
import { useEffect } from "react"
import { useMe } from "@/hooks/useMe"

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

    const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<DistrictFormData>({
        resolver: zodResolver(districtSchema),
        defaultValues: {
            state_id: district?.state_id || 0,
            region_id: district?.region_id || 0,
            name: district?.name || '',
            leader: district?.leader || '',
            code: district?.code || ''
        }
    })

    // Helper function to generate district code from district name
    const generateDistrictCode = (districtName: string): string => {
        if (!districtName) return ''

        // Remove common words and take first 3-4 letters in uppercase
        const cleanName = districtName
            .replace(/district|area|zone|region/gi, '')
            .trim()

        // Take first 3-4 characters and convert to uppercase
        return cleanName.substring(0, 4).toUpperCase()
    }

    const handleDistrictNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const districtName = e.target.value
        setValue('name', districtName)

        // Auto-generate district code only in add mode or if code is empty
        if (mode === 'add' || !district?.code) {
            const districtCode = districtName ? generateDistrictCode(districtName) : ''
            setValue('code', districtCode)
        }
    }

    const onSubmit = (data: DistrictFormData) => {
        onSave(data)
        reset()
    }

    const handleClose = () => {
        onClose()
        reset()
    }

    // Reset form when dialog opens with district data or set from logged in user
    useEffect(() => {
        if (isOpen) {
            if (district) {
                reset({
                    state_id: district.state_id || 0,
                    region_id: district.region_id || 0,
                    name: district.name,
                    leader: district.leader || '',
                    code: district.code || ''
                })
            } else {
                // For new districts, use logged in user's state_id and region_id
                reset({
                    state_id: user?.state_id || 0,
                    region_id: user?.region_id || 0,
                    name: '',
                    leader: '',
                    code: ''
                })
            }
        }
    }, [isOpen, district, reset, mode, user])

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
                            <form noValidate id="district-form" onSubmit={handleSubmit(onSubmit)}>
                                <VStack gap="4" colorPalette={"accent"}>

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

                                    <Field.Root invalid={!!errors.code}>
                                        <Field.Label>District Code</Field.Label>
                                        <Input
                                            rounded="lg"
                                            placeholder="District code will be auto-generated"
                                            value={watch('code')}
                                            readOnly={mode === 'add'}
                                            // bg={mode === 'add' ? "gray.50" : "white"}
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

                                    {/* Hidden inputs for state_id and region_id from logged in user */}
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