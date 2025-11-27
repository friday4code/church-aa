// components/oldgroups/components/OldGroupEditForm.tsx
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
import { oldGroupSchema, type OldGroupFormData } from "../../../schemas/oldgroups.schema"
import type { OldGroup } from "@/types/oldGroups.type"
import { useStates } from "../../../hooks/useState"
import { useRegions } from "../../../hooks/useRegion"
import StateIdCombobox from "../../../components/StateIdCombobox"
import RegionIdCombobox from "../../../components/RegionIdCombobox"

interface OldGroupEditFormProps {
    group: OldGroup
    onUpdate: (data: Partial<OldGroupFormData>) => void
    onCancel: () => void
}

const OldGroupEditForm = ({ group, onUpdate, onCancel }: OldGroupEditFormProps) => {
    const { states } = useStates()
    const { regions } = useRegions()

    const { register, handleSubmit, formState: { errors }, setValue, watch, trigger } = useForm<OldGroupFormData>({
        resolver: zodResolver(oldGroupSchema),
        defaultValues: {
            name: group.name,
            code: group.code,
            leader: group.leader,
            state_id: group.state_id,
            region_id: group.region_id,
        }
    })

    const currentName = watch('name')
    const currentCode = watch('code')
    const currentStateId = watch('state_id')
    const currentRegionId = watch('region_id')

    const handleNameChange = (value: string) => {
        setValue('name', value)
        const generatedCode = value ? generateGroupCode(value) : ''
        setValue('code', generatedCode)
    }

    const handleStateChange = (stateName: string) => {
        const state = states?.find(s => s.name === stateName)
        if (state) {
            setValue('state_id', state.id, { shouldValidate: true })
            trigger('state_id')
            // Clear dependent fields
            setValue('region_id', 0)
        }
    }

    const handleRegionChange = (regionId?: number) => {
        setValue('region_id', regionId || 0, { shouldValidate: true })
        trigger('region_id')
    }

    

    const generateGroupCode = (groupName: string): string => {
        if (!groupName) return ''
        const cleanName = groupName.replace(/group/gi, '').trim()
        return `GRP-${cleanName.substring(0, 3).toUpperCase()}`
    }

    const onSubmit = (data: OldGroupFormData) => {
        onUpdate(data)
    }

    // Get display names for selected IDs
    const getSelectedStateName = () => {
        return states?.find(s => s.id === currentStateId)?.name || ''
    }

    const getSelectedRegionName = () => {
        return regions?.find(r => r.id === currentRegionId)?.name || ''
    }

    return (
        <VStack gap="4" align="stretch">
            <Text fontSize="sm" color="gray.600" mb="2">
                Editing: <strong>{group.name}</strong>
            </Text>

            <form id={`group-form-${group.id}`} onSubmit={handleSubmit(onSubmit)}>
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
                            value={currentRegionId}
                            onChange={handleRegionChange}
                            required
                            invalid={!!errors.region_id}
                            stateId={currentStateId}
                            disabled={!currentStateId || currentStateId === 0}
                        />
                        <Field.ErrorText>{errors.region_id?.message}</Field.ErrorText>
                    </Field.Root>

                    {/* Hidden inputs for React Hook Form validation */}
                    <input type="hidden" {...register('state_id', { valueAsNumber: true })} />
                    <input type="hidden" {...register('region_id', { valueAsNumber: true })} />
                </VStack>
            </form>

            <HStack justify="flex-end" gap="2" mt="4">
                <Button variant="outline" size="sm" onClick={onCancel}>
                    Skip
                </Button>
                <Button
                    size="sm"
                    colorPalette="accent"
                    type="submit"
                    form={`group-form-${group.id}`}
                >
                    Update & Close
                </Button>
            </HStack>
        </VStack>
    )
}

export default OldGroupEditForm
