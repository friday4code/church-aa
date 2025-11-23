// components/districts/components/DistrictEditForm.tsx
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
import { districtSchema, type DistrictFormData } from "../../../schemas/districts.schema"
import type { District } from "@/types/districts.type"
import StateIdCombobox from "@/modules/admin/components/StateIdCombobox"
import RegionIdCombobox from "@/modules/admin/components/RegionIdCombobox"
import OldGroupIdCombobox from "@/modules/admin/components/OldGroupIdCombobox"
import GroupIdCombobox from "@/modules/admin/components/GroupIdCombobox"
import { useStates } from "@/modules/admin/hooks/useState"
import { useRegions } from "@/modules/admin/hooks/useRegion"
import { useOldGroups } from "@/modules/admin/hooks/useOldGroup"
import { useGroups } from "@/modules/admin/hooks/useGroup"
import { useEffect, useMemo } from "react"


interface DistrictEditFormProps {
    district: District
    onUpdate: (data: Partial<DistrictFormData>) => void
    onCancel: () => void
}

const DistrictEditForm = ({ district, onUpdate, onCancel }: DistrictEditFormProps) => {
    const { states } = useStates()
    const { regions } = useRegions()
    const { oldGroups } = useOldGroups()
    const { groups: allGroups } = useGroups()
    const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<DistrictFormData>({
        resolver: zodResolver(districtSchema),
        defaultValues: {
            state_id: district.state_id || 0,
            region_id: district.region_id || 0,
            name: district.name,
            leader: district.leader,
            code: district.code || '',
            old_group_id: district.old_group_id || 0,
            group_id: district.group_id || 0,
            old_group_name: district.old_group || '',
            group_name: district.group || '',
            state_name: district.state || '',
            region_name: district.region || '',
        }
    })

    const currentStateName = watch('state_name')
    const currentRegionName = watch('region_name')
    const currentOldGroupName = watch('old_group_name')
    const currentGroupName = watch('group_name')
    const watchedStateId = watch('state_id')

    const filteredRegions = (regions || []).filter((region) => {
        if (region.state_id != null && watchedStateId) {
            return Number(region.state_id) === Number(watchedStateId)
        }
        if (currentStateName && region.state) {
            return region.state.toLowerCase() === currentStateName.toLowerCase()
        }
        return false
    })

    const filteredGroups = useMemo(() => {
        if (!currentOldGroupName || !oldGroups || !allGroups) return []
        const selectedOldGroup = oldGroups.find(og => og.name === currentOldGroupName)
        if (!selectedOldGroup) return []
        return allGroups.filter(group => group.old_group === selectedOldGroup.name)
    }, [currentOldGroupName, oldGroups, allGroups])

    const handleStateChange = (stateName: string) => {
        const state = states?.find(s => s.name === stateName)
        if (state) {
            setValue('state_id', state.id, { shouldValidate: true })
            setValue('state_name', stateName)
            setValue('region_id', 0, { shouldValidate: true })
            setValue('region_name', '')
        }
    }

    const handleRegionChange = (regionName: string) => {
        const region = regions?.find(r => r.name === regionName)
        if (region) {
            setValue('region_id', region.id, { shouldValidate: true })
            setValue('region_name', regionName)
        }
    }

    const handleOldGroupChange = (oldGroupName: string) => {
        const oldGroup = oldGroups?.find(og => og.name === oldGroupName)
        if (oldGroup) {
            setValue('old_group_id', oldGroup.id, { shouldValidate: true })
            setValue('old_group_name', oldGroupName)
            setValue('group_id', 0, { shouldValidate: true })
            setValue('group_name', '')
        }
    }

    const handleGroupChange = (groupName: string) => {
        const group = filteredGroups.find(g => g.name === groupName)
        if (group) {
            setValue('group_id', group.id, { shouldValidate: true })
            setValue('group_name', groupName)
        }
    }

    const generateDistrictCode = (districtName: string): string => {
        if (!districtName) return ''
        const cleanName = districtName.replace(/district|area|zone|region/gi, '').trim()
        return cleanName.substring(0, 4).toUpperCase()
    }

    const handleDistrictNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const districtName = e.target.value
        setValue('name', districtName)
        const districtCode = districtName ? generateDistrictCode(districtName) : ''
        setValue('code', districtCode)
    }

    useEffect(() => {
        reset({
            state_id: district.state_id || 0,
            region_id: district.region_id || 0,
            name: district.name,
            leader: district.leader,
            code: district.code || '',
            old_group_id: district.old_group_id || 0,
            group_id: district.group_id || 0,
            old_group_name: district.old_group || '',
            group_name: district.group || '',
            state_name: district.state || '',
            region_name: district.region || '',
        })
    }, [district, reset])

    const onSubmit = (data: DistrictFormData) => {
        const { old_group_name, group_name, state_name, region_name, ...apiData } = data
        onUpdate(apiData)
    }

    return (
        <VStack gap="4" align="stretch">
            <Text fontSize="sm" color="gray.600" mb="2">
                Editing: <strong>{district.name}</strong>
            </Text>

            <form id={`district-form-${district.id}`} onSubmit={handleSubmit(onSubmit)}>
                <VStack gap="4" colorPalette={"accent"}>
                    <Field.Root required invalid={!!errors.state_id}>
                        <StateIdCombobox
                            value={currentStateName}
                            onChange={handleStateChange}
                            invalid={!!errors.state_id}
                        />
                        <Field.ErrorText>{errors.state_id?.message}</Field.ErrorText>
                    </Field.Root>

                    <Field.Root required invalid={!!errors.region_id}>
                        <RegionIdCombobox
                            value={currentRegionName}
                            onChange={handleRegionChange}
                            invalid={!!errors.region_id}
                            items={filteredRegions}
                            disabled={!watchedStateId && !currentStateName}
                        />
                        <Field.ErrorText>{errors.region_id?.message}</Field.ErrorText>
                    </Field.Root>

                    <Field.Root required invalid={!!errors.old_group_id}>
                        <OldGroupIdCombobox
                            value={currentOldGroupName}
                            onChange={handleOldGroupChange}
                            invalid={!!errors.old_group_id}
                        />
                        <Field.ErrorText>{errors.old_group_id?.message}</Field.ErrorText>
                    </Field.Root>

                    <Field.Root required invalid={!!errors.group_id}>
                        <GroupIdCombobox
                            value={currentGroupName}
                            onChange={handleGroupChange}
                            invalid={!!errors.group_id}
                            items={filteredGroups}
                            disabled={!currentOldGroupName}
                        />
                        <Field.ErrorText>{errors.group_id?.message}</Field.ErrorText>
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

                    <Field.Root required invalid={!!errors.code}>
                        <Field.Label>District Code
                            <Field.RequiredIndicator />
                        </Field.Label>
                        <Input
                            rounded="lg"
                            placeholder="District code will be auto-generated"
                            {...register('code')}
                        />
                        <Field.ErrorText>{errors.code?.message}</Field.ErrorText>
                    </Field.Root>
                    <input type="hidden" {...register('state_id', { valueAsNumber: true })} />
                    <input type="hidden" {...register('region_id', { valueAsNumber: true })} />
                    <input type="hidden" {...register('old_group_id', { valueAsNumber: true })} />
                    <input type="hidden" {...register('group_id', { valueAsNumber: true })} />
                    <input type="hidden" {...register('state_name')} />
                    <input type="hidden" {...register('region_name')} />
                    <input type="hidden" {...register('old_group_name')} />
                    <input type="hidden" {...register('group_name')} />
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
                    form={`district-form-${district.id}`}
                >
                    Update & Close
                </Button>
            </HStack>
        </VStack>
    )
}

export default DistrictEditForm;