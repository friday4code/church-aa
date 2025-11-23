// components/regions/components/RegionEditForm.tsx
"use client"

import {
    VStack,
    HStack,
    Field,
    Input,
    Button,
    Text,
} from "@chakra-ui/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { regionSchema, type RegionFormData } from "../../../schemas/region.schema"
import type { Region } from "@/types/regions.type"
import { useEffect, useMemo, useState } from "react"
import { useStates } from "@/modules/admin/hooks/useState"
import StateIdCombobox from "@/modules/admin/components/StateIdCombobox"

interface RegionEditFormProps {
    region: Region
    onUpdate: (data: Partial<RegionFormData>) => void
    onCancel: () => void
}

const RegionEditForm = ({ region, onUpdate, onCancel }: RegionEditFormProps) => {
    const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<RegionFormData>({
        resolver: zodResolver(regionSchema),
        defaultValues: {
            name: region.name,
            state_id: region.state_id ?? 0,
            leader: region.leader,
            code: region.code
        }
    })

    const currentName = watch('name')
    const currentCode = watch('code')
    const watchedStateId = watch('state_id')
    const { states } = useStates()
    const [selectedStateName, setSelectedStateName] = useState('')

    const generateRegionCode = (regionName: string): string => {
        if (!regionName) return ''
        return regionName.substring(0, 3).toUpperCase()
    }

    // Auto-generate code when name changes
    useEffect(() => {
        if (currentName && !currentCode) {
            const generatedCode = generateRegionCode(currentName)
            setValue('code', generatedCode)
        }
    }, [currentName, setValue, currentCode])

    useEffect(() => {
        if (!states?.length || selectedStateName) return
        const matched = states.find(s => s.id === (region.state_id ?? 0))
        if (matched) {
            setSelectedStateName(matched.name)
        }
    }, [states, region.state_id, selectedStateName])

    useEffect(() => {
        reset({
            name: region.name,
            state_id: region.state_id ?? 0,
            leader: region.leader,
            code: region.code
        })
    }, [region, reset])

    const handleStateChange = (stateName: string) => {
        setSelectedStateName(stateName)
        if (!stateName) {
            setValue('state_id', 0, { shouldValidate: true })
            return
        }
        const selected = states?.find(s => s.name === stateName)
        setValue('state_id', selected?.id ?? 0, { shouldValidate: true })
    }

    const onSubmit = (data: RegionFormData) => {
        onUpdate(data)
    }

    return (
        <VStack gap="4" align="stretch">
            <Text fontSize="sm" color="gray.600" mb="2">
                Editing: <strong>{region.name}</strong>
            </Text>

            <form id={`region-form-${region.id}`} onSubmit={handleSubmit(onSubmit)}>
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

                    <Field.Root required invalid={!!errors.state_id}>
                        <StateIdCombobox
                            required
                            value={selectedStateName}
                            onChange={handleStateChange}
                            invalid={!!errors.state_id}
                        />
                        <Field.ErrorText>{errors.state_id?.message}</Field.ErrorText>
                    </Field.Root>

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

            <input type="hidden" {...register('state_id', { valueAsNumber: true })} />

            <HStack justify="flex-end" gap="2" mt="4">
                <Button variant="outline" size="sm" onClick={onCancel}>
                    Skip
                </Button>
                <Button
                    size="sm"
                    colorPalette="accent"
                    type="submit"
                    form={`region-form-${region.id}`}
                >
                    Update & Close
                </Button>
            </HStack>
        </VStack>
    )
}

export default RegionEditForm;